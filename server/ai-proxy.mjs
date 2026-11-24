/**
 * CREATIVE STUDIO — AI proxy sunucusu
 *
 * API anahtarları bu sunucuda .env dosyasından okunur; tarayıcıya ASLA gönderilmez.
 * Desteklenen sağlayıcılar: Anthropic (Claude) ve OpenAI.
 *
 * Başlatmak için:
 *   cp .env.example .env   →  anahtarınızı girin
 *   npm run server         →  http://localhost:8787
 *
 * Vite geliştirme sunucusu /api/ai/* isteklerini bu sunucuya yönlendirir (vite.config.ts).
 */
import http from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env')

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const PORT = Number(process.env.AI_PROXY_PORT ?? 8787)
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const OPENAI_KEY = process.env.OPENAI_API_KEY
const MODEL = process.env.AI_MODEL ?? (ANTHROPIC_KEY ? 'claude-sonnet-4-20250514' : 'gpt-4o-mini')

const provider = ANTHROPIC_KEY ? 'anthropic' : OPENAI_KEY ? 'openai' : null

const SYSTEM_PROMPT = `Sen deneyimli bir reklam ajansı yaratıcı yönetmenisin. Kullanıcı marka, ürün, hedef kitle, reklam hedefi, stil ve senaryo süresi verir. SADECE şu JSON şemasıyla yanıt ver, başka hiçbir metin ekleme:
{"headline":"...","concept":"...","strategy":"...","slogans":["...","..."],"script":{"length":30,"style":"...","shots":[{"from":0,"to":3,"visual":"...","audio":"..."}],"ctaText":"..."}}
Türkçe yaz, sektör bilgisiyle uyumlu, profesyonel ve özgün ol. Shot sayısı: 10 sn için 3, 15 sn için 4, 30 sn için 5 olsun.`

function json(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

async function callAnthropic(input) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: JSON.stringify(input) }],
      system: SYSTEM_PROMPT,
    }),
  })
  if (!res.ok) throw new Error(`Anthropic API hatası: ${res.status}`)
  const data = await res.json()
  const text = data.content?.[0]?.text ?? ''
  return JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1))
}

async function callOpenAI(input) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(input) },
      ],
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) throw new Error(`OpenAI API hatası: ${res.status}`)
  const data = await res.json()
  return JSON.parse(data.choices[0].message.content)
}

const server = http.createServer((req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors)
    res.end()
    return
  }

  if (req.url === '/api/ai/status') {
    json(res, 200, {
      mode: provider ? 'api' : 'yerel',
      provider: provider ? `${provider} (${MODEL})` : 'anahtar tanımlı değil',
    })
    return
  }

  if (req.url === '/api/ai/generate' && req.method === 'POST') {
    if (!provider) {
      json(res, 503, {
        error: 'AI anahtarı tanımlı değil. .env dosyasına ANTHROPIC_API_KEY veya OPENAI_API_KEY girip sunucuyu yeniden başlatın.',
      })
      return
    }
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', async () => {
      try {
        const input = JSON.parse(body)
        const concept = provider === 'anthropic' ? await callAnthropic(input) : await callOpenAI(input)
        if (!concept?.headline || !Array.isArray(concept?.script?.shots)) {
          throw new Error('Model yanıtı beklenen şemada değil')
        }
        json(res, 200, { concept, provider })
      } catch (err) {
        json(res, 502, { error: `AI üretimi başarısız: ${err.message}` })
      }
    })
    return
  }

  json(res, 404, { error: 'Bilinmeyen yolu: ' + req.url })
})

server.listen(PORT, () => {
  console.log(`[ai-proxy] http://localhost:${PORT} — mod: ${provider ?? 'yerel (anahtar yok)'}, model: ${provider ? MODEL : '-'}`)
})
