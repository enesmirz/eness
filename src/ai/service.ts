import type { AIConcept, ScriptLength } from '../types'
import { generateConceptLocal } from './engine'
import type { AIInput } from './engine'

export type AI_SOURCE = 'api' | 'yerel'

export interface GenerateResult {
  concept: AIConcept
  source: AI_SOURCE
  error?: string
}

export interface AIStatus {
  mode: 'api' | 'yerel'
  provider: string
}

export async function fetchAIStatus(): Promise<AIStatus> {
  try {
    const res = await fetch('/api/ai/status', { signal: AbortSignal.timeout(2500) })
    if (res.ok) {
      const data = (await res.json()) as AIStatus
      return data
    }
  } catch {
    /* sunucu kapali olabilir */
  }
  return { mode: 'yerel', provider: 'yerleşik şablon motoru' }
}

export async function generateConcept(input: AIInput): Promise<GenerateResult> {
  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(45000),
    })
    if (res.ok) {
      const data = (await res.json()) as { concept: AIConcept; provider: string }
      if (data?.concept?.headline) {
        return { concept: { ...data.concept, style: input.style }, source: 'api' }
      }
    }
    return {
      concept: generateConceptLocal(input),
      source: 'yerel',
      error: 'AI sunucusuna ulaşılamadı, yerel motor kullanıldı.',
    }
  } catch {
    return {
      concept: generateConceptLocal(input),
      source: 'yerel',
      error: 'AI sunucusuna ulaşılamadı, yerel motor kullanıldı.',
    }
  }
}

export type { ScriptLength }
