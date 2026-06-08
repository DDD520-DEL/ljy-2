const STORAGE_KEY = 'mortise-tenon-projects'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('读取项目存储失败:', e)
    return []
  }
}

function writeStorage(projects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    return true
  } catch (e) {
    console.error('写入项目存储失败:', e)
    return false
  }
}

export function listProjects() {
  return readStorage().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function saveProject(name, data) {
  if (!name || !name.trim()) {
    return { success: false, error: '项目名称不能为空' }
  }
  const projects = readStorage()
  const existing = projects.find(p => p.name === name.trim())
  const now = Date.now()

  if (existing) {
    existing.data = { ...data }
    existing.updatedAt = now
  } else {
    projects.push({
      id: generateId(),
      name: name.trim(),
      data: { ...data },
      createdAt: now,
      updatedAt: now
    })
  }

  const ok = writeStorage(projects)
  return ok
    ? { success: true, project: existing || projects[projects.length - 1] }
    : { success: false, error: '保存失败' }
}

export function saveProjectAs(id, name, data) {
  if (!name || !name.trim()) {
    return { success: false, error: '项目名称不能为空' }
  }
  const projects = readStorage()
  const nameConflict = projects.find(p => p.name === name.trim() && p.id !== id)
  if (nameConflict) {
    return { success: false, error: '项目名称已存在' }
  }

  const now = Date.now()
  if (id) {
    const existing = projects.find(p => p.id === id)
    if (existing) {
      existing.name = name.trim()
      existing.data = { ...data }
      existing.updatedAt = now
      const ok = writeStorage(projects)
      return ok
        ? { success: true, project: existing }
        : { success: false, error: '保存失败' }
    }
  }

  const newProject = {
    id: generateId(),
    name: name.trim(),
    data: { ...data },
    createdAt: now,
    updatedAt: now
  }
  projects.push(newProject)
  const ok = writeStorage(projects)
  return ok
    ? { success: true, project: newProject }
    : { success: false, error: '保存失败' }
}

export function loadProject(id) {
  const projects = readStorage()
  return projects.find(p => p.id === id) || null
}

export function deleteProject(id) {
  const projects = readStorage()
  const filtered = projects.filter(p => p.id !== id)
  if (filtered.length === projects.length) {
    return { success: false, error: '项目不存在' }
  }
  const ok = writeStorage(filtered)
  return ok ? { success: true } : { success: false, error: '删除失败' }
}

export function renameProject(id, newName) {
  if (!newName || !newName.trim()) {
    return { success: false, error: '项目名称不能为空' }
  }
  const projects = readStorage()
  const nameConflict = projects.find(p => p.name === newName.trim() && p.id !== id)
  if (nameConflict) {
    return { success: false, error: '项目名称已存在' }
  }
  const project = projects.find(p => p.id === id)
  if (!project) {
    return { success: false, error: '项目不存在' }
  }
  project.name = newName.trim()
  project.updatedAt = Date.now()
  const ok = writeStorage(projects)
  return ok ? { success: true, project } : { success: false, error: '重命名失败' }
}

export function projectNameExists(name, excludeId = null) {
  if (!name || !name.trim()) return false
  const projects = readStorage()
  return projects.some(p => p.name === name.trim() && p.id !== excludeId)
}
