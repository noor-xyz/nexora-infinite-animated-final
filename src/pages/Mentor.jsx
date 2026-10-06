import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { askMentor } from '../services/api'

const quickPrompts = [
  { label: '💡 Give me a hint', mode: 'hint', prompt: 'I am stuck. Can you give me a small hint without giving away the full answer?' },
  { label: '🐛 Help debug this', mode: 'debug', prompt: 'Help me debug this. Ask what you need to know and guide me through finding the issue.' },
  { label: '📚 Explain the concept', mode: 'explain', prompt: 'Explain this concept clearly, with a small example and a question to check my understanding.' },
  { label: '🎯 Give me a similar challenge', mode: 'challenge', prompt: 'Give me a short practice challenge on this topic, but do not reveal its solution yet.' },
]

function friendlyError(error) {
  if (error.message?.includes('not configured')) return 'The AI Mentor is not configured on the NEXORA server yet. Please try again later.'
  if (error.message?.includes('AI Mentor is temporarily unavailable')) return error.message
  if (error.message?.includes('AI Mentor returned') || error.message?.includes('AI Mentor could not')) return error.message
  return 'I could not reach the NEXORA AI Mentor. Check your connection and try again.'
}

export default function Mentor() {
  const [searchParams] = useSearchParams()
  const world = searchParams.get('world') || ''
  const topic = searchParams.get('topic') || ''
  const contextLabel = [world, topic].filter(Boolean).join(' · ') || 'Your learning journey'
  const [messages, setMessages] = useState([{
    id: 'welcome',
    role: 'assistant',
    text: 'Hi! I’m your NEXORA AI Mentor. Bring me a coding question, a tricky concept, or a bug. I’ll help you reason through it one step at a time.',
  }])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('hint')
  const [waiting, setWaiting] = useState(false)
  const [error, setError] = useState('')
  const [failedRequest, setFailedRequest] = useState(null)

  const send = async (text, retry = null) => {
    const message = text.trim()
    if (!message || waiting) return

    const messageId = retry?.messageId || `message-${Date.now()}`
    const payload = retry?.payload || {
      message,
      world: world || undefined,
      topic: topic || undefined,
      mode,
      history: messages.filter(item => item.id !== 'welcome' && !item.failed).slice(-8).map(item => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: item.text,
      })),
    }

    if (!retry) {
      setMessages(current => [...current, { id: messageId, role: 'user', text: message }])
      setInput('')
    }
    setError('')
    setFailedRequest(null)
    setWaiting(true)

    try {
      const result = await askMentor(payload)
      if (typeof result.reply !== 'string' || !result.reply.trim()) {
        throw new Error('AI Mentor could not create a response. Please try again.')
      }
      setMessages(current => [
        ...current.map(item => item.id === messageId ? { ...item, failed: false } : item),
        { id: `reply-${messageId}`, role: 'assistant', text: result.reply },
      ])
      setMode('hint')
    } catch (requestError) {
      setError(friendlyError(requestError))
      setFailedRequest({ payload, messageId })
      setMessages(current => current.map(item => item.id === messageId ? { ...item, failed: true } : item))
    } finally {
      setWaiting(false)
    }
  }

  const submit = event => {
    event.preventDefault()
    send(input)
  }

  const handleKeyDown = event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit(event)
    }
  }

  return <AppShell>
    <header className="page-header">
      <div>
        <span className="eyebrow">NEXORA AI MENTOR</span>
        <h1>Your personal coding coach.</h1>
        <p>Ask questions, untangle bugs, and build understanding with guided help—not answer dumping.</p>
      </div>
    </header>
    <div className="mentor-page">
      <section className="chat-card mentor-chat" aria-label="Chat with the NEXORA AI Mentor">
        <div className="chat-top mentor-chat-top">
          <div className="mentor-identity">
            <div className="ai-orb tiny"><span>AI</span></div>
            <div><strong>NEXORA AI MENTOR</strong><small>Your learning companion · {contextLabel}</small></div>
          </div>
          <span className="mentor-ready"><span /> READY TO HELP</span>
        </div>
        <div className="messages mentor-messages" aria-live="polite" aria-relevant="additions text">
          {messages.map(message => <article key={message.id} className={`message ${message.role === 'assistant' ? 'ai' : 'user'}`}>
            <span>{message.role === 'assistant' ? 'MENTOR' : 'YOU'}</span>
            <p>{message.text}</p>
          </article>)}
          {waiting && <article className="message ai mentor-thinking" role="status">
            <span>MENTOR</span>
            <p><i /><i /><i /> Thinking through your question…</p>
          </article>}
        </div>
        {error && <div className="mentor-error" role="alert">
          <p>{error}</p>
          {failedRequest && <button className="secondary-btn" disabled={waiting} onClick={() => send(failedRequest.payload.message, failedRequest)}>Retry</button>}
        </div>}
        <form onSubmit={submit} className="chat-input mentor-composer">
          <label className="sr-only" htmlFor="mentor-question">Ask the AI Mentor</label>
          <textarea
            id="mentor-question"
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about a concept, bug, or challenge…"
            rows={2}
            maxLength={4000}
            disabled={waiting}
          />
          <button type="submit" disabled={waiting || !input.trim()}>{waiting ? 'Thinking…' : 'Send ↑'}</button>
          <small>Enter to send · Shift+Enter for a new line</small>
        </form>
      </section>
      <aside className="mentor-tools mentor-guidance">
        <span className="eyebrow">LEARN WITH GUIDANCE</span>
        <h2>Where should we start?</h2>
        <p>Your mentor can nudge you toward the answer, explain the idea, or help you inspect a bug.</p>
        <div className="mentor-quick-prompts">{quickPrompts.map(item => <button
          key={item.mode}
          type="button"
          disabled={waiting}
          onClick={() => { setInput(item.prompt); setMode(item.mode) }}
        >{item.label}<span>→</span></button>)}</div>
        <div className="mentor-context"><span aria-hidden="true">✦</span><p><strong>Connected to your learning journey</strong><br />{world || topic ? `Questions are scoped to ${contextLabel}.` : 'Ask about any world, level, or topic you are exploring.'}</p></div>
      </aside>
    </div>
  </AppShell>
}
