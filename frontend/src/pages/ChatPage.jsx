import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Heart, Image, MapPin } from 'lucide-react'
import axios from 'axios'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'

export default function ChatPage() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [matchInfo, setMatchInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    fetchMessages()
    fetchMatchInfo()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [matchId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/matches/${matchId}/messages`)
      setMessages(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMatchInfo = async () => {
    try {
      const res = await axios.get('/api/matches')
      const match = res.data.find(m => m.id === parseInt(matchId))
      setMatchInfo(match)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const content = newMessage.trim()
    setNewMessage('')

    try {
      const res = await axios.post('/api/messages', {
        match_id: parseInt(matchId),
        content
      })
      setMessages(prev => [...prev, res.data])
    } catch (err) {
      console.error(err)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const groupMessagesByDate = (msgs) => {
    const groups = {}
    msgs.forEach(msg => {
      const date = format(new Date(msg.created_at), 'MMMM d, yyyy')
      if (!groups[date]) groups[date] = []
      groups[date].push(msg)
    })
    return groups
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-[var(--warm-coral)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const groupedMessages = groupMessagesByDate(messages)

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Chat Header */}
      <div className="glass px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/matches')} className="p-2 -ml-2 text-[var(--warm-gray)] hover:text-[var(--warm-brown)]">
          <ArrowLeft size={22} />
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[var(--warm-peach)]">
          <img 
            src={matchInfo?.user?.avatar_url || `https://ui-avatars.com/api/?name=${matchInfo?.user?.full_name}&background=FFE4D6&color=C75B39`}
            alt={matchInfo?.user?.full_name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-[var(--warm-brown)]">{matchInfo?.user?.full_name}</h3>
          <div className="flex items-center gap-1 text-xs text-[var(--warm-coral)]">
            <Heart size={10} fill="currentColor" />
            <span>{matchInfo?.compatibility_score}% match</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="flex items-center justify-center mb-4">
              <span className="text-xs text-[var(--warm-gray)] bg-[var(--warm-peach)]/50 px-3 py-1 rounded-full">
                {date}
              </span>
            </div>
            <div className="space-y-3">
              {msgs.map((msg, i) => {
                const isMe = msg.sender_id === user?.id
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] ${isMe ? 'message-sent' : 'message-received'} px-4 py-2.5`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-[var(--warm-gray)]'}`}>
                        {format(new Date(msg.created_at), 'h:mm a')}
                        {isMe && (
                          <span className="ml-1">{msg.is_read ? 'Read' : 'Sent'}</span>
                        )}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="glass p-3 flex items-center gap-2 sticky bottom-0">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-xl border-2 border-[var(--warm-peach)] bg-white/80 focus:border-[var(--warm-coral)] focus:outline-none text-sm"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="submit"
          disabled={!newMessage.trim()}
          className="w-12 h-12 rounded-full btn-warm flex items-center justify-center disabled:opacity-50"
        >
          <Send size={18} />
        </motion.button>
      </form>
    </div>
  )
}
