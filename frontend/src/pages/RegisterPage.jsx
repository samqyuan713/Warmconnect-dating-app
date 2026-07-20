import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Eye, EyeOff, ArrowLeft, ChevronRight } from 'lucide-react'
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
    { title: 'Account', desc: 'Basic info' },
    { title: 'Profile', desc: 'About you' },
    { title: 'Interests', desc: 'What you love' },
    { title: 'Activities', desc: 'What you do' },
  ]

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      <button 
        onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} 
        className="self-start text-[var(--warm-gray)] hover:text-[var(--warm-brown)] mb-4"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={i} className="flex-1">
            <div className={`h-2 rounded-full transition-colors ${i + 1 <= step ? 'bg-[var(--warm-coral)]' : 'bg-[var(--warm-peach)]'}`} />
            <p className="text-[10px] text-[var(--warm-gray)] mt-1 text-center">{s.title}</p>
          </div>
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex-1 flex flex-col"
      >
        <h1 className="font-display text-3xl font-bold text-[var(--warm-brown)] mb-1">
          {steps[step - 1].title}
        </h1>
        <p className="text-[var(--warm-gray)] mb-6">{steps[step - 1].desc}</p>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--warm-brown)] mb-1 block">Full Name</label>
              <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--warm-peach)] bg-white/80 focus:border-[var(--warm-coral)] focus:outline-none"
                placeholder="Your name" required />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--warm-brown)] mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--warm-peach)] bg-white/80 focus:border-[var(--warm-coral)] focus:outline-none"
                placeholder="you@example.com" required />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--warm-brown)] mb-1 block">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--warm-peach)] bg-white/80 focus:border-[var(--warm-coral)] focus:outline-none pr-12"
                  placeholder="Min 6 characters" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--warm-gray)]">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--warm-brown)] mb-1 block">Age</label>
                <input type="number" min="18" max="120" value={form.age} onChange={e => setForm({...form, age: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--warm-peach)] bg-white/80 focus:border-[var(--warm-coral)] focus:outline-none" required />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--warm-brown)] mb-1 block">Gender</label>
                <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--warm-peach)] bg-white/80 focus:border-[var(--warm-coral)] focus:outline-none">
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
              <label className="text-sm font-medium text-[var(--warm-brown)] mb-1 block">Bio</label>
              <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--warm-peach)] bg-white/80 focus:border-[var(--warm-coral)] focus:outline-none h-24 resize-none"
                placeholder="Tell us about yourself..." />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--warm-brown)] mb-1 block">Occupation</label>
              <input type="text" value={form.occupation} onChange={e => setForm({...form, occupation: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--warm-peach)] bg-white/80 focus:border-[var(--warm-coral)] focus:outline-none"
                placeholder="What do you do?" />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--warm-brown)] mb-1 block">Location</label>
              <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--warm-peach)] bg-white/80 focus:border-[var(--warm-coral)] focus:outline-none"
                placeholder="City, Country" />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--warm-brown)] mb-1 block">Looking For</label>
              <select value={form.looking_for} onChange={e => setForm({...form, looking_for: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--warm-peach)] bg-white/80 focus:border-[var(--warm-coral)] focus:outline-none">
                <option value="everyone">Everyone</option>
                <option value="male">Men</option>
                <option value="female">Women</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-[var(--warm-gray)] mb-2">Select at least 3 interests</p>
            <div className="flex flex-wrap gap-2">
              {interests.map(i => (
                <button key={i.id} type="button" onClick={() => toggleInterest(i.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedInterests.includes(i.id) ? 'btn-warm text-white' : 'tag-warm'
                  }`}>
                  {i.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-[var(--warm-gray)] mb-2">Select activities you enjoy</p>
            <div className="grid grid-cols-2 gap-3">
              {activities.map(a => (
                <button key={a.id} type="button" onClick={() => toggleActivity(a.id)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    selectedActivities.includes(a.id) ? 'btn-warm text-white' : 'glass card-shadow'
                  }`}>
                  <p className="font-semibold text-sm">{a.name}</p>
                  <p className={`text-xs mt-1 ${selectedActivities.includes(a.id) ? 'text-white/80' : 'text-[var(--warm-gray)]'}`}>
                    {a.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-[var(--warm-rose)] text-sm bg-red-50 px-4 py-2 rounded-lg mt-4">{error}</p>}

        <div className="mt-auto pt-6 flex gap-3">
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)}
              className="w-full py-4 rounded-2xl btn-warm text-lg font-semibold flex items-center justify-center gap-2">
              Continue <ChevronRight size={20} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading || selectedInterests.length < 1}
              className="w-full py-4 rounded-2xl btn-warm text-lg font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? 'Creating Account...' : <><Heart size={20} fill="white" /> Get Started</>}
            </button>
          )}
        </div>

        <p className="mt-4 text-center text-[var(--warm-gray)] text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--warm-rose)] font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
