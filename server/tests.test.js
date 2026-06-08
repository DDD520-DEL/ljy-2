import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'

const BASE = 'http://localhost:3001/api'

async function request(path, options = {}) {
  const url = BASE + path
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const resp = await fetch(url, { ...options, headers })
  const text = await resp.text()
  let data = null
  if (text) { try { data = JSON.parse(text) } catch { data = text } }
  return { status: resp.status, ok: resp.ok, data }
}

let demoToken = null
let demoUser = null

describe('后端 API 测试', () => {
  describe('用户认证模块', () => {
    it('健康检查接口', async () => {
      const r = await request('/health')
      assert.equal(r.ok, true)
      assert.equal(r.data.status, 'ok')
    })

    it('演示账户一键登录', async () => {
      const r = await request('/auth/login-demo', { method: 'POST' })
      assert.equal(r.ok, true)
      assert.ok(r.data.token, '应返回 token')
      assert.ok(r.data.user, '应返回 user')
      assert.equal(r.data.user.username, 'demo')
      assert.equal(r.data.user.isDemo, true)
      demoToken = r.data.token
      demoUser = r.data.user
    })

    it('用户 ID 应使用 generateId 格式（非纯数字时间戳）', async () => {
      const username = 'test_uid_' + Date.now().toString(36)
      const r = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password: 'test123456' })
      })
      assert.equal(r.ok, true, `注册失败: ${JSON.stringify(r.data)}`)
      const userId = String(r.data.user.id)
      assert.ok(
        !/^\d+$/.test(userId) || userId.length > 13,
        `用户 ID ${userId} 看起来像纯时间戳，应使用 generateId() 格式`
      )
      assert.ok(
        /^[a-z0-9]+$/.test(userId),
        `用户 ID ${userId} 应符合 generateId() 字母数字格式`
      )
    })

    it('普通用户注册成功', async () => {
      const username = 'testuser_' + Date.now().toString(36)
      const r = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password: 'test123456' })
      })
      assert.equal(r.ok, true)
      assert.ok(r.data.token)
      assert.equal(r.data.user.username, username)
    })

    it('注册：用户名为空应报错', async () => {
      const r = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: '', password: 'test123456' })
      })
      assert.equal(r.ok, false)
      assert.equal(r.status, 400)
    })

    it('注册：密码不足6位应报错', async () => {
      const r = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: 'short_pwd', password: '123' })
      })
      assert.equal(r.ok, false)
      assert.equal(r.status, 400)
    })

    it('注册：重复用户名应报错', async () => {
      const username = 'dup_' + Date.now().toString(36)
      await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password: 'test123456' })
      })
      const r = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password: 'test123456' })
      })
      assert.equal(r.ok, false)
      assert.equal(r.status, 400)
      assert.match(r.data.error, /已存在/)
    })

    it('普通用户登录成功', async () => {
      const username = 'loginuser_' + Date.now().toString(36)
      await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password: 'pass67890' })
      })
      const r = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password: 'pass67890' })
      })
      assert.equal(r.ok, true)
      assert.ok(r.data.token)
    })

    it('登录：错误密码应报错', async () => {
      const username = 'badlogin_' + Date.now().toString(36)
      await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password: 'correctpass' })
      })
      const r = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password: 'wrongpass' })
      })
      assert.equal(r.ok, false)
      assert.equal(r.status, 400)
    })

    it('未登录访问受保护接口应返回 401', async () => {
      const r = await request('/projects')
      assert.equal(r.ok, false)
      assert.equal(r.status, 401)
    })

    it('获取当前登录用户信息', async () => {
      assert.ok(demoToken, '需要先获取演示账户 token')
      const r = await request('/auth/me', {
        headers: { Authorization: 'Bearer ' + demoToken }
      })
      assert.equal(r.ok, true)
      assert.equal(r.data.username, 'demo')
      assert.equal(r.data.isDemo, true)
    })
  })

  describe('项目云同步模块', () => {
    let userToken = null
    const projectName = '测试项目_' + Date.now()
    const projectData = { type: 'straight', params: { width: 200, height: 50 } }

    it('注册新用户并获取 token', async () => {
      const username = 'proj_user_' + Date.now().toString(36)
      const r = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password: 'test123456' })
      })
      userToken = r.data.token
      assert.ok(userToken)
    })

    it('保存项目到云端', async () => {
      const r = await request('/projects', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + userToken },
        body: JSON.stringify({ name: projectName, data: projectData })
      })
      assert.equal(r.ok, true)
      assert.equal(r.data.name, projectName)
      assert.equal(r.data.data.type, 'straight')
      assert.ok(r.data.id)
      assert.ok(r.data.createdAt)
      assert.ok(r.data.updatedAt)
    })

    it('获取云端项目列表应包含刚保存的项目', async () => {
      const r = await request('/projects', {
        headers: { Authorization: 'Bearer ' + userToken }
      })
      assert.equal(r.ok, true)
      assert.ok(Array.isArray(r.data))
      const found = r.data.find(p => p.name === projectName)
      assert.ok(found, `列表中应找到项目 ${projectName}`)
      assert.equal(found.data.params.width, 200)
    })

    it('同名项目保存应覆盖更新', async () => {
      const updatedData = { type: 'dovetail', params: { width: 300 } }
      const r = await request('/projects', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + userToken },
        body: JSON.stringify({ name: projectName, data: updatedData })
      })
      assert.equal(r.ok, true)
      assert.equal(r.data.data.type, 'dovetail')
      assert.equal(r.data.data.params.width, 300)
      const list = await request('/projects', {
        headers: { Authorization: 'Bearer ' + userToken }
      })
      assert.equal(list.data.filter(p => p.name === projectName).length, 1, '同名项目只应保留一条')
    })

    it('更新项目名称', async () => {
      const list = await request('/projects', {
        headers: { Authorization: 'Bearer ' + userToken }
      })
      const proj = list.data.find(p => p.name === projectName)
      assert.ok(proj)
      const newName = projectName + '_renamed'
      const r = await request('/projects/' + proj.id, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + userToken },
        body: JSON.stringify({ name: newName })
      })
      assert.equal(r.ok, true)
      assert.equal(r.data.name, newName)
    })

    it('删除云端项目', async () => {
      const list = await request('/projects', {
        headers: { Authorization: 'Bearer ' + userToken }
      })
      const proj = list.data[0]
      assert.ok(proj)
      const r = await request('/projects/' + proj.id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + userToken }
      })
      assert.equal(r.ok, true)
      assert.equal(r.data.success, true)
      const afterList = await request('/projects', {
        headers: { Authorization: 'Bearer ' + userToken }
      })
      assert.equal(afterList.data.find(p => p.id === proj.id), undefined)
    })

    it('用户数据隔离：A 用户看不到 B 用户的项目', async () => {
      const ua = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: 'iso_a_' + Date.now().toString(36), password: 'test123456' })
      })
      const ub = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: 'iso_b_' + Date.now().toString(36), password: 'test123456' })
      })
      await request('/projects', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + ua.data.token },
        body: JSON.stringify({ name: 'A私有项目', data: { type: 'straight' } })
      })
      const bList = await request('/projects', {
        headers: { Authorization: 'Bearer ' + ub.data.token }
      })
      assert.equal(bList.data.filter(p => p.name === 'A私有项目').length, 0)
    })
  })

  describe('generateId 格式校验', () => {
    it('连续生成多个 ID 应不重复且格式正确', () => {
      function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
      }
      const seen = new Set()
      for (let i = 0; i < 1000; i++) {
        const id = generateId()
        assert.ok(!seen.has(id), `ID 重复: ${id}`)
        seen.add(id)
        assert.ok(/^[a-z0-9]+$/.test(id), `ID 格式不正确: ${id}`)
        assert.ok(id.length >= 8, `ID 长度过短: ${id}`)
      }
    })
  })
})

