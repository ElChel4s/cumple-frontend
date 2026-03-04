'use client';

import { motion } from 'framer-motion';
import { useApp } from '@/lib/context';

export function LandingScreen() {
  const { setScreen } = useApp();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const pulseVariants = {
    initial: { opacity: 0.5, scale: 0.95 },
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: [0.95, 1, 0.95],
      transition: { duration: 3, repeat: Infinity },
    },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center max-w-2xl"
      >
        {/* Title with glow effect */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-primary glow-cyan mb-4">
            MARCELO
          </h1>
          <p className="text-xl md:text-2xl text-secondary glow-lime font-mono">
            // CUMPLEAÑOS — 21
          </p>
        </motion.div>

        {/* Event details */}
        <motion.div 
          variants={itemVariants} 
          className="bg-card border-2 border-primary rounded-lg p-8 mb-8 hover:border-primary transition-all duration-300"
          style={{
            boxShadow: 'inset 0 0 20px rgba(0, 229, 255, 0.05), 0 0 30px rgba(0, 229, 255, 0.15)',
          }}
        >
          <div className="space-y-4 text-foreground font-mono text-sm md:text-base">
            <p>
              <span className="text-secondary">━━━ DETALLES DEL EVENTO ━━━</span>
            </p>
            <p>
              <span className="text-primary">FECHA:</span> 8 MARZO 2025
            </p>
            <p>
              <span className="text-primary">HORA:</span> 14:00 - NO SÉ
            </p>
            <p>
              <span className="text-primary">LUGAR:</span>{' '}
              <a
                href="https://maps.app.goo.gl/SnaA4MdHEdN8Zi1x5"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary underline hover:opacity-80"
                aria-label="Ubicación en Google Maps - Mallasa Calle2. Calle C"
              >
                Mallasa Calle2. Calle C
              </a>
            </p>
            <p>
              <span className="text-secondary">━━━━━━━━━━━━━━━━━━━━━</span>
            </p>
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div variants={itemVariants} className="space-y-4">
          <p className="text-foreground text-lg mb-6 font-mono">
            <span className="text-secondary">→</span> Estas cordialmente invitado mi pana. <span className="text-secondary">←</span>
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setScreen('login')}
            className="bg-primary text-primary-foreground font-bold py-4 px-8 rounded-lg text-lg hover:opacity-80 transition-opacity border border-primary"
            style={{
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.4), inset 0 0 20px rgba(0, 229, 255, 0.1)',
            }}
          >
            → INGRESA TU CÓDIGO
          </motion.button>
        </motion.div>

        {/* Pulsing accent */}
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          className="mt-12 text-primary text-2xl"
        >
          ◆ ◆ ◆
        </motion.div>
      </motion.div>
    </div>
  );
}