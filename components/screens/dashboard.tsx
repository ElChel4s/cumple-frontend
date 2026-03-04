'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp, mapBackendStatusToGuestStatus, mapGuestStatusToBackendStatus } from '@/lib/context';

export function DashboardScreen() {
  const { setScreen, currentUser, guests, setCurrentUser, setGuests, colorRevealEnabled, setColorRevealEnabled } = useApp();
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://cumpleback.vmoop.com'
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/api/configuracion`);
        if (res.ok) {
          const data = await res.json();
          setColorRevealEnabled(data.sorteo_activo ?? false);
        }
      } catch (error) {
        console.error('Error cargando configuración:', error);
      }
    };
    fetchConfig();
  }, [API_URL, setColorRevealEnabled]);

  // Sincronizar del usuario actual con la lista de invitados
  useEffect(() => {
    if (!currentUser) return;
    
    const updatedUser = guests.find(g => g.id === currentUser.id);
    if (updatedUser && 
        (updatedUser.colorRevealed !== currentUser.colorRevealed || 
         updatedUser.colorAssigned !== currentUser.colorAssigned ||
         updatedUser.status !== currentUser.status)) {
      setCurrentUser(updatedUser);
    }
  }, [guests, currentUser, setCurrentUser]);

  const userStatus = currentUser?.status ?? 'pending';
  let statusColorClass = 'text-primary';
  let statusLabel = 'PENDIENTE';

  if (userStatus === 'attending') {
    statusColorClass = 'text-secondary';
    statusLabel = 'CONFIRMADO';
  } else if (userStatus === 'declined') {
    statusColorClass = 'text-destructive';
    statusLabel = 'RECHAZADO';
  }

  const handleRevealColor = async () => {
    if (!currentUser) return;
    
    setIsRevealing(true);
    setRevealProgress(0);

    // Simulate loading animation
    const interval = setInterval(() => {
      setRevealProgress(p => Math.min(p + Math.random() * 30, 90));
    }, 100);

    try {
      // Llamar al backend para asignar el color
      const res = await fetch(`${API_URL}/api/invitado/${currentUser.id}/asignar-color`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'No se pudo asignar el color');
      }

      const updated = await res.json();
      
      // Completar la barra de progreso
      clearInterval(interval);
      setRevealProgress(100);

      // Actualizar el usuario con el color asignado
      setTimeout(() => {
        const updatedUser = {
          ...currentUser,
          colorAssigned: updated.color?.hex || '#0a0a0a',
          colorName: updated.color?.nombre || 'Sin asignar',
          colorRevealed: true,
        };
        setCurrentUser(updatedUser);
        
        // También actualizar en la lista de invitados
        setGuests(guests.map(g => 
          g.id === currentUser.id ? updatedUser : g
        ));
        
        setIsRevealing(false);
      }, 300);
    } catch (error) {
      clearInterval(interval);
      setIsRevealing(false);
      setRevealProgress(0);
      console.error(error);
      alert('No se pudo revelar el color. Intenta de nuevo.');
    }
  };

  const handleStatusUpdate = async (nextStatus: 'pending' | 'attending' | 'declined') => {
    if (!currentUser) return;

    setIsUpdatingStatus(true);

    try {
      const asistencia = mapGuestStatusToBackendStatus(nextStatus);
      const res = await fetch(`${API_URL}/api/invitado/${currentUser.id}/asistencia`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asistencia }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'No se pudo actualizar la asistencia');
      }

      const updated = await res.json();
      setCurrentUser({
        ...currentUser,
        status: mapBackendStatusToGuestStatus(updated.asistencia),
      });
    } catch (error) {
      console.error(error);
      alert('No se pudo actualizar la asistencia. Intenta de nuevo.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const attendingGuests = guests.filter(g => g.status === 'attending');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
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
    <div className="min-h-screen bg-background p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center pt-6">
          <h2 className="text-4xl font-bold text-primary glow-cyan mb-2">
            INVITACIÓN OFICIAL
          </h2>
          <p className="text-secondary font-mono text-sm glow-lime">
            {'// BIENVENIDO A LA FIESTA, '} {currentUser?.name.toUpperCase()}
          </p>
        </motion.div>

        {/* Event Details Card */}
        <motion.div
          variants={itemVariants}
          className="bg-card border-2 border-primary rounded-lg p-8 hover:border-primary transition-all duration-300"
          style={{
            boxShadow: 'inset 0 0 20px rgba(0, 229, 255, 0.05), 0 0 30px rgba(0, 229, 255, 0.15)',
          }}
        >
          <h3 className="text-2xl font-bold text-primary glow-cyan mb-6 text-center">
            MARCELO // LEVEL 21
          </h3>
          <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between items-center pb-4 border-b border-primary/20">
              <span className="text-muted-foreground">FECHA:</span>
              <span className="text-secondary font-bold">8 MARZO 2025</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-primary/20">
              <span className="text-muted-foreground">HORA:</span>
              <span className="text-secondary font-bold">14:00 - NO SÉ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">ESTADO:</span>
              <span className={`font-bold ${statusColorClass}`}>
                {statusLabel}
              </span>
            </div>
          </div>
        </motion.div>

        {userStatus !== 'attending' && (
          <motion.div
            variants={itemVariants}
            className="bg-card border-2 border-primary rounded-lg p-8 hover:border-primary transition-all duration-300"
            style={{
              boxShadow: 'inset 0 0 20px rgba(0, 229, 255, 0.05), 0 0 30px rgba(0, 229, 255, 0.15)',
            }}
          >
            <div className="space-y-4 text-foreground font-mono text-sm md:text-base text-center">
              <p>
                <span className="text-secondary">━━━ INVITACIÓN ACTIVA ━━━</span>
              </p>
              <p>
                <span className="text-primary">FECHA:</span> 8 MARZO 2025
              </p>
              <p>
                <span className="text-primary">HORA:</span> 14:00 - NO SÉ
              </p>
              <p className="text-secondary">Estas cordialmente invitado mi pana.</p>
              <p>
                <span className="text-secondary">━━━━━━━━━━━━━━━━━━━━━</span>
              </p>
            </div>

            {userStatus === 'pending' && (
              <div className="mt-6 space-y-3">
                <p className="text-center text-sm font-mono text-muted-foreground">
                  Confirmar hasta el 5 de Marzo a las 23:59
                </p>
                <motion.button
                  whileHover={{ scale: isUpdatingStatus ? 1 : 1.02 }}
                  whileTap={{ scale: isUpdatingStatus ? 1 : 0.98 }}
                  onClick={() => handleStatusUpdate('attending')}
                  disabled={isUpdatingStatus}
                  className="w-full bg-secondary text-secondary-foreground font-bold py-3 px-4 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 font-mono border border-secondary"
                  style={{
                    boxShadow: '0 0 20px rgba(188, 254, 47, 0.3), inset 0 0 15px rgba(188, 254, 47, 0.1)',
                  }}
                >
                  ✓ CONFIRMAR ASISTENCIA
                </motion.button>
                <motion.button
                  whileHover={{ scale: isUpdatingStatus ? 1 : 1.02 }}
                  whileTap={{ scale: isUpdatingStatus ? 1 : 0.98 }}
                  onClick={() => handleStatusUpdate('declined')}
                  disabled={isUpdatingStatus}
                  className="w-full bg-transparent border-2 border-destructive text-destructive font-bold py-3 px-4 rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50 font-mono"
                >
                  ✕ RECHAZAR ASISTENCIA
                </motion.button>
              </div>
            )}

            {userStatus === 'declined' && (
              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setScreen('rsvp')}
                  className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:opacity-80 transition-opacity font-mono border border-primary"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 229, 255, 0.3), inset 0 0 15px rgba(0, 229, 255, 0.1)',
                  }}
                >
                  ↺ ME ARREPENTÍ
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {userStatus === 'attending' && (
          <motion.div
            variants={itemVariants}
            className="bg-card border-2 border-primary rounded-lg p-8 hover:border-primary transition-all duration-300"
            style={{
              boxShadow: 'inset 0 0 20px rgba(0, 229, 255, 0.05), 0 0 30px rgba(0, 229, 255, 0.15)',
            }}
          >
            <h3 className="text-xl font-bold text-primary glow-cyan mb-4 text-center font-mono">
              {'// TU COLOR'}
            </h3>
            
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-24 h-24 rounded-lg border-2 border-primary transition-all"
                style={{
                  backgroundColor: currentUser?.colorRevealed ? currentUser?.colorAssigned : '#0a0a0a',
                  boxShadow: currentUser?.colorRevealed 
                    ? `0 0 30px ${currentUser?.colorAssigned}, inset 0 0 20px ${currentUser?.colorAssigned}20`
                    : 'none'
                }}
              />

              {isRevealing && (
                <div className="w-full max-w-xs h-2 bg-input rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    style={{ width: `${revealProgress}%` }}
                  />
                </div>
              )}

              {!currentUser?.colorRevealed && (
                <motion.button
                  whileHover={{ scale: colorRevealEnabled && !isRevealing ? 1.05 : 1 }}
                  whileTap={{ scale: colorRevealEnabled && !isRevealing ? 0.95 : 1 }}
                  onClick={handleRevealColor}
                  disabled={isRevealing || !colorRevealEnabled}
                  className="bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 font-mono mt-4 border border-primary"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 229, 255, 0.3), inset 0 0 15px rgba(0, 229, 255, 0.1)',
                  }}
                >
                  {(() => {
                    if (isRevealing) return '⟳ REVELANDO...';
                    if (colorRevealEnabled) return '★ REVELAR COLOR';
                    return '🔒 SORTEO DESACTIVADO';
                  })()}
                </motion.button>
              )}

              {!colorRevealEnabled && !currentUser?.colorRevealed && (
                <p className="text-muted-foreground font-mono text-xs text-center mt-2">
                  El sorteo aún no ha sido activado
                </p>
              )}

              {currentUser?.colorRevealed && (
                <p className="text-primary font-mono text-sm glow-cyan">
                  ¡COLOR DESBLOQUEADO! {currentUser.colorName}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {userStatus === 'attending' && (
          <motion.div
            variants={itemVariants}
            className="bg-card border-2 border-secondary rounded-lg p-8 hover:border-secondary transition-all duration-300"
            style={{
              boxShadow: 'inset 0 0 20px rgba(188, 254, 47, 0.05), 0 0 30px rgba(188, 254, 47, 0.15)',
            }}
          >
            <h3 className="text-xl font-bold text-secondary glow-lime font-mono mb-4 text-center">
              {'// VER A LOS DEMÁS INVITADOS'}
            </h3>
            <p className="text-muted-foreground text-sm text-center mb-6 font-mono">
              Mira quiénes asistirán a la fiesta
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setScreen('squad')}
              className="w-full bg-secondary text-secondary-foreground font-bold py-3 px-4 rounded-lg hover:opacity-80 transition-opacity font-mono border border-secondary"
              style={{
                boxShadow: '0 0 20px rgba(188, 254, 47, 0.3), inset 0 0 15px rgba(188, 254, 47, 0.1)',
              }}
            >
              ⊞ VER INVITADOS ({attendingGuests.length} CONFIRMADOS)
            </motion.button>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div variants={itemVariants} className="space-y-3 pb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setCurrentUser(null);
              setScreen('login');
            }}
            className="w-full bg-transparent border-2 border-primary text-primary font-bold py-3 px-4 rounded-lg hover:bg-primary/10 transition-colors font-mono"
            style={{
              boxShadow: 'inset 0 0 10px rgba(0, 229, 255, 0.05)',
            }}
          >
            ← CERRAR SESIÓN
          </motion.button>
          {currentUser?.id === '1' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setScreen('admin')}
              className="w-full bg-transparent border-2 border-muted text-muted-foreground font-bold py-2 px-4 rounded-lg hover:border-muted-foreground transition-colors font-mono text-sm"
            >
              🔧 ADMIN
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
