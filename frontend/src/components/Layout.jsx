import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Search, MessageCircle, User, Flame, LogOut } from 'lucide-react'
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

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      {/* Desktop: full width with sidebar. Mobile: max-w-md centered */}
      <div className="w-full max-w-md lg:max-w-6xl lg:flex lg:gap-6 lg:p-6 lg:items-start">

        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden lg:block lg:w-72 lg:shrink-0 lg:sticky lg:top-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col" style={{ minHeight: 'calc(100vh - 48px)' }}>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 px-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center shadow-md">
                <Flame size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">WarmConnect</span>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col gap-1 flex-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium text-sm transition-all ${
                    isActive(path)
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive(path) ? 2.5 : 2} />
                  {label}
                </button>
              ))}
            </nav>

            {/* User Card */}
            <div className="mt-auto pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 px-1 mb-3">
                <img 
                  src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name}&background=FF6B6B&color=fff`}
                  alt={user?.full_name}
                  className="w-10 h-10 rounded-full object-cover bg-gray-100"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{user?.full_name}</p>
                  <p className="text-xs text-gray-400">{user?.age} years</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <LogOut size={16} />
                Log Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 w-full lg:max-w-xl lg:mx-auto">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center">
                <Flame size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">WarmConnect</span>
            </div>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500 font-medium">
              Logout
            </button>
          </header>

          {/* Page Content */}
          <div className="pb-20 lg:pb-0">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
          <div className="max-w-md mx-auto flex justify-around py-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl transition-all ${
                  isActive(path) ? 'text-red-500' : 'text-gray-400'
                }`}
              >
                <Icon size={22} strokeWidth={isActive(path) ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
