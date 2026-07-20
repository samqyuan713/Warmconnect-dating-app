import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Eye, EyeOff, ArrowLeft } from 'lucide-react'
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
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      <button 
        onClick={() => navigate('/')} 
        className="self-start text-[var(--warm-gray)] hover:text-[var(--warm-brown)] mb-6"
      >
        <ArrowLeft size={24} />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col"
      >
        <div className="w-16 h-16 rounded-full btn-warm flex items-center justify-center mb-6">
          <Heart size={28} fill="white" />
        </div>

        <h1 className="font-display text-4xl font-bold text-[var(--warm-brown)] mb-2">
          Welcome Back
        </h1>
        <p className="text-[var(--warm-gray)] mb-8">Sign in to continue your journey</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--warm-brown)] mb-1 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--warm-peach)] bg-white/80 focus:border-[var(--warm-coral)] focus:outline-none transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--warm-brown)] mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--warm-peach)] bg-white/80 focus:border-[var(--warm-coral)] focus:outline-none transition-colors pr-12"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--warm-gray)]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[var(--warm-rose)] text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl btn-warm text-lg font-semibold mt-4 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--warm-gray)]">
            Demo accounts: <span className="font-medium">demo1@warmconnect.com</span> / <span className="font-medium">demo123</span>
          </p>
        </div>

        <p className="mt-auto text-center text-[var(--warm-gray)]">
          New here?{' '}
          <Link to="/register" className="text-[var(--warm-rose)] font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
