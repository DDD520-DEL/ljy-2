<template>
  <div class="w-full h-full flex bg-ink text-white">
    <div class="hidden md:block w-80 lg:w-96 flex-shrink-0 z-10 shadow-2xl">
      <ControlPanel
        :current-type="currentType"
        :params="currentParams"
        :explode-progress="explodeProgress"
        :wireframe-mode="wireframeMode"
        :show-annotations="showAnnotations"
        @select-type="selectType"
        @param-change="updateParam"
        @explode-change="setExplode"
        @toggle-explode="toggleExplode"
        @animate-explode="animateExplode"
        @toggle-wireframe="wireframeMode = !wireframeMode"
        @toggle-annotations="toggleAnnotations"
        @export-bom="showBom = true"
      />
    </div>

    <div ref="canvasContainer" class="flex-1 relative">
      <div class="absolute top-4 left-4 z-20 bg-ink/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-wood/30">
        <div class="text-wood text-sm font-bold tracking-widest">{{ currentJointInfo.name }}</div>
        <div class="text-wood-light/60 text-xs mt-0.5">{{ currentJointInfo.description }}</div>
      </div>

      <div class="absolute bottom-4 left-4 z-20 bg-ink/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-wood/30 text-[11px] text-wood-light/70 leading-relaxed">
        <div>🖱️ 拖动旋转 · 滚轮/双指缩放</div>
        <div>📱 单指旋转 · 双指捏合缩放</div>
      </div>

      <button
        class="absolute top-4 right-4 z-20 md:hidden bg-ink/80 backdrop-blur-sm px-3 py-2 rounded border border-wood/30 text-wood text-sm"
        @click="mobilePanelOpen = !mobilePanelOpen"
      >
        ⚙ 参数
      </button>

      <div v-if="mobilePanelOpen" class="absolute inset-0 z-30 md:hidden">
        <div class="absolute inset-0 bg-black/50" @click="mobilePanelOpen = false"></div>
        <div class="absolute right-0 top-0 bottom-0 w-80">
          <ControlPanel
            :current-type="currentType"
            :params="currentParams"
            :explode-progress="explodeProgress"
            :wireframe-mode="wireframeMode"
            :show-annotations="showAnnotations"
            @select-type="v => { selectType(v); mobilePanelOpen = false }"
            @param-change="updateParam"
            @explode-change="setExplode"
            @toggle-explode="toggleExplode"
            @animate-explode="animateExplode"
            @toggle-wireframe="wireframeMode = !wireframeMode"
            @toggle-annotations="toggleAnnotations"
            @export-bom="showBom = true; mobilePanelOpen = false"
          />
        </div>
      </div>
    </div>

    <BomDialog
      v-if="showBom"
      :components="bomComponents"
      :joint-name="currentJointInfo.name"
      @close="showBom = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive, nextTick } from 'vue'
import { SceneManager } from './utils/SceneManager.js'
import { JOINT_TYPES, INGFA_NAMES } from './models/jointTypes.js'
import ControlPanel from './components/ControlPanel.vue'
import BomDialog from './components/BomDialog.vue'

const canvasContainer = ref(null)
const scene = ref(null)
const currentType = ref('straight')
const explodeProgress = ref(0)
const wireframeMode = ref(true)
const showAnnotations = ref(true)
const showBom = ref(false)
const mobilePanelOpen = ref(false)
const animating = ref(false)

const defaultParams = computed(() => {
  const ps = {}
  for (const p of JOINT_TYPES[currentType.value].params) {
    ps[p.key] = p.default
  }
  return ps
})

const currentParams = reactive({ ...defaultParams.value })

const currentJointInfo = computed(() => JOINT_TYPES[currentType.value])

const bomComponents = computed(() => {
  if (!scene.value) return []
  const raw = scene.value.getComponents()
  const names = INGFA_NAMES[currentType.value] || []
  return raw.map((c, i) => ({
    ...c,
    name: names[i] ? `${names[i].name}（${c.name}）` : c.name
  }))
})

function selectType(type) {
  currentType.value = type
  Object.assign(currentParams, defaultParams.value)
  loadJoint()
}

function updateParam(key, value) {
  currentParams[key] = value
  loadJoint()
}

function setExplode(v) {
  explodeProgress.value = v
  if (scene.value) scene.value.setExplode(v)
}

function toggleExplode() {
  const target = explodeProgress.value > 0 ? 0 : 1
  animateTo(target)
}

function animateExplode() {
  if (animating.value) return
  animating.value = true
  const start = explodeProgress.value
  const end = start > 0.5 ? 0 : 1
  animateTo(end)
}

function animateTo(target) {
  if (animating.value) return
  animating.value = true
  const start = explodeProgress.value
  const duration = 1200
  const t0 = performance.now()
  function step(t) {
    const k = Math.min(1, (t - t0) / duration)
    const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
    explodeProgress.value = start + (target - start) * ease
    if (scene.value) scene.value.setExplode(explodeProgress.value)
    if (k < 1) {
      requestAnimationFrame(step)
    } else {
      animating.value = false
    }
  }
  requestAnimationFrame(step)
}

function toggleAnnotations() {
  showAnnotations.value = !showAnnotations.value
  if (scene.value) scene.value.setShowAnnotations(showAnnotations.value)
}

function loadJoint() {
  if (!scene.value) return
  scene.value.loadJoint(currentType.value, { ...currentParams })
  scene.value.setExplode(explodeProgress.value)
  scene.value.setWireframe(wireframeMode)
  scene.value.setShowAnnotations(showAnnotations.value)
}

watch(wireframeMode, v => {
  if (scene.value) scene.value.setWireframe(v)
})

watch(showAnnotations, v => {
  if (scene.value) scene.value.setShowAnnotations(v)
})

onMounted(async () => {
  await nextTick()
  if (canvasContainer.value) {
    scene.value = new SceneManager(canvasContainer.value)
    loadJoint()
  }
})
</script>
