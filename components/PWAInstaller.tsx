'use client';

import { useEffect } from 'react';

export default function PWAInstaller() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration);
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }

    // Handle install prompt
    let deferredPrompt: any;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show custom install button
      const installButton = document.getElementById('pwa-install-button');
      if (installButton) {
        installButton.style.display = 'block';
        
        installButton.addEventListener('click', async () => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response: ${outcome}`);
            deferredPrompt = null;
            installButton.style.display = 'none';
          }
        });
      }
    });

    // Handle successful installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      deferredPrompt = null;
    });
  }, []);

  return null;
}
