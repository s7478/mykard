"use client"

// import { useState } from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import "../../globals.css"
import { auth, GoogleAuthProvider, signInWithPopup } from "@/lib/firebase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')


    useEffect(() => {
    console.log("🔥 FIREBASE ENV CHECK START");

    console.log(
      "NEXT_PUBLIC_FIREBASE_API_KEY:",
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "❌ NOT SET"
    );
    console.log(
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:",
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "❌ NOT SET"
    );
    console.log(
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID:",
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "❌ NOT SET"
    );
    console.log(
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:",
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "❌ NOT SET"
    );
    console.log(
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:",
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "❌ NOT SET"
    );
    console.log(
      "NEXT_PUBLIC_FIREBASE_APP_ID:",
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "❌ NOT SET"
    );
    console.log(
      "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:",
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "❌ NOT SET"
    );

    console.log("🔥 FIREBASE ENV CHECK END");
  }, []);


  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError('')
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setError('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter your email and password')
      return
    }
    setLoading(true)
    setError('')
    try {
      console.log('email', email)
      console.log('password', password)
      // Send login payload to backend JSON API (email + password)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password,
        }),
      })

      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        
        // Handle deactivated account (403 status)
        if (res.status === 403) {
          setError(data?.error || 'Your account has been deactivated. Please contact support.')
          return
        }
        
        setError(data?.error || 'Login failed. Please try again.')
        return
      }
      const data = await res.json().catch(() => ({}))
      if (data?.token) {
        localStorage.setItem('token', data.token)
      }
      // On success, redirect to onboarding if first-time login, otherwise dashboard
      if (data?.needsOnboarding) {
        window.location.href = '/onboarding'
      } else {
        window.location.href = '/dashboard'
      }
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError('')
      const provider = new GoogleAuthProvider()
      if (!auth) {
        throw new Error('Authentication is not configured. Please set Firebase env vars.')
      }
      const result = await signInWithPopup(auth as any, provider)
      const idToken = await result.user.getIdToken(true)

      const res = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        // Handle deactivated account
        if (res.status === 403 || data?.error?.includes('deactivated')) {
          throw new Error('Your account has been deactivated. Please contact support to reactivate your account.')
        }
        throw new Error(data?.error || 'Authentication failed')
      }
      if (data?.needsOnboarding) {
        window.location.href = '/onboarding'
      } else {
        window.location.href = '/dashboard'
      }
    } catch (e: any) {
      console.error('Google login failed', e)
      setError(e?.message || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" className="flex justify-center w-full">
  <img
    src="/assets/headerlogo.png"
    alt="MyKard Logo"
    className="h-12 w-auto"
  />
</Link>
          <h2 className="auth-title">
            Sign in to your account
          </h2>
          <p className="auth-subtitle">
            Or{' '}
            <Link href="/auth/signup" className="text-primary-green hover:text-primary-green-dark">
              create a new account
            </Link>
          </p>
        </div>
        <form onSubmit={handleLogin} className="auth-form space-y-6">
          <div className="auth-input-group">
            <label htmlFor="email" className="label">
              Email Address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleEmailChange}
                className="auth-input"
                placeholder="Enter your email address"
              />
            </div>
          </div>
          <div className="auth-input-group">
            <label htmlFor="password" className="label">
              Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={handlePasswordChange}
                className="auth-input"
                placeholder="Enter your password"
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
          <p className="text-sm text-gray-600">
            <Link href="/auth/forgot-password" className="text-primary-green hover:text-primary-green-dark">
              Forgot Password?
            </Link>
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="auth-submit-button w-full"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6">
          <button type="button" onClick={handleGoogleLogin} className="auth-submit-button w-full" disabled={loading}>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}
