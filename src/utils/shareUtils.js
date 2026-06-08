import { JOINT_TYPES } from '../models/jointTypes.js'

export function encodeShareData(type, params, viewState = {}) {
  if (!type || !JOINT_TYPES[type]) {
    throw new Error('无效的榫卯类型')
  }
  const data = {
    v: 1,
    t: type,
    p: { ...params },
    vs: {
      explode: viewState.explodeProgress ?? 0,
      wireframe: viewState.wireframeMode ?? true,
      annot: viewState.showAnnotations ?? true
    }
  }
  const json = JSON.stringify(data)
  const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(json))))
  return encoded
}

export function decodeShareData(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(decodeURIComponent(encoded))))
    const data = JSON.parse(json)
    if (!data || !data.t || !JOINT_TYPES[data.t]) {
      return null
    }
    const typeDef = JOINT_TYPES[data.t]
    const validParams = {}
    for (const p of typeDef.params) {
      if (typeof data.p[p.key] === 'number') {
        let val = data.p[p.key]
        val = Math.max(p.min, Math.min(p.max, val))
        validParams[p.key] = val
      } else {
        validParams[p.key] = p.default
      }
    }
    return {
      type: data.t,
      params: validParams,
      viewState: {
        explodeProgress: typeof data.vs?.explode === 'number' ? data.vs.explode : 0,
        wireframeMode: typeof data.vs?.wireframe === 'boolean' ? data.vs.wireframe : true,
        showAnnotations: typeof data.vs?.annot === 'boolean' ? data.vs.annot : true
      }
    }
  } catch (e) {
    console.warn('解码分享数据失败:', e)
    return null
  }
}

export function generateShortId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function buildShareUrl(shareId) {
  const base = window.location.origin + window.location.pathname
  return `${base}#/share/${shareId}`
}

export function buildDirectShareUrl(encodedData) {
  const base = window.location.origin + window.location.pathname
  return `${base}#/?d=${encodedData}`
}

export function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(resolve).catch(reject)
    } else {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        resolve()
      } catch (e) {
        reject(e)
      }
    }
  })
}
