import React, { useEffect, useState } from 'react';
import { Image, ImageStyle, StyleProp, ActivityIndicator, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import apiClient from '@/api/client';

interface AuthenticatedImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  uri,
  style,
  resizeMode = 'cover',
}) => {
  const theme = useTheme();
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const buildDataUri = (buffer: ArrayBuffer, contentType: string) => {
    const base64 = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''),
    );
    return `data:${contentType};base64,${base64}`;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await apiClient.get(uri, { responseType: 'arraybuffer' });

        if (isMounted) {
          const contentType = response.headers['content-type'] || 'image/png';
          setImageData(buildDataUri(response.data, contentType));
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          if (__DEV__) console.warn('Failed to load image', uri, err);
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [uri]);

  if (loading) {
    return (
      <View
        style={[
          style,
          {
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
          },
        ]}
      >
        <ActivityIndicator size="small" color={theme.colors.onSurfaceVariant} />
      </View>
    );
  }

  if (error || !imageData) {
    return <View style={[style, { backgroundColor: theme.colors.surfaceVariant }]} />;
  }

  return <Image source={{ uri: imageData }} style={style} resizeMode={resizeMode} />;
};
