import React, { useState } from 'react';
import {
  ActivityIndicator, Image, Pressable, StyleSheet, Text, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, X } from 'lucide-react-native';
import { uploadCoverImage } from '../services/storage';
import { useColors } from '../theme/useThemedStyles';

interface Props {
  value:       string;               // current URL (empty = none)
  onChange:    (url: string) => void;
  disabled?:   boolean;
}

export function CoverImagePicker({ value, onChange, disabled }: Props) {
  const colors   = useColors();
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');

  const pick = async () => {
    setError('');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { setError('Gallery permission is required.'); return; }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const url = await uploadCoverImage(result.assets[0].uri);
      onChange(url);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clear = () => onChange('');

  return (
    <View style={{ gap: 6 }}>
      <Pressable
        onPress={pick}
        disabled={disabled || uploading}
        style={[styles.zone, value ? styles.zoneWithImage : null]}
      >
        {value ? (
          <>
            <Image source={{ uri: value }} style={styles.preview} resizeMode="cover" />
            <View style={styles.overlay}>
              <ImagePlus size={20} color="#fff" />
              <Text style={styles.overlayText}>Change</Text>
            </View>
          </>
        ) : uploading ? (
          <View style={styles.placeholder}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.hint, { color: colors.muted }]}>Uploading…</Text>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <ImagePlus size={24} color={colors.muted} />
            <Text style={[styles.hint, { color: colors.muted }]}>Tap to upload cover image</Text>
            <Text style={[styles.sub, { color: colors.muted }]}>16:9 · JPEG or PNG</Text>
          </View>
        )}
      </Pressable>

      {value && !uploading ? (
        <Pressable style={styles.removeRow} onPress={clear}>
          <X size={13} color={colors.error} />
          <Text style={[styles.removeText, { color: colors.error }]}>Remove image</Text>
        </Pressable>
      ) : null}

      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    height: 140,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneWithImage: {
    borderStyle: 'solid',
    borderColor: 'transparent',
  },
  placeholder: { alignItems: 'center', gap: 6 },
  hint:  { fontSize: 13, fontWeight: '600' },
  sub:   { fontSize: 11 },
  preview: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  overlayText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  removeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  removeText: { fontSize: 12, fontWeight: '600' },
  error: { fontSize: 12, fontWeight: '600' },
});
