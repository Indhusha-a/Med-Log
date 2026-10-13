import { AnimatePresence, motion } from 'framer-motion'
import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { sendChatMessage } from '@/features/chatbot/api'
import { toApiError } from '@/utils/apiError'
import { cn } from '@/utils/cn'

interface ChatMessage {
  id: number
  from: 'user' | 'assistant'
  text: string
  showBookingCta?: boolean
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, from: 'assistant', text: "Hi! I can help with your appointments, doctors, and scheduling. What do you need?" },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setError(null)
    setMessages((prev) => [...prev, { id: Date.now(), from: 'user', text }])
    setSending(true)
    try {
      const res = await sendChatMessage(text)
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: 'assistant', text: res.reply, showBookingCta: res.show_booking_cta },
      ])
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 z-[140] flex h-14 w-14 items-center justify-center rounded-full bg-navy-dark text-white shadow-lifted hover:bg-navy-secondary"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-24 right-5 z-[140] flex h-[520px] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-white/95 shadow-lifted backdrop-blur-md"
          >
            <div className="flex items-center gap-2 border-b border-border bg-navy-dark px-4 py-3 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Med-Log Assistant</p>
                <p className="flex items-center gap-1 text-[11px] text-white/60">
                  <Sparkles className="h-3 w-3" /> appointments &amp; scheduling only
                </p>
              </div>
            </div>

            <div ref={listRef} className="scroll-thin flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <div key={m.id} className={cn('flex', m.from === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                      m.from === 'user' ? 'bg-navy-dark text-white' : 'bg-app-bg-2 text-text-primary',
                    )}
                  >
                    {m.text}
                    {m.showBookingCta && (
                      <Link
                        to="/patient/book"
                        className="mt-2 block rounded-lg bg-blue-primary px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-blue-primary/90"
                      >
                        Create appointment
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl bg-app-bg-2 px-3.5 py-2.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" />
                  </div>
                </div>
              )}
              {error && <p className="text-xs text-error">{error}</p>}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                void handleSend()
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your appointments..."
                aria-label="Message the assistant"
                disabled={sending}
                className="h-10 flex-1 rounded-lg border border-border bg-white px-3 text-sm focus:border-blue-accent focus:outline-none focus:ring-2 focus:ring-blue-accent/20"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-dark text-white disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
