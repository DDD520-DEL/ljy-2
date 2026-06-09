<template>
  <div class="w-full h-full flex text-white" style="background-color: var(--color-ink);">
    <div class="flex-1 flex flex-col border-r border-wood-dark/40">
      <div class="px-4 py-2 border-b border-wood-dark/40 backdrop-blur-sm flex items-center justify-between" style="background-color: var(--color-ink-alpha-90);">
        <div>
          <div class="text-wood text-sm font-bold tracking-widest">左 · {{ leftJointInfo.name }}</div>
          <div class="text-wood-light/60 text-[10px]">{{ leftJointInfo.description }}</div>
        </div>
        <div class="flex gap-1.5">
          <button
            @click="leftPanelOpen = !leftPanelOpen"
            class="px-2 py-1 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood-dark/50 hover:bg-wood-dark/70 transition-all"
          >
            ⚙ 参数
          </button>
          <button
            @click="swapSides"
            class="px-2 py-1 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood-dark/50 hover:bg-wood-dark/70 transition-all"
            title="交换左右"
          >
            ⇄
          </button>
          <button
            @click="syncFromRight"
            class="px-2 py-1 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood-dark/50 hover:bg-wood-dark/70 transition-all"
            title="从右侧同步"
          >
            ← 同步
          </button>
        </div>
      </div>

      <div ref="leftCanvasContainer" class="flex-1 relative">
        <div class="absolute bottom-2 left-2 z-10 backdrop-blur-sm px-2 py-1 rounded border border-wood/30 text-[10px] text-wood-light/70" style="background-color: var(--color-ink-alpha-80);">
          🖱️ 拖动旋转 · 滚轮缩放
        </div>

        <div v-if="leftPanelOpen" class="absolute inset-0 z-20">
          <div class="absolute inset-0 bg-black/40" @click="leftPanelOpen = false"></div>
          <div class="absolute right-0 top-0 bottom-0 w-72 backdrop-blur-sm overflow-y-auto scrollbar-thin border-l border-wood/30" style="background-color: var(--color-ink-alpha-95);">
            <CompareSidePanel
              :current-type="leftType"
              :params="leftParams"
              :presets="leftPresets"
              :current-preset-id="leftCurrentPresetId"
              :explode-progress="leftExplode"
              :wireframe-mode="leftWireframe"
              :show-annotations="leftAnnotations"
              @select-type="selectLeftType"
              @param-change="updateLeftParam"
              @apply-preset="handleLeftApplyPreset"
              @save-preset="handleLeftSavePreset"
              @delete-preset="handleLeftDeletePreset"
              @explode-change="setLeftExplode"
              @toggle-explode="toggleLeftExplode"
              @animate-explode="animateLeftExplode"
              @toggle-wireframe="leftWireframe = !leftWireframe"
              @toggle-annotations="leftAnnotations = !leftAnnotations"
              @close="leftPanelOpen = false"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="w-1 bg-wood-dark/60 flex-shrink-0"></div>

    <div class="flex-1 flex flex-col border-l border-wood-dark/40">
      <div class="px-4 py-2 border-b border-wood-dark/40 backdrop-blur-sm flex items-center justify-between" style="background-color: var(--color-ink-alpha-90);">
        <div>
          <div class="text-wood text-sm font-bold tracking-widest">右 · {{ rightJointInfo.name }}</div>
          <div class="text-wood-light/60 text-[10px]">{{ rightJointInfo.description }}</div>
        </div>
        <div class="flex gap-1.5">
          <button
            @click="syncFromLeft"
            class="px-2 py-1 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood-dark/50 hover:bg-wood-dark/70 transition-all"
            title="从左侧同步"
          >
            同步 →
          </button>
          <button
            @click="rightPanelOpen = !rightPanelOpen"
            class="px-2 py-1 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood-dark/50 hover:bg-wood-dark/70 transition-all"
          >
            ⚙ 参数
          </button>
        </div>
      </div>

      <div ref="rightCanvasContainer" class="flex-1 relative">
        <div class="absolute bottom-2 left-2 z-10 backdrop-blur-sm px-2 py-1 rounded border border-wood/30 text-[10px] text-wood-light/70" style="background-color: var(--color-ink-alpha-80);">
          🖱️ 拖动旋转 · 滚轮缩放
        </div>

        <div v-if="rightPanelOpen" class="absolute inset-0 z-20">
          <div class="absolute inset-0 bg-black/40" @click="rightPanelOpen = false"></div>
          <div class="absolute left-0 top-0 bottom-0 w-72 backdrop-blur-sm overflow-y-auto scrollbar-thin border-r border-wood/30" style="background-color: var(--color-ink-alpha-95);">
            <CompareSidePanel
              :current-type="rightType"
              :params="rightParams"
              :presets="rightPresets"
              :current-preset-id="rightCurrentPresetId"
              :explode-progress="rightExplode"
              :wireframe-mode="rightWireframe"
              :show-annotations="rightAnnotations"
              @select-type="selectRightType"
              @param-change="updateRightParam"
              @apply-preset="handleRightApplyPreset"
              @save-preset="handleRightSavePreset"
              @delete-preset="handleRightDeletePreset"
              @explode-change="setRightExplode"
              @toggle-explode="toggleRightExplode"
              @animate-explode="animateRightExplode"
              @toggle-wireframe="rightWireframe = !rightWireframe"
              @toggle-annotations="rightAnnotations = !rightAnnotations"
              @close="rightPanelOpen = false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, reactive, nextTick } from 'vue'
