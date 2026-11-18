import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { DocumentsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<DocumentsStackParamList, 'PdfViewer'>;

const buildViewerHtml = (base64: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #525659; }
    #viewer { padding: 8px 0; }
    canvas { display: block; margin: 4px auto; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
    .msg { color: #ccc; text-align: center; padding: 20px; font-family: sans-serif; }
    .error { color: #ff6b6b; }
  </style>
</head>
<body>
  <div id="viewer"><p class="msg">Rendering…</p></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    try {
      var raw = atob('${base64}');
      var uint8 = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) uint8[i] = raw.charCodeAt(i);

      // Pages are drawn at the screen's real resolution (devicePixelRatio) instead of 1 CSS px = 1 canvas px,
      // which looked blurry on high-density screens. They are redrawn sharper after a pinch-zoom, and only pages
      // near the viewport keep a bitmap, so long documents don't run the WebView out of memory.
      pdfjsLib.getDocument({ data: uint8 }).promise.then(function (pdf) {
        var viewer = document.getElementById('viewer');
        viewer.innerHTML = '';
        var dpr = window.devicePixelRatio || 1;
        var cssW = window.innerWidth - 16;
        var pages = [];
        function zoom() { return (window.visualViewport && window.visualViewport.scale) || 1; }
        function draw(rec) {
          var want = Math.min(dpr * Math.max(1, zoom()), 4);
          if (rec.drawnAt >= want - 0.01 || rec.busy) return;
          rec.busy = true;
          pdf.getPage(rec.num).then(function (page) {
            var base = page.getViewport({ scale: 1 });
            var cssScale = cssW / base.width;
            var vp = page.getViewport({ scale: cssScale * want });
            var maxPx = 8000000; // keep one page under ~32 MB
            if (vp.width * vp.height > maxPx) vp = page.getViewport({ scale: cssScale * want * Math.sqrt(maxPx / (vp.width * vp.height)) });
            var c = rec.canvas;
            c.width = Math.floor(vp.width);
            c.height = Math.floor(vp.height);
            return page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise.then(function () {
              rec.drawnAt = want;
              rec.busy = false;
            });
          }).catch(function () { rec.busy = false; });
        }
        function free(rec) {
          if (rec.drawnAt > 0 && !rec.busy) { rec.canvas.width = 1; rec.canvas.height = 1; rec.drawnAt = 0; }
        }
        function refresh() {
          var vv = window.visualViewport;
          var top = vv ? vv.pageTop : window.scrollY, h = window.innerHeight / zoom();
          pages.forEach(function (rec) {
            var r = rec.canvas.offsetTop, bottom = r + rec.cssH;
            var near = bottom > top - 2 * h && r < top + 3 * h;
            if (near) draw(rec); else free(rec);
          });
        }
        var chain = Promise.resolve();
        for (var p = 1; p <= pdf.numPages; p++) {
          (function (num) {
            chain = chain.then(function () {
              return pdf.getPage(num).then(function (page) {
                var base = page.getViewport({ scale: 1 });
                var cssH = cssW * base.height / base.width;
                var c = document.createElement('canvas');
                c.width = 1;
                c.height = 1;
                c.style.width = cssW + 'px';
                c.style.height = cssH + 'px';
                c.style.background = '#fff';
                viewer.appendChild(c);
                pages.push({ num: num, canvas: c, cssH: cssH, drawnAt: 0, busy: false });
              });
            });
          })(p);
        }
        chain.then(function () {
          refresh();
          var t = null;
          function later() { clearTimeout(t); t = setTimeout(refresh, 150); }
          window.addEventListener('scroll', later, { passive: true });
          if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', later); // pinch-zoom ended: redraw sharper
            window.visualViewport.addEventListener('scroll', later);
          }
        });
      }).catch(function (e) {
        document.getElementById('viewer').innerHTML =
          '<p class="msg error">PDF render error: ' + e.message + '</p>';
      });
    } catch (e) {
      document.getElementById('viewer').innerHTML =
        '<p class="msg error">Error: ' + e.message + '</p>';
    }
  </script>
</body>
</html>`;

export const PdfViewerScreen: React.FC<Props> = ({ route }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { serverUrl, token } = useAuthStore();
  const { documentId } = route.params;

  const [htmlUri, setHtmlUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadPdf = async () => {
      try {
        const baseUrl = serverUrl.replace(/\/+$/, '');
        const url = `${baseUrl}/api/documents/${documentId}/preview/`;
        const pdfPath = `${FileSystem.cacheDirectory}doc_preview_${documentId}.pdf`;

        const result = await FileSystem.downloadAsync(url, pdfPath, {
          headers: { Authorization: `Token ${token}` },
        });

        if (cancelled) return;
        if (result.status !== 200) {
          setError(t('documents.pdfLoadError', { status: result.status }));
          setLoading(false);
          return;
        }

        const base64 = await FileSystem.readAsStringAsync(pdfPath, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (cancelled) return;

        const html = buildViewerHtml(base64);
        const htmlPath = `${FileSystem.cacheDirectory}viewer_${documentId}.html`;
        await FileSystem.writeAsStringAsync(htmlPath, html);
        if (cancelled) return;

        setHtmlUri(htmlPath);
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message);
          setLoading(false);
        }
      }
    };

    loadPdf();
    return () => {
      cancelled = true;
    };
  }, [documentId, serverUrl, token, t]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.onBackground }}>
          {t('documents.pdfLoading')}
        </Text>
      </View>
    );
  }

  if (error || !htmlUri) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error, textAlign: 'center', padding: 16 }}>
          {error || t('common.error')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#525659' }]}>
      <WebView
        source={{ uri: htmlUri }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowFileAccessFromFileURLs
        mixedContentMode="always"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: '#525659',
  },
});
