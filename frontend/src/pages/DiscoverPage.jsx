import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Star, MapPin, Info, SlidersHorizontal, RotateCcw } from 'lucide-react'
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
  const [swipeDir, setSwipeDir] = useState(null)
  const [filters, setFilters] = useState({
    min_age: 18, max_age: 99, max_distance_km: 50, gender: '',
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
      setShowDetail(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchCandidates() }, [fetchCandidates])

  const handleSwipe = async (direction) => {
    if (currentIndex >= candidates.length) return
    const candidate = candidates[currentIndex]

    setSwipeDir(direction)

    setTimeout(async () => {
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
      setSwipeDir(null)
    }, 350)
  }

  const current = candidates[currentIndex]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-3 border-[var(--border)] border-t-[#FF6B6B] rounded-full animate-spin" />
      </div>
    )
  }

  if (currentIndex >= candidates.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--bg)] flex items-center justify-center mb-5">
          <RotateCcw size={24} className="text-[var(--text-muted)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">No More Profiles</h2>
        <p className="text-[var(--text-secondary)] text-sm mb-8 max-w-xs">You have seen everyone for now. Check your matches or come back later!</p>
        <button onClick={fetchCandidates} className="btn-primary px-8">
          Discover Again
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Discover</h2>
        <button onClick={() => setShowFilters(!showFilters)} 
          className="w-10 h-10 rounded-xl bg-white border border-[var(--border-light)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border)] transition-all shadow-sm">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4">
            <div className="card p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Min Age</label>
                  <input type="number" value={filters.min_age} onChange={e => setFilters({...filters, min_age: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-white focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/10 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Max Age</label>
                  <input type="number" value={filters.max_age} onChange={e => setFilters({...filters, max_age: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-white focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/10 outline-none transition-all" />
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Max Distance: {filters.max_distance_km}km</label>
                <input type="range" min="5" max="200" value={filters.max_distance_km}
                  onChange={e => setFilters({...filters, max_distance_km: e.target.value})}
                  className="w-full accent-[#FF6B6B] h-1.5 bg-[var(--border)] rounded-full appearance-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Gender</label>
                <select value={filters.gender} onChange={e => setFilters({...filters, gender: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-white focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/10 outline-none transition-all">
                  <option value="">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card */}
      <div className="relative h-[480px] lg:h-[520px]">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ 
                opacity: 1, scale: 1, y: 0,
                x: swipeDir === 'right' ? 400 : swipeDir === 'left' ? -400 : 0,
                rotate: swipeDir === 'right' ? 18 : swipeDir === 'left' ? -18 : 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="absolute inset-0"
            >
              <div className="swipe-card h-full">
                <img 
                  src={current.avatar_url || `https://ui-avatars.com/api/?name=${current.full_name}&background=FF6B6B&color=fff&size=600`}
                  alt={current.full_name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

                {/* Stamps */}
                <motion.div className="stamp-like" animate={{ opacity: swipeDir === 'right' ? 1 : 0 }} />
                <motion.div className="stamp-nope" animate={{ opacity: swipeDir === 'left' ? 1 : 0 }} />

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <h3 className="text-[28px] font-bold leading-tight">{current.full_name} <span className="text-[22px] font-normal opacity-80">{current.age}</span></h3>
                      <div className="flex items-center gap-1.5 mt-1.5 text-white/70">
                        <MapPin size={13} />
                        <span className="text-sm">{current.distance_km ? `${current.distance_km}km away` : current.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full">
                      <Star size={12} fill="#FCD34D" className="text-yellow-400" />
                      <span className="text-sm font-bold">{current.compatibility_score}%</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {(current.shared_interests?.length > 0 || current.shared_activities?.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {current.shared_interests?.slice(0, 3).map(i => (
                        <span key={i} className="px-2.5 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-medium">{i}</span>
                      ))}
                      {current.shared_activities?.slice(0, 2).map(a => (
                        <span key={a} className="px-2.5 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-medium">{a}</span>
                      ))}
                    </div>
                  )}

                  <button onClick={() => setShowDetail(!showDetail)} 
                    className="flex items-center gap-1 text-white/60 hover:text-white text-sm transition-colors">
                    <Info size={14} />
                    {showDetail ? 'Less info' : 'More info'}
                  </button>
                </div>

                {/* Detail Panel */}
                <AnimatePresence>
                  {showDetail && (
                    <motion.div
                      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                      transition={{ type: 'spring', damping: 25 }}
                      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 max-h-[55%] overflow-y-auto"
                    >
                      <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-4" />
                      <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">{current.bio || 'No bio yet'}</p>

                      {current.occupation && (
                        <p className="text-sm text-[var(--text-secondary)] mb-4">Works as <span className="font-medium text-[var(--text-primary)]">{current.occupation}</span></p>
                      )}

                      {current.shared_interests?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Shared Interests</p>
                          <div className="flex flex-wrap gap-2">
                            {current.shared_interests.map(i => (
                              <span key={i} className="tag">{i}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {current.shared_activities?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Shared Activities</p>
                          <div className="flex flex-wrap gap-2">
                            {current.shared_activities.map(a => (
                              <span key={a} className="tag">{a}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-5 mt-6">
        <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.05 }}
          onClick={() => handleSwipe('left')}
          className="w-[60px] h-[60px] rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-[#EF4444] hover:bg-red-50 hover:border-red-200 transition-all shadow-lg shadow-red-100/50">
          <X size={26} strokeWidth={2.5} />
        </motion.button>

        <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.05 }}
          onClick={() => handleSwipe('right')}
          className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#E85555] flex items-center justify-center text-white shadow-lg shadow-[#FF6B6B]/30">
          <Heart size={26} fill="white" />
        </motion.button>
      </div>

      {/* Match Modal */}
      {matchData && <MatchModal match={matchData} onClose={() => setMatchData(null)} />}
    </div>
  )
}
