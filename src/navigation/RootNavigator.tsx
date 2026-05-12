import React, { useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppStore } from '../store/appStore';
import { AuthFlow } from './AuthFlow';
import { StudentTabs } from './StudentTabs';
import { AdminTabs } from './AdminTabs';
import { SuperAdminTabs } from './SuperAdminTabs';
import { useColors } from '../theme/useThemedStyles';
import { useResolvedScheme } from '../store/themeStore';

export function RootNavigator() {
  const role = useAppStore((s) => s.role);
  const colors = useColors();
  const scheme = useResolvedScheme();
  const navTheme = useMemo(
    () => ({
      dark: scheme === 'dark',
      colors: {
        primary: colors.brand,
        background: colors.pageBg,
        card: colors.surface,
        text: colors.primary,
        border: colors.stroke,
        notification: colors.error,
      },
      fonts: {
        regular: { fontFamily: 'System', fontWeight: '400' as const },
        medium:  { fontFamily: 'System', fontWeight: '500' as const },
        bold:    { fontFamily: 'System', fontWeight: '700' as const },
        heavy:   { fontFamily: 'System', fontWeight: '800' as const },
      },
    }),
    [scheme, colors],
  );
  return (
    <NavigationContainer theme={navTheme as any}>
      {role === 'public'  && <AuthFlow />}
      {role === 'student' && <StudentTabs />}
      {role === 'admin'   && <AdminTabs />}
      {role === 'super'   && <SuperAdminTabs />}
    </NavigationContainer>
  );
}
