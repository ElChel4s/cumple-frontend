'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/context';

export function AdminScreen() {
  const { setScreen, currentUser, guests, setGuests, colorRevealEnabled, setColorRevealEnabled } = useApp();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [newGuestName, setNewGuestName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const ADMIN_PASSWORD = 'LEVEL21';
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

  // Auto-authenticate if user is admin (ID 1)
  useEffect(() => {
    if (currentUser?.id === '1') {
      setIsAuthenticated(true);
    }
  }, [currentUser?.id]);

  const handleAdminLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('INCORRECT PASSWORD');
    }
  };

  const toggleColorReveal = async () => {
    const newState = !colorRevealEnabled;
    try {
      const res = await fetch(`${API_URL}/api/configuracion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sorteo_activo: newState }),
      });
      
      if (res.ok) {
        setColorRevealEnabled(newState);
      } else {
        alert('No se pudo actualizar la configuración');
      }
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      alert('Error de conexión');
    }
  };

  const resetAllGuests = () => {
    if (confirm('RESET ALL GUESTS? THIS CANNOT BE UNDONE')) {
      const reset = guests.map(g => ({
        ...g,
        status: 'pending' as const,
        colorRevealed: false,
      }));
      setGuests(reset);
    }
  };

  const handleCreateGuest = async () => {
    if (!newGuestName.trim()) {
      alert('Por favor ingresa el nombre del invitado');
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/invitado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newGuestName }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'No se pudo crear el invitado');
      }

      const newGuest = await res.json();
      
      // Agregar invitado a la lista local
      setGuests([
        ...guests,
        {
          id: String(newGuest.id),
          name: newGuest.nombre,
          code: newGuest.codigo_acceso,
          status: 'pending' as const,
          colorAssigned: '#0a0a0a',
          colorName: 'Sin asignar',
          colorRevealed: false,
        },
      ]);

      setNewGuestName('');
      alert(`✓ Invitado creado: ${newGuest.nombre} (${newGuest.codigo_acceso})`);
    } catch (error) {
      console.error(error);
      alert('No se pudo crear el invitado. Intenta de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  if (!isAuthenticated) {
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
            <h2 className="text-3xl font-bold text-primary glow-cyan mb-2 text-center">
              ACCESO ADMIN
            </h2>
            <p className="text-secondary text-center font-mono mb-8 text-sm">
              // ÁREA RESTRINGIDA
            </p>

            <div className="space-y-6">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="CONTRASEÑA_ADMIN"
                className="w-full px-4 py-3 bg-input border-2 border-primary/30 rounded-lg text-foreground font-mono uppercase focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
                style={{
                  boxShadow: 'inset 0 0 10px rgba(0, 229, 255, 0.05)',
                }}
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-destructive font-mono text-sm text-center glow-cyan"
                >
                  ✕ {error}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdminLogin}
                className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:opacity-80 transition-opacity font-mono border border-primary"
                style={{
                  boxShadow: '0 0 15px rgba(0, 229, 255, 0.3), inset 0 0 15px rgba(0, 229, 255, 0.1)',
                }}
              >
                → AUTENTICAR
              </motion.button>

              <button
                onClick={() => setScreen('dashboard')}
                className="w-full text-muted-foreground hover:text-foreground transition-colors font-mono text-sm py-2"
              >
                ← ATRÁS
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-primary/20">
              <p className="text-muted-foreground font-mono text-xs text-center">
                PISTA: LEVEL21
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const attendingCount = guests.filter(g => g.status === 'attending').length;
  const declinedCount = guests.filter(g => g.status === 'declined').length;
  const pendingCount = guests.filter(g => g.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center pt-6">
          <h2 className="text-4xl font-bold text-secondary glow-lime mb-2">
            PANEL ADMIN
          </h2>
          <p className="text-primary font-mono text-sm glow-cyan">
            // CONTROL TOTAL
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
          <div 
            className="bg-card border-2 border-primary rounded-lg p-6 text-center hover:border-primary transition-all duration-300"
            style={{
              boxShadow: 'inset 0 0 15px rgba(0, 229, 255, 0.05), 0 0 20px rgba(0, 229, 255, 0.1)',
            }}
          >
            <p className="text-3xl font-bold text-secondary glow-lime">{attendingCount}</p>
            <p className="text-muted-foreground font-mono text-sm mt-2">CONFIRMADOS</p>
          </div>
          <div 
            className="bg-card border-2 border-primary rounded-lg p-6 text-center hover:border-primary transition-all duration-300"
            style={{
              boxShadow: 'inset 0 0 15px rgba(0, 229, 255, 0.05), 0 0 20px rgba(0, 229, 255, 0.1)',
            }}
          >
            <p className="text-3xl font-bold text-primary glow-cyan">{pendingCount}</p>
            <p className="text-muted-foreground font-mono text-sm mt-2">PENDIENTE</p>
          </div>
          <div 
            className="bg-card border-2 border-destructive rounded-lg p-6 text-center hover:border-destructive transition-all duration-300"
            style={{
              boxShadow: 'inset 0 0 15px rgba(255, 68, 68, 0.05), 0 0 20px rgba(255, 68, 68, 0.1)',
            }}
          >
            <p className="text-3xl font-bold text-destructive">{declinedCount}</p>
            <p className="text-muted-foreground font-mono text-sm mt-2">RECHAZADOS</p>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div 
          variants={itemVariants} 
          className="bg-card border-2 border-primary rounded-lg p-8 hover:border-primary transition-all duration-300"
          style={{
            boxShadow: 'inset 0 0 20px rgba(0, 229, 255, 0.05), 0 0 30px rgba(0, 229, 255, 0.15)',
          }}
        >
          <h3 className="text-2xl font-bold text-primary glow-cyan mb-6 font-mono">
            // CONTROLES DEL SISTEMA
          </h3>

          <div className="space-y-4">
            {/* Color Reveal Toggle */}
            <div className="flex items-center justify-between p-4 bg-input border-2 border-primary/30 rounded-lg hover:border-primary/60 transition-all duration-300"
              style={{
                boxShadow: 'inset 0 0 10px rgba(0, 229, 255, 0.05)',
              }}
            >
              <div>
                <p className="font-bold text-foreground font-mono">REVELAR COLORES</p>
                <p className="text-muted-foreground text-sm font-mono">Permite a huéspedes revelar colores</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleColorReveal}
                className={`px-6 py-2 rounded-lg font-bold font-mono transition-colors border ${
                  colorRevealEnabled
                    ? 'bg-secondary text-secondary-foreground border-secondary'
                    : 'bg-muted text-muted-foreground border-muted'
                }`}
                style={colorRevealEnabled ? {
                  boxShadow: '0 0 15px rgba(188, 254, 47, 0.3), inset 0 0 10px rgba(188, 254, 47, 0.1)',
                } : {}}
              >
                {colorRevealEnabled ? '✓ ACTIVADO' : '✕ DESACTIVADO'}
              </motion.button>
            </div>

            {/* Reset button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetAllGuests}
              className="w-full bg-destructive text-destructive-foreground font-bold py-3 px-4 rounded-lg hover:opacity-80 transition-opacity font-mono border border-destructive"
              style={{
                boxShadow: '0 0 15px rgba(255, 68, 68, 0.3), inset 0 0 10px rgba(255, 68, 68, 0.1)',
              }}
            >
              ⟳ REINICIAR TODOS LOS HUÉSPEDES
            </motion.button>
          </div>
        </motion.div>

        {/* Create Guest */}
        <motion.div 
          variants={itemVariants} 
          className="bg-card border-2 border-secondary rounded-lg p-8 hover:border-secondary transition-all duration-300"
          style={{
            boxShadow: 'inset 0 0 20px rgba(188, 254, 47, 0.05), 0 0 30px rgba(188, 254, 47, 0.15)',
          }}
        >
          <h3 className="text-2xl font-bold text-secondary glow-lime mb-6 font-mono">
            {'+ CREAR NUEVO INVITADO'}
          </h3>

          <div className="space-y-4">
            <input
              type="text"
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateGuest()}
              placeholder="NOMBRE DEL INVITADO"
              className="w-full px-4 py-3 bg-input border-2 border-secondary/30 rounded-lg text-foreground font-mono uppercase focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/50 transition-all"
              style={{
                boxShadow: 'inset 0 0 10px rgba(188, 254, 47, 0.05)',
              }}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateGuest}
              disabled={isCreating}
              className="w-full bg-secondary text-secondary-foreground font-bold py-3 px-4 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 font-mono border border-secondary"
              style={{
                boxShadow: '0 0 20px rgba(188, 254, 47, 0.3), inset 0 0 15px rgba(188, 254, 47, 0.1)',
              }}
            >
              {isCreating ? '⟳ CREANDO...' : '✓ CREAR INVITADO'}
            </motion.button>

            <p className="text-muted-foreground text-sm font-mono text-center">
              Se generará un código automático (ej: ABC123)
            </p>
          </div>
        </motion.div>

        {/* Guest List */}
        <motion.div 
          variants={itemVariants} 
          className="bg-card border-2 border-primary rounded-lg p-8 hover:border-primary transition-all duration-300"
          style={{
            boxShadow: 'inset 0 0 20px rgba(0, 229, 255, 0.05), 0 0 30px rgba(0, 229, 255, 0.15)',
          }}
        >
          <h3 className="text-2xl font-bold text-primary glow-cyan mb-6 font-mono">
            // LISTA DE HUÉSPEDES
          </h3>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {guests.map((guest, idx) => (
              <motion.div
                key={guest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-4 bg-input border-2 border-primary/30 rounded-lg hover:border-primary/60 transition-all duration-300"
                style={{
                  boxShadow: 'inset 0 0 10px rgba(0, 229, 255, 0.05)',
                }}
              >
                <div className="flex-1">
                  <p className="font-mono font-bold text-foreground">{guest.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{guest.code}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded text-xs font-mono font-bold border ${
                    guest.status === 'attending'
                      ? 'bg-secondary/20 text-secondary border-secondary/50'
                      : guest.status === 'declined'
                      ? 'bg-destructive/20 text-destructive border-destructive/50'
                      : 'bg-primary/20 text-primary border-primary/50'
                  }`}>
                    {guest.status === 'attending' ? 'CONFIRMADO' : guest.status === 'declined' ? 'RECHAZADO' : 'PENDIENTE'}
                  </span>
                  <div
                    className="w-5 h-5 rounded border-2 border-primary"
                    style={{
                      backgroundColor: guest.colorAssigned,
                      boxShadow: `0 0 10px ${guest.colorAssigned}`
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Back button */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setScreen('dashboard')}
          className="w-full bg-transparent border-2 border-primary text-primary font-bold py-3 px-4 rounded-lg hover:bg-primary/10 transition-colors font-mono"
          style={{
            boxShadow: 'inset 0 0 10px rgba(0, 229, 255, 0.05)',
          }}
        >
          ← VOLVER AL DASHBOARD
        </motion.button>
      </motion.div>
    </div>
  );
}
