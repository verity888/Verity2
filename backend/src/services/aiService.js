require('dotenv').config()
const { GoogleGenAI } = require('@google/genai')
const OpenAI = require('openai')
const db = require('../db/database')
const { decrypt } = require('./encryptionService')

// ── In-memory cache of validated clients per user ────────────────────────────
// userId (string) → { provider, client, model }
const userAIClients = new Map()

const THERAPY_SYSTEM_PROMPT = `You are Verity, a knowledgeable and empathetic mental health support companion.

Principles:
- Respond specifically to what the person actually said — never give a generic template response
- Offer concrete, evidence-based advice (correct technique names, mechanisms, citations where relevant)
- Validate emotions, then help the person understand and act on what they're feeling
- If someone sends nonsense or tests the system, gently ask them what's on their mind
- Never diagnose; always recommend professional help for serious concerns
- For any expression of self-harm or crisis: immediately provide crisis line — call or text 988 (US/Canada), or nearest emergency department
- Keep responses to 2–4 sentences. Be direct and warm, never flowery or over-effusive
- Do not start your response with "I" as the first word
- Do not repeat advice already given earlier in this conversation — vary your approach`

// ── Fallback model chains ─────────────────────────────────────────────────────
// Listed in preference order. If the configured model fails (invalid / removed),
// the service tries each fallback in sequence before giving up.
const MODEL_FALLBACKS = {
  gemini:     ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.0-pro'],
  openai:     ['gpt-4o-mini', 'gpt-3.5-turbo'],
  anthropic:  ['claude-3-5-haiku-20241022', 'claude-3-haiku-20240307'],
  openrouter: ['openai/gpt-4o-mini', 'google/gemini-flash-1.5', 'mistralai/mistral-7b-instruct:free'],
}

function getFallbackChain(provider, preferredModel) {
  const defaults = MODEL_FALLBACKS[provider] || []
  if (preferredModel && !defaults.includes(preferredModel)) {
    return [preferredModel, ...defaults]
  }
  if (preferredModel && defaults[0] !== preferredModel) {
    return [preferredModel, ...defaults.filter((m) => m !== preferredModel)]
  }
  return defaults
}

// ── DB helpers ────────────────────────────────────────────────────────────────
function getUserSettings(userId) {
  return db.get('SELECT * FROM user_settings WHERE user_id = ?', [userId])
}

function invalidateUserClient(userId) {
  userAIClients.delete(String(userId))
}

// ── Error classification ──────────────────────────────────────────────────────
function classifyError(err) {
  const status = err.status || err.response?.status || err.statusCode
  const msg = (err.message || err.toString()).toLowerCase()

  // ── HTTP status codes (OpenAI / Anthropic / OpenRouter use standard codes) ──
  if (status === 401 || status === 403) return 'invalid_key'
  if (status === 429) return 'quota_exceeded'
  if (status === 404) return 'model_not_found'

  // ── Model-not-found patterns (must come before key check to avoid false positives) ──
  if (
    msg.includes('model_not_found') ||
    msg.includes('does not exist') ||
    msg.includes('no such model') ||
    msg.includes('model not found') ||
    msg.includes('is not found')
  ) return 'model_not_found'

  // ── Specific API-key invalidity patterns ──────────────────────────────────
  // IMPORTANT: do NOT use the broad substring 'invalid' here — Google returns
  // HTTP 400 INVALID_ARGUMENT for many non-auth errors (wrong model name, bad
  // request format, etc.) and matching 'invalid' would misclassify them all as
  // invalid_key, stopping the fallback chain on a perfectly good key.
  if (
    msg.includes('api_key_invalid') ||       // Google reason: API_KEY_INVALID
    msg.includes('api key not valid') ||      // Google message text
    msg.includes('invalid api key') ||        // generic
    msg.includes('invalid_api_key') ||        // OpenAI error code
    msg.includes('incorrect api key') ||      // OpenAI message text
    msg.includes('permission_denied') ||      // Google permission error
    msg.includes('unauthorized') ||           // generic HTTP 401 text
    msg.includes('authentication')            // generic auth failure
  ) return 'invalid_key'

  // ── Quota / rate-limit patterns ───────────────────────────────────────────
  if (
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('insufficient_quota') ||
    msg.includes('rate_limit') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests')
  ) return 'quota_exceeded'

  return 'unknown'
}

// ── Gemini ────────────────────────────────────────────────────────────────────
async function validateAndCacheGemini(userId, apiKey, preferredModel) {
  const chain = getFallbackChain('gemini', preferredModel)
  let client

  for (const mdl of chain) {
    try {
      if (!client) client = new GoogleGenAI({ apiKey })
      await client.models.generateContent({ model: mdl, contents: 'Hello' })
      userAIClients.set(String(userId), { provider: 'gemini', client, model: mdl })
      console.log(`✅ Gemini validated for user ${userId}: ${apiKey.slice(0, 8)}… model=${mdl}`)
      return { valid: true, model: mdl }
    } catch (err) {
      const kind = classifyError(err)
      if (kind === 'invalid_key') return { valid: false, error: 'invalid_key' }
      if (kind === 'quota_exceeded') return { valid: false, error: 'quota_exceeded' }
      // model_not_found or unknown → try next fallback
      console.warn(`Gemini model ${mdl} unavailable, trying next fallback…`)
    }
  }
  return { valid: false, error: 'no_available_model' }
}

