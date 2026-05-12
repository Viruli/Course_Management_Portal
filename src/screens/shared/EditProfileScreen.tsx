import React, { useState } from 'react';
import {
  Image, Pressable, ScrollView, StyleSheet, Text, View, Alert,
} from 'react-native';
import {
  ArrowLeft, Camera, Trash2, Check, AlertCircle, KeyRound,
  Sun, Moon, Smartphone, Palette,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Avatar } from '../../components/Avatar';
import { useProfileStore, fullName } from '../../store/profileStore';
import type { ProfileRole } from '../../store/profileStore';
import { toast } from '../../store/uiStore';
import { useThemeStore, ThemeMode } from '../../store/themeStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

interface Props {
  role: ProfileRole;
  onBack: () => void;
}

export function EditProfileScreen({ role, onBack }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const profile  = useProfileStore((s) => s.profiles[role]);
  const update   = useProfileStore((s) => s.update);
  const setPhoto = useProfileStore((s) => s.setPhoto);

  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName,  setLastName]  = useState(profile.lastName);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd,     setNewPwd]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSection, setPwdSection] = useState(false);

  const passwordMismatch = newPwd.length > 0 && confirmPwd.length > 0 && newPwd !== confirmPwd;

  const handlePickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to change your profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(role, result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take a profile photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(role, result.assets[0].uri);
    }
  };

  const handleSave = () => {
    update(role, {
      firstName: firstName.trim() || profile.firstName,
      lastName:  lastName.trim()  || profile.lastName,
    });
    if (pwdSection && newPwd && newPwd === confirmPwd) {
      // Demo: pretend the password was changed.
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      toast.success('Profile and password updated.');
    } else {
      toast.success('Profile updated.');
    }
    onBack();
  };

  return (
    <ScreenContainer edges={['top']} bg={colors.surface2}>
      <AppBar
        title="Edit profile"
        leading={<IconBtn onPress={onBack}><ArrowLeft size={20} color={colors.primary} /></IconBtn>}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Profile photo */}
        <View style={styles.photoCard}>
          <View style={styles.avatarWrap}>
            <Avatar
              size={96}
              name={fullName(profile)}
              variant={role === 'super' ? 'lime' : role === 'admin' ? 'dark' : 'default'}
              photoUri={profile.photoUri}
            />
            <View style={styles.cameraBadge}>
              <Camera size={14} color={colors.primary} />
            </View>
          </View>
          <View style={styles.photoActions}>
            <Pressable style={styles.photoBtn} onPress={handlePickPhoto}>
              <Camera size={14} color={colors.primary} />
              <Text style={styles.photoBtnText}>Choose photo</Text>
            </Pressable>
            <Pressable style={styles.photoBtn} onPress={handleTakePhoto}>
              <Camera size={14} color={colors.primary} />
              <Text style={styles.photoBtnText}>Take photo</Text>
            </Pressable>
            {profile.photoUri ? (
              <Pressable
                style={[styles.photoBtn, { backgroundColor: colors.errorBg }]}
                onPress={() => setPhoto(role, undefined)}
              >
                <Trash2 size={14} color={colors.error} />
                <Text style={[styles.photoBtnText, { color: colors.error }]}>Remove</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Personal info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Personal info</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
            </View>
          </View>
          <View style={{ gap: 6 }}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.readOnly}>
              <Text style={styles.readOnlyText}>{profile.email}</Text>
              <Text style={styles.readOnlyHint}>Email can't be changed.</Text>
            </View>
          </View>
        </View>

        {/* Change password */}
        <View style={styles.section}>
          <Pressable
            style={styles.pwdHead}
            onPress={() => setPwdSection((v) => !v)}
          >
            <View style={styles.pwdHeadIco}>
              <KeyRound size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Change password</Text>
              <Text style={styles.pwdHeadSub}>
                {pwdSection ? 'Fill in the fields below.' : 'Tap to update your password.'}
              </Text>
            </View>
            <Text style={styles.pwdToggle}>{pwdSection ? 'Cancel' : 'Edit'}</Text>
          </Pressable>

          {pwdSection ? (
            <View style={{ gap: 12, marginTop: 4 }}>
              <Input
                label="Current password"
                value={currentPwd}
                onChangeText={setCurrentPwd}
                password
                placeholder="Your current password"
              />
              <Input
                label="New password"
                value={newPwd}
                onChangeText={setNewPwd}
                password
                placeholder="At least 6 characters"
              />
              <Input
                label="Confirm new password"
                value={confirmPwd}
                onChangeText={setConfirmPwd}
                password
                placeholder="Repeat the new password"
              />
              {passwordMismatch ? (
                <View style={styles.errorRow}>
                  <AlertCircle size={13} color={colors.error} />
                  <Text style={styles.errorText}>Passwords don't match.</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Appearance — Light / Dark / System */}
        <AppearanceSection />
      </ScrollView>

      <View style={styles.stickyBar}>
        <View style={{ flex: 1 }}>
          <Button variant="secondary" full size="lg" onPress={onBack}>Cancel</Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button
            full size="lg"
            leftIcon={<Check size={16} color={colors.white} />}
            disabled={pwdSection && (passwordMismatch || (newPwd.length > 0 && newPwd.length < 6))}
            onPress={handleSave}
          >
            Save
          </Button>
        </View>
      </View>
    </ScreenContainer>
  );
}

function AppearanceSection() {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const options: { id: ThemeMode; label: string; Icon: any; desc: string }[] = [
    { id: 'light',  label: 'Light',  Icon: Sun,        desc: 'Bright surfaces and dark text.' },
    { id: 'dark',   label: 'Dark',   Icon: Moon,       desc: 'Easy on the eyes in low light.' },
    { id: 'system', label: 'System', Icon: Smartphone, desc: 'Follow your device setting.' },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.appearanceHead}>
        <View style={styles.appearanceIco}>
          <Palette size={16} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Appearance</Text>
          <Text style={styles.pwdHeadSub}>Choose how the app looks.</Text>
        </View>
      </View>

      <View style={styles.themeRow}>
        {options.map((o) => {
          const isActive = mode === o.id;
          const Icon = o.Icon;
          return (
            <Pressable
              key={o.id}
              onPress={() => {
                setMode(o.id);
                toast.info(
                  o.id === 'system'
                    ? 'Theme follows your device.'
                    : `Switched to ${o.label} mode.`
                );
              }}
              style={[
                styles.themeOption,
                isActive && styles.themeOptionActive,
              ]}
            >
              <View
                style={[
                  styles.themeIco,
                  isActive ? { backgroundColor: colors.brand } : null,
                ]}
              >
                <Icon size={16} color={isActive ? colors.accent : colors.primary} />
              </View>
              <Text style={[styles.themeLabel, isActive && styles.themeLabelActive]}>
                {o.label}
              </Text>
              <Text style={styles.themeDesc} numberOfLines={2}>
                {o.desc}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  body: { padding: 16, gap: 14, paddingBottom: 110 },

  photoCard: {
    padding: 16, alignItems: 'center', gap: 14,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 16,
  },
  avatarWrap: { position: 'relative' },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    borderColor: colors.surface, borderWidth: 3,
  },
  photoActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9999,
    backgroundColor: colors.lightGray,
  },
  photoBtnText: { fontSize: 12, fontWeight: '700', color: colors.primary },

  section: {
    padding: 14, gap: 12,
    backgroundColor: colors.surface,
    borderColor: colors.stroke, borderWidth: 1, borderRadius: 16,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.bodyGreen, letterSpacing: 0.6, textTransform: 'uppercase' },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: colors.primary },
  row: { flexDirection: 'row', gap: 10 },

  readOnly: {
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: colors.lightGray, borderRadius: 12,
    gap: 2,
  },
  readOnlyText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  readOnlyHint: { fontSize: 11, color: colors.muted },

  pwdHead: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 4,
  },
  pwdHeadIco: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  pwdHeadSub: { fontSize: 11, color: colors.bodyGreen, marginTop: 2 },

  // Appearance toggle
  appearanceHead: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 4,
  },
  appearanceIco: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeOption: {
    flex: 1,
    padding: 12, borderRadius: 12,
    borderColor: colors.stroke, borderWidth: 1,
    backgroundColor: colors.surface,
    gap: 6,
  },
  themeOptionActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(188,233,85,0.12)',
  },
  themeIco: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  themeLabel: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 2 },
  themeLabelActive: { color: colors.primary },
  themeDesc: { fontSize: 10, color: colors.bodyGreen, lineHeight: 13 },
  pwdToggle: { fontSize: 12, fontWeight: '700', color: colors.primary, paddingHorizontal: 4 },

  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText: { fontSize: 12, color: colors.error, fontWeight: '600' },

  stickyBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24,
    backgroundColor: colors.surface,
    borderTopColor: colors.stroke, borderTopWidth: 1,
    flexDirection: 'row', gap: 10,
  },
});
