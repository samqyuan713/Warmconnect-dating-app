import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Sparkles, Users, MessageCircle } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  const features = [
    { icon: Sparkles, title: "Interest Matching", desc: "Connect through shared passions and hobbies" },
    { icon: Users, title: "Activity Dates", desc: "Plan real experiences, not just conversations" },
    { icon: MessageCircle, title: "Meaningful Chats", desc: "Start with what you both love" },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="w-24 h-24 rounded-full btn-warm flex items-center justify-center mb-8 shadow-lg"
        >
          <Heart size={48} fill="white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-5xl font-bold text-[var(--warm-brown)] mb-4"
        >
          WarmConnect
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-[var(--warm-gray)] max-w-xs mb-10"
        >
          Find someone who shares your passions. Connect through interests, meet through activities.
        </motion.p>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-4 w-full max-w-sm mb-10"
        >
          {features.map((f, i) => (
            <div key={i} className="glass rounded-2xl p-4 flex items-center gap-4 card-shadow">
              <div className="w-12 h-12 rounded-xl bg-[var(--warm-peach)] flex items-center justify-center text-[var(--warm-terracotta)]">
                <f.icon size={22} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-[var(--warm-brown)]">{f.title}</h3>
                <p className="text-sm text-[var(--warm-gray)]">{f.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3 w-full max-w-sm"
        >
          <button
            onClick={() => navigate('/register')}
            className="w-full py-4 rounded-2xl btn-warm text-lg font-semibold shadow-lg"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 rounded-2xl border-2 border-[var(--warm-coral)] text-[var(--warm-coral)] font-semibold hover:bg-[var(--warm-peach)] transition-colors"
          >
            I Already Have an Account
          </button>
        </motion.div>
      </div>
    </div>
  )
}