async function runGemini(client, model, history, userMessage) {
  const contents = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  contents.push({ role: 'user', parts: [{ text: userMessage }] })
  const response = await client.models.generateContent({
    model,
    config: { systemInstruction: THERAPY_SYSTEM_PROMPT },
    contents,
  })
  return response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// ── OpenAI (and OpenRouter) ───────────────────────────────────────────────────
async function validateAndCacheOpenAICompat(provider, userId, apiKey, preferredModel, baseURL) {
  const chain = getFallbackChain(provider, preferredModel)
  const clientOpts = { apiKey }
  if (baseURL) clientOpts.baseURL = baseURL
  // OpenRouter requires these headers to identify the calling app
  if (provider === 'openrouter') {
    clientOpts.defaultHeaders = {
      'HTTP-Referer': 'https://verity.app',
      'X-Title': 'Verity',
    }
  }

  let client

  for (const mdl of chain) {
    try {
      if (!client) client = new OpenAI(clientOpts)
      await client.chat.completions.create({
        model: mdl,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      })
      userAIClients.set(String(userId), { provider, client, model: mdl, baseURL })
      console.log(`✅ ${provider} validated for user ${userId}: ${apiKey.slice(0, 7)}… model=${mdl}`)
      return { valid: true, model: mdl }
    } catch (err) {
      const kind = classifyError(err)
      if (kind === 'invalid_key') return { valid: false, error: 'invalid_key' }
      if (kind === 'quota_exceeded') return { valid: false, error: 'quota_exceeded' }
      console.warn(`${provider} model ${mdl} unavailable, trying next fallback…`)
    }
  }
  return { valid: false, error: 'no_available_model' }
}

async function runOpenAICompat(client, model, history, userMessage) {
  const messages = [
    { role: 'system', content: THERAPY_SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
    { role: 'user', content: userMessage },
  ]
  const res = await client.chat.completions.create({ model, messages })
  return res.choices[0]?.message?.content || ''
}

// ── Anthropic ─────────────────────────────────────────────────────────────────
async function validateAndCacheAnthropic(userId, apiKey, preferredModel) {
  let AnthropicClass
  try {
    const mod = require('@anthropic-ai/sdk')
    AnthropicClass = mod.default || mod
  } catch {
    return { valid: false, error: 'sdk_not_installed' }
  }

  const chain = getFallbackChain('anthropic', preferredModel)
  let client

  for (const mdl of chain) {
    try {
      if (!client) client = new AnthropicClass({ apiKey })
      await client.messages.create({
        model: mdl,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'Hello' }],
      })
      userAIClients.set(String(userId), { provider: 'anthropic', client, model: mdl })
      console.log(`✅ Anthropic validated for user ${userId}: ${apiKey.slice(0, 7)}… model=${mdl}`)
      return { valid: true, model: mdl }
    } catch (err) {
      const kind = classifyError(err)
      if (kind === 'invalid_key') return { valid: false, error: 'invalid_key' }
      if (kind === 'quota_exceeded') return { valid: false, error: 'quota_exceeded' }
      console.warn(`Anthropic model ${mdl} unavailable, trying next fallback…`)
    }
  }
  return { valid: false, error: 'no_available_model' }
}

async function runAnthropic(client, model, history, userMessage) {
  const messages = [
    ...history.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
    { role: 'user', content: userMessage },
  ]
  const res = await client.messages.create({
    model,
    max_tokens: 1024,
    system: THERAPY_SYSTEM_PROMPT,
    messages,
  })
  return res.content[0]?.text || ''
}

// ── Error messages shown to the user ─────────────────────────────────────────
const KEY_ERRORS = {
  invalid_key:        "Your API key is not valid. Please update it in Settings → AI Provider.",
  quota_exceeded:     "Your API key's quota or token limit has been reached. Please wait, add credits, or update your key in Settings.",
  sdk_not_installed:  "The Anthropic SDK is not installed on this server. Run `npm i @anthropic-ai/sdk` in /backend.",
  no_available_model: "None of the available model fallbacks worked for your provider. Please check the model name in Settings.",
  network_error:      "Couldn't reach the AI provider due to a network issue. Please try again.",
  unknown_provider:   "Unknown AI provider configured. Please update your settings.",
}

// ── Active-session fallback handler ──────────────────────────────────────────
// If a model disappears mid-session (e.g., deprecated), try the next fallback
// from the chain and update the cached entry.
async function tryWithFallback(userId, entry, conversationHistory, userMessage) {
  const { provider, client, model } = entry
  const chain = getFallbackChain(provider, model).filter((m) => m !== model)

  for (const fallbackModel of chain) {
    try {
      console.warn(`Active session fallback: ${provider} model ${model} → ${fallbackModel} for user ${userId}`)
      let result
      if (provider === 'gemini')     result = await runGemini(client, fallbackModel, conversationHistory, userMessage)
      else if (provider === 'anthropic') result = await runAnthropic(client, fallbackModel, conversationHistory, userMessage)
      else result = await runOpenAICompat(client, fallbackModel, conversationHistory, userMessage)

      // Update cached model
      userAIClients.set(String(userId), { ...entry, model: fallbackModel })
      return result
    } catch {
      // continue to next fallback
    }
  }
  return null
}

