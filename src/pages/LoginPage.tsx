import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Label from '../components/ui/Label'
import { Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('')
      setLoading(true)
      await signIn(data.email, data.password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setResetMessage('')
      setError('')
      setLoading(true)

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        resetEmail,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (resetError) throw resetError

      setResetMessage('Password reset email sent! Check your inbox.')
      setTimeout(() => {
        setShowResetPassword(false)
        setResetEmail('')
        setResetMessage('')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-semibold text-text-primary">Gateway Success</span>
            </Link>
            <Link to="/signup" className="bg-secondary text-white px-5 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div>
            <h2 className="text-center text-3xl font-bold text-text-primary">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-secondary hover:text-secondary/80"
              >
                Sign up
              </Link>
            </p>
          </div>

        <div className="mt-8 card">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="your.email@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-text-secondary hover:text-text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  className="font-medium text-secondary hover:text-secondary/80"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <Link
              to="/"
              className="text-sm text-text-secondary hover:text-secondary text-center block"
            >
              ← Back to home
            </Link>
          </div>
        </div>

        {/* Password Reset Modal */}
        {showResetPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-text-primary mb-4">
                Reset Password
              </h3>

              {resetMessage && (
                <div className="bg-success/10 border border-success text-success px-4 py-3 rounded-lg mb-4">
                  {resetMessage}
                </div>
              )}

              {error && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handlePasswordReset}>
                <div className="mb-4">
                  <Label htmlFor="reset-email">Email address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                  <p className="mt-2 text-sm text-text-secondary">
                    We'll send you a link to reset your password
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowResetPassword(false)
                      setResetEmail('')
                      setError('')
                      setResetMessage('')
                    }}
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={loading || !resetEmail}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
