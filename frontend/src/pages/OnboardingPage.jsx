import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function OnboardingPage() {
  const navigate = useNavigate()
  React.useEffect(() => {
    navigate('/discover')
  }, [navigate])
  return null
}
