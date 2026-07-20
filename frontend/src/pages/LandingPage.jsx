import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Sparkles, Users, MessageCircle, ArrowRight, Shield, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  const features = [
    { icon: Sparkles, title: "Smart Matching", desc: "AI-powered compatibility scoring based on your interests & activities" },
    { icon: Users, title: "Real Connections", desc: "Meet people who share your passions, not just your zip code" },
    { icon: MessageCircle, title: "Meaningful Chats", desc: "Break the ice with shared interests, not awkward small talk" },
    { icon: Shield, title: "Safe & Secure", desc: "Verified profiles and privacy-first design" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#FF6B6B]/8 to-transparent rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#4ECDC4]/8 to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />

        <div className="relative px-6 pt-16 pb-12 lg:pt-24 lg:pb-20 max-w-lg mx-auto text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="w-[72px] h-[72px] mx-auto mb-8 rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-[#E85555] flex items-center justify-center shadow-xl shadow-[#FF6B6B]/25"
          >
            <Heart size={32} className="text-white" fill="white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-[40px] lg:text-[48px] font-bold text-[var(--text-primary)] mb-4 leading-tight tracking-tight"
          >
            Find Your
            <br />
            <span className="gradient-text">Perfect Match</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-[var(--text-secondary)] mb-10 max-w-sm mx-auto leading-relaxed"
          >
            Connect through shared passions. Meet people who love what you love.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col gap-3 max-w-xs mx-auto"
          >
            <button
              onClick={() => navigate('/register')}
              className="btn-primary w-full py-4 text-base"
            >
              Get Started
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary w-full py-4 text-base"
            >
              I Already Have an Account
            </button>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-[var(--bg)] px-6 py-16">
        <div className="max-w-lg mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-[var(--text-primary)] text-center mb-10"
          >
            Why WarmConnect?
          </motion.h2>

          <div className="grid grid-cols-1 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-5 card-hover flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF6B6B]/10 to-[#FF6B6B]/5 flex items-center justify-center text-[#FF6B6B] shrink-0">
                  <f.icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-1">{f.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 text-center bg-white">
        <p className="text-sm text-[var(--text-muted)]">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-[#FF6B6B] font-semibold hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
