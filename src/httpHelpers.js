import deepmerge from 'deepmerge'

let apiKey = 'torus-default'
let embedHost = ''

// #region API Keys
export const gatewayAuthHeader = 'x-api-key'
export const gatewayEmbedHostHeader = 'x-embed-host'

export function setEmbedHost(embedHost_) {
  embedHost = embedHost_
}

export function clearEmbedHost() {
  embedHost = ''
}

export function getEmbedHost() {
  return embedHost
}

export function setAPIKey(apiKey_) {
  apiKey = apiKey_
}

export function clearAPIKey() {
  apiKey = 'torus-default'
}

export function getAPIKey() {
  return apiKey
}
// #endregion

function getApiKeyHeaders() {
  const headers = {}
  if (apiKey) headers[gatewayAuthHeader] = apiKey
  if (embedHost) headers[gatewayEmbedHostHeader] = embedHost
  return headers
}

export const promiseTimeout = (ms, promise) => {
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      reject(new Error(`Timed out in ${ms}ms`))
    }, ms)
  })
  return Promise.race([promise, timeout])
}

export const get = async (url, options_ = {}, customOptions = {}) => {
  const defaultOptions = {
    mode: 'cors',
    headers: {},
  }
  if (customOptions.useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, ...getApiKeyHeaders() }
  }
  const options = deepmerge.all([defaultOptions, options_, { method: 'GET' }])
  const response = await fetch(url, options)
  if (response.ok) {
    return response.json()
  }
  throw response
}

export const post = (url, data = {}, options_ = {}, customOptions = {}) => {
  const defaultOptions = {
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: customOptions.isUrlEncodedData ? data : JSON.stringify(data),
  }
  if (customOptions.useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, ...getApiKeyHeaders() }
  }
  const options = deepmerge.all([defaultOptions, options_, { method: 'POST' }])
  return promiseTimeout(
    customOptions.timeout || 30000,
    fetch(url, options).then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw response
    })
  )
}

export const patch = async (url, data = {}, options_ = {}, customOptions = {}) => {
  const defaultOptions = {
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(data),
  }
  if (customOptions.useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, ...getApiKeyHeaders() }
  }
  const options = deepmerge.all([defaultOptions, options_, { method: 'PATCH' }])
  const response = await fetch(url, options)
  if (response.ok) {
    return response.json()
  }
  throw response
}

export const remove = async (url, _data = {}, options_ = {}, customOptions = {}) => {
  const defaultOptions = {
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  }
  if (customOptions.useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, ...getApiKeyHeaders() }
  }
  const options = deepmerge.all([defaultOptions, options_, { method: 'DELETE' }])
  const response = await fetch(url, options)
  if (response.ok) {
    return response.json()
  }
  throw response
}

export const generateJsonRPCObject = (method, parameters) => ({
  jsonrpc: '2.0',
  method,
  id: 10,
  params: parameters,
})

export const promiseRace = (url, options, timeout = 30000) =>
  Promise.race([
    get(url, options),
    new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('timed out'))
      }, timeout)
    }),
  ])
