'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp, mapBackendStatusToGuestStatus, mapGuestStatusToBackendStatus } from '@/lib/context';

export function RSVPScreen() {
  const { setScreen, currentUser, setCurrentUser, guests, setGuests } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://cumpleback.vmoop.com'
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000');

  const handleResponse = async (status: 'attending' | 'pending' | 'declined') => {
    if (!currentUser) return;

    setIsLoading(true);

    try {
      const asistencia = mapGuestStatusToBackendStatus(status);

      const res = await fetch(`${API_URL}/api/invitado/${currentUser.id}/asistencia`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asistencia }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error actualizando asistencia');
      }

      const updated = await res.json();
      const mapped = {
        ...currentUser,
        status: mapBackendStatusToGuestStatus(updated.asistencia),
        colorAssigned: updated.color?.hex ?? currentUser.colorAssigned,
        colorName: updated.color?.nombre ?? currentUser.colorName,
        colorRevealed: !!updated.color_id,
      };

      setCurrentUser(mapped);
      setGuests(guests.map(g => (g.id === mapped.id ? mapped : g)));
      setScreen('dashboard');
    } catch (e) {
      console.error(e);
      alert('No se pudo actualizar la asistencia. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <div 
          className="bg-card border-2 border-primary rounded-lg p-8 hover:border-primary transition-all duration-300"
          style={{
            boxShadow: 'inset 0 0 20px rgba(0, 229, 255, 0.05), 0 0 30px rgba(0, 229, 255, 0.15)',
          }}
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-primary glow-cyan mb-2 text-center">
            ¡HOLA, {currentUser?.name.toUpperCase()}!
          </motion.h2>
          <motion.p variants={itemVariants} className="text-secondary text-center font-mono mb-8 text-sm">
            {'// ¿LISTO PARA LA FIESTA?'}
          </motion.p>

          <motion.div 
            variants={itemVariants} 
            className="bg-input border-2 border-primary/30 rounded-lg p-6 mb-8 hover:border-primary/60 transition-all duration-300"
            style={{
              boxShadow: 'inset 0 0 10px rgba(0, 229, 255, 0.05)',
            }}
          >
            <p className="text-foreground font-mono text-sm text-center space-y-2">
              <div>Mi pana, ¿puedes confirmar tu asistencia para el 8 de marzo a las 14:00?</div>
              <div className="text-primary">8 MARZO 2025</div>
              <div className="text-secondary">14:00 - NO SÉ</div>
              <div className="text-muted text-sm mt-2">Promete que llegarás puntual o que al menos intentarás estar.</div>
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            {/* Yes button */}
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              onClick={() => handleResponse('attending')}
              disabled={isLoading}
              className="w-full bg-secondary text-secondary-foreground font-bold py-4 px-4 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 font-mono text-lg border border-secondary"
              style={{
                boxShadow: '0 0 15px rgba(188, 254, 47, 0.3), inset 0 0 15px rgba(188, 254, 47, 0.1)',
              }}
            >
              {isLoading ? '⟳ PROCESANDO...' : '✓ SÍ, VOY'}
            </motion.button>

            {/* Maybe button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleResponse('pending')}
              disabled={isLoading}
              className="w-full bg-transparent border-2 border-primary text-primary font-bold py-4 px-4 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50 font-mono"
              style={{
                boxShadow: 'inset 0 0 10px rgba(0, 229, 255, 0.05)',
              }}
            >
              ? NO SÉ
            </motion.button>

            {/* No button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleResponse('declined')}
              disabled={isLoading}
              className="w-full bg-transparent border-2 border-destructive text-destructive font-bold py-4 px-4 rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50 font-mono"
              style={{
                boxShadow: 'inset 0 0 10px rgba(255, 68, 68, 0.05)',
              }}
            >
              ✕ NO PUEDO IR
            </motion.button>
          </motion.div>

          {/* Back button */}
          <button
            onClick={() => setScreen('login')}
            disabled={isLoading}
            className="w-full text-muted-foreground hover:text-foreground transition-colors font-mono text-sm py-3 mt-4"
          >
            ← ATRÁS
          </button>
        </div>
      </motion.div>
    </div>
  );
}
