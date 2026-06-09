<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-[9999]">
      <div
        class="absolute inset-0 bg-black/60 pointer-events-none"
        :style="{
          clipPath: highlightRect
            ? `polygon(
                0% 0%, 0% 100%,
                ${highlightRect.left}px 100%, ${highlightRect.left}px ${highlightRect.top}px,
                ${highlightRect.right}px ${highlightRect.top}px, ${highlightRect.right}px ${highlightRect.bottom}px,
                ${highlightRect.left}px ${highlightRect.bottom}px, ${highlightRect.left}px 100%,
                100% 100%, 100% 0%
              )`
            : 'none'
        }"
      ></div>

      <div
        v-if="highlightRect"
        class="absolute pointer-events-none border-2 border-wood rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] transition-all duration-300 ease-out"
        :style="{
          left: highlightRect.left + 'px',
          top: highlightRect.top + 'px',
          width: highlightRect.width + 'px',
          height: highlightRect.height + 'px'
        }"
      ></div>

      <div
        v-if="currentStep"
        class="absolute z-10 max-w-xs transition-all duration-300 ease-out"
        :style="tooltipStyle"
      >
        <div
          class="relative rounded-xl border border-wood/40 p-5 shadow-2xl font-song"
          style="background-color: var(--color-ink);"
        >
          <div
            class="absolute w-3 h-3 bg-wood-dark/50 border-l border-t border-wood/40"
            :class="arrowClass"
          ></div>

          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] text-wood/60 font-mono tracking-wider">
              步骤 {{ currentStepIndex + 1 }} / {{ steps.length }}
            </span>
            <span class="text-wood text-base font-bold">
              {{ currentStep.icon || '💡' }}
            </span>
          </div>

          <h3 class="text-wood text-lg font-bold mb-2 tracking-wide">
            {{ currentStep.title }}
          </h3>
          <p class="text-wood-light/80 text-sm leading-relaxed mb-5">
            {{ currentStep.description }}
          </p>

          <div class="flex items-center justify-between">
            <button
              v-if="currentStepIndex > 0"
              @click="prevStep"
              class="px-3 py-1.5 text-xs bg-wood-dark/50 text-wood-light/80 rounded border border-wood-dark/50 hover:bg-wood-dark/70 transition-all tracking-wider"
            >
              ← 上一步
            </button>
            <div v-else></div>

            <div class="flex gap-2">
              <button
                @click="handleSkip"
                class="px-3 py-1.5 text-xs text-wood-light/50 hover:text-wood-light/80 transition-all tracking-wider"
              >
                跳过
              </button>
              <button
                v-if="currentStepIndex < steps.length - 1"
                @click="nextStep"
                class="px-4 py-1.5 text-xs bg-wood text-white rounded border border-wood-light hover:bg-wood-dark transition-all tracking-wider font-bold"
              >
                下一步 →
              </button>
              <button
                v-else
                @click="handleFinish"
                class="px-4 py-1.5 text-xs bg-wood text-white rounded border border-wood-light hover:bg-wood-dark transition-all tracking-wider font-bold"
              >
                完成 ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  steps: { type: Array, default: () => [] },
  startIndex: { type: Number, default: 0 }
})

const emit = defineEmits(['skip', 'finish', 'step-change'])

const currentStepIndex = ref(0)
const highlightRect = ref(null)
const updateTimer = ref(null)

const currentStep = computed(() => props.steps[currentStepIndex.value] || null)

const arrowClass = computed(() => {
  const pos = currentStep.value?.position || 'right'
  const base = 'transform rotate-45'
  switch (pos) {
    case 'right':
      return `${base} -left-1.5 top-6`
    case 'left':
      return `${base} -right-1.5 top-6 rotate-[225deg]`
    case 'bottom':
      return `${base} -top-1.5 left-6 rotate-[135deg]`
    case 'top':
      return `${base} -bottom-1.5 left-6 -rotate-45`
    default:
      return `${base} -left-1.5 top-6`
  }
})

const tooltipStyle = computed(() => {
  if (!highlightRect.value || !currentStep.value) return {}
  const pos = currentStep.value.position || 'right'
  const gap = 16
  const tooltipWidth = 300
  const tooltipHeight = 200
  let left = 0
  let top = 0

  const rect = highlightRect.value
  switch (pos) {
    case 'right':
      left = rect.right + gap
      top = rect.top
      break
    case 'left':
      left = rect.left - tooltipWidth - gap
      top = rect.top
      break
    case 'bottom':
      left = rect.left
      top = rect.bottom + gap
      break
    case 'top':
      left = rect.left
      top = rect.top - tooltipHeight - gap
      break
  }

  const viewportW = window.innerWidth
  const viewportH = window.innerHeight
  if (left + tooltipWidth > viewportW - 16) {
    left = viewportW - tooltipWidth - 16
  }
  if (left < 16) left = 16
  if (top + tooltipHeight > viewportH - 16) {
    top = viewportH - tooltipHeight - 16
  }
  if (top < 16) top = 16

  return {
    left: left + 'px',
    top: top + 'px',
    width: tooltipWidth + 'px'
  }
})

function updateHighlight() {
  if (!props.visible || !currentStep.value) {
    highlightRect.value = null
    return
  }
  const selector = currentStep.value.target
  let el = null
  if (typeof selector === 'string') {
    el = document.querySelector(selector)
  } else if (selector instanceof HTMLElement) {
    el = selector
  } else if (selector && selector.$el) {
    el = selector.$el
  }
  if (el) {
    const r = el.getBoundingClientRect()
    highlightRect.value = {
      top: r.top - 4,
      left: r.left - 4,
      right: r.right + 4,
      bottom: r.bottom + 4,
      width: r.width + 8,
      height: r.height + 8
    }
  } else {
    highlightRect.value = null
  }
}

function nextStep() {
  if (currentStepIndex.value < props.steps.length - 1) {
    currentStepIndex.value++
    emit('step-change', currentStepIndex.value)
    nextTick(updateHighlight)
  }
}

function prevStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
    emit('step-change', currentStepIndex.value)
    nextTick(updateHighlight)
  }
}

function handleSkip() {
  emit('skip')
}

function handleFinish() {
  emit('finish')
}

function handleResize() {
  updateHighlight()
}

watch(() => props.visible, (v) => {
  if (v) {
    currentStepIndex.value = props.startIndex || 0
    nextTick(() => {
      updateHighlight()
      updateTimer.value = setInterval(updateHighlight, 500)
    })
  } else {
    highlightRect.value = null
    if (updateTimer.value) {
      clearInterval(updateTimer.value)
      updateTimer.value = null
    }
  }
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleResize, true)
  if (props.visible) {
    nextTick(updateHighlight)
    updateTimer.value = setInterval(updateHighlight, 500)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleResize, true)
  if (updateTimer.value) {
    clearInterval(updateTimer.value)
    updateTimer.value = null
  }
})
</script>