// ── Main dispatcher ───────────────────────────────────────────────────────────
async function getAIResponse(conversationHistory, userMessage, userId) {
  const userIdKey = String(userId)

  // PATH A: Cached validated client
  if (userAIClients.has(userIdKey)) {
    const entry = userAIClients.get(userIdKey)
    const { provider, client, model } = entry

    try {
      if (provider === 'gemini')     return await runGemini(client, model, conversationHistory, userMessage)
      if (provider === 'openai' || provider === 'openrouter') return await runOpenAICompat(client, model, conversationHistory, userMessage)
      if (provider === 'anthropic') return await runAnthropic(client, model, conversationHistory, userMessage)
    } catch (err) {
      const kind = classifyError(err)

      if (kind === 'invalid_key') {
        userAIClients.delete(userIdKey)
        return "Your API key appears to have been revoked or expired. Please update it in Settings."
      }

      if (kind === 'quota_exceeded') {
        return "The API quota or token limit for your key has been reached. Please wait, add credits, or update your key in Settings."
      }

      if (kind === 'model_not_found') {
        // Try fallback models while keeping the validated client
        const fallbackResult = await tryWithFallback(userId, entry, conversationHistory, userMessage)
        if (fallbackResult) return fallbackResult
        userAIClients.delete(userIdKey)
        return "The configured model is no longer available and no fallback worked. Please update the model in Settings."
      }

      console.warn(`AI provider error (${provider}):`, err.message)
      return "I encountered an issue reaching the AI. Please try again in a moment."
    }
  }

  // PATH B: No cached client — load from DB
  const settings = getUserSettings(userId)

  if (settings && settings.ai_api_key) {
    const { ai_provider, ai_model } = settings
    const ai_api_key = decrypt(settings.ai_api_key)
    let result

    if (ai_provider === 'gemini') {
      result = await validateAndCacheGemini(userId, ai_api_key, ai_model)
    } else if (ai_provider === 'openai') {
      result = await validateAndCacheOpenAICompat('openai', userId, ai_api_key, ai_model, null)
    } else if (ai_provider === 'openrouter') {
      result = await validateAndCacheOpenAICompat('openrouter', userId, ai_api_key, ai_model, 'https://openrouter.ai/api/v1')
    } else if (ai_provider === 'anthropic') {
      result = await validateAndCacheAnthropic(userId, ai_api_key, ai_model)
    } else {
      result = { valid: false, error: 'unknown_provider' }
    }

    if (result.valid) {
      const entry = userAIClients.get(userIdKey)
      const { provider, client, model } = entry
      if (provider === 'gemini')     return await runGemini(client, model, conversationHistory, userMessage)
      if (provider === 'openai' || provider === 'openrouter') return await runOpenAICompat(client, model, conversationHistory, userMessage)
      if (provider === 'anthropic') return await runAnthropic(client, model, conversationHistory, userMessage)
    }

    return KEY_ERRORS[result.error] || "Couldn't connect. Please check your API key in Settings."
  }

  // PATH C: No key configured
  const hasGreeted = conversationHistory.some((m) => m.role === 'assistant')
  if (!hasGreeted) {
    return (
      "Hi — I'm Verity, your mental health support companion.\n\n" +
      "Before we can start talking, you'll need to connect an AI provider:\n\n" +
      "1. Click the ⚙️ **Settings** icon at the bottom of the sidebar.\n" +
      "2. Choose a provider — Google Gemini, OpenAI, Anthropic, or OpenRouter.\n" +
      "3. Paste your API key and click **Save settings**.\n\n" +
      "Once that's done, come back here and I'm ready to listen — any time, no judgment."
    )
  }
  return (
    "It looks like no AI provider key is set up yet. Head to ⚙️ **Settings** (gear icon in the sidebar) " +
    "to add your key — Gemini, OpenAI, Anthropic, and OpenRouter are all supported."
  )
}

// ── Status helpers ────────────────────────────────────────────────────────────
function getUserAIStatus(userId) {
  if (userAIClients.has(String(userId))) {
    const { provider, model } = userAIClients.get(String(userId))
    return { status: 'connected', provider, model }
  }
  const settings = getUserSettings(userId)
  if (settings && settings.ai_api_key) {
    return { status: 'configured', provider: settings.ai_provider, model: settings.ai_model }
  }
  return { status: 'pending_key', provider: null, model: null }
}

// Backwards-compat shim
function getUserGeminiStatus(userId) {
  return getUserAIStatus(userId).status
}

module.exports = { getAIResponse, getUserGeminiStatus, getUserAIStatus, invalidateUserClient }
