import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function MatchModal({ match, onClose }) {
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6"
        style={{ background: 'rgba(92, 61, 46, 0.6)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full text-center card-shadow relative overflow-hidden"
        >
          {/* Decorative hearts */}
          <div className="absolute top-4 left-4 text-[var(--warm-peach)] opacity-50">
            <Heart size={32} fill="currentColor" />
          </div>
          <div className="absolute bottom-4 right-4 text-[var(--warm-peach)] opacity-50">
            <Heart size={24} fill="currentColor" />
          </div>

          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--warm-gray)] hover:text-[var(--warm-brown)]"
          >
            <X size={20} />
          </button>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-4 rounded-full btn-warm flex items-center justify-center"
          >
            <Heart size={40} fill="white" />
          </motion.div>

          <h2 className="font-display text-3xl font-bold text-[var(--warm-brown)] mb-2">
            It is a Match!
          </h2>
          <p className="text-[var(--warm-gray)] mb-6">
            You and <span className="font-semibold text-[var(--warm-rose)]">{match?.full_name}</span> liked each other
          </p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-[var(--warm-peach)]">
              <img 
                src={match?.avatar_url || `https://ui-avatars.com/api/?name=${match?.full_name}&background=FFE4D6&color=C75B39`} 
                alt="You" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-[var(--warm-coral)]">
              <Heart size={28} fill="currentColor" />
            </div>
            <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-[var(--warm-peach)]">
              <img 
                src={match?.avatar_url || `https://ui-avatars.com/api/?name=${match?.full_name}&background=FFE4D6&color=C75B39`} 
                alt={match?.full_name} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-[var(--warm-peach)] text-[var(--warm-brown)] font-medium hover:bg-[var(--warm-cream)] transition-colors"
            >
              Keep Swiping
            </button>
            <button
              onClick={() => {
                onClose()
                navigate(`/chat/${match?.match_id}`)
              }}
              className="flex-1 py-3 rounded-xl btn-warm font-medium flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              Say Hello
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
