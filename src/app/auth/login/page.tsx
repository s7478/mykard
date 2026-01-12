  "use client"

  import { useState } from "react"
  import Link from "next/link"
  import Image from "next/image"
  import { useRouter } from "next/navigation"
  import { getFirebaseAuth, GoogleAuthProvider, signInWithPopup } from "@/lib/firebase"
  import styles from "./login.module.css" // css module 
  import GoogleIcon from "@/assets/google.png";


  export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    
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
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
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
        console.log('🔐 [Login] Starting Google login...')
        const provider = new GoogleAuthProvider()
        const auth = await getFirebaseAuth()
        console.log('🔐 [Login] Auth instance:', auth ? 'Available' : 'NULL')
        if (!auth) throw new Error('Authentication is not configured. Please try again.')
        
        const result = await signInWithPopup(auth, provider)
        const idToken = await result.user.getIdToken(true)

        const res = await fetch('/api/auth/firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ idToken }),
        })
        
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          if (res.status === 403 || data?.error?.includes('deactivated')) {
            throw new Error('Your account has been deactivated.')
          }
          throw new Error(data?.error || 'Authentication failed')
        }
        
        if (data?.needsOnboarding) {
          window.location.href = '/onboarding'
        } else {
          window.location.href = '/dashboard'
        }
      } catch (e: any) {
        setError(e?.message || 'Google sign-in failed')
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className={styles.page}>
        <div className={styles.card}>
          
          {/* Header Section */}
          <div className={styles.header}>
            <div className={styles.logoWrapper}>
              <Link href="/">
                <Image
                  src="/assets/headerlogo.png"
                  alt="MyKard Logo"
                  width={180} 
                  height={48} 
                  priority
                  className="h-auto w-auto object-contain" // Slightly smaller logo for compact look
                />
              </Link>
            </div>
            <h2 className={styles.title}>Sign in to your </h2>
            <h2 className={styles.title}>account</h2>
            <p className={styles.subtitle}>
              Or{' '}
              <Link href="/auth/signup" className={styles.link}>
                create an account
              </Link>
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleLogin} className={styles.form}>
            
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
              Email 
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={handleEmailChange}
                className={styles.input}
                placeholder="Enter your email"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className={styles.input}
                  placeholder="Enter your password"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
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
              

              <div className={styles.forgotPass}>
                <Link href="/auth/forgot-password" className={styles.link}>
                  Forgot Password?
                </Link>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <button
  type="button"
  onClick={handleGoogleLogin}
  className={styles.googleBtn}
>
  Continue with
   <img
    src="/assets/google.png"
    alt="Google"   
    className={styles.googleIcon}
  />
</button>


        </div>
      </div>
    )
  }
