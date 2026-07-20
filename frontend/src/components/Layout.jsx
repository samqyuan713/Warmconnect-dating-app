import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Search, MessageCircle, User, Flame } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const navItems = [
    { path: '/discover', icon: Flame, label: 'Discover' },
    { path: '/matches', icon: MessageCircle, label: 'Matches' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Desktop Header */}
      <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/discover')}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#ee5a5a] flex items-center justify-center">
            <Flame size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">WarmConnect</span>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(path)
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-gray-100">
            <img 
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name}&background=FF6B6B&color=fff`}
              alt={user?.full_name}
              className="w-full h-full object-cover"
            />
          </div>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
            Logout
          </button>
        </div>
      </header>

      <div className="lg:flex lg:justify-center lg:py-8">
        <div className="w-full lg:max-w-[420px] lg:mx-auto">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#ee5a5a] flex items-center justify-center">
                <Flame size={15} className="text-white" />
              </div>
              <span className="text-lg font-bold text-gray-800">WarmConnect</span>
            </div>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500">
              Logout
            </button>
          </header>

          {/* Main Content */}
          <main className="pb-20 lg:pb-0">
            <Outlet />
          </main>

          {/* Mobile Bottom Nav */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
            <div className="max-w-md mx-auto flex justify-around py-2">
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname.startsWith(path)
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl transition-all ${
                      isActive 
                        ? 'text-[#FF6B6B]' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">{label}</span>
                  </button>
                )
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}
