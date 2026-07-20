import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Clock, Trash2 } from 'lucide-react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'

export default function MatchesPage() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const res = await axios.get('/api/matches')
      setMatches(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUnmatch = async (matchId) => {
    if (!confirm('Are you sure you want to unmatch?')) return
    try {
      await axios.delete(`/api/matches/${matchId}`)
      setMatches(prev => prev.filter(m => m.id !== matchId))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-[var(--warm-coral)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--warm-peach)] flex items-center justify-center mb-4">
          <Heart size={32} className="text-[var(--warm-coral)]" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[var(--warm-brown)] mb-2">No Matches Yet</h2>
        <p className="text-[var(--warm-gray)]">Start swiping to find your perfect match!</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <h2 className="font-display text-2xl font-bold text-[var(--warm-brown)] mb-1">Your Matches</h2>
      <p className="text-sm text-[var(--warm-gray)] mb-4">{matches.length} connection{matches.length !== 1 ? 's' : ''}</p>

      <div className="flex flex-col gap-3">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass rounded-2xl p-4 card-shadow flex items-center gap-4 cursor-pointer hover:bg-white/80 transition-colors"
            onClick={() => navigate(`/chat/${match.id}`)}
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-[var(--warm-peach)]">
                <img 
                  src={match.user.avatar_url || `https://ui-avatars.com/api/?name=${match.user.full_name}&background=FFE4D6&color=C75B39`}
                  alt={match.user.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              {match.unread_count > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--warm-rose)] text-white text-xs flex items-center justify-center font-bold">
                  {match.unread_count}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--warm-brown)] truncate">{match.user.full_name}</h3>
                <div className="flex items-center gap-1 text-[var(--warm-coral)]">
                  <Heart size={12} fill="currentColor" />
                  <span className="text-xs font-medium">{match.compatibility_score}%</span>
                </div>
              </div>
              <p className="text-sm text-[var(--warm-gray)] truncate mt-0.5">
                {match.last_message || 'Start the conversation!'}
              </p>
              <div className="flex items-center gap-1 mt-1 text-[var(--warm-gray)]">
                <Clock size={10} />
                <span className="text-xs">
                  {match.last_message_at 
                    ? formatDistanceToNow(new Date(match.last_message_at), { addSuffix: true })
                    : formatDistanceToNow(new Date(match.created_at), { addSuffix: true })
                  }
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/chat/${match.id}`)
                }}
                className="w-10 h-10 rounded-full bg-[var(--warm-peach)] flex items-center justify-center text-[var(--warm-terracotta)] hover:bg-[var(--warm-coral)] hover:text-white transition-colors"
              >
                <MessageCircle size={18} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  handleUnmatch(match.id)
                }}
                className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
