import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, MapPin, Briefcase, Heart, Sliders, LogOut, Edit2, Check, X, ChevronRight, Sparkles, Activity } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [allInterests, setAllInterests] = useState([])
  const [allActivities, setAllActivities] = useState([])
  const [form, setForm] = useState({})
  const [selectedInterests, setSelectedInterests] = useState([])
  const [selectedActivities, setSelectedActivities] = useState([])
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '', age: user.age || '',
        bio: user.bio || '', occupation: user.occupation || '',
        location: user.location || '', looking_for: user.looking_for || 'everyone',
        min_age: user.min_age || 18, max_age: user.max_age || 99,
        max_distance_km: user.max_distance_km || 50,
      })
      setSelectedInterests(user.interests?.map(i => i.id) || [])
      setSelectedActivities(user.activities?.map(a => a.id) || [])
    }
    axios.get('/api/interests').then(r => setAllInterests(r.data))
    axios.get('/api/activities').then(r => setAllActivities(r.data))
  }, [user])

  const toggleInterest = (id) => {
    setSelectedInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }
  const toggleActivity = (id) => {
    setSelectedActivities(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await axios.put('/api/users/me', {
        ...form,
        age: parseInt(form.age),
        min_age: parseInt(form.min_age), max_age: parseInt(form.max_age),
        max_distance_km: parseInt(form.max_distance_km),
        interest_ids: selectedInterests,
        activity_ids: selectedActivities,
      })
      updateUser(res.data)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (!user) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-red-400 rounded-full animate-spin" />
    </div>
  )

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Camera },
    { id: 'interests', label: 'Interests', icon: Heart },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
  ]

  return (
    <div className="pb-8">
      {/* Profile Header */}
      <div className="bg-white px-5 pt-6 pb-6 mb-4">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-gray-100 bg-gray-100">
              <img 
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=FF6B6B&color=fff&size=200`}
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg">
              <Camera size={14} />
            </button>
          </div>

          <h1 className="text-xl font-bold text-gray-900">{user.full_name}, {user.age}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{user.location || 'Add location'}</p>

          <div className="flex items-center gap-2 mt-3 bg-gray-100 px-4 py-1.5 rounded-full">
            <Sparkles size={12} className="text-red-400" />
            <span className="text-xs font-medium text-gray-500">{user.interests?.length || 0} interests</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-medium text-gray-500">{user.activities?.length || 0} activities</span>
          </div>

          {!isEditing ? (
            <button onClick={() => setIsEditing(true)}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors">
              <Edit2 size={14} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-400 to-red-500 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                <Check size={14} />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-medium hover:bg-gray-200 transition-colors">
                <X size={14} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  activeTab === tab.id 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 space-y-3">
        <AnimatePresence mode="wait">

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">About</h3>
                {isEditing ? (
                  <textarea value={form.bio || ''} onChange={e => setForm({...form, bio: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm min-h-[100px] resize-none focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    placeholder="Tell us about yourself..." />
                ) : (
                  <p className="text-gray-500 text-sm leading-relaxed">{user.bio || 'No bio yet. Tell the world who you are!'}</p>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Details</h3>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <Briefcase size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">Occupation</p>
                    {isEditing ? (
                      <input value={form.occupation || ''} onChange={e => setForm({...form, occupation: e.target.value})}
                        className="w-full text-sm border-b border-gray-200 bg-transparent focus:border-red-400 focus:outline-none py-1" />
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{user.occupation || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">Location</p>
                    {isEditing ? (
                      <input value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})}
                        className="w-full text-sm border-b border-gray-200 bg-transparent focus:border-red-400 focus:outline-none py-1" />
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{user.location || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* INTERESTS TAB */}
          {activeTab === 'interests' && (
            <motion.div key="interests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Interests ({allInterests.length} available)</h3>

                {/* DEBUG: Show raw count */}
                <p className="text-xs text-gray-400 mb-3">Loaded: {allInterests.length} interests</p>

                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {allInterests.map(i => (
                      <button key={i.id} onClick={() => toggleInterest(i.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedInterests.includes(i.id)
                            ? 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                        }`}>
                        {i.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.interests?.length > 0 ? user.interests.map(i => (
                      <span key={i.id} className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium border border-gray-200">{i.name}</span>
                    )) : (
                      <p className="text-sm text-gray-400">No interests added yet. Tap Edit to add some!</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ACTIVITIES TAB */}
          {activeTab === 'activities' && (
            <motion.div key="activities" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Activities ({allActivities.length} available)</h3>

                {/* DEBUG: Show raw count */}
                <p className="text-xs text-gray-400 mb-3">Loaded: {allActivities.length} activities</p>

                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    {allActivities.map(a => (
                      <button key={a.id} onClick={() => toggleActivity(a.id)}
                        className={`flex items-center justify-between p-4 rounded-xl text-left transition-all border ${
                          selectedActivities.includes(a.id)
                            ? 'border-red-400 bg-red-50'
                            : 'border-gray-100 bg-white hover:bg-gray-50'
                        }`}>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{a.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
                        </div>
                        {selectedActivities.includes(a.id) && (
                          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {user.activities?.length > 0 ? user.activities.map(a => (
                      <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{a.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                      </div>
                    )) : (
                      <p className="text-sm text-gray-400">No activities added yet. Tap Edit to add some!</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <motion.div key="preferences" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Matching Preferences</h3>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Looking For</label>
                  {isEditing ? (
                    <select value={form.looking_for || 'everyone'} onChange={e => setForm({...form, looking_for: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all">
                      <option value="everyone">Everyone</option>
                      <option value="male">Men</option>
                      <option value="female">Women</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-gray-900 capitalize">{user.looking_for}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Age Range</label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input type="number" value={form.min_age} onChange={e => setForm({...form, min_age: e.target.value})}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-center focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all" />
                        <span className="text-gray-400">-</span>
                        <input type="number" value={form.max_age} onChange={e => setForm({...form, max_age: e.target.value})}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-center focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all" />
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{user.min_age} - {user.max_age} years</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Max Distance</label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input type="number" value={form.max_distance_km} onChange={e => setForm({...form, max_distance_km: e.target.value})}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-center focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all" />
                        <span className="text-xs text-gray-400">km</span>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{user.max_distance_km} km</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Logout */}
      <div className="px-4 mt-8">
        <button onClick={logout}
          className="w-full py-3.5 rounded-xl bg-white border border-gray-200 text-red-500 font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </div>
  )
}
