import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Para desarrollo: mostrar prompt después de 5 segundos sin esperar beforeinstallprompt
    const showDemoPrompt = () => {
      // Solo mostrar en desarrollo si no hay deferredPrompt real
      if (!deferredPrompt && !isInstalled) {
        console.log('MentalCheck PWA: Mostrando prompt de demostración (desarrollo)');
        setShowInstallPrompt(true);
      }
    };

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('MentalCheck PWA: beforeinstallprompt event triggered');
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      
      // Mostrar el prompt después de un tiempo o cuando el usuario haya interactuado
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    // Escuchar cuando la app se instala
    const handleAppInstalled = () => {
      console.log('MentalCheck PWA: App instalada exitosamente');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Mostrar prompt de demo en desarrollo después de 5 segundos
    const demoTimer = setTimeout(showDemoPrompt, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(demoTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Si tenemos el prompt nativo, usarlo
      deferredPrompt.prompt();

      // Esperar la respuesta del usuario
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('MentalCheck PWA: Usuario aceptó instalar la app');
      } else {
        console.log('MentalCheck PWA: Usuario rechazó instalar la app');
      }

      // Limpiar el prompt
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } else {
      // Modo demostración: mostrar instrucciones para instalación manual
      console.log('MentalCheck PWA: Modo demostración - explicar instalación manual');
      alert(
        'Para instalar MentalCheck como PWA:\n\n' +
        '📱 Móvil Chrome/Edge: Menú → "Agregar a pantalla de inicio"\n' +
        '💻 Desktop Chrome: Dirección URL → ícono de instalación\n' +
        '🍎 Safari iOS: Compartir → "Agregar a pantalla de inicio"\n\n' +
        'La app aparecerá como una aplicación nativa en tu dispositivo.'
      );
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Recordar que el usuario dismisseó el prompt
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // No mostrar si ya está instalada o si fue dismisseado recientemente
  const lastDismissed = localStorage.getItem('pwa-install-dismissed');
  const dismissedRecently = lastDismissed && (Date.now() - parseInt(lastDismissed)) < 24 * 60 * 60 * 1000; // 24 horas

  if (isInstalled || !showInstallPrompt || dismissedRecently) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-xl border-0 md:left-auto md:right-4 md:max-w-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Smartphone className="h-5 w-5" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              ¡Instala MentalCheck!
            </h3>
            <p className="text-xs text-primary-foreground/90 mb-3 leading-relaxed">
              Accede a tu bienestar mental desde cualquier lugar. Instala la app para una experiencia completa.
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="bg-white text-primary hover:bg-white/90 text-xs font-semibold flex-1"
              >
                <Download className="h-3 w-3 mr-1" />
                Instalar
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-primary-foreground hover:bg-white/10 p-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;