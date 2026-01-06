"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { getFirebaseAuth, PhoneAuthProvider, signInWithCredential, RecaptchaVerifier, signInWithPhoneNumber } from "@/lib/firebase"

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone") || ""

  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]) 
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const recaptchaRef = useRef<RecaptchaVerifier | null>(null)

  useEffect(() => {
    return () => {
      try { recaptchaRef.current?.clear() } catch {}
      recaptchaRef.current = null
    }
  }, [])

  const setupRecaptcha = async () => {
    if (recaptchaRef.current) return recaptchaRef.current
    const container = typeof document !== 'undefined' ? document.getElementById('recaptcha-container-verify') : null
    if (!container) throw new Error('reCAPTCHA container missing')
    const auth = await getFirebaseAuth()
    if (!auth) throw new Error('Authentication is not configured. Please try again.')
    recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container-verify', { size: 'invisible' })
    return recaptchaRef.current
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const otp = otpDigits.join("")
    if (!otp || otp.length < 6) {
      setError("Please enter the OTP code")
      return
    }

    setLoading(true)
    try {
      // Get verification ID from sessionStorage
      const verificationId = typeof window !== 'undefined' 
        ? sessionStorage.getItem('verificationId')
        : null

      if (!verificationId) {
        throw new Error('Verification ID not found. Please request OTP again.')
      }

      console.log('🔐 Verifying OTP with Firebase...')

      // Verify OTP with Firebase
      const credential = PhoneAuthProvider.credential(verificationId, otp)
      const auth = await getFirebaseAuth()
      if (!auth) throw new Error('Authentication is not configured. Please try again.')
      await signInWithCredential(auth, credential)
      
      console.log('✅ Firebase OTP verified successfully!')
      
      // Get signup data from sessionStorage
      const signupData = typeof window !== 'undefined' 
        ? JSON.parse(sessionStorage.getItem('signupData') || '{}')
        : {}

      if (!signupData.email) {
        throw new Error('Signup data not found. Please signup again.')
      }

      // Now create user account via API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Account creation failed')
      }

      // Clear session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('signupData')
        sessionStorage.removeItem('verificationId')
        sessionStorage.removeItem('otpPhone')
      }

      toast.success("Account created successfully!")
      router.push("/auth/login")
    } catch (error: any) {
      console.error('❌ Verification error:', error)
      setError(error.message || "Invalid or expired OTP. Please try again.")
      toast.error(error.message || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    try {
      const storedPhone = typeof window !== 'undefined' ? sessionStorage.getItem('otpPhone') : null
      const target = storedPhone || phone
      if (!target) {
        toast.error("Phone missing. Go back and start again.")
        return
      }
      const verifier = await setupRecaptcha()
      const auth = await getFirebaseAuth()
      if (!auth) throw new Error('Authentication is not configured. Please try again.')
      const confirmation = await signInWithPhoneNumber(auth, target, verifier)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('verificationId', confirmation.verificationId)
        sessionStorage.setItem('otpPhone', target)
      }
      toast.success("OTP sent again")
    } catch {
      toast.error("Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" className="block">
            <h1 className="auth-logo">MyKard</h1>
          </Link>
          <h2 className="auth-title">Verify your phone</h2>
          <p className="auth-subtitle">
            We sent a code to {phone ? <span className="font-medium">{phone}</span> : "your phone"}.
          </p>
        </div>

        <div id="recaptcha-container-verify" className="hidden" />

        <form onSubmit={handleSubmit} className="auth-form space-y-6">
          <div className="auth-input-group">
            <label htmlFor="otp-0" className="label">OTP Code</label>
            <div className="flex gap-2 justify-between">
              {otpDigits.map((d, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={d}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0,1)
                    const next = [...otpDigits]
                    next[i] = val
                    setOtpDigits(next)
                    if (val && i < 5) {
                      const nextEl = document.getElementById(`otp-${i+1}`) as HTMLInputElement | null
                      nextEl?.focus()
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
                      const prevEl = document.getElementById(`otp-${i-1}`) as HTMLInputElement | null
                      prevEl?.focus()
                    }
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text').replace(/\D/g, "").slice(0,6)
                    if (pasted) {
                      e.preventDefault()
                      const next = [...otpDigits]
                      for (let k=0; k<6; k++) next[k] = pasted[k] || ''
                      setOtpDigits(next)
                      const lastIndex = Math.min(5, pasted.length - 1)
                      const el = document.getElementById(`otp-${Math.max(0,lastIndex)}`) as HTMLInputElement | null
                      el?.focus()
                    }
                  }}
                  className="w-10 h-12 text-center text-lg auth-input"
                  required
                />
              ))}
            </div>
          </div>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full" suppressHydrationWarning>
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-primary-green hover:text-primary-green-dark"
            disabled={loading}
          >
            Resend code
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  )
}
