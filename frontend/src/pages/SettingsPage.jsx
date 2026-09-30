import React, { useState, useEffect } from 'react'
import { settingsService } from '../services/settingsService'

const PROVIDERS = [
  {
    id: 'gemini',
    label: 'Google Gemini',
    placeholder: 'AIzaSy…',
    hint: 'Get a free key at https://ai.google.dev',
    defaultModel: 'gemini-2.5-flash',
    models: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'],
    fallbackNote: 'Falls back to gemini-2.0-flash → gemini-1.5-flash if the selected model is unavailable.',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    placeholder: 'sk-…',
    hint: 'Get a key at https://platform.openai.com/api-keys',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    fallbackNote: 'Falls back to gpt-4o-mini → gpt-3.5-turbo if the selected model is unavailable or quota is exhausted.',
  },
  {
    id: 'anthropic',
    label: 'Anthropic (Claude)',
    placeholder: 'sk-ant-…',
    hint: 'Get a key at https://console.anthropic.com',
    defaultModel: 'claude-3-5-haiku-20241022',
    models: ['claude-3-5-haiku-20241022', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
    fallbackNote: 'Falls back to claude-3-haiku if the selected model is unavailable. Requires @anthropic-ai/sdk on the backend.',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    placeholder: 'sk-or-v1-…',
    hint: 'Get a free key at https://openrouter.ai — access 200+ models with one key.',
    defaultModel: 'openai/gpt-4o-mini',
    models: [
      'openai/gpt-4o-mini',
      'openai/gpt-4o',
      'google/gemini-flash-1.5',
      'google/gemini-2.0-flash-exp:free',
      'anthropic/claude-3.5-haiku',
      'anthropic/claude-3.5-sonnet',
      'meta-llama/llama-3.1-8b-instruct:free',
      'mistralai/mistral-7b-instruct:free',
      'nousresearch/hermes-3-llama-3.1-405b',
    ],
    fallbackNote: 'Falls back to google/gemini-flash-1.5 → mistralai/mistral-7b-instruct:free. OpenRouter routes through the OpenAI-compatible API.',
  },
]

const STATUS_BADGE = {
  connected:  { label: 'Connected',   cls: 'bg-emerald-100 text-emerald-700' },
  configured: { label: 'Key saved — not yet verified', cls: 'bg-yellow-100 text-yellow-700' },
  pending_key:{ label: 'No key configured', cls: 'bg-neutral-100 text-neutral-500' },
}

export default function SettingsPage() {
  const [settings, setSettings]   = useState(null)
  const [provider, setProvider]   = useState('gemini')
  const [apiKey, setApiKey]       = useState('')
  const [model, setModel]         = useState('')
  const [showKey, setShowKey]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [clearing, setClearing]   = useState(false)
  const [success, setSuccess]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    settingsService.getSettings()
      .then((data) => {
        setSettings(data)
        setProvider(data.ai_provider || 'gemini')
        setModel(data.ai_model || '')
        setError('')
      })
      .catch(() => setError('Could not load settings.'))
      .finally(() => setLoading(false))
  }, [])

  const currentProviderMeta = PROVIDERS.find((p) => p.id === provider)

  const handleProviderChange = (p) => {
    setProvider(p)
    setModel('')
    setApiKey('')
    setSuccess('')
    setError('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!apiKey && !settings?.has_key) {
      setError('Please enter your API key.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await settingsService.updateSettings({
        ai_provider: provider,
        ai_api_key: apiKey || undefined,
        ai_model: model || currentProviderMeta?.defaultModel || '',
      })
      setSuccess('Settings saved. Your key will be verified on the next message.')
      setApiKey('')
      const fresh = await settingsService.getSettings()
      setSettings(fresh)
    } catch {
      setError('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleClearKey = async () => {
    if (!window.confirm('Remove the stored API key?')) return
    setClearing(true)
    setError('')
    setSuccess('')
    try {
      await settingsService.clearKey()
      setSuccess('API key removed.')
      const fresh = await settingsService.getSettings()
      setSettings(fresh)
    } catch {
      setError('Failed to remove the key.')
    } finally {
      setClearing(false)
    }
  }

  const statusInfo = settings ? (STATUS_BADGE[settings.status?.status] || STATUS_BADGE.pending_key) : null

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-[#ABABAB]">
        Loading settings…
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-10 max-w-2xl mx-auto w-full">
      <h1 className="text-xl font-bold text-[#0F0F0F] mb-1">Settings</h1>
      <p className="text-sm text-[#6B6B6B] mb-8">Configure the AI provider Verity uses to respond to you.</p>

      {/* Status chip */}
      {statusInfo && (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold mb-8 ${statusInfo.cls}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          {statusInfo.label}
          {settings?.status?.provider && (
            <span className="opacity-60 font-normal">
              · {PROVIDERS.find(p => p.id === settings.status.provider)?.label || settings.status.provider}
              {settings.status.model ? ` (${settings.status.model})` : ''}
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* Provider selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] mb-3">
            AI Provider
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleProviderChange(p.id)}
                className={`
                  px-3 py-3 rounded border text-sm font-medium text-left transition-colors
                  ${provider === p.id
                    ? 'border-[#0F0F0F] bg-[#0F0F0F] text-white'
                    : 'border-[#E2E1DC] bg-white text-[#0F0F0F] hover:border-[#ABABAB]'}
                `}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Model selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] mb-2">
            Model
          </label>
          <select
            value={model || currentProviderMeta?.defaultModel || ''}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-[#E2E1DC] rounded bg-white text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F] transition-colors"
          >
            {currentProviderMeta?.models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
            <option value="__custom__">Custom model ID…</option>
          </select>

          {/* Custom model free-text entry */}
          {(model === '__custom__' || (model && !currentProviderMeta?.models.includes(model) && model !== currentProviderMeta?.defaultModel)) && (
            <input
              type="text"
              placeholder={provider === 'openrouter' ? 'e.g. openai/gpt-4o or mistralai/mixtral-8x7b-instruct' : 'Enter exact model ID'}
              defaultValue={model === '__custom__' ? '' : model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-2 w-full px-3 py-2.5 text-sm border border-[#E2E1DC] rounded bg-white text-[#0F0F0F] placeholder-[#C4C3BC] focus:outline-none focus:border-[#0F0F0F] transition-colors font-mono"
              autoFocus
            />
          )}

          {/* Fallback chain note */}
          {currentProviderMeta?.fallbackNote && (
            <p className="text-xs text-[#ABABAB] mt-1.5">⟳ {currentProviderMeta.fallbackNote}</p>
          )}
        </div>

        {/* API key input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] mb-2">
            API Key
          </label>
          {settings?.has_key && (
            <p className="text-xs text-[#ABABAB] mb-2">
              A key is stored ({settings.key_preview}). Enter a new one below to replace it, or leave blank to keep the current key.
            </p>
          )}
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={settings?.has_key ? '(leave blank to keep current key)' : currentProviderMeta?.placeholder}
              autoComplete="off"
              className="w-full px-3 py-2.5 pr-12 text-sm border border-[#E2E1DC] rounded bg-white text-[#0F0F0F] placeholder-[#C4C3BC] focus:outline-none focus:border-[#0F0F0F] transition-colors font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ABABAB] hover:text-[#6B6B6B] text-xs transition-colors"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          {currentProviderMeta?.hint && (
            <p className="text-xs text-[#ABABAB] mt-1.5">{currentProviderMeta.hint}</p>
          )}
        </div>

        {/* Feedback */}
        {error   && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
        {success && <p className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded">{success}</p>}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-[#0F0F0F] hover:bg-[#2A2A2A] text-white text-sm font-semibold rounded transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>

          {settings?.has_key && (
            <button
              type="button"
              onClick={handleClearKey}
              disabled={clearing}
              className="px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors disabled:opacity-50"
            >
              {clearing ? 'Removing…' : 'Remove key'}
            </button>
          )}
        </div>
      </form>

      {/* Provider notes */}
      <div className="mt-12 border-t border-[#E2E1DC] pt-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#ABABAB] mb-4">Notes</p>
        <ul className="space-y-2 text-xs text-[#6B6B6B]">
          <li><span className="font-semibold text-[#0F0F0F]">Keys are stored server-side</span> and never exposed to other users or third parties.</li>
          <li><span className="font-semibold text-[#0F0F0F]">Model fallbacks</span> — if the selected model is unavailable or deprecated, Verity automatically tries the next model in the fallback chain so your conversation continues uninterrupted.</li>
          <li><span className="font-semibold text-[#0F0F0F]">Quota / token exhaustion</span> — when your key runs out of credits, you'll receive a clear message in chat. Update or replace your key in Settings.</li>
          <li><span className="font-semibold text-[#0F0F0F]">OpenRouter</span> gives you access to 200+ models (including free-tier ones) with a single key — ideal for trying different models without managing multiple accounts.</li>
          <li><span className="font-semibold text-[#0F0F0F]">Anthropic support</span> requires the <code className="bg-neutral-100 px-1 rounded">@anthropic-ai/sdk</code> package installed on the backend (<code className="bg-neutral-100 px-1 rounded">npm i @anthropic-ai/sdk</code> in /backend).</li>
          <li>Your key is validated on the <span className="font-semibold text-[#0F0F0F]">first message</span> after saving — you'll see an error in chat if it's invalid.</li>
        </ul>
      </div>
    </div>
  )
}
