import * as admin from 'firebase-admin'

// Initialize Firebase Admin SDK once per runtime
function initFirebaseAdmin() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    let privateKey = process.env.FIREBASE_PRIVATE_KEY
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

    console.log('[Firebase Admin] Init start', {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      storageBucket,
    })

    // Allow escaped newlines in env
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n')
      // Detect placeholder value
      if (privateKey.includes('YOUR_NEW_PRIVATE_KEY_HERE')) {
        console.warn('[Firebase Admin] Placeholder private key detected, treating as undefined')
        privateKey = undefined
      }
    }

    try {
      if (projectId && clientEmail && privateKey) {
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
        if (storageBucket) {
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            storageBucket,
          })
        } else {
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
          })
        }
      }
    } catch (error) {
      console.error('[Firebase Admin] Failed to initialize', error)
      // Do not throw here, allow getFirebaseAdmin to return the non-initialized admin object
      // which will result in null/errors later where it is used, instead of crashing the whole process.
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