import { SceneManager } from '../utils/SceneManager.js'
import { JOINT_TYPES } from '../models/jointTypes.js'
import {
  getAllPresets,
  saveCustomPreset,
  deleteCustomPreset,
  presetNameExists
} from '../utils/presetManager.js'
import CompareSidePanel from './CompareSidePanel.vue'

const emit = defineEmits(['exit-compare'])

const leftCanvasContainer = ref(null)
const rightCanvasContainer = ref(null)
const leftScene = ref(null)
const rightScene = ref(null)

const leftPanelOpen = ref(false)
const rightPanelOpen = ref(false)

const leftType = ref('straight')
const rightType = ref('dovetail')
const leftExplode = ref(0)
const rightExplode = ref(0)
const leftWireframe = ref(true)
const rightWireframe = ref(true)
const leftAnnotations = ref(true)
const rightAnnotations = ref(true)

const leftAnimating = ref(false)
const rightAnimating = ref(false)
const leftPresets = ref([])
const rightPresets = ref([])
const leftCurrentPresetId = ref(null)
const rightCurrentPresetId = ref(null)

function createDefaultParams(type) {
  const ps = {}
  for (const p of JOINT_TYPES[type].params) {
    ps[p.key] = p.default
  }
  return ps
}

const leftParams = reactive(createDefaultParams(leftType.value))
const rightParams = reactive(createDefaultParams(rightType.value))

const leftJointInfo = computed(() => JOINT_TYPES[leftType.value])
const rightJointInfo = computed(() => JOINT_TYPES[rightType.value])

function selectLeftType(type) {
  leftType.value = type
  Object.assign(leftParams, createDefaultParams(type))
  leftPresets.value = getAllPresets(type)
  leftCurrentPresetId.value = null
  loadLeftJoint()
}

function selectRightType(type) {
  rightType.value = type
  Object.assign(rightParams, createDefaultParams(type))
  rightPresets.value = getAllPresets(type)
  rightCurrentPresetId.value = null
  loadRightJoint()
}

function updateLeftParam(key, value) {
  leftParams[key] = value
  leftCurrentPresetId.value = null
  loadLeftJoint()
}

function updateRightParam(key, value) {
  rightParams[key] = value
  rightCurrentPresetId.value = null
  loadRightJoint()
}

