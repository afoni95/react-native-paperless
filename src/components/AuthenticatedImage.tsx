import React, { useEffect, useState } from 'react';
import { Image, ImageStyle, StyleProp, ActivityIndicator, View } from 'react-native';
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
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await apiClient.get(uri, {
          responseType: 'arraybuffer',
        });

        if (isMounted) {
          // arraybuffer -> base64 string
          const base64 = btoa(
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );
          
          const contentType = response.headers['content-type'] || 'image/png';
          const dataUri = `data:${contentType};base64,${base64}`;
          
          setImageData(dataUri);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Failed to load image', uri, err);
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
      <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0' }]}>
        <ActivityIndicator size="small" color="#666" />
      </View>
    );
  }

  if (error || !imageData) {
    return (
      <View style={[style, { backgroundColor: '#e0e0e0' }]} />
    );
  }

  return (
    <Image
      source={{ uri: imageData }}
      style={style}
      resizeMode={resizeMode}
    />
  );
};
