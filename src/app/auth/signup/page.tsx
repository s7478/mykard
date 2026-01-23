"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { getFirebaseAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "@/lib/firebase"
import "../../globals.css"
import styles from "./signup.module.css"

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "options" | "password">("email")
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [captchaCode, setCaptchaCode] = useState('')
  const [generatedCaptcha, setGeneratedCaptcha] = useState('')
  const [acceptPrivacyPolicy, setAcceptPrivacyPolicy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Generate random captcha code
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGeneratedCaptcha(result)
    setCaptchaCode('')
  }

  // Generate captcha on component mount
  useEffect(() => {
    generateCaptcha()
    // Prefetch onboarding page for faster transition
    router.prefetch('/onboarding')
  }, [router])

  // Handle email submission (Step 1)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      // Check if email already exists
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const result = await response.json()

      if (result.exists) {
        setError('Email already registered. Please log in.')
        toast.error('Email already registered')
        return
      }

      // Email is available, proceed to options
      setStep('options')
    } catch (err: any) {
      setError(err.message || 'Failed to verify email')
    } finally {
      setLoading(false)
    }
  }

  // Google via Firebase
  const handleGoogleOAuth = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('🔐 Starting Google sign-in...')
      const provider = new GoogleAuthProvider()
      const auth = await getFirebaseAuth()
      if (!auth) {
        throw new Error('Authentication is not configured. Please try again.')
      }
      const result = await signInWithPopup(auth, provider)

      console.log('✅ Google popup success, getting token...')
      const idToken = await result.user.getIdToken(true)

      console.log('📤 Sending token to backend...')
      const res = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      })

      const data = await res.json().catch(() => ({}))
      console.log('📥 Backend response:', data)

      if (!res.ok) {
        throw new Error(data?.error || 'Authentication failed')
      }

      toast.success('Signed in with Google')
      if (data?.needsPassword) {
        window.location.href = '/auth/set-password'
      } else if (data?.needsOnboarding) {
        window.location.href = '/onboarding'
      } else {
        window.location.href = '/dashboard/feed'
      }
    } catch (e: any) {
      console.error('❌ Google auth error:', e)
      const errorMsg = e?.message || 'Google sign-in failed'
      toast.error(errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Handle password option click
  const handlePasswordOption = () => {
    setStep('password')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!acceptPrivacyPolicy) {
      setError('Please accept the privacy policy to continue')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      // Create user in Firebase Auth
      const auth = await getFirebaseAuth()
      if (!auth) {
        throw new Error('Authentication is not configured. Please try again.')
      }

      console.log('🔐 Creating Firebase user account...')
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      console.log('✅ Firebase user created successfully')

      const idToken = await cred.user.getIdToken(true)
      console.log('🎫 Got Firebase ID token')

      // Call backend to create user in DB and set session
      console.log('📤 Sending user data to backend...')
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken, fullName, phone }),
      })

      const data = await response.json()
      console.log('📥 Backend response:', data)

      if (response.ok) {
        toast.success('Account created successfully!')
        console.log('✅ Account setup complete, redirecting...')
        router.push('/onboarding')
      } else {
        setError(data.error || 'Failed to create account')
        toast.error(data.error || 'Failed to create account')
      }
    } catch (error: any) {
      console.error('❌ Signup error:', error)
      console.error('Error code:', error?.code)
      console.error('Error message:', error?.message)

      // Handle Firebase-specific errors with helpful messages
      let errorMessage = error.message || 'Failed to create account. Please try again.'

      if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/Password authentication is not enabled in Firebase. Please wait a moment and try again, or contact support.'
        console.error('⚠️ Firebase Error: Email/Password provider may not be properly configured.')
        console.error('🔍 Check Firebase Console → Authentication → Sign-in method → Email/Password')
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please try logging in instead.'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password (at least 6 characters).'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.'
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.'
      }

      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  // ...existing code...


  return (
    <div className={`auth-container ${styles.page}`}>
      <div className={`auth-card ${styles.card}`}>
        {/* Logo */}
        <div className="auth-header">
          <Link href="/" className="flex justify-center w-full">
            <Image
              src="/assets/headerlogo.png"
              alt="MyKard Logo"
              width={180}
              height={48}
              priority
              className="h-auto w-auto object-contain"
            />
          </Link>
        </div>

        {/* STEP 1: Email Input */}
        {step === 'email' && (
          <>
            <p className="text-center text-black-700 mb-6 text-sm leading-relaxed">
              First impressions matter.<br />
              Make yours unforgettable!

            </p>

            <h2 className={styles.title}>Create an account</h2>

            <form onSubmit={handleEmailSubmit} className="auth-form">
              <div className="auth-input-group">
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.authInput}
                  placeholder="Enter your email"
                />

              </div>

              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className={`${styles.submitBtn} ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </form>

            <p className="text-center text-sm text-black-700 mt-10">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary-green hover:text-primary-green-dark font-medium">
                Log in
              </Link>
            </p>
          </>
        )}

        {/* STEP 2: Options (OAuth + Password) */}
        {step === 'options' && (
          <>
            <h2 className={styles.optionsTitle}>Proceed with an option below:</h2>

            <div className={styles.optionsList}>
              {/* Google */}
              <button
                onClick={handleGoogleOAuth}
                className={styles.oauthBtn}
              >
                <svg className="icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-medium text-gray-700">Continue with Google</span>
              </button>

              {/* Microsoft */}
              <button
                onClick={() => toast('Microsoft auth coming soon', { icon: 'ℹ️' })}
                className={styles.oauthBtn}
              >
                <svg className="icon" viewBox="0 0 23 23">
                  <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span className="font-medium text-gray-700">Continue with Microsoft</span>
              </button>

              {/* Apple */}
              <button
                onClick={() => toast('Apple auth coming soon', { icon: 'ℹ️' })}
                className={styles.oauthBtn}
              >
                <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span className="font-medium text-gray-700">Continue with Apple</span>
              </button>

              {/* Password */}
              <button
                onClick={handlePasswordOption}
                className={styles.oauthBtn}
              >
                <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <span className="font-medium text-gray-700">Continue with Password</span>
              </button>

              {/* Go Back */}
              <button
                onClick={() => setStep('email')}
                className={styles.backBtn}
              >
                ← Go back
              </button>
            </div>
          </>
        )}

        {/* STEP 3: Password Form */}
        {step === 'password' && (
          <>
            <h2 className="auth-title">Complete your profile</h2>

            <form onSubmit={handleSignup} className="auth-form">
              <div className={styles.formFields}>
                <div className="auth-input-group">
                  <label htmlFor="fullName" className="label">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="auth-input"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <label htmlFor="phone" className="label">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="auth-input"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <label htmlFor="email" className="label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="auth-input"
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                      style={{ paddingRight: '10px' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="confirmPassword" className="label">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="auth-input"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                      style={{ paddingRight: '10px' }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Captcha Section (disabled)
            <div className="auth-input-group">
              <label htmlFor="captcha" className="label">
                Captcha Code
              </label>
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <input
                    id="captcha"
                    type="text"
                    value={captchaCode}
                    onChange={(e) => setCaptchaCode(e.target.value)}
                    className="auth-input"
                    placeholder="Enter captcha code"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-mono text-lg font-bold text-gray-700 select-none"
                    style={{ letterSpacing: '3px', minWidth: '120px', textAlign: 'center' }}
                  >
                    {generatedCaptcha}
                  </div>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    title="Refresh captcha"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            */}

                {/* Privacy Policy Checkbox */}
                <div className="auth-input-group">
                  <div className="flex items-start gap-3">
                    <input
                      id="privacyPolicy"
                      type="checkbox"
                      checked={acceptPrivacyPolicy}
                      onChange={(e) => setAcceptPrivacyPolicy(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      required
                    />
                    <label htmlFor="privacyPolicy" className="text-sm text-gray-700">
                      I agree to the{' '}
                      <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">
                        Privacy Policy
                      </Link>{' '}
                      and{' '}
                      <Link href="/terms-of-service" className="text-blue-600 hover:text-blue-800 underline">
                        Terms of Service
                      </Link>
                    </label>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`auth-submit-button w-full ${styles.submitBtn} ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep('options')}
                className={styles.backBtn}
              >
                ← Go back
              </button>
            </form>
          </>
        )}

        {/* Terms & Privacy at bottom */}
        <p className={styles.terms}>
          By continuing, you are agreeing to the{' '}
          <Link href="/terms" className="text-primary-green hover:underline">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-primary-green hover:underline">
            Acceptable Use Policy
          </Link>.
        </p>
      </div>
    </div>
  )
}