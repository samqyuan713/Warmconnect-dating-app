import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Sparkles, Users, MessageCircle, ArrowRight, Shield } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  const features = [
    { icon: Sparkles, title: "Smart Matching", desc: "AI-powered compatibility based on your interests & activities" },
    { icon: Users, title: "Real Connections", desc: "Meet people who share your passions, not just your zip code" },
    { icon: MessageCircle, title: "Meaningful Chats", desc: "Break the ice with shared interests, not awkward small talk" },
    { icon: Shield, title: "Safe & Secure", desc: "Verified profiles and privacy-first design" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#FF6B6B]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#4ECDC4]/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative px-6 pt-16 pb-12 lg:pt-24 lg:pb-20 max-w-lg mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-[#FF6B6B] to-[#ee5a5a] flex items-center justify-center shadow-xl shadow-[#FF6B6B]/20"
          >
            <Heart size={36} className="text-white" fill="white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight"
          >
            Find Your
            <span className="text-[#FF6B6B]"> Perfect Match</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 mb-10 max-w-sm mx-auto leading-relaxed"
          >
            Connect through shared passions. Meet people who love what you love.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-3 max-w-xs mx-auto"
          >
            <button
              onClick={() => navigate('/register')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6B6B] to-[#ee5a5a] text-white text-lg font-semibold shadow-lg shadow-[#FF6B6B]/25 hover:shadow-xl hover:shadow-[#FF6B6B]/30 transition-all flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 rounded-2xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
            >
              I Already Have an Account
            </button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50/50 px-6 py-16">
        <div className="max-w-lg mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-2xl font-bold text-gray-900 text-center mb-10"
          >
            Why WarmConnect?
          </motion.h2>

          <div className="grid grid-cols-1 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-5 shadow-soft flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B6B]/10 to-[#FF6B6B]/5 flex items-center justify-center text-[#FF6B6B] shrink-0">
                  <f.icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-gray-400">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-[#FF6B6B] font-semibold hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
