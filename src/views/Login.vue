<template>
  <div class="min-h-screen w-full bg-ink flex items-center justify-center p-4 font-song">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-wood text-3xl font-bold tracking-widest">榫卯参数化工具</h1>
        <p class="text-wood-light/60 text-sm mt-2 tracking-wider">传统营造 · 古法今用 · 云端同步</p>
      </div>

      <div class="bg-ink/80 border border-wood/30 rounded-xl p-6 shadow-2xl backdrop-blur-sm">
        <h2 class="text-wood text-xl font-bold mb-6 tracking-wider text-center">账户登录</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-xs text-wood-light/70 mb-2 tracking-wider">用户名</label>
            <input
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              class="w-full bg-wood-dark/30 border border-wood-dark/50 rounded px-4 py-3 text-sm text-wood-light focus:outline-none focus:border-wood/60 transition-all"
              @keyup.enter="handleLogin"
            />
          </div>
          <div>
            <label class="block text-xs text-wood-light/70 mb-2 tracking-wider">密码</label>
            <input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              class="w-full bg-wood-dark/30 border border-wood-dark/50 rounded px-4 py-3 text-sm text-wood-light focus:outline-none focus:border-wood/60 transition-all"
              @keyup.enter="handleLogin"
            />
          </div>

          <div v-if="error" class="text-xs text-red-400 text-center py-2">{{ error }}</div>
          <div v-if="success" class="text-xs text-green-400 text-center py-2">{{ success }}</div>

          <button
            @click="handleLogin"
            :disabled="loading"
            class="w-full px-4 py-3 bg-wood text-white rounded border border-wood-light hover:bg-wood-dark transition-all tracking-widest font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </button>

          <div class="relative py-2">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-wood-dark/40"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="bg-ink/80 px-3 text-wood-light/50">或</span>
            </div>
          </div>

          <button
            @click="handleDemoLogin"
            :disabled="loading"
            class="w-full px-4 py-3 bg-wood-dark/50 text-wood rounded border border-wood/50 hover:bg-wood-dark/70 transition-all tracking-wider font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>🎯</span>
            <span>演示账户一键登录</span>
          </button>

          <div class="text-center pt-2">
            <span class="text-xs text-wood-light/50">还没有账户？</span>
            <router-link to="/register" class="text-xs text-wood hover:text-wood-light ml-1 underline transition-colors">
              立即注册
            </router-link>
          </div>
        </div>
      </div>

      <div class="text-center mt-6">
        <router-link to="/" class="text-xs text-wood-light/40 hover:text-wood-light/70 transition-colors">
          ← 返回编辑器
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../utils/api.js'
import { useAuth } from '../stores/auth.js'

const router = useRouter()
const auth = useAuth()

const username = ref('')
const password = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  success.value = ''
  if (!username.value.trim() || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  try {
    const result = await api.login(username.value.trim(), password.value)
    api.setToken(result.token)
    auth.setUser(result.user)
    success.value = '登录成功，正在跳转...'
    setTimeout(() => router.push('/'), 500)
  } catch (e) {
    error.value = e.message || '登录失败'
  } finally {
    loading.value = false
  }
}

async function handleDemoLogin() {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    const result = await api.loginDemo()
    api.setToken(result.token)
    auth.setUser(result.user)
    success.value = '演示账户登录成功，正在跳转...'
    setTimeout(() => router.push('/'), 500)
  } catch (e) {
    error.value = e.message || '演示账户登录失败'
  } finally {
    loading.value = false
  }
}
</script>
