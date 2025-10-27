"use client";

import { useEffect } from 'react';

export default function ParticlesBackground() {
  useEffect(() => {
    const container = document.getElementById('particles-container');
    if (!container) return;

    // إنشاء 30 جزيء
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
      container.appendChild(particle);
    }

    // تنظيف عند إلغاء التحميل
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      id="particles-container" 
      className="particles-bg"
      style={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        top: 0,
        left: 0
      }}
    />
  );
}

