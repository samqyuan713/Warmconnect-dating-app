import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Sparkles } from 'lucide-react'
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
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-[#FF6B6B] rounded-full animate-spin" />
      </div>
    )
  }

  const groupedMessages = groupMessagesByDate(messages)

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] lg:h-[calc(100vh-24px)] bg-white lg:rounded-3xl lg:shadow-card overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => navigate('/matches')} className="p-2 -ml-2 text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={22} />
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100">
          <img 
            src={matchInfo?.user?.avatar_url || `https://ui-avatars.com/api/?name=${matchInfo?.user?.full_name}&background=FF6B6B&color=fff`}
            alt={matchInfo?.user?.full_name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-sm">{matchInfo?.user?.full_name}</h3>
          <div className="flex items-center gap-1 text-xs text-[#FF6B6B]">
            <Sparkles size={10} />
            <span>{matchInfo?.compatibility_score}% match</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 bg-gray-50/50">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="flex items-center justify-center mb-4">
              <span className="text-[11px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">
                {date}
              </span>
            </div>
            <div className="space-y-3">
              {msgs.map((msg) => {
                const isMe = msg.sender_id === user?.id
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] px-4 py-2.5 ${isMe ? 'msg-sent' : 'msg-received'}`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-white/50' : 'text-gray-400'}`}>
                        {format(new Date(msg.created_at), 'h:mm a')}
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
      <form onSubmit={sendMessage} className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-100">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-full bg-gray-100 border-0 text-sm focus:ring-2 focus:ring-[#FF6B6B]/20 placeholder:text-gray-400"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="submit"
          disabled={!newMessage.trim()}
          className="w-11 h-11 rounded-full btn-primary flex items-center justify-center disabled:opacity-40"
        >
          <Send size={16} />
        </motion.button>
      </form>
    </div>
  )
}
