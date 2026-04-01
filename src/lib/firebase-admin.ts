import * as admin from 'firebase-admin'

// Helper to sanitize environment variables (handles surrounding quotes and escaped newlines)
function sanitizeEnvVar(value: string | undefined, isPrivateKey = false): string | undefined {
  if (!value) return undefined;
  
  // Remove surrounding quotes if present (common issue in some .env loaders)
  let sanitized = value.trim();
  if ((sanitized.startsWith('"') && sanitized.endsWith('"')) || 
      (sanitized.startsWith("'") && sanitized.endsWith("'"))) {
    sanitized = sanitized.substring(1, sanitized.length - 1);
  }

  // Handle escaped newlines for private keys
  if (isPrivateKey) {
    sanitized = sanitized.replace(/\\n/g, '\n');
  }
  
  return sanitized;
}

// Initialize Firebase Admin SDK once per runtime
function initFirebaseAdmin() {
  if (!admin.apps.length) {
    const projectId = sanitizeEnvVar(process.env.FIREBASE_PROJECT_ID)
    const clientEmail = sanitizeEnvVar(process.env.FIREBASE_CLIENT_EMAIL)
    let privateKey = sanitizeEnvVar(process.env.FIREBASE_PRIVATE_KEY, true)
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

    console.log('[Firebase Admin] Init start', {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      projectIdLength: projectId?.length || 0,
      clientEmailLength: clientEmail?.length || 0,
      privateKeyLength: privateKey?.length || 0,
    })

    try {
      if (projectId && clientEmail && privateKey) {
        // Detect placeholder value
        if (privateKey.includes('YOUR_NEW_PRIVATE_KEY_HERE')) {
          console.warn('[Firebase Admin] Placeholder private key detected, falling back to applicationDefault')
          throw new Error('Placeholder private key');
        }

        console.log('[Firebase Admin] Using service account credentials')
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
          storageBucket,
        })
      } else {
        console.warn('[Firebase Admin] Missing service account env vars, falling back to applicationDefault credentials')
        // Fallback to applicationDefault if service account not explicitly set
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          storageBucket,
        })
      }
    } catch (error) {
      console.error('[Firebase Admin] Failed to initialize', error)
      // Do not throw here, allow getFirebaseAdmin to return the non-initialized admin object
    }
  }
}

// Initialize Firebase Admin SDK once per runtime
function getFirebaseAdmin() {
  // Only initialize Firebase if we're not in build time
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test' && !admin.apps.length) {
    initFirebaseAdmin()
  }
  return admin
}

export const adminAuth = () => {
  // Only use Firebase Auth if not in build time
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
    return getFirebaseAdmin().auth()
  }
  return null
}

export const adminStorageBucket = () => {
  // Only use Firebase Storage if not in build time
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
    return getFirebaseAdmin().storage().bucket()
  }
  return null
}
