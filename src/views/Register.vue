<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4 font-song" style="background-color: var(--color-ink);">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-wood text-3xl font-bold tracking-widest">榫卯参数化工具</h1>
        <p class="text-wood-light/60 text-sm mt-2 tracking-wider">创建账户，开启云端同步</p>
      </div>

      <div class="border border-wood/30 rounded-xl p-6 shadow-2xl backdrop-blur-sm" style="background-color: var(--color-ink-alpha-80);">
        <h2 class="text-wood text-xl font-bold mb-6 tracking-wider text-center">用户注册</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-xs text-wood-light/70 mb-2 tracking-wider">用户名</label>
            <input
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              class="w-full bg-wood-dark/30 border border-wood-dark/50 rounded px-4 py-3 text-sm text-wood-light focus:outline-none focus:border-wood/60 transition-all"
              @keyup.enter="handleRegister"
            />
          </div>
          <div>
            <label class="block text-xs text-wood-light/70 mb-2 tracking-wider">密码</label>
            <input
              v-model="password"
              type="password"
              placeholder="至少6位"
              class="w-full bg-wood-dark/30 border border-wood-dark/50 rounded px-4 py-3 text-sm text-wood-light focus:outline-none focus:border-wood/60 transition-all"
              @keyup.enter="handleRegister"
            />
          </div>
          <div>
            <label class="block text-xs text-wood-light/70 mb-2 tracking-wider">确认密码</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="再次输入密码"
              class="w-full bg-wood-dark/30 border border-wood-dark/50 rounded px-4 py-3 text-sm text-wood-light focus:outline-none focus:border-wood/60 transition-all"
              @keyup.enter="handleRegister"
            />
          </div>

          <div v-if="error" class="text-xs text-red-400 text-center py-2">{{ error }}</div>
          <div v-if="success" class="text-xs text-green-400 text-center py-2">{{ success }}</div>

          <button
            @click="handleRegister"
            :disabled="loading"
            class="w-full px-4 py-3 bg-wood text-white rounded border border-wood-light hover:bg-wood-dark transition-all tracking-widest font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '注册中...' : '注 册' }}
          </button>

          <div class="text-center pt-2">
            <span class="text-xs text-wood-light/50">已有账户？</span>
            <router-link to="/login" class="text-xs text-wood hover:text-wood-light ml-1 underline transition-colors">
              立即登录
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
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''
  success.value = ''
  if (!username.value.trim()) {
    error.value = '请输入用户名'
    return
  }
  if (!password.value || password.value.length < 6) {
    error.value = '密码长度至少6位'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  loading.value = true
  try {
    const result = await api.register(username.value.trim(), password.value)
    api.setToken(result.token)
    auth.setUser(result.user)
    success.value = '注册成功，正在跳转...'
    setTimeout(() => router.push('/'), 500)
  } catch (e) {
    error.value = e.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>
