<template>
  <div
    v-if="open"
    class="fixed inset-0 z-40 flex items-center justify-center"
    @click.self="$emit('close')"
  >
    <div class="absolute inset-0 bg-black/60" @click="$emit('close')"></div>
    <div class="relative bg-ink border border-wood/40 rounded-lg shadow-2xl w-[420px] max-h-[75vh] flex flex-col font-song">
      <div class="px-5 py-4 border-b border-wood-dark/40 flex items-center justify-between">
        <div>
          <h3 class="text-wood font-bold text-lg tracking-wider">📜 操作历史</h3>
          <p class="text-xs text-wood-light/50 mt-0.5">可点击任意历史状态快速回退</p>
        </div>
        <button
          @click="$emit('close')"
          class="text-wood-light/60 hover:text-wood text-xl leading-none transition-colors"
        >
          ✕
        </button>
      </div>

      <div class="px-5 py-3 border-b border-wood-dark/40 flex gap-2">
        <button
          @click="$emit('undo')"
          :disabled="history.length <= 1 || currentIndex <= 0"
          class="flex-1 px-3 py-2 text-xs rounded border transition-all tracking-wider disabled:opacity-40 disabled:cursor-not-allowed bg-wood-dark/50 text-wood-light border-wood-dark/50 hover:bg-wood-dark/70 hover:border-wood/60"
        >
          ↩ 撤销一步
        </button>
        <button
          @click="$emit('reset-default')"
          class="flex-1 px-3 py-2 text-xs rounded border transition-all tracking-wider bg-wood/80 text-white border-wood-light hover:bg-wood"
        >
          ⟲ 恢复默认
        </button>
      </div>

      <div class="flex-1 overflow-y-auto scrollbar-thin px-3 py-3">
        <div v-if="history.length === 0" class="text-center text-wood-light/40 text-sm py-8 italic">
          暂无操作记录
        </div>
        <div v-else class="space-y-1.5">
          <div
            v-for="(item, index) in reversedHistory"
            :key="item.id"
            @click="$emit('goto', realIndex(index))"
            :class="[
              'group px-3 py-2.5 rounded border cursor-pointer transition-all',
              realIndex(index) === currentIndex
                ? 'bg-wood/20 border-wood/60 shadow-inner'
                : 'bg-wood-dark/20 border-wood-dark/40 hover:bg-wood-dark/40 hover:border-wood/40'
            ]"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'text-xs font-bold px-1.5 py-0.5 rounded',
                      realIndex(index) === currentIndex
                        ? 'bg-wood text-white'
                        : 'bg-wood-dark/60 text-wood-light/80'
                    ]"
                  >
                    #{{ realIndex(index) + 1 }}
                  </span>
                  <span class="text-sm text-wood-light/90 font-bold truncate">
                    {{ item.label }}
                  </span>
                </div>
                <div class="mt-1 text-[11px] text-wood-light/50 flex items-center gap-2 flex-wrap">
                  <span>{{ formatTime(item.timestamp) }}</span>
                  <span v-if="item.type" class="text-wood/70">· {{ getTypeLabel(item.type) }}</span>
                </div>
                <div v-if="item.detail" class="mt-1 text-[10px] text-wood-light/40 truncate">
                  {{ item.detail }}
                </div>
              </div>
              <div v-if="realIndex(index) === currentIndex" class="text-wood text-xs flex-shrink-0">
                ● 当前
              </div>
              <div v-else class="text-wood-light/30 text-xs flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                点击跳转
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-5 py-3 border-t border-wood-dark/40 bg-wood-dark/10">
        <div class="flex items-center justify-between text-xs text-wood-light/60">
          <span>共 {{ history.length }} 条记录</span>
          <span>当前：第 {{ currentIndex + 1 }} 步</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  history: { type: Array, default: () => [] },
  currentIndex: { type: Number, default: 0 }
})

defineEmits(['close', 'undo', 'reset-default', 'goto'])

const reversedHistory = computed(() => [...props.history].reverse())

function realIndex(reversedIndex) {
  return props.history.length - 1 - reversedIndex
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function getTypeLabel(type) {
  const map = {
    'select-type': '切换类型',
    'param-change': '调整参数',
    'explode-change': '拆解进度',
    'toggle-wireframe': '显示模式',
    'toggle-annotations': '标注显示',
    'load-project': '加载项目',
    'init': '初始状态'
  }
  return map[type] || type
}
</script>
