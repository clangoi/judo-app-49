
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.45b2774f46784b0baeb053719e6a0e9d',
  appName: 'judo-app-49',
  webDir: 'dist',
  server: {
    url: 'https://45b2774f-4678-4b0b-aeb0-53719e6a0e9d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1A1A1A',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1A1A1A',
    },
  },
};

export default config;
