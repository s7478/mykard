const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function sanitizeEnvVar(value, isPrivateKey = false) {
  if (!value) return undefined;
  let sanitized = value.trim();
  if ((sanitized.startsWith('"') && sanitized.endsWith('"')) || 
      (sanitized.startsWith("'") && sanitized.endsWith("'"))) {
    sanitized = sanitized.substring(1, sanitized.length - 1);
  }
  if (isPrivateKey) {
    sanitized = sanitized.replace(/\\n/g, '\n');
  }
  return sanitized;
}

async function testFirebase() {
  console.log('--- Firebase Admin Diagnostic ---');
  
  const projectId = sanitizeEnvVar(process.env.FIREBASE_PROJECT_ID);
  const clientEmail = sanitizeEnvVar(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKey = sanitizeEnvVar(process.env.FIREBASE_PRIVATE_KEY, true);

  console.log('1. Checking Environment Variables:');
  console.log(`   - Project ID: ${projectId ? 'OK (' + projectId.length + ' chars)' : 'MISSING'}`);
  console.log(`   - Client Email: ${clientEmail ? 'OK (' + clientEmail.length + ' chars)' : 'MISSING'}`);
  console.log(`   - Private Key: ${privateKey ? 'OK (' + privateKey.length + ' chars)' : 'MISSING'}`);

  if (!projectId || !clientEmail || !privateKey) {
    console.error('\n❌ ERROR: Missing required environment variables.');
    process.exit(1);
  }

  console.log('\n2. Attempting Initialization...');
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      })
    });
    console.log('✅ Initialization Successful!');

    console.log('\n3. Testing Authentication Service...');
    const auth = admin.auth();
    // Just try to list users (limit 1) to verify communication
    await auth.listUsers(1);
    console.log('✅ Communication with Firebase Successful!');
    
  } catch (error) {
    console.error('\n❌ FAILED to initialize or communicate with Firebase:');
    console.error(error.message);
    if (error.code === 'auth/invalid-credential') {
      console.error('\nTIP: The private key or client email might be incorrect.');
    } else if (error.message.includes('payload')) {
      console.error('\nTIP: This "payload" error usually means the private key format is still invalid.');
    }
    process.exit(1);
  }

  console.log('\n--- Diagnostic Complete ---');
}

testFirebase();
