'use client';

import { AppProvider, useApp } from '@/lib/context';
import { LandingScreen } from '@/components/screens/landing';
import { LoginScreen } from '@/components/screens/login';
import { RSVPScreen } from '@/components/screens/rsvp';
import { DashboardScreen } from '@/components/screens/dashboard';
import { SquadScreen } from '@/components/screens/squad';
import { AdminScreen } from '@/components/screens/admin';

function AppContent() {
  const { screen } = useApp();

  return (
    <>
      {screen === 'landing' && <LandingScreen />}
      {screen === 'login' && <LoginScreen />}
      {screen === 'rsvp' && <RSVPScreen />}
      {screen === 'dashboard' && <DashboardScreen />}
      {screen === 'squad' && <SquadScreen />}
      {screen === 'admin' && <AdminScreen />}
    </>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