function handleLeftApplyPreset(preset) {
  if (!preset || !preset.params) return
  Object.assign(leftParams, preset.params)
  leftCurrentPresetId.value = preset.id
  loadLeftJoint()
}

function handleRightApplyPreset(preset) {
  if (!preset || !preset.params) return
  Object.assign(rightParams, preset.params)
  rightCurrentPresetId.value = preset.id
  loadRightJoint()
}

function handleLeftSavePreset(name, description, onSuccess, onError) {
  if (presetNameExists(leftType.value, name)) {
    onError && onError('预设名称已存在')
    return
  }
  const result = saveCustomPreset(leftType.value, name, { ...leftParams }, description)
  if (result.success) {
    leftPresets.value = getAllPresets(leftType.value)
    leftCurrentPresetId.value = result.preset.id
    rightPresets.value = getAllPresets(rightType.value)
    onSuccess && onSuccess()
  } else {
    onError && onError(result.error || '保存失败')
  }
}

function handleRightSavePreset(name, description, onSuccess, onError) {
  if (presetNameExists(rightType.value, name)) {
    onError && onError('预设名称已存在')
    return
  }
  const result = saveCustomPreset(rightType.value, name, { ...rightParams }, description)
  if (result.success) {
    rightPresets.value = getAllPresets(rightType.value)
    rightCurrentPresetId.value = result.preset.id
    leftPresets.value = getAllPresets(leftType.value)
    onSuccess && onSuccess()
  } else {
    onError && onError(result.error || '保存失败')
  }
}

function handleLeftDeletePreset(presetId, onSuccess) {
  const result = deleteCustomPreset(leftType.value, presetId)
  if (result.success) {
    if (leftCurrentPresetId.value === presetId) {
      leftCurrentPresetId.value = null
    }
    leftPresets.value = getAllPresets(leftType.value)
    rightPresets.value = getAllPresets(rightType.value)
    onSuccess && onSuccess()
  }
}

function handleRightDeletePreset(presetId, onSuccess) {
  const result = deleteCustomPreset(rightType.value, presetId)
  if (result.success) {
    if (rightCurrentPresetId.value === presetId) {
      rightCurrentPresetId.value = null
    }
    rightPresets.value = getAllPresets(rightType.value)
    leftPresets.value = getAllPresets(leftType.value)
    onSuccess && onSuccess()
  }
}

function setLeftExplode(v) {
  leftExplode.value = v
  if (leftScene.value) leftScene.value.setExplode(v)
}

function setRightExplode(v) {
  rightExplode.value = v
  if (rightScene.value) rightScene.value.setExplode(v)
}

function toggleLeftExplode() {
  animateLeftTo(leftExplode.value > 0 ? 0 : 1)
}

function toggleRightExplode() {
  animateRightTo(rightExplode.value > 0 ? 0 : 1)
}

function animateLeftExplode() {
  if (leftAnimating.value) return
  animateLeftTo(leftExplode.value > 0.5 ? 0 : 1)
}

function animateRightExplode() {
  if (rightAnimating.value) return
  animateRightTo(rightExplode.value > 0.5 ? 0 : 1)
}

function animateLeftTo(target) {
  if (leftAnimating.value) return
  leftAnimating.value = true
  const start = leftExplode.value
  const duration = 1200
  const t0 = performance.now()
  function step(t) {
    const k = Math.min(1, (t - t0) / duration)
    const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
    leftExplode.value = start + (target - start) * ease
    if (leftScene.value) leftScene.value.setExplode(leftExplode.value)
    if (k < 1) {
      requestAnimationFrame(step)
    } else {
      leftAnimating.value = false
    }
  }
  requestAnimationFrame(step)
}

