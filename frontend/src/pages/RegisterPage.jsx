import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Eye, EyeOff, ArrowLeft, ChevronRight, User, Mail, Lock, Calendar, MapPin, FileText, Briefcase, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [interests, setInterests] = useState([])
  const [activities, setActivities] = useState([])

  const [form, setForm] = useState({
    email: '', password: '', full_name: '', age: '',
    gender: 'female', looking_for: 'everyone',
    bio: '', occupation: '', location: '',
    latitude: null, longitude: null,
    min_age: 18, max_age: 99, max_distance_km: 50,
  })

  React.useEffect(() => {
    axios.get('/api/interests').then(r => setInterests(r.data))
    axios.get('/api/activities').then(r => setActivities(r.data))
  }, [])

  const [selectedInterests, setSelectedInterests] = useState([])
  const [selectedActivities, setSelectedActivities] = useState([])

  const toggleInterest = (id) => {
    setSelectedInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }
  const toggleActivity = (id) => {
    setSelectedActivities(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = {
        ...form, age: parseInt(form.age),
        interest_ids: selectedInterests, activity_ids: selectedActivities,
      }
      await register(data)
      navigate('/discover')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { title: 'Account', desc: 'Create your account' },
    { title: 'Profile', desc: 'Tell us about you' },
    { title: 'Interests', desc: 'What you love' },
    { title: 'Activities', desc: 'What you do' },
  ]

  const canProceed = () => {
    if (step === 1) return form.full_name && form.email && form.password && form.age
    if (step === 3) return selectedInterests.length >= 1
    if (step === 4) return selectedActivities.length >= 1
    return true
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 flex items-center gap-4">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} 
          className="btn-outline !p-2.5 !rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i + 1 <= step ? 'bg-[#FF6B6B]' : 'bg-[var(--border-light)]'}`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col px-6 pt-6 pb-8 max-w-sm mx-auto w-full"
        >
          <div className="mb-6">
            <h1 className="text-[28px] font-bold text-[var(--text-primary)] mb-1 tracking-tight">{steps[step - 1].title}</h1>
            <p className="text-[var(--text-secondary)] text-sm">{steps[step - 1].desc}</p>
          </div>

          {/* Step 1: Account */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <User size={18} className="input-icon" />
                <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                  className="input" placeholder="Your full name" required />
              </div>
              <div className="relative">
                <Mail size={18} className="input-icon" />
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="input" placeholder="you@example.com" required />
              </div>
              <div className="relative">
                <Lock size={18} className="input-icon" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="input" placeholder="Min 6 characters" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar size={18} className="input-icon" />
                  <input type="number" min="18" max="120" value={form.age} onChange={e => setForm({...form, age: e.target.value})}
                    className="input" placeholder="Age" required />
                </div>
                <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}
                  className="input !pl-4">
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Profile */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <FileText size={18} className="input-icon !top-4" />
                <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
                  className="input !pt-3.5 !h-28 resize-none" placeholder="Tell us about yourself..." />
              </div>
              <div className="relative">
                <Briefcase size={18} className="input-icon" />
                <input type="text" value={form.occupation} onChange={e => setForm({...form, occupation: e.target.value})}
                  className="input" placeholder="What do you do?" />
              </div>
              <div className="relative">
                <MapPin size={18} className="input-icon" />
                <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                  className="input" placeholder="City, Country" />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Looking For</label>
                <select value={form.looking_for} onChange={e => setForm({...form, looking_for: e.target.value})}
                  className="input !pl-4">
                  <option value="everyone">Everyone</option>
                  <option value="male">Men</option>
                  <option value="female">Women</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[var(--text-secondary)]">Select at least 3 interests</p>
              <div className="flex flex-wrap gap-2">
                {interests.map(i => (
                  <button key={i.id} type="button" onClick={() => toggleInterest(i.id)}
                    className={`tag ${selectedInterests.includes(i.id) ? 'active' : ''}`}>
                    {i.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--text-muted)]">{selectedInterests.length} selected</p>
            </div>
          )}

          {/* Step 4: Activities */}
          {step === 4 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[var(--text-secondary)]">Select activities you enjoy</p>
              <div className="flex flex-col gap-2">
                {activities.map(a => (
                  <button key={a.id} type="button" onClick={() => toggleActivity(a.id)}
                    className={`card p-4 text-left transition-all flex items-center justify-between ${
                      selectedActivities.includes(a.id) ? 'ring-2 ring-[#FF6B6B] bg-[#FF6B6B]/5' : 'card-hover'
                    }`}>
                    <div>
                      <p className="font-semibold text-sm text-[var(--text-primary)]">{a.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{a.description}</p>
                    </div>
                    {selectedActivities.includes(a.id) && (
                      <div className="w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--text-muted)]">{selectedActivities.length} selected</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mt-4">
              <p className="text-red-500 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="mt-auto pt-6">
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
                className="btn-primary w-full">
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading || !canProceed()}
                className="btn-primary w-full">
                {loading ? 'Creating Account...' : <><Heart size={18} fill="white" /> Get Started</>}
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-[var(--text-secondary)] text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#FF6B6B] font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
