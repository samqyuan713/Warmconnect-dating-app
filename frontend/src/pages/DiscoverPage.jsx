import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { X, Heart, Star, MapPin, Info, ChevronUp, SlidersHorizontal, RotateCcw } from 'lucide-react'
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
  const [direction, setDirection] = useState(null)
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
      setShowDetail(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  const handleSwipe = async (swipeDirection) => {
    if (currentIndex >= candidates.length) return
    const candidate = candidates[currentIndex]

    setDirection(swipeDirection)

    setTimeout(async () => {
      try {
        const res = await axios.post('/api/swipes', {
          swiped_id: candidate.id,
          direction: swipeDirection === 'right' ? 'right' : 'left'
        })

        if (res.data.is_match) {
          setMatchData({ ...candidate, match_id: res.data.id })
        }
      } catch (err) {
        console.error(err)
      }

      setCurrentIndex(prev => prev + 1)
      setDirection(null)
    }, 300)
  }

  const handleDragEnd = (event, info) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      handleSwipe('right')
    } else if (info.offset.x < -threshold) {
      handleSwipe('left')
    }
  }

  const current = candidates[currentIndex]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-[#FF6B6B] rounded-full animate-spin" />
      </div>
    )
  }

  if (currentIndex >= candidates.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
          <RotateCcw size={28} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No More Profiles</h2>
        <p className="text-gray-400 mb-8 max-w-xs">You've seen everyone for now. Check your matches or come back later!</p>
        <button onClick={fetchCandidates} className="px-8 py-3.5 rounded-full btn-primary font-semibold text-sm">
          Discover Again
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-6 lg:px-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Discover</h2>
        <button onClick={() => setShowFilters(!showFilters)} 
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4">
            <div className="bg-white rounded-2xl p-4 shadow-soft">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">Min Age</label>
                  <input type="number" value={filters.min_age} onChange={e => setFilters({...filters, min_age: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">Max Age</label>
                  <input type="number" value={filters.max_age} onChange={e => setFilters({...filters, max_age: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50" />
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-400 mb-1 block">Max Distance: {filters.max_distance_km}km</label>
                <input type="range" min="5" max="200" value={filters.max_distance_km}
                  onChange={e => setFilters({...filters, max_distance_km: e.target.value})}
                  className="w-full accent-[#FF6B6B]" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">Gender</label>
                <select value={filters.gender} onChange={e => setFilters({...filters, gender: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50">
                  <option value="">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Stack */}
      <div className="relative h-[520px] lg:h-[580px]">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                x: direction === 'right' ? 300 : direction === 'left' ? -300 : 0,
                rotate: direction === 'right' ? 15 : direction === 'left' ? -15 : 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              {/* Photo */}
              <div className="relative h-full rounded-3xl overflow-hidden shadow-card">
                <img 
                  src={current.avatar_url || `https://ui-avatars.com/api/?name=${current.full_name}&background=FF6B6B&color=fff&size=600`}
                  alt={current.full_name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Like/Nope stamps */}
                <motion.div 
                  className="absolute top-6 left-6 border-4 border-green-400 rounded-xl px-4 py-1.5 transform -rotate-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: direction === 'right' ? 1 : 0 }}
                >
                  <span className="text-green-400 font-bold text-2xl tracking-wider">LIKE</span>
                </motion.div>
                <motion.div 
                  className="absolute top-6 right-6 border-4 border-red-400 rounded-xl px-4 py-1.5 transform rotate-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: direction === 'left' ? 1 : 0 }}
                >
                  <span className="text-red-400 font-bold text-2xl tracking-wider">NOPE</span>
                </motion.div>

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <h3 className="text-3xl font-bold">{current.full_name} <span className="text-2xl font-normal">{current.age}</span></h3>
                      <div className="flex items-center gap-1.5 mt-1 text-white/80">
                        <MapPin size={14} />
                        <span className="text-sm">{current.distance_km ? `${current.distance_km}km away` : current.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                      <Star size={13} fill="currentColor" className="text-yellow-400" />
                      <span className="text-sm font-bold">{current.compatibility_score}%</span>
                    </div>
                  </div>

                  {/* Shared tags */}
                  {(current.shared_interests?.length > 0 || current.shared_activities?.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {current.shared_interests?.slice(0, 3).map(i => (
                        <span key={i} className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium">{i}</span>
                      ))}
                      {current.shared_activities?.slice(0, 2).map(a => (
                        <span key={a} className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium">{a}</span>
                      ))}
                    </div>
                  )}

                  {/* Expand detail button */}
                  <button onClick={() => setShowDetail(!showDetail)} 
                    className="flex items-center gap-1 text-white/70 hover:text-white text-sm transition-colors">
                    <Info size={14} />
                    {showDetail ? 'Less info' : 'More info'}
                    <ChevronUp size={14} className={`transition-transform ${showDetail ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Detail panel */}
                <AnimatePresence>
                  {showDetail && (
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{ type: 'spring', damping: 25 }}
                      className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl rounded-t-3xl p-6 max-h-[60%] overflow-y-auto"
                    >
                      <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">{current.bio || 'No bio yet'}</p>

                      {current.occupation && (
                        <p className="text-sm text-gray-500 mb-4">Works as {current.occupation}</p>
                      )}

                      {current.shared_interests?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Shared Interests</p>
                          <div className="flex flex-wrap gap-2">
                            {current.shared_interests.map(i => (
                              <span key={i} className="px-3 py-1.5 rounded-full tag-pill text-xs font-medium">{i}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {current.shared_activities?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Shared Activities</p>
                          <div className="flex flex-wrap gap-2">
                            {current.shared_activities.map(a => (
                              <span key={a} className="px-3 py-1.5 rounded-full tag-pill text-xs font-medium">{a}</span>
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
        <motion.button
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-white shadow-card flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
        >
          <X size={28} strokeWidth={2.5} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#ee5a5a] shadow-lg flex items-center justify-center text-white"
        >
          <Heart size={28} fill="white" />
        </motion.button>
      </div>

      {/* Match Modal */}
      {matchData && <MatchModal match={matchData} onClose={() => setMatchData(null)} />}
    </div>
  )
}
