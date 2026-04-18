'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types'

const QUICK_QUESTIONS = [
  'Quel entraînement choisir cette semaine ?',
  "C'est quoi la VMA ?",
  'Comment préparer un 10 km ?',
  'Endurance fondamentale vs fractionné ?',
  'Comment choisir mes chaussures de running ?',
  'Comment rejoindre le Club MAJOR ?',
]

const WELCOME: ChatMessage = {
  id:        'welcome',
  role:      'assistant',
  content:   '👋 Bonjour ! Je suis **Coach MAJOR**, votre assistant running personnel.\n\nJe peux vous aider sur les entraînements, la physiologie, les équipements, et tout ce qui concerne la course à pied.\n\nQue puis-je faire pour vous aujourd\'hui ?',
  timestamp: new Date(),
}

function nanoid() {
  return Math.random().toString(36).slice(2)
}

function AssistantAvatar() {
  return (
    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-major-primary/40">
      <Image src="/coach-robot.jpg" alt="Coach MAJOR" width={28} height={28} className="object-cover object-top w-full h-full" />
    </div>
  )
}

interface MessageBubbleProps {
  msg: ChatMessage
}

function MessageBubble({ msg }: MessageBubbleProps) {
  const isUser = msg.role === 'user'
  // Render markdown-like bold **text**
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((part, i) =>
      part.startsWith('**') ? <strong key={i} className="font-semibold text-major-accent">{part.slice(2, -2)}</strong> : part
    )
  }

  return (
    <div className={cn('flex gap-2.5 items-end', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {!isUser && <AssistantAvatar />}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-inter leading-relaxed whitespace-pre-line',
          isUser
            ? 'bg-major-primary text-white rounded-br-sm'
            : 'bg-major-surface border border-major-primary/20 text-gray-200 rounded-bl-sm',
        )}
      >
        {renderContent(msg.content)}
        <p className="text-[10px] mt-1 opacity-40">{msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 items-end">
      <AssistantAvatar />
      <div className="bg-major-surface border border-major-primary/20 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-major-accent animate-typing" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  )
}

export function ChatbotWidget() {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [sessionId]             = useState(() => nanoid())
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    setInput('')

    const userMsg: ChatMessage = { id: nanoid(), role: 'user', content: text.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res  = await fetch('/api/chatbot', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text.trim(), sessionId }),
      })
      const data = await res.json()
      const botMsg: ChatMessage = {
        id:        nanoid(),
        role:      'assistant',
        content:   data.answer ?? "Désolé, je n'ai pas pu traiter votre message. Réessayez.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMsg])
    } catch {
      setMessages(prev => [...prev, {
        id:        nanoid(),
        role:      'assistant',
        content:   "Une erreur de connexion s'est produite. Veuillez réessayer.",
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Ouvrir Coach MAJOR"
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-major-primary/30 transition-all duration-300',
          open ? 'bg-major-dark scale-95' : 'bg-major-primary hover:bg-major-dark animate-pulse-glow',
        )}
      >
        {open ? <ChevronDown size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </button>

      {/* Fenêtre chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[95vw] sm:w-[440px] md:w-[520px] bg-major-black border border-major-primary/30 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col" style={{ height: 620 }}>

          {/* Header */}
          <div className="bg-green-gradient px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/40 flex-shrink-0 shadow-md">
                <Image src="/coach-robot.jpg" alt="Coach MAJOR" width={44} height={44} className="object-cover object-top w-full h-full" />
              </div>
              <div>
                <p className="font-bebas text-white text-base tracking-widest leading-none">COACH MAJOR</p>
                <p className="text-white/70 text-[10px] font-inter flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-major-accent inline-block" /> En ligne
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Questions rapides (affiché si peu de messages) */}
          {messages.length <= 2 && !loading && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] font-inter text-major-cyan bg-major-cyan/10 border border-major-cyan/20 rounded-full px-2.5 py-1 hover:bg-major-cyan/20 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-major-primary/15 flex-shrink-0 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
              placeholder="Posez votre question…"
              className="flex-1 bg-major-surface border border-major-primary/20 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-major-primary font-inter"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-major-primary hover:bg-major-dark disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0"
            >
              {loading ? <Loader2 size={15} className="text-white animate-spin" /> : <Send size={15} className="text-white" />}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
