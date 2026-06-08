const API_BASE = '/api'

function getToken() {
  return localStorage.getItem('auth_token')
}

function setToken(token) {
  if (token) {
    localStorage.setItem('auth_token', token)
  } else {
    localStorage.removeItem('auth_token')
  }
}

async function request(path, options = {}) {
  const url = API_BASE + path
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }
  const token = getToken()
  if (token) {
    headers['Authorization'] = 'Bearer ' + token
  }
  const resp = await fetch(url, {
    ...options,
    headers
  })
  let data = null
  const text = await resp.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch (e) {
      data = text
    }
  }
  if (!resp.ok) {
    const msg = (data && data.error) || '请求失败'
    throw new Error(msg)
  }
  return data
}

export const api = {
  getToken,
  setToken,

  async health() {
    return request('/health')
  },

  async register(username, password) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
  },

  async login(username, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
  },

  async loginDemo() {
    return request('/auth/login-demo', {
      method: 'POST'
    })
  },

  async getMe() {
    return request('/auth/me')
  },

  async listProjects() {
    return request('/projects')
  },

  async saveProject(name, data) {
    return request('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, data })
    })
  },

  async updateProject(id, name, data) {
    return request('/projects/' + id, {
      method: 'PUT',
      body: JSON.stringify({ name, data })
    })
  },

  async deleteProject(id) {
    return request('/projects/' + id, {
      method: 'DELETE'
    })
  },

  async createShare(shareData) {
    return request('/shares', {
      method: 'POST',
      body: JSON.stringify(shareData)
    })
  },

  async getShare(id) {
    return request('/shares/' + id)
  }
}
