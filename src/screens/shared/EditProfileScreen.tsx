import React, { useState } from 'react';
import {
  Pressable, ScrollView, StyleSheet, Text, View, Alert,
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
import { updateMyProfile, changePassword as changePasswordApi } from '../../services/profile';
import { ApiError } from '../../services/api';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

// Matches API password policy: min 10 chars + upper + lower + number + special
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

interface Props {
  role: ProfileRole;
  onBack: () => void;
}

export function EditProfileScreen({ role, onBack }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const mockProfile = useProfileStore((s) => s.profiles[role]);
  const apiProfile  = useProfileStore((s) => s.apiProfile);
  const setProfile  = useProfileStore((s) => s.setProfile);
  const update      = useProfileStore((s) => s.update);
  const setPhoto    = useProfileStore((s) => s.setPhoto);

  // Seed from real API profile when available; fall back to mock
  const [firstName, setFirstName] = useState(apiProfile?.firstName ?? mockProfile.firstName);
  const [lastName,  setLastName]  = useState(apiProfile?.lastName  ?? mockProfile.lastName);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd,     setNewPwd]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSection, setPwdSection] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [pwdFieldError, setPwdFieldError] = useState<string | null>(null);

  // Resolved display values: real API data takes priority over mock.
  const displayName = apiProfile
    ? `${apiProfile.firstName} ${apiProfile.lastName}`.trim()
    : fullName(mockProfile);
  // Photo: user's in-session pick (local URI) overrides the persistent backend URL.
  const resolvedPhotoUri = mockProfile.photoUri ?? apiProfile?.profilePhotoUrl ?? undefined;

  const passwordMismatch  = newPwd.length > 0 && confirmPwd.length > 0 && newPwd !== confirmPwd;
  const passwordPolicyOk  = PASSWORD_RULE.test(newPwd);
  const passwordSectionValid = !pwdSection || (newPwd.length === 0) ||
    (currentPwd.length > 0 && passwordPolicyOk && newPwd === confirmPwd);

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

  const handleSave = async () => {
    if (saving || !passwordSectionValid) return;
    setSaving(true);
    setPwdFieldError(null);

    try {
      // Step 1: Save name via PATCH /me (when apiProfile exists)
      if (apiProfile) {
        const result = await updateMyProfile({
          firstName: firstName.trim() || apiProfile.firstName,
          lastName:  lastName.trim()  || apiProfile.lastName,
        });
        setProfile(result.data);
      } else {
        // Mock update when real auth not yet wired
        update(role, {
          firstName: firstName.trim() || mockProfile.firstName,
          lastName:  lastName.trim()  || mockProfile.lastName,
        });
      }

      // Step 2: Change password if the section is open and has a new value
      if (pwdSection && newPwd && currentPwd && passwordPolicyOk && newPwd === confirmPwd) {
        try {
          await changePasswordApi(currentPwd, newPwd);
          setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
          toast.success('Profile and password updated.');
        } catch (pwdErr) {
          if (pwdErr instanceof ApiError) {
            if (pwdErr.code === 'VALIDATION_ERROR') {
              setPwdFieldError(pwdErr.details?.newPassword?.[0] ?? pwdErr.details?.currentPassword?.[0] ?? pwdErr.message);
            } else if (pwdErr.code === 'INVALID_PASSWORD' || pwdErr.code === 'WRONG_PASSWORD') {
              setPwdFieldError('Current password is incorrect.');
            } else {
              setPwdFieldError(pwdErr.message);
            }
          } else {
            toast.error('Profile saved but password change failed. Please try again.');
          }
          return; // Don't navigate back — let user see the password error
        }
      } else {
        toast.success('Profile updated.');
      }

      onBack();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setSaving(false);
    }
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
              name={displayName}
              variant={role === 'super' ? 'lime' : role === 'admin' ? 'dark' : 'default'}
              photoUri={resolvedPhotoUri}
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
            {resolvedPhotoUri ? (
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
              <Text style={styles.readOnlyText}>{apiProfile?.email ?? mockProfile.email}</Text>
              <Text style={styles.readOnlyHint}>Email can't be changed.</Text>
            </View>
          </View>
        </View>

        {/* Change password */}
        <View style={styles.section}>
          <Pressable
            style={styles.pwdHead}
            onPress={() => {
              setPwdSection((v) => !v);
              setCurrentPwd(''); setNewPwd(''); setConfirmPwd(''); setPwdFieldError(null);
            }}
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
                onChangeText={(t) => { setCurrentPwd(t); setPwdFieldError(null); }}
                password
                placeholder="Enter your current password"
              />
              <Input
                label="New password"
                value={newPwd}
                onChangeText={(t) => { setNewPwd(t); setPwdFieldError(null); }}
                password
                placeholder="At least 10 characters"
                hint="10+ chars with uppercase, lowercase, a number and a symbol."
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
              {newPwd.length > 0 && !passwordPolicyOk && !passwordMismatch ? (
                <View style={styles.errorRow}>
                  <AlertCircle size={13} color={colors.error} />
                  <Text style={styles.errorText}>Use 10+ chars with uppercase, lowercase, a number and a symbol.</Text>
                </View>
              ) : null}
              {pwdFieldError ? (
                <View style={styles.errorRow}>
                  <AlertCircle size={13} color={colors.error} />
                  <Text style={styles.errorText}>{pwdFieldError}</Text>
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
            disabled={saving || !passwordSectionValid}
            onPress={handleSave}
          >
            {saving ? 'Saving…' : 'Save'}
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