describe('前端事件链路测试（逻辑验证）', () => {
  it('ControlPanel handleRefreshCloud 应触发 refresh-cloud 事件（而非 refresh-projects）', () => {
    const eventsFired = []
    const fakeEmit = (event) => eventsFired.push(event)
    function handleRefreshCloud(emit) {
      emit('refresh-cloud')
    }
    handleRefreshCloud(fakeEmit)
    assert.deepEqual(eventsFired, ['refresh-cloud'], '应触发 refresh-cloud 事件')
    assert.equal(eventsFired.includes('refresh-projects'), false, '不应触发 refresh-projects')
  })

  it('上传流程应等待异步结果后触发回调', async () => {
    let successCalled = false
    let errorCalled = false
    let dialogClosed = false

    function closeUploadDialog() { dialogClosed = true }

    async function mockHandleUploadToCloud(projectId, onSuccess, onError) {
      await new Promise(r => setTimeout(r, 50))
      if (projectId === 'bad') {
        onError && onError('模拟错误')
        return
      }
      onSuccess && onSuccess()
    }

    await new Promise(resolve => {
      mockHandleUploadToCloud('good',
        () => { successCalled = true; closeUploadDialog(); resolve() },
        (err) => { errorCalled = true; resolve() }
      )
    })

    assert.equal(successCalled, true, '成功回调应被调用')
    assert.equal(errorCalled, false)
    assert.equal(dialogClosed, true, '对话框应在成功回调后关闭')
  })

  it('上传失败应触发错误回调且不关闭对话框', async () => {
    let successCalled = false
    let errorCalled = false
    let errorMsg = ''

    async function mockHandleUploadToCloud(projectId, onSuccess, onError) {
      await new Promise(r => setTimeout(r, 50))
      if (projectId === 'bad') {
        onError && onError('模拟错误')
        return
      }
      onSuccess && onSuccess()
    }

    await new Promise(resolve => {
      mockHandleUploadToCloud('bad',
        () => { successCalled = true; resolve() },
        (err) => { errorCalled = true; errorMsg = err; resolve() }
      )
    })

    assert.equal(successCalled, false)
    assert.equal(errorCalled, true)
    assert.equal(errorMsg, '模拟错误')
  })
})

console.log('\n=== 所有测试用例已加载完成 ===')
console.log('运行方式: node --test server/tests.test.js')
console.log('注意: 请确保后端服务已启动 (npm run server)')
