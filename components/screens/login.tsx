'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp, mapBackendStatusToGuestStatus } from '@/lib/context';

export function LoginScreen() {
  const { setScreen, setCurrentUser } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = process.env.NODE_ENV === 'production'
        ? 'https://cumpleback.vmoop.com'
        : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000');
      const response = await fetch(`${API_URL}/api/invitado/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo_acceso: code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Map Laravel Invitado model to AppContext Guest shape
        const user = {
          id: data.id?.toString() ?? code,
          name: data.nombre ?? data.name ?? code,
          code: data.codigo_acceso ?? code,
          status: mapBackendStatusToGuestStatus(data.asistencia),
          colorAssigned: data.color?.hex ?? '',
          colorName: data.color?.nombre ?? 'Sin asignar',
          colorRevealed: !!data.color_id,
        };
        setCurrentUser(user);
        setScreen('dashboard');
      } else {
        setError(data.message || 'Código inválido');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card border-2 border-primary rounded-lg p-8"
          style={{
            boxShadow: 'inset 0 0 20px rgba(0, 229, 255, 0.05), 0 0 30px rgba(0, 229, 255, 0.15)',
          }}
        >
          <h2 className="text-3xl font-bold text-primary glow-cyan mb-2 text-center">
            ACCESO
          </h2>
          <p className="text-secondary text-center font-mono mb-8">
            {'// INGRESA TU CÓDIGO'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO"
                className="w-full bg-background border-2 border-primary rounded px-4 py-3 text-foreground font-mono text-center text-lg focus:outline-none focus:border-secondary transition-colors"
                style={{
                  boxShadow: 'inset 0 0 10px rgba(0, 229, 255, 0.1)',
                }}
                disabled={loading}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-center font-mono text-sm"
              >
                ⚠ {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || !code}
              className="w-full bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg text-lg hover:opacity-80 transition-opacity border border-primary disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: '0 0 20px rgba(0, 229, 255, 0.4), inset 0 0 20px rgba(0, 229, 255, 0.1)',
              }}
            >
              {loading ? '→ VERIFICANDO...' : '→ VERIFICAR'}
            </motion.button>
          </form>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScreen('landing')}
            className="w-full mt-4 text-secondary font-mono text-sm hover:text-primary transition-colors"
          >
            ← VOLVER
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}