import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, AlertCircle, UserPlus } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AppBar } from '../../components/AppBar';
import { IconBtn } from '../../components/IconBtn';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { createAdmin } from '../../services/admins';
import { ApiError } from '../../services/api';
import { toast } from '../../store/uiStore';
import type { Colors } from '../../theme/colors';
import { useColors, useThemedStyles } from '../../theme/useThemedStyles';

interface Props {
  navigation: any;
}

// Matches API policy for admin initial password
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
const EMAIL_RULE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldName = 'firstName' | 'lastName' | 'email' | 'initialPassword';

export function CreateAdminScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  const [firstName,        setFirstName]        = useState('');
  const [lastName,         setLastName]         = useState('');
  const [email,            setEmail]            = useState('');
  const [initialPassword,  setInitialPassword]  = useState('');
  const [submitting,       setSubmitting]       = useState(false);
  const [fieldErrors,      setFieldErrors]      = useState<Record<string, string>>({});
  const [blurred,          setBlurred]          = useState<Record<FieldName, boolean>>({
    firstName: false, lastName: false, email: false, initialPassword: false,
  });

  const markBlurred = (f: FieldName) =>
    setBlurred((p) => p[f] ? p : { ...p, [f]: true });

  const validationErrors = useMemo(() => {
    const e: Partial<Record<FieldName, string>> = {};
    if (!firstName.trim()) e.firstName = 'First name is required.';
    if (!lastName.trim())  e.lastName  = 'Last name is required.';
    if (!email.trim())               e.email = 'Email is required.';
    else if (!EMAIL_RULE.test(email.trim())) e.email = 'Enter a valid email address.';
    if (!initialPassword)            e.initialPassword = 'Initial password is required.';
    else if (!PASSWORD_RULE.test(initialPassword))
      e.initialPassword = 'Use 10+ chars with uppercase, lowercase, a number and a symbol.';
    return e;
  }, [firstName, lastName, email, initialPassword]);

  const showError = (f: FieldName) =>
    (blurred[f] ? validationErrors[f] : undefined) ?? fieldErrors[f];

  const canSubmit = Object.keys(validationErrors).length === 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setFieldErrors({});

    try {
      await createAdmin({
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        email:     email.trim(),
        initialPassword,
      });
      toast.success('Admin account created.');
      navigation.goBack();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'EMAIL_EXISTS') {
          setFieldErrors({ email: 'This email is already registered.' });
        } else if (err.code === 'VALIDATION_ERROR' && err.details) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(err.details)) {
            mapped[k] = Array.isArray(v) ? v[0] : String(v);
          }
          setFieldErrors(mapped);
        } else if (err.code === 'NETWORK_ERROR' || err.code === 'TIMEOUT') {
          toast.error("Couldn't reach the server. Check your connection.");
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const ErrorRow = ({ field }: { field: FieldName }) => {
    const msg = showError(field);
    if (!msg) return null;
    return (
      <View style={styles.errorRow}>
        <AlertCircle size={13} color={colors.error} />
        <Text style={styles.errorText}>{msg}</Text>
      </View>
    );
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <AppBar
        title="Create Admin"
        leading={
          <IconBtn onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={colors.primary} />
          </IconBtn>
        }
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          A new admin account will be created immediately. The admin will receive login credentials by email.
        </Text>

        <View style={styles.fields}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                onBlur={() => markBlurred('firstName')}
                placeholder="First name"
                autoCapitalize="words"
              />
              <ErrorRow field="firstName" />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                onBlur={() => markBlurred('lastName')}
                placeholder="Last name"
                autoCapitalize="words"
              />
              <ErrorRow field="lastName" />
            </View>
          </View>

          <Input
            label="Email"
            value={email}
            onChangeText={(t) => { setEmail(t); setFieldErrors((p) => ({ ...p, email: '' })); }}
            onBlur={() => markBlurred('email')}
            placeholder="admin@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <ErrorRow field="email" />

          <Input
            label="Initial password"
            value={initialPassword}
            onChangeText={setInitialPassword}
            onBlur={() => markBlurred('initialPassword')}
            placeholder="Temporary password"
            password
            hint="10+ chars with uppercase, lowercase, a number and a symbol."
          />
          <ErrorRow field="initialPassword" />
        </View>

        <View style={styles.actions}>
          <Button
            full size="lg"
            leftIcon={<UserPlus size={16} color={colors.white} />}
            disabled={submitting}
            onPress={handleSubmit}
          >
            {submitting ? 'Creating…' : 'Create admin account'}
          </Button>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  body:      { padding: 16, gap: 16, paddingBottom: 40 },
  subtitle:  { fontSize: 13, color: colors.bodyGreen, lineHeight: 20 },
  fields:    { gap: 12 },
  row:       { flexDirection: 'row', gap: 10 },
  errorRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  errorText: { flex: 1, fontSize: 12, color: colors.error, fontWeight: '600' },
  actions:   { marginTop: 8 },
});
