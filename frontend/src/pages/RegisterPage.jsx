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
    email: '',
    password: '',
    full_name: '',
    age: '',
    gender: 'female',
    looking_for: 'everyone',
    bio: '',
    occupation: '',
    location: '',
    latitude: null,
    longitude: null,
    min_age: 18,
    max_age: 99,
    max_distance_km: 50,
  })

  React.useEffect(() => {
    axios.get('/api/interests').then(r => setInterests(r.data))
    axios.get('/api/activities').then(r => setActivities(r.data))
  }, [])

  const [selectedInterests, setSelectedInterests] = useState([])
  const [selectedActivities, setSelectedActivities] = useState([])

  const toggleInterest = (id) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleActivity = (id) => {
    setSelectedActivities(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = {
        ...form,
        age: parseInt(form.age),
        interest_ids: selectedInterests,
        activity_ids: selectedActivities,
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
    if (step === 2) return true
    if (step === 3) return selectedInterests.length >= 1
    if (step === 4) return selectedActivities.length >= 1
    return true
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 flex items-center gap-4">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} 
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i + 1 <= step ? 'bg-[#FF6B6B]' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="flex-1 flex flex-col px-6 pt-6 pb-8 max-w-sm mx-auto w-full"
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{steps[step - 1].title}</h1>
            <p className="text-gray-500 text-sm">{steps[step - 1].desc}</p>
          </div>

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/10 transition-all"
                    placeholder="Your name" required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/10 transition-all"
                    placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/10 transition-all"
                    placeholder="Min 6 characters" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Age</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" min="18" max="120" value={form.age} onChange={e => setForm({...form, age: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/10 transition-all" required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Gender</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/10 transition-all">
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Bio</label>
                <div className="relative">
                  <FileText size={18} className="absolute left-4 top-4 text-gray-400" />
                  <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/10 transition-all h-28 resize-none"
                    placeholder="Tell us about yourself..." />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Occupation</label>
                <div className="relative">
                  <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={form.occupation} onChange={e => setForm({...form, occupation: e.target.value})}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/10 transition-all"
                    placeholder="What do you do?" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Location</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/10 transition-all"
                    placeholder="City, Country" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Looking For</label>
                <select value={form.looking_for} onChange={e => setForm({...form, looking_for: e.target.value})}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/10 transition-all">
                  <option value="everyone">Everyone</option>
                  <option value="male">Men</option>
                  <option value="female">Women</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500 mb-2">Select at least 3 interests</p>
              <div className="flex flex-wrap gap-2">
                {interests.map(i => (
                  <button key={i.id} type="button" onClick={() => toggleInterest(i.id)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      selectedInterests.includes(i.id)
                        ? 'bg-gradient-to-r from-[#FF6B6B] to-[#ee5a5a] text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {i.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">{selectedInterests.length} selected</p>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500 mb-2">Select activities you enjoy</p>
              <div className="grid grid-cols-1 gap-2">
                {activities.map(a => (
                  <button key={a.id} type="button" onClick={() => toggleActivity(a.id)}
                    className={`p-4 rounded-xl text-left transition-all flex items-center justify-between ${
                      selectedActivities.includes(a.id)
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}>
                    <div>
                      <p className="font-semibold text-sm">{a.name}</p>
                      <p className={`text-xs mt-0.5 ${selectedActivities.includes(a.id) ? 'text-white/60' : 'text-gray-400'}`}>
                        {a.description}
                      </p>
                    </div>
                    {selectedActivities.includes(a.id) && <Check size={18} className="text-white" />}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">{selectedActivities.length} selected</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mt-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-auto pt-6">
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6B6B] to-[#ee5a5a] text-white text-lg font-semibold shadow-lg shadow-[#FF6B6B]/25 hover:shadow-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                Continue
                <ChevronRight size={20} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading || !canProceed()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6B6B] to-[#ee5a5a] text-white text-lg font-semibold shadow-lg shadow-[#FF6B6B]/25 hover:shadow-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                {loading ? 'Creating Account...' : (
                  <>
                    <Heart size={20} fill="white" />
                    Get Started
                  </>
                )}
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#FF6B6B] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
