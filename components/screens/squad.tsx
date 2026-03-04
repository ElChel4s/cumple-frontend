'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';

interface InvitadoConfirmado {
  id: string;
  nombre: string;
  codigo_acceso: string;
  color_id: number | null;
  color?: {
    id: number;
    nombre: string;
    hex: string;
  };
}

export function SquadScreen() {
  const { setScreen } = useApp();
  const [confirmados, setConfirmados] = useState<InvitadoConfirmado[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://cumpleback.vmoop.com'
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000');

  useEffect(() => {
    const fetchConfirmados = async () => {
      try {
        const res = await fetch(`${API_URL}/api/invitados/confirmados`);
        if (res.ok) {
          const data = await res.json();
          setConfirmados(data);
        }
      } catch (error) {
        console.error('Error fetching confirmados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfirmados();
  }, [API_URL]);

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

  const guestItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  const renderGuestList = (guestList: InvitadoConfirmado[]) => (
    <div className="space-y-3">
      {guestList.map((guest, idx) => (
        <motion.div
          key={guest.id}
          variants={guestItemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: idx * 0.05 }}
          className="flex items-center justify-between p-4 bg-input border border-primary/30 rounded-lg hover:border-primary/60 transition-all duration-300 hover:shadow-lg"
          style={{
            boxShadow: 'inset 0 0 10px rgba(0, 229, 255, 0.05)',
          }}
        >
          <div className="flex-1">
            <p className="font-mono font-bold text-foreground">{guest.nombre}</p>
            <p className="text-xs font-mono text-muted-foreground mt-1">{guest.codigo_acceso}</p>
          </div>
          <div
            className="w-6 h-6 rounded-lg border-2 border-primary flex-shrink-0"
            style={{
              backgroundColor: guest.color ? guest.color.hex : 'transparent',
              boxShadow: guest.color ? `0 0 15px ${guest.color.hex}, inset 0 0 10px ${guest.color.hex}30` : 'none',
            }}
          />
        </motion.div>
      ))}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <motion.div
          variants={itemVariants}
          className="text-center p-8"
        >
          <p className="text-muted-foreground font-mono">CARGANDO...</p>
        </motion.div>
      );
    }

    if (confirmados.length === 0) {
      return (
        <motion.div
          variants={itemVariants}
          className="text-center p-8"
        >
          <p className="text-muted-foreground font-mono">AÚN NO HAY CONFIRMADOS</p>
        </motion.div>
      );
    }

    return (
      <>
        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4">
          <div 
            className="bg-card border border-secondary/30 rounded-lg p-6 text-center hover:border-secondary/60 transition-all duration-300"
            style={{
              boxShadow: 'inset 0 0 15px rgba(188, 254, 47, 0.05), 0 0 20px rgba(188, 254, 47, 0.1)',
            }}
          >
            <p className="text-4xl font-bold text-secondary glow-lime">{confirmados.length}</p>
            <p className="text-muted-foreground font-mono text-sm mt-2">CONFIRMADOS</p>
          </div>
        </motion.div>

        {/* Confirmados List */}
        <motion.div
          variants={itemVariants}
          className="bg-card border border-secondary/30 rounded-lg p-8 hover:border-secondary/60 transition-all duration-300"
          style={{
            boxShadow: 'inset 0 0 15px rgba(188, 254, 47, 0.05), 0 0 20px rgba(188, 254, 47, 0.15)',
          }}
        >
          <h3 className="text-xl font-bold text-secondary glow-lime mb-6 font-mono">
            {`✓ CONFIRMADOS (${confirmados.length})`}
          </h3>
          {renderGuestList(confirmados)}
        </motion.div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center pt-6">
          <h2 className="text-4xl font-bold text-secondary glow-lime mb-2">
            LISTA DE INVITADOS
          </h2>
          <p className="text-primary font-mono text-sm glow-cyan">
            {`// CONFIRMARON ASISTENCIA`}
          </p>
        </motion.div>

        {renderContent()}

        {/* Back button */}
        <motion.div variants={itemVariants} className="pb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScreen('dashboard')}
            className="w-full bg-transparent border-2 border-primary text-primary font-bold py-3 px-4 rounded-lg hover:bg-primary/10 transition-colors font-mono"
          >
            ← VOLVER AL DASHBOARD
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