function animateRightTo(target) {
  if (rightAnimating.value) return
  rightAnimating.value = true
  const start = rightExplode.value
  const duration = 1200
  const t0 = performance.now()
  function step(t) {
    const k = Math.min(1, (t - t0) / duration)
    const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
    rightExplode.value = start + (target - start) * ease
    if (rightScene.value) rightScene.value.setExplode(rightExplode.value)
    if (k < 1) {
      requestAnimationFrame(step)
    } else {
      rightAnimating.value = false
    }
  }
  requestAnimationFrame(step)
}

function loadLeftJoint() {
  if (!leftScene.value) return
  leftScene.value.loadJoint(leftType.value, { ...leftParams })
  leftScene.value.setExplode(leftExplode.value)
  leftScene.value.setWireframe(leftWireframe.value)
  leftScene.value.setShowAnnotations(leftAnnotations.value)
}

function loadRightJoint() {
  if (!rightScene.value) return
  rightScene.value.loadJoint(rightType.value, { ...rightParams })
  rightScene.value.setExplode(rightExplode.value)
  rightScene.value.setWireframe(rightWireframe.value)
  rightScene.value.setShowAnnotations(rightAnnotations.value)
}

function swapSides() {
  const tmpType = leftType.value
  const tmpParams = { ...leftParams }
  const tmpExplode = leftExplode.value
  const tmpWireframe = leftWireframe.value
  const tmpAnnotations = leftAnnotations.value
  const tmpPresets = leftPresets.value
  const tmpPresetId = leftCurrentPresetId.value

  leftType.value = rightType.value
  Object.assign(leftParams, rightParams)
  leftExplode.value = rightExplode.value
  leftWireframe.value = rightWireframe.value
  leftAnnotations.value = rightAnnotations.value
  leftPresets.value = rightPresets.value
  leftCurrentPresetId.value = rightCurrentPresetId.value

  rightType.value = tmpType
  Object.assign(rightParams, tmpParams)
  rightExplode.value = tmpExplode
  rightWireframe.value = tmpWireframe
  rightAnnotations.value = tmpAnnotations
  rightPresets.value = tmpPresets
  rightCurrentPresetId.value = tmpPresetId

  loadLeftJoint()
  loadRightJoint()
}

function syncFromLeft() {
  rightType.value = leftType.value
  Object.assign(rightParams, leftParams)
  rightExplode.value = leftExplode.value
  rightWireframe.value = leftWireframe.value
  rightAnnotations.value = leftAnnotations.value
  rightPresets.value = getAllPresets(rightType.value)
  rightCurrentPresetId.value = leftCurrentPresetId.value
  loadRightJoint()
}

function syncFromRight() {
  leftType.value = rightType.value
  Object.assign(leftParams, rightParams)
  leftExplode.value = rightExplode.value
  leftWireframe.value = rightWireframe.value
  leftAnnotations.value = rightAnnotations.value
  leftPresets.value = getAllPresets(leftType.value)
  leftCurrentPresetId.value = rightCurrentPresetId.value
  loadLeftJoint()
}

watch(leftWireframe, v => {
  if (leftScene.value) leftScene.value.setWireframe(v)
})

watch(rightWireframe, v => {
  if (rightScene.value) rightScene.value.setWireframe(v)
})

watch(leftAnnotations, v => {
  if (leftScene.value) leftScene.value.setShowAnnotations(v)
})

watch(rightAnnotations, v => {
  if (rightScene.value) rightScene.value.setShowAnnotations(v)
})

onMounted(async () => {
  await nextTick()
  leftPresets.value = getAllPresets(leftType.value)
  rightPresets.value = getAllPresets(rightType.value)
  if (leftCanvasContainer.value) {
    leftScene.value = new SceneManager(leftCanvasContainer.value)
    loadLeftJoint()
  }
  if (rightCanvasContainer.value) {
    rightScene.value = new SceneManager(rightCanvasContainer.value)
    loadRightJoint()
  }
})

onBeforeUnmount(() => {
  if (leftScene.value) leftScene.value.dispose()
  if (rightScene.value) rightScene.value.dispose()
})
</script>
