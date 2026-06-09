<template>
  <div class="relative z-20 font-song" :class="expanded ? 'w-80' : 'w-auto'">
    <div
      class="bg-ink/90 backdrop-blur-sm border border-wood/30 rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
      :class="expanded ? 'max-h-[520px]' : 'max-h-[44px]'"
    >
      <div
        class="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-wood-dark/20 transition-colors select-none"
        @click="expanded = !expanded"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-wood text-base">📖</span>
          <div class="min-w-0">
            <div class="text-wood text-sm font-bold tracking-wider truncate">
              {{ jointInfo?.name || '榫卯' }}知识
            </div>
          </div>
        </div>
        <span
          class="text-wood-light/70 text-xs transition-transform duration-300 flex-shrink-0 ml-2"
          :class="expanded ? 'rotate-180' : ''"
        >
          ▼
        </span>
      </div>

      <div
        v-show="expanded"
        class="border-t border-wood-dark/40 overflow-y-auto scrollbar-thin"
        style="max-height: calc(520px - 44px);"
      >
        <div class="px-4 py-3 space-y-4">
          <div>
            <div class="flex items-center gap-1.5 mb-2">
              <span class="text-wood">🏛️</span>
              <span class="text-wood text-xs font-bold tracking-wider">历史渊源</span>
            </div>
            <p class="text-wood-light/80 text-xs leading-relaxed">
              {{ knowledge?.history || '暂无资料' }}
            </p>
          </div>

          <div class="border-t border-wood-dark/30 pt-4">
            <div class="flex items-center gap-1.5 mb-2">
              <span class="text-wood">⚙️</span>
              <span class="text-wood text-xs font-bold tracking-wider">结构原理</span>
            </div>
            <p class="text-wood-light/80 text-xs leading-relaxed">
              {{ knowledge?.principle || '暂无资料' }}
            </p>
          </div>

          <div class="border-t border-wood-dark/30 pt-4">
            <div class="flex items-center gap-1.5 mb-2">
              <span class="text-wood">🪑</span>
              <span class="text-wood text-xs font-bold tracking-wider">常见应用</span>
            </div>
            <ul class="space-y-1.5">
              <li
                v-for="(app, idx) in knowledge?.applications || []"
                :key="idx"
                class="flex items-start gap-2 text-wood-light/80 text-xs leading-relaxed"
              >
                <span class="text-wood/60 mt-0.5 flex-shrink-0">•</span>
                <span>{{ app }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { JOINT_TYPES } from '../models/jointTypes.js'

const props = defineProps({
  jointType: {
    type: String,
    default: 'straight'
  }
})

const expanded = ref(true)

const jointInfo = computed(() => JOINT_TYPES[props.jointType])
const knowledge = computed(() => jointInfo.value?.knowledge)

watch(() => props.jointType, () => {
  if (!expanded.value) {
    expanded.value = true
  }
})
</script>
