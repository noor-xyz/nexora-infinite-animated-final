const SYSTEM_PROMPT = `You are NEXORA AI Mentor, a technical-learning coach. Guide the learner instead of dumping final answers. Prefer short hints, questions, debugging guidance, and one small next step. If the learner asks for a solution, explain the reasoning and let them attempt it. Never claim to execute code you did not execute. Keep responses safe and educational.`

function publicMentorError(message, statusCode) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.expose = true
  return error
}

export async function generateMentorReply({ message, world, topic, mode, history }) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || /YOUR_|PLACEHOLDER/i.test(apiKey)) {
    throw publicMentorError('AI Mentor is not configured on the server yet.', 503)
  }

  const input = [
    `World: ${world || 'general'}`,
    `Topic: ${topic || 'general'}`,
    `Mode: ${mode}`,
    history.length
      ? `Conversation so far:\n${history.map(turn => `${turn.role === 'assistant' ? 'Mentor' : 'Learner'}: ${turn.content}`).join('\n')}`
      : '',
    `Learner: ${message}`,
  ].filter(Boolean).join('\n')

  let response
  try {
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5-mini',
        instructions: SYSTEM_PROMPT,
        input,
        max_output_tokens: 500,
      }),
    })
  } catch {
    throw publicMentorError('AI Mentor is temporarily unavailable. Check your connection and try again.', 502)
  }

  if (!response.ok) {
    console.error(`AI Mentor provider request failed with status ${response.status}.`)
    throw publicMentorError('AI Mentor is temporarily unavailable. Please try again.', 502)
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw publicMentorError('AI Mentor returned an unreadable response. Please try again.', 502)
  }
  const reply = typeof data.output_text === 'string' ? data.output_text.trim() : ''
  if (!reply) {
    throw publicMentorError('AI Mentor could not create a response. Please try again.', 502)
  }
  return { reply }
}
