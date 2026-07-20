import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Trash2, Sparkles } from 'lucide-react'
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
    if (!confirm('Remove this match?')) return
    try {
      await axios.delete(`/api/matches/${matchId}`)
      setMatches(prev => prev.filter(m => m.id !== matchId))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-[#FF6B6B] rounded-full animate-spin" />
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
          <Heart size={28} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Matches Yet</h2>
        <p className="text-gray-400 mb-2">Start swiping to find your perfect match!</p>
        <button onClick={() => navigate('/discover')} className="mt-4 px-8 py-3 rounded-full btn-primary font-semibold text-sm">
          Start Discovering
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-6 lg:px-0">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>
          <p className="text-sm text-gray-400">{matches.length} match{matches.length !== 1 ? 'es' : ''}</p>
        </div>
      </div>

      <div className="space-y-2">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-4 shadow-soft flex items-center gap-4 cursor-pointer hover:shadow-card transition-shadow"
            onClick={() => navigate(`/chat/${match.id}`)}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-gray-100">
                <img 
                  src={match.user.avatar_url || `https://ui-avatars.com/api/?name=${match.user.full_name}&background=FF6B6B&color=fff`}
                  alt={match.user.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              {match.unread_count > 0 && (
                <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#FF6B6B] text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-white">
                  {match.unread_count}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="font-semibold text-gray-800 truncate">{match.user.full_name}</h3>
                <div className="flex items-center gap-1 text-[#FF6B6B] shrink-0 ml-2">
                  <Sparkles size={11} />
                  <span className="text-xs font-bold">{match.compatibility_score}%</span>
                </div>
              </div>
              <p className={`text-sm truncate ${match.unread_count > 0 ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                {match.last_message || 'Start the conversation'}
              </p>
              <p className="text-xs text-gray-300 mt-0.5">
                {match.last_message_at 
                  ? formatDistanceToNow(new Date(match.last_message_at), { addSuffix: true })
                  : formatDistanceToNow(new Date(match.created_at), { addSuffix: true })
                }
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/chat/${match.id}`)
                }}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#FF6B6B] hover:text-white transition-all"
              >
                <MessageCircle size={16} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  handleUnmatch(match.id)
                }}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
