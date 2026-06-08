<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/60" @click="handleClose"></div>
    <div class="relative bg-ink border border-wood/40 rounded-lg p-5 w-96 shadow-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-wood font-bold text-lg tracking-wider">🔗 分享模型</h3>
        <button
          @click="handleClose"
          class="text-wood-light/50 hover:text-wood transition-all text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-10">
        <div class="w-10 h-10 border-2 border-wood/30 border-t-wood rounded-full animate-spin mb-3"></div>
        <div class="text-wood-light/60 text-sm">{{ loadingText }}</div>
      </div>

      <div v-else-if="error" class="py-6 text-center">
        <div class="text-red-400 text-sm mb-3">{{ error }}</div>
        <button
          @click="retry"
          class="px-4 py-2 text-xs bg-wood/20 text-wood rounded border border-wood/50 hover:bg-wood/30 transition-all tracking-wider"
        >
          重试
        </button>
      </div>

      <div v-else>
        <div class="mb-4">
          <div class="text-xs text-wood-light/70 mb-2 tracking-wider">预览缩略图</div>
          <div class="rounded-lg overflow-hidden border border-wood/30 bg-black/40 aspect-video flex items-center justify-center">
            <img v-if="thumbnail" :src="thumbnail" class="w-full h-full object-contain" alt="模型预览" />
            <div v-else class="text-wood-light/30 text-xs">暂无预览</div>
          </div>
        </div>

        <div class="mb-4">
          <div class="text-xs text-wood-light/70 mb-2 tracking-wider">模型信息</div>
          <div class="bg-wood-dark/20 rounded border border-wood-dark/40 p-3">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs text-wood-light/60">榫卯类型</span>
              <span class="text-sm text-wood font-bold">{{ jointName }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-wood-light/60">参数数量</span>
              <span class="text-sm text-wood-light font-mono">{{ paramCount }}</span>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <div class="text-xs text-wood-light/70 mb-2 tracking-wider flex items-center justify-between">
            <span>分享链接</span>
            <span v-if="shareId" class="text-[10px] text-wood/50 font-mono">ID: {{ shareId }}</span>
          </div>
          <div class="flex gap-2">
            <input
              :value="shareUrl"
              readonly
              class="flex-1 bg-wood-dark/30 border border-wood-dark/50 rounded px-3 py-2 text-xs text-wood-light font-mono focus:outline-none focus:border-wood/60"
            />
            <button
              @click="copyLink"
              :disabled="copied"
              :class="[
                'px-4 py-2 text-xs rounded border transition-all tracking-wider font-bold flex-shrink-0',
                copied
                  ? 'bg-green-700/80 text-green-100 border-green-500'
                  : 'bg-wood text-white border-wood-light hover:bg-wood-dark'
              ]"
            >
              {{ copied ? '✓ 已复制' : '复制链接' }}
            </button>
          </div>
          <div class="mt-2 flex gap-2">
            <button
              v-if="directUrl && directUrl.length < 2000"
              @click="copyDirectLink"
              :disabled="directCopied"
              :class="[
                'flex-1 px-3 py-1.5 text-[11px] rounded border transition-all tracking-wider',
                directCopied
                  ? 'bg-green-700/60 text-green-100 border-green-500/60'
                  : 'bg-wood-dark/30 text-wood-light border-wood-dark/50 hover:bg-wood-dark/50'
              ]"
            >
              {{ directCopied ? '✓ 直链已复制' : '📋 复制免服务器直链' }}
            </button>
          </div>
        </div>

        <div class="pt-3 border-t border-wood-dark/30">
          <div class="text-[10px] text-wood-light/40 leading-relaxed">
            💡 提示：接收方打开链接后将自动加载完全相同的模型效果，包括榫卯类型、所有参数和视图设置。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { JOINT_TYPES } from '../models/jointTypes.js'
import { api } from '../utils/api.js'
import { encodeShareData, copyToClipboard, buildShareUrl, buildDirectShareUrl } from '../utils/shareUtils.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  type: { type: String, default: 'straight' },
  params: { type: Object, default: () => ({}) },
  viewState: { type: Object, default: () => ({}) },
  thumbnail: { type: String, default: '' }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const loadingText = ref('正在生成分享...')
const error = ref('')
const shareId = ref('')
const shareUrl = ref('')
const directUrl = ref('')
const copied = ref(false)
const directCopied = ref(false)

const jointName = computed(() => JOINT_TYPES[props.type]?.name || props.type)
const paramCount = computed(() => Object.keys(props.params || {}).length)

watch(() => props.open, async (val) => {
  if (val) {
    copied.value = false
    directCopied.value = false
    error.value = ''
    shareId.value = ''
    shareUrl.value = ''
    directUrl.value = ''
    await createShare()
  }
})

async function createShare() {
  loading.value = true
  error.value = ''
  try {
    const encoded = encodeShareData(props.type, props.params, props.viewState)
    directUrl.value = buildDirectShareUrl(encoded)

    loadingText.value = '正在上传分享数据...'
    const result = await api.createShare({
      type: props.type,
      params: props.params,
      viewState: props.viewState,
      thumbnail: props.thumbnail || null,
      encodedData: encoded
    })

    shareId.value = result.id
    shareUrl.value = buildShareUrl(result.id)
  } catch (e) {
    console.error('创建分享失败:', e)
    if (directUrl.value) {
      shareUrl.value = directUrl.value
    } else {
      error.value = e.message || '生成分享失败，请重试'
    }
  } finally {
    loading.value = false
  }
}

async function copyLink() {
  if (!shareUrl.value) return
  try {
    await copyToClipboard(shareUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) {
    console.error('复制失败:', e)
  }
}

async function copyDirectLink() {
  if (!directUrl.value) return
  try {
    await copyToClipboard(directUrl.value)
    directCopied.value = true
    setTimeout(() => { directCopied.value = false }, 2000)
  } catch (e) {
    console.error('复制失败:', e)
  }
}

function retry() {
  error.value = ''
  createShare()
}

function handleClose() {
  emit('close')
}
</script>
