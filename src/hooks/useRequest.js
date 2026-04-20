import { useCallback, useState } from 'react'

function getBasicAuthValue(authValue = '') {
  return `Basic ${window.btoa(authValue)}`
}

function getResponseSize(rawText) {
  return new TextEncoder().encode(rawText).length
}

export default function useRequest() {
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const execute = useCallback(async (config) => {
    const {
      url,
      method = 'GET',
      headers = {},
      body = '',
      authType = 'none',
      authValue = '',
    } = config

    if (!navigator.onLine) {
      const offlineMessage = 'No internet connection'
      setError(offlineMessage)
      throw new Error(offlineMessage)
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 10000)
    const finalHeaders = { ...headers }

    if (authType === 'bearer' && authValue) {
      finalHeaders.Authorization = `Bearer ${authValue}`
    }

    if (authType === 'basic' && authValue) {
      finalHeaders.Authorization = getBasicAuthValue(authValue)
    }

    setLoading(true)
    setError('')

    try {
      const startedAt = performance.now()
      const requestOptions = {
        method,
        headers: finalHeaders,
        signal: controller.signal,
      }

      if (!['GET', 'HEAD'].includes(method.toUpperCase()) && body) {
        requestOptions.body = body
      }

      const fetchResponse = await window.fetch(url, requestOptions)
      const latency = performance.now() - startedAt
      const contentType = fetchResponse.headers.get('content-type') || ''
      const rawBody = await fetchResponse.text()
      const parsedBody = contentType.includes('application/json')
        ? rawBody
          ? JSON.parse(rawBody)
          : null
        : rawBody

      const responseHeaders = Object.fromEntries(fetchResponse.headers.entries())
      const responsePayload = {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        body: parsedBody,
        headers: responseHeaders,
        latency: Math.round(latency),
        size: getResponseSize(rawBody),
      }

      setResponse(responsePayload)
      return responsePayload
    } catch (err) {
      const message = err.name === 'AbortError'
        ? 'Request timed out after 10s'
        : !navigator.onLine
          ? 'No internet connection'
          : `Network or CORS error: ${err.message}`

      setError(message)
      throw new Error(message)
    } finally {
      window.clearTimeout(timeoutId)
      setLoading(false)
    }
  }, [])

  return { execute, response, loading, error }
}
