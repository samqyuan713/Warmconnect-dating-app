import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Search, MessageCircle, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const navItems = [
    { path: '/discover', icon: Search, label: 'Discover' },
    { path: '/matches', icon: Heart, label: 'Matches' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white/50">
      {/* Header */}
      <header className="sticky top-0 z-50 glass px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full btn-warm flex items-center justify-center">
            <Heart size={16} fill="white" />
          </div>
          <span className="font-display text-xl font-bold text-[var(--warm-brown)]">WarmConnect</span>
        </div>
        <button 
          onClick={logout}
          className="text-sm text-[var(--warm-gray)] hover:text-[var(--warm-rose)] transition-colors"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[var(--warm-peach)]">
        <div className="max-w-md mx-auto flex justify-around py-3">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(path)
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all ${
                  isActive 
                    ? 'text-[var(--warm-rose)]' 
                    : 'text-[var(--warm-gray)] hover:text-[var(--warm-coral)]'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
