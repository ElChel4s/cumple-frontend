'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Screen = 'landing' | 'login' | 'rsvp' | 'dashboard' | 'squad' | 'admin';

export type GuestStatus = 'pending' | 'attending' | 'declined';

interface Guest {
  id: string;
  name: string;
  code: string;
  status: GuestStatus;
  colorAssigned: string;
  colorName: string;
  colorRevealed: boolean;
}

interface AppContextType {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  currentUser: Guest | null;
  setCurrentUser: (user: Guest | null) => void;
  guests: Guest[];
  setGuests: (guests: Guest[]) => void;
  colorRevealEnabled: boolean;
  setColorRevealEnabled: (enabled: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_SCREEN_KEY = 'cumple.screen';
const STORAGE_USER_KEY = 'cumple.currentUser';
const STORAGE_IS_ADMIN_KEY = 'cumple.isAdmin';

export function mapBackendStatusToGuestStatus(status?: string | null): GuestStatus {
  if (status === 'confirmado') return 'attending';
  if (status === 'rechazado') return 'declined';
  return 'pending';
}

export function mapGuestStatusToBackendStatus(status: GuestStatus): 'pendiente' | 'confirmado' | 'rechazado' {
  if (status === 'attending') return 'confirmado';
  if (status === 'declined') return 'rechazado';
  return 'pendiente';
}

// Mock data
const MOCK_GUESTS: Guest[] = [
  { id: '1', name: 'Valentina', code: 'VAL123', status: 'pending', colorAssigned: '#00e5ff', colorName: 'Cyan', colorRevealed: false },
  { id: '2', name: 'Diego', code: 'DI456', status: 'pending', colorAssigned: '#bcfe2f', colorName: 'Lime', colorRevealed: false },
  { id: '3', name: 'Sofia', code: 'SOF789', status: 'pending', colorAssigned: '#ff4444', colorName: 'Rojo', colorRevealed: false },
  { id: '4', name: 'Marcos', code: 'MAR012', status: 'pending', colorAssigned: '#00e5ff', colorName: 'Cyan', colorRevealed: false },
  { id: '5', name: 'Luna', code: 'LUN345', status: 'pending', colorAssigned: '#bcfe2f', colorName: 'Lime', colorRevealed: false },
];

export function AppProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [screen, setScreen] = useState<Screen>('landing');
  const [currentUser, setCurrentUser] = useState<Guest | null>(null);
  const [guests, setGuests] = useState<Guest[]>(MOCK_GUESTS);
  const [colorRevealEnabled, setColorRevealEnabled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://cumpleback.vmoop.com'
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000');

  // Cargar invitados desde el backend
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const res = await fetch(`${API_URL}/api/invitados`);
        if (res.ok) {
          const data = await res.json();
          // Mapear datos del backend al formato del frontend
          const mappedGuests: Guest[] = data.map((item: any) => ({
            id: String(item.id),
            name: item.nombre,
            code: item.codigo_acceso,
            status: mapBackendStatusToGuestStatus(item.asistencia),
            colorAssigned: item.color?.hex ?? '#0a0a0a',
            colorName: item.color?.nombre ?? 'Sin asignar',
            colorRevealed: !!item.color_id,
          }));
          setGuests(mappedGuests);
        }
      } catch (error) {
        console.error('Error fetching guests from backend:', error);
        // Mantener dados mockeados en caso de error
      }
    };
    
    fetchGuests();
  }, [API_URL]);

  useEffect(() => {
    const storedScreen = localStorage.getItem(STORAGE_SCREEN_KEY) as Screen | null;
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);
    const storedIsAdmin = localStorage.getItem(STORAGE_IS_ADMIN_KEY);

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as Guest;
        setCurrentUser(parsedUser);

        const nextScreen: Screen = storedScreen && storedScreen !== 'landing' ? storedScreen : 'dashboard';
        setScreen(nextScreen);
      } catch {
        localStorage.removeItem(STORAGE_USER_KEY);
        localStorage.removeItem(STORAGE_SCREEN_KEY);
      }
    } else if (storedScreen) {
      setScreen(storedScreen);
    }

    if (storedIsAdmin) {
      setIsAdmin(storedIsAdmin === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_SCREEN_KEY, screen);
  }, [screen]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(currentUser));
      return;
    }

    localStorage.removeItem(STORAGE_USER_KEY);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_IS_ADMIN_KEY, String(isAdmin));
  }, [isAdmin]);

  const contextValue = useMemo(() => ({
    screen,
    setScreen,
    currentUser,
    setCurrentUser,
    guests,
    setGuests,
    colorRevealEnabled,
    setColorRevealEnabled,
    isAdmin,
    setIsAdmin,
  }), [screen, currentUser, guests, colorRevealEnabled, isAdmin]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
