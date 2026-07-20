import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, MapPin, Briefcase, Heart, Settings, LogOut, Edit2, Check, X, Sliders } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [allInterests, setAllInterests] = useState([])
  const [allActivities, setAllActivities] = useState([])
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        age: user.age || '',
        bio: user.bio || '',
        occupation: user.occupation || '',
        location: user.location || '',
        looking_for: user.looking_for || 'everyone',
        min_age: user.min_age || 18,
        max_age: user.max_age || 99,
        max_distance_km: user.max_distance_km || 50,
      })
    }
    axios.get('/api/interests').then(r => setAllInterests(r.data))
    axios.get('/api/activities').then(r => setAllActivities(r.data))
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await axios.put('/api/users/me', {
        ...form,
        age: parseInt(form.age),
        min_age: parseInt(form.min_age),
        max_age: parseInt(form.max_age),
        max_distance_km: parseInt(form.max_distance_km),
        interest_ids: user.interests?.map(i => i.id) || [],
        activity_ids: user.activities?.map(a => a.id) || [],
      })
      updateUser(res.data)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="pb-8">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-[var(--warm-coral)] to-[var(--warm-rose)]" />
        <div className="px-4 -mt-12">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white bg-[var(--warm-peach)]">
              <img 
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=FFE4D6&color=C75B39&size=200`}
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white card-shadow flex items-center justify-center text-[var(--warm-coral)]">
              <Camera size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Name & Actions */}
      <div className="px-4 mt-3 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--warm-brown)]">{user.full_name}</h1>
          <p className="text-[var(--warm-gray)] text-sm">{user.age} years old</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={handleSave} disabled={saving}
                className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Check size={18} />
              </button>
              <button onClick={() => setIsEditing(false)}
                className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                <X size={18} />
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)}
              className="w-10 h-10 rounded-full glass card-shadow flex items-center justify-center text-[var(--warm-brown)]">
              <Edit2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Bio */}
      <div className="px-4 mt-4">
        {isEditing ? (
          <textarea
            value={form.bio || ''}
            onChange={e => setForm({...form, bio: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--warm-peach)] bg-white/80 focus:border-[var(--warm-coral)] focus:outline-none h-24 resize-none text-sm"
            placeholder="Tell us about yourself..."
          />
        ) : (
          <p className="text-[var(--warm-gray)] text-sm leading-relaxed">{user.bio || 'No bio yet. Tell the world who you are!'}</p>
        )}
      </div>

      {/* Details Grid */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl p-3 card-shadow">
            <div className="flex items-center gap-2 text-[var(--warm-coral)] mb-1">
              <Briefcase size={14} />
              <span className="text-xs font-medium">Occupation</span>
            </div>
            {isEditing ? (
              <input
                value={form.occupation || ''}
                onChange={e => setForm({...form, occupation: e.target.value})}
                className="w-full text-sm border-b border-[var(--warm-peach)] bg-transparent focus:border-[var(--warm-coral)] focus:outline-none"
              />
            ) : (
              <p className="text-sm text-[var(--warm-brown)] font-medium">{user.occupation || 'Not set'}</p>
            )}
          </div>

          <div className="glass rounded-xl p-3 card-shadow">
            <div className="flex items-center gap-2 text-[var(--warm-coral)] mb-1">
              <MapPin size={14} />
              <span className="text-xs font-medium">Location</span>
            </div>
            {isEditing ? (
              <input
                value={form.location || ''}
                onChange={e => setForm({...form, location: e.target.value})}
                className="w-full text-sm border-b border-[var(--warm-peach)] bg-transparent focus:border-[var(--warm-coral)] focus:outline-none"
              />
            ) : (
              <p className="text-sm text-[var(--warm-brown)] font-medium">{user.location || 'Not set'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="px-4 mt-6">
        <h2 className="font-display text-lg font-bold text-[var(--warm-brown)] mb-3 flex items-center gap-2">
          <Sliders size={18} className="text-[var(--warm-coral)]" />
          Preferences
        </h2>
        <div className="glass rounded-2xl p-4 card-shadow space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--warm-gray)]">Looking For</label>
            {isEditing ? (
              <select
                value={form.looking_for || 'everyone'}
                onChange={e => setForm({...form, looking_for: e.target.value})}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--warm-peach)] text-sm bg-white/80"
              >
                <option value="everyone">Everyone</option>
                <option value="male">Men</option>
                <option value="female">Women</option>
              </select>
            ) : (
              <p className="text-sm text-[var(--warm-brown)] font-medium capitalize">{user.looking_for}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--warm-gray)]">Age Range</label>
              {isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <input type="number" value={form.min_age} onChange={e => setForm({...form, min_age: e.target.value})}
                    className="w-full px-2 py-1.5 rounded-lg border border-[var(--warm-peach)] text-sm" />
                  <span className="text-[var(--warm-gray)]">-</span>
                  <input type="number" value={form.max_age} onChange={e => setForm({...form, max_age: e.target.value})}
                    className="w-full px-2 py-1.5 rounded-lg border border-[var(--warm-peach)] text-sm" />
                </div>
              ) : (
                <p className="text-sm text-[var(--warm-brown)] font-medium">{user.min_age} - {user.max_age}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--warm-gray)]">Max Distance</label>
              {isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <input type="number" value={form.max_distance_km} onChange={e => setForm({...form, max_distance_km: e.target.value})}
                    className="w-full px-2 py-1.5 rounded-lg border border-[var(--warm-peach)] text-sm" />
                  <span className="text-xs text-[var(--warm-gray)]">km</span>
                </div>
              ) : (
                <p className="text-sm text-[var(--warm-brown)] font-medium">{user.max_distance_km} km</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interests */}
      <div className="px-4 mt-6">
        <h2 className="font-display text-lg font-bold text-[var(--warm-brown)] mb-3 flex items-center gap-2">
          <Heart size={18} className="text-[var(--warm-coral)]" />
          Interests
        </h2>
        <div className="flex flex-wrap gap-2">
          {user.interests?.map(i => (
            <span key={i.id} className="px-3 py-1.5 rounded-full tag-warm text-sm font-medium">{i.name}</span>
          ))}
          {(!user.interests || user.interests.length === 0) && (
            <p className="text-sm text-[var(--warm-gray)]">No interests added yet</p>
          )}
        </div>
      </div>

      {/* Activities */}
      <div className="px-4 mt-6">
        <h2 className="font-display text-lg font-bold text-[var(--warm-brown)] mb-3 flex items-center gap-2">
          <Settings size={18} className="text-[var(--warm-coral)]" />
          Activities
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {user.activities?.map(a => (
            <div key={a.id} className="glass rounded-xl p-3 card-shadow">
              <p className="text-sm font-medium text-[var(--warm-brown)]">{a.name}</p>
              <p className="text-xs text-[var(--warm-gray)] mt-0.5">{a.description}</p>
            </div>
          ))}
          {(!user.activities || user.activities.length === 0) && (
            <p className="text-sm text-[var(--warm-gray)] col-span-2">No activities added yet</p>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 mt-8">
        <button
          onClick={logout}
          className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  )
}
