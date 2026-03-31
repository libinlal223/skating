'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<'wheel' | 'sparks' | 'logo'>('wheel');

  useEffect(() => {
    // Phase transitions: wheel -> sparks -> logo -> done
    const sparkTimer = setTimeout(() => setPhase('sparks'), 500);
    const logoTimer = setTimeout(() => setPhase('logo'), 900);
    const doneTimer = setTimeout(() => setIsLoading(false), 1600);

    return () => {
      clearTimeout(sparkTimer);
      clearTimeout(logoTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="loading-screen"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Spinning Wheel */}
          <div className="loading-wheel-container">
            <div className="loading-wheel" />

            {/* Sparks */}
            {phase !== 'wheel' && (
              <div className="loading-sparks">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="loading-spark"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0.5],
                      x: [0, Math.cos(i * 45 * Math.PI / 180) * 50],
                      y: [0, Math.sin(i * 45 * Math.PI / 180) * 50],
                    }}
                    transition={{ duration: 0.5, delay: i * 0.03 }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: i % 2 === 0 ? '#FFD400' : '#E10600',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Logo Text */}
          {phase === 'logo' && (
            <motion.div
              className="loading-logo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span>Smart Wheels</span>
            </motion.div>
          )}

          
        </motion.div>
      )}
    </AnimatePresence>
  );
}
