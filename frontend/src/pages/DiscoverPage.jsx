import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, MapPin, Star, Info, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import MatchModal from '../components/MatchModal'

export default function DiscoverPage() {
  const { user } = useAuth()
  const [candidates, setCandidates] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [matchData, setMatchData] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [filters, setFilters] = useState({
    min_age: 18,
    max_age: 99,
    max_distance_km: 50,
    gender: '',
  })

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.min_age) params.append('min_age', filters.min_age)
      if (filters.max_age) params.append('max_age', filters.max_age)
      if (filters.max_distance_km) params.append('max_distance_km', filters.max_distance_km)
      if (filters.gender) params.append('gender', filters.gender)

      const res = await axios.get(`/api/discover?${params}`)
      setCandidates(res.data)
      setCurrentIndex(0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  const handleSwipe = async (direction) => {
    if (currentIndex >= candidates.length) return
    const candidate = candidates[currentIndex]

    try {
      const res = await axios.post('/api/swipes', {
        swiped_id: candidate.id,
        direction: direction === 'right' ? 'right' : 'left'
      })

      if (res.data.is_match) {
        setMatchData({ ...candidate, match_id: res.data.id })
      }
    } catch (err) {
      console.error(err)
    }

    setCurrentIndex(prev => prev + 1)
  }

  const current = candidates[currentIndex]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-[var(--warm-coral)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (currentIndex >= candidates.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--warm-peach)] flex items-center justify-center mb-4">
          <Heart size={32} className="text-[var(--warm-coral)]" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[var(--warm-brown)] mb-2">No More Profiles</h2>
        <p className="text-[var(--warm-gray)] mb-6">You have seen everyone for now. Check back later!</p>
        <button onClick={fetchCandidates} className="px-6 py-3 rounded-xl btn-warm font-medium">
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      {/* Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-[var(--warm-brown)]">Discover</h2>
        <button onClick={() => setShowFilters(!showFilters)} className="p-2 rounded-xl glass card-shadow">
          <SlidersHorizontal size={18} className="text-[var(--warm-brown)]" />
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="glass rounded-2xl p-4 card-shadow">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-medium text-[var(--warm-gray)]">Min Age</label>
                  <input type="number" value={filters.min_age} onChange={e => setFilters({...filters, min_age: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--warm-peach)] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--warm-gray)]">Max Age</label>
                  <input type="number" value={filters.max_age} onChange={e => setFilters({...filters, max_age: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--warm-peach)] text-sm" />
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs font-medium text-[var(--warm-gray)]">Max Distance: {filters.max_distance_km}km</label>
                <input type="range" min="5" max="200" value={filters.max_distance_km}
                  onChange={e => setFilters({...filters, max_distance_km: e.target.value})}
                  className="w-full accent-[var(--warm-coral)]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--warm-gray)]">Gender</label>
                <select value={filters.gender} onChange={e => setFilters({...filters, gender: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--warm-peach)] text-sm">
                  <option value="">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Card */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative rounded-3xl overflow-hidden card-shadow bg-white"
            >
              {/* Photo */}
              <div className="relative h-[420px]">
                <img 
                  src={current.avatar_url || `https://ui-avatars.com/api/?name=${current.full_name}&background=FFE4D6&color=C75B39&size=400`}
                  alt={current.full_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="font-display text-3xl font-bold">{current.full_name}, {current.age}</h3>
                      <div className="flex items-center gap-1 mt-1 text-white/80">
                        <MapPin size={14} />
                        <span className="text-sm">{current.distance_km ? `${current.distance_km}km away` : current.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Star size={14} fill="currentColor" className="text-yellow-400" />
                      <span className="text-sm font-semibold">{current.compatibility_score}%</span>
                    </div>
                  </div>
                </div>

                {/* Detail Toggle */}
                <button 
                  onClick={() => setShowDetail(!showDetail)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <Info size={18} className="text-white" />
                </button>
              </div>

              {/* Details */}
              <AnimatePresence>
                {showDetail && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 border-t border-[var(--warm-peach)]">
                      <p className="text-[var(--warm-gray)] mb-4">{current.bio || 'No bio yet'}</p>

                      {current.occupation && (
                        <p className="text-sm text-[var(--warm-brown)] mb-3">
                          <span className="font-medium">Works as:</span> {current.occupation}
                        </p>
                      )}

                      {current.shared_interests?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-[var(--warm-brown)] mb-2">Shared Interests</p>
                          <div className="flex flex-wrap gap-2">
                            {current.shared_interests.map(i => (
                              <span key={i} className="px-3 py-1 rounded-full tag-warm text-xs font-medium">{i}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {current.shared_activities?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-[var(--warm-brown)] mb-2">Shared Activities</p>
                          <div className="flex flex-wrap gap-2">
                            {current.shared_activities.map(a => (
                              <span key={a} className="px-3 py-1 rounded-full bg-[var(--warm-peach)] text-[var(--warm-terracotta)] text-xs font-medium">{a}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-white card-shadow flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors"
        >
          <X size={28} strokeWidth={2.5} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full btn-warm flex items-center justify-center shadow-lg"
        >
          <Heart size={28} fill="white" />
        </motion.button>
      </div>

      {/* Match Modal */}
      {matchData && <MatchModal match={matchData} onClose={() => setMatchData(null)} />}
    </div>
  )
}
