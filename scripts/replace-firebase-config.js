const fs = require('fs');
const path = require('path');

// Firebase environment variables
const replacements = {
  '__FIREBASE_API_KEY__': process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBCt_QhVfDJiuG6GXbI9_lqBHa3hDsmDV4',
  '__FIREBASE_AUTH_DOMAIN__': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'credlink-01.firebaseapp.com',
  '__FIREBASE_PROJECT_ID__': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'credlink-01',
  '__FIREBASE_STORAGE_BUCKET__': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'credlink-01.firebasestorage.app',
  '__FIREBASE_MESSAGING_SENDER_ID__': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '226902678503',
  '__FIREBASE_APP_ID__': process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:226902678503:web:fd3d13d4482ea4cd19fb42',
  '__FIREBASE_MEASUREMENT_ID__': process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-RV6R387M1G',
};

// Read the firebase config file
const configPath = path.join(__dirname, '../src/lib/firebase-client-config.ts');
let content = fs.readFileSync(configPath, 'utf8');

// Replace placeholders with actual values
Object.entries(replacements).forEach(([placeholder, value]) => {
  const regex = new RegExp(`${placeholder}`, 'g');
  content = content.replace(regex, `'${value}'`);
});

// Write the updated content back
fs.writeFileSync(configPath, content);

console.log('✅ Firebase configuration updated with environment variables');
console.log('🔧 Config check:', {
  hasApiKey: !!replacements['__FIREBASE_API_KEY__'],
  hasAuthDomain: !!replacements['__FIREBASE_AUTH_DOMAIN__'],
  hasProjectId: !!replacements['__FIREBASE_PROJECT_ID__'],
  apiKey: replacements['__FIREBASE_API_KEY__']?.substring(0, 10) + '...',
});
