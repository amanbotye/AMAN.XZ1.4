import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aman.protection',
  appName: 'AMAN - منظومة أمان',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    backgroundColor: '#020617'
  }
};

export default config;
