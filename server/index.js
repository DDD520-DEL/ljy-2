import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from './db.js'

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'mortise-tenon-secret-key-2024'

const DEMO_USERNAME = 'demo'
const DEMO_PASSWORD = 'demo123456'

app.use(cors())
app.use(express.json({ limit: '10mb' }))

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' })
  }
  const token = authHeader.slice(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (e) {
    return res.status(401).json({ error: '登录已过期，请重新登录' })
  }
}

async function ensureDemoUser() {
  await db.read()
  const existing = db.data.users.find(u => u.username === DEMO_USERNAME)
  if (existing) return
  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10)
  const now = Date.now()
  const newUser = {
    id: generateId(),
    username: DEMO_USERNAME,
    password_hash: hash,
    created_at: now
  }
  db.data.users.push(newUser)
  await db.write()
  console.log(`[初始化] 演示账户已创建: ${DEMO_USERNAME} / ${DEMO_PASSWORD}`)
}
ensureDemoUser()

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !username.trim()) {
    return res.status(400).json({ error: '用户名不能为空' })
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: '密码长度至少6位' })
  }
  const name = username.trim()
  await db.read()
  const existing = db.data.users.find(u => u.username === name)
  if (existing) {
    return res.status(400).json({ error: '用户名已存在' })
  }
  const hash = bcrypt.hashSync(password, 10)
  const now = Date.now()
  const newUser = {
    id: generateId(),
    username: name,
    password_hash: hash,
    created_at: now
  }
  db.data.users.push(newUser)
  await db.write()
  const token = jwt.sign({ userId: newUser.id, username: name }, JWT_SECRET, { expiresIn: '30d' })
  res.json({
    token,
    user: { id: newUser.id, username: name, createdAt: now }
  })
})

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ error: '请输入用户名和密码' })
  }
  await db.read()
  const user = db.data.users.find(u => u.username === username.trim())
  if (!user) {
    return res.status(400).json({ error: '用户名或密码错误' })
  }
  const ok = bcrypt.compareSync(password, user.password_hash)
  if (!ok) {
    return res.status(400).json({ error: '用户名或密码错误' })
  }
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' })
  res.json({
    token,
    user: { id: user.id, username: user.username, createdAt: user.created_at }
  })
})

app.post('/api/auth/login-demo', async (req, res) => {
  await db.read()
  const user = db.data.users.find(u => u.username === DEMO_USERNAME)
  if (!user) {
    return res.status(500).json({ error: '演示账户初始化失败' })
  }
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' })
  res.json({
    token,
    user: { id: user.id, username: user.username, createdAt: user.created_at, isDemo: true }
  })
})

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  await db.read()
  const user = db.data.users.find(u => u.id === req.user.userId)
  if (!user) return res.status(404).json({ error: '用户不存在' })
  res.json({
    id: user.id,
    username: user.username,
    createdAt: user.created_at,
    isDemo: user.username === DEMO_USERNAME
  })
})

app.get('/api/projects', authMiddleware, async (req, res) => {
  await db.read()
  const projects = db.data.projects
    .filter(p => p.user_id === req.user.userId)
    .sort((a, b) => b.updated_at - a.updated_at)
    .map(p => ({
      id: p.id,
      name: p.name,
      data: p.data,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }))
  res.json(projects)
})

app.post('/api/projects', authMiddleware, async (req, res) => {
  const { name, data } = req.body || {}
  if (!name || !name.trim()) {
    return res.status(400).json({ error: '项目名称不能为空' })
  }
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: '项目数据无效' })
  }
  const nameTrim = name.trim()
  const now = Date.now()
  await db.read()
  const existing = db.data.projects.find(
    p => p.user_id === req.user.userId && p.name === nameTrim
  )
  if (existing) {
    existing.data = data
    existing.updated_at = now
    await db.write()
    return res.json({
      id: existing.id,
      name: existing.name,
      data: existing.data,
      createdAt: existing.created_at,
      updatedAt: existing.updated_at
    })
  }
  const id = generateId()
  const newProject = {
    id,
    user_id: req.user.userId,
    name: nameTrim,
    data,
    created_at: now,
    updated_at: now
  }
  db.data.projects.push(newProject)
  await db.write()
  res.json({
    id,
    name: nameTrim,
    data,
    createdAt: now,
    updatedAt: now
  })
})

app.put('/api/projects/:id', authMiddleware, async (req, res) => {
  const { id } = req.params
  const { name, data } = req.body || {}
  await db.read()
  const project = db.data.projects.find(
    p => p.id === id && p.user_id === req.user.userId
  )
  if (!project) {
    return res.status(404).json({ error: '项目不存在' })
  }
  const now = Date.now()
  let finalName = project.name
  if (name && name.trim()) {
    const nameTrim = name.trim()
    if (nameTrim !== project.name) {
      const conflict = db.data.projects.find(
        p => p.user_id === req.user.userId && p.name === nameTrim && p.id !== id
      )
      if (conflict) {
        return res.status(400).json({ error: '项目名称已存在' })
      }
      finalName = nameTrim
    }
  }
  const finalData = data && typeof data === 'object' ? data : project.data
  project.name = finalName
  project.data = finalData
  project.updated_at = now
  await db.write()
  res.json({
    id,
    name: finalName,
    data: finalData,
    createdAt: project.created_at,
    updatedAt: now
  })
})

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  const { id } = req.params
  await db.read()
  const idx = db.data.projects.findIndex(
    p => p.id === id && p.user_id === req.user.userId
  )
  if (idx === -1) {
    return res.status(404).json({ error: '项目不存在' })
  }
  db.data.projects.splice(idx, 1)
  await db.write()
  res.json({ success: true })
})

app.use((err, req, res, next) => {
  console.error('[服务器错误]', err)
  res.status(500).json({ error: '服务器内部错误' })
})

app.listen(PORT, () => {
  console.log(`榫卯后端服务已启动: http://localhost:${PORT}`)
  console.log(`演示账户: ${DEMO_USERNAME} / ${DEMO_PASSWORD}`)
})
