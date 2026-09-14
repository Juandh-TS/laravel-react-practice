import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { chatbotApi } from '../api/chatbotApi'
import type { ChatMessage } from '../types'
import './ChatWidget.css'

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    const history = messages
    setMessages([...history, { role: 'user', content: text }])
    setInput('')
    setError(null)
    setSending(true)

    try {
      const response = await chatbotApi.ask(text, history)
      setMessages((current) => [...current, { role: 'assistant', content: response.message }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="chat-fab-wrap">
        <span className="chat-fab-ring" aria-hidden="true" />
        <button
          type="button"
          className={`chat-fab${open ? ' chat-fab-open' : ''}`}
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? 'Cerrar chat' : 'Abrir chat de ayuda'}
          aria-expanded={open}
        >
          {open ? '✕' : '💬'}
        </button>
      </div>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Asistente virtual">
          <div className="chat-panel-header">
            <strong>Asistente virtual</strong>
            <span className="chat-panel-subtitle">Pregunta sobre tus tareas, usuarios y empresas</span>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <p className="state-message chat-empty">
                Hola 👋 puedo responder preguntas sobre los datos que ves en la app.
              </p>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`chat-bubble chat-bubble-${message.role}`}>
                {message.content}
              </div>
            ))}
            {sending && (
              <div className="chat-bubble chat-bubble-assistant chat-bubble-typing">
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <ErrorAlert message={error} className="chat-error" />

          <form className="chat-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={sending}
              autoFocus
            />
            <button type="submit" className="btn" disabled={sending || !input.trim()}>
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  )
}
