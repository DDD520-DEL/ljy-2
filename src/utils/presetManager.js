const STORAGE_KEY = 'mortise-tenon-presets'
import { JOINT_TYPES } from '../models/jointTypes.js'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (e) {
    console.error('读取预设存储失败:', e)
    return {}
  }
}

function writeStorage(presets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
    return true
  } catch (e) {
    console.error('写入预设存储失败:', e)
    return false
  }
}

export function getBuiltInPresets(jointType) {
  const type = JOINT_TYPES[jointType]
  if (!type || !Array.isArray(type.presets)) return []
  return type.presets.map(p => ({ ...p, builtIn: true }))
}

export function getCustomPresets(jointType) {
  const all = readStorage()
  const list = all[jointType] || []
  return list.map(p => ({ ...p, builtIn: false }))
}

export function getAllPresets(jointType) {
  return [...getBuiltInPresets(jointType), ...getCustomPresets(jointType)]
}

export function saveCustomPreset(jointType, name, params, description = '') {
  if (!name || !name.trim()) {
    return { success: false, error: '预设名称不能为空' }
  }
  const all = readStorage()
  if (!all[jointType]) all[jointType] = []

  const existing = all[jointType].find(p => p.name === name.trim())
  const now = Date.now()

  if (existing) {
    existing.params = { ...params }
    existing.description = description
    existing.updatedAt = now
  } else {
    all[jointType].push({
      id: generateId(),
      name: name.trim(),
      builtIn: false,
      description: description || '',
      params: { ...params },
      createdAt: now,
      updatedAt: now
    })
  }

  const ok = writeStorage(all)
  return ok
    ? { success: true, preset: existing || all[jointType][all[jointType].length - 1] }
    : { success: false, error: '保存失败' }
}

export function deleteCustomPreset(jointType, presetId) {
  const all = readStorage()
  if (!all[jointType]) {
    return { success: false, error: '预设不存在' }
  }
  const before = all[jointType].length
  all[jointType] = all[jointType].filter(p => p.id !== presetId)
  if (all[jointType].length === before) {
    return { success: false, error: '预设不存在' }
  }
  const ok = writeStorage(all)
  return ok ? { success: true } : { success: false, error: '删除失败' }
}

export function presetNameExists(jointType, name, excludeId = null) {
  if (!name || !name.trim()) return false
  const builtIn = getBuiltInPresets(jointType)
  if (builtIn.some(p => p.name === name.trim())) return true
  const custom = getCustomPresets(jointType)
  return custom.some(p => p.name === name.trim() && p.id !== excludeId)
}
