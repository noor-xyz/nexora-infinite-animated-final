import { z } from 'zod'

export const profileSchema = z.object({
  username: z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
  avatar_url: z.string().url().optional().or(z.literal('')),
})

export const masterySchema = z.object({
  world_id: z.string().min(1).max(50),
  topic: z.string().min(1).max(100),
  correct: z.boolean(),
  time_ms: z.number().int().min(0).max(3600000).optional(),
})

export const challengeAnswerSchema = z.object({
  challenge_id: z.string().uuid(),
  answer: z.number().int().min(0).max(1000),
})

export const mentorSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  world: z.string().max(50).optional(),
  topic: z.string().max(100).optional(),
  mode: z.enum(['hint', 'explain', 'debug', 'challenge']).default('hint'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(2000),
  })).max(8).default([]),
})
