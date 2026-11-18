import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, ProgressBar, Snackbar, Text } from 'react-native-paper';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useShareIntent, ShareIntentFile } from 'expo-share-intent';
import * as FileSystem from 'expo-file-system/legacy';

import { documentsApi } from '@/api/documents';
import { useAuthStore } from '@/store/authStore';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import { useOfflineQueueStore } from '@/store/offlineQueueStore';

export const SHARED_DIR = `${FileSystem.documentDirectory}shared/`;
const toUri = (path: string) =>
  path.startsWith('file://') || path.startsWith('content://') ? path : `file://${path}`;
/** True only for copies inside the app cache - never delete a path that may be the user's original file. */
const inCache = (path: string) =>
  !!FileSystem.cacheDirectory && toUri(path).startsWith(FileSystem.cacheDirectory);
const nameOf = (f: ShareIntentFile) => f.fileName || f.path.split('/').pop() || 'document';

/** Shared files live in the app cache: copy them somewhere permanent before queueing them for later. */
const keepCopy = async (f: ShareIntentFile): Promise<string> => {
  await FileSystem.makeDirectoryAsync(SHARED_DIR, { intermediates: true }).catch(() => undefined);
  const target = `${SHARED_DIR}${Date.now()}_${nameOf(f).replace(/[^\w.\-]+/g, '_')}`;
  await FileSystem.copyAsync({ from: toUri(f.path), to: target });
  return target;
};

/**
 * "Send to Paperless" from Android's share menu: PDFs and images shared from any app are uploaded to Paperless
 * (or queued while offline / logged in without a server). Waits until the user is logged in.
 */
export const ShareIntentHandler: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent({
    resetOnBackground: false,
    // the app has no deep-link scheme: without this, resetShareIntent() throws looking one up
    scheme: 'paperlessnative',
  });
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const biometricLocked = useAuthStore((s) => s.biometricLocked);
  const token = useAuthStore((s) => s.token);
  const status = useNetworkStore((s) => s.status);
  const addItem = useOfflineQueueStore((s) => s.addItem);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  const files = (shareIntent.files ?? []).filter((f) => !!f.path);
  const online = status === NetworkStatus.Online && !!token;
  const visible = hasShareIntent && files.length > 0 && isAuthenticated && !biometricLocked;

  useEffect(() => {
    // text/links are not documents: drop them silently
    if (hasShareIntent && files.length === 0) resetShareIntent();
  }, [hasShareIntent, files.length, resetShareIntent]);

  const queue = async (f: ShareIntentFile) => {
    const uri = await keepCopy(f);
    if (inCache(f.path))
      FileSystem.deleteAsync(toUri(f.path), { idempotent: true }).catch(() => undefined);
    addItem({
      type: 'document',
      data: {
        title: nameOf(f).replace(/\.[^/.]+$/, ''),
        fileUri: uri,
        fileName: nameOf(f),
        fileMimeType: f.mimeType,
      },
    });
  };

  const send = async () => {
    setBusy(true);
    let sent = 0;
    let queued = 0;
    let failed = 0;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      try {
        if (online) {
          try {
            await documentsApi.uploadDocument({
              document: {
                uri: toUri(f.path),
                name: nameOf(f),
                type: f.mimeType || 'application/octet-stream',
              },
            });
            sent++;
            // the share library copies each file into the app cache: remove it once uploaded
            if (inCache(f.path))
              FileSystem.deleteAsync(toUri(f.path), { idempotent: true }).catch(() => undefined);
          } catch (e: unknown) {
            // no answer from the server (not an HTTP error): keep it for later instead of losing it
            if ((e as { response?: unknown })?.response) throw e;
            await queue(f);
            queued++;
          }
        } else {
          await queue(f);
          queued++;
        }
      } catch {
        failed++;
      }
      setProgress((i + 1) / files.length);
    }
    if (sent) {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-all'] });
    }
    const parts = [
      sent ? t('shareIntent.sent', { count: sent }) : '',
      queued ? t('shareIntent.queued', { count: queued }) : '',
      failed ? t('shareIntent.failed', { count: failed }) : '',
    ].filter(Boolean);
    setMessage(parts.join(' '));
    setBusy(false);
    setProgress(0);
    resetShareIntent();
  };

  const shown = files.slice(0, 5).map(nameOf);
  return (
    <>
      <Portal>
        <Dialog visible={visible} onDismiss={busy ? undefined : () => resetShareIntent()}>
          <Dialog.Title>{t('shareIntent.title')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{t('shareIntent.body', { count: files.length })}</Text>
            {shown.map((n, i) => (
              <Text key={`${i}-${n}`} variant="bodySmall" numberOfLines={1} style={styles.file}>
                • {n}
              </Text>
            ))}
            {files.length > shown.length ? (
              <Text variant="bodySmall" style={styles.file}>
                {t('shareIntent.more', { count: files.length - shown.length })}
              </Text>
            ) : null}
            {!online ? (
              <Text variant="bodySmall" style={styles.hint}>
                {t('shareIntent.offlineHint')}
              </Text>
            ) : null}
            {busy ? <ProgressBar progress={progress} style={styles.progress} /> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button disabled={busy} onPress={() => resetShareIntent()}>
              {t('common.cancel')}
            </Button>
            <Button mode="contained" loading={busy} disabled={busy} onPress={send}>
              {online ? t('shareIntent.send') : t('shareIntent.sendLater')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar visible={!!message} onDismiss={() => setMessage('')} duration={5000}>
        {message}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  file: { marginTop: 4, opacity: 0.8 },
  hint: { marginTop: 12, fontStyle: 'italic' },
  progress: { marginTop: 16 },
});
