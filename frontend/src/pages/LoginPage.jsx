import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/discover')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Back Button */}
      <div className="px-5 pt-5">
        <button onClick={() => navigate('/')} className="btn-outline !p-2.5 !rounded-xl">
          <ArrowLeft size={20} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col px-6 pt-8 pb-12 max-w-sm mx-auto w-full"
      >
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-[#E85555] flex items-center justify-center mb-8 shadow-lg shadow-[#FF6B6B]/20">
          <Heart size={24} className="text-white" fill="white" />
        </div>

        <h1 className="text-[32px] font-bold text-[var(--text-primary)] mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-[var(--text-secondary)] mb-8">Sign in to continue your journey</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="relative">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className="input"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-red-500 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo hint */}
        <div className="mt-6 p-4 bg-[var(--bg)] rounded-xl">
          <p className="text-xs text-[var(--text-secondary)] text-center">
            <span className="font-semibold text-[var(--text-primary)]">Demo:</span> demo1@warmconnect.com / demo123
          </p>
        </div>

        {/* Sign up link */}
        <p className="mt-auto text-center text-[var(--text-secondary)] text-sm">
          New here?{' '}
          <Link to="/register" className="text-[#FF6B6B] font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
