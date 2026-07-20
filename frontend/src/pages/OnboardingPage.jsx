import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function OnboardingPage() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/discover')
  }, [navigate])
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-gray-200 border-t-[#FF6B6B] rounded-full animate-spin" />
    </div>
  )
}
