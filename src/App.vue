<template>
  <div class="w-full h-full flex bg-ink text-white">
    <template v-if="viewMode === 'single'">
      <div class="hidden md:block w-80 lg:w-96 flex-shrink-0 z-10 shadow-2xl">
        <ControlPanel
          :current-type="currentType"
          :params="currentParams"
          :explode-progress="explodeProgress"
          :wireframe-mode="wireframeMode"
          :show-annotations="showAnnotations"
          :projects="projects"
          :current-project-id="currentProjectId"
          @select-type="selectType"
          @param-change="updateParam"
          @explode-change="setExplode"
          @toggle-explode="toggleExplode"
          @animate-explode="animateExplode"
          @toggle-wireframe="wireframeMode = !wireframeMode"
          @toggle-annotations="toggleAnnotations"
          @export-bom="showBom = true"
          @save-project="handleSaveProject"
          @load-project="handleLoadProject"
          @delete-project="handleDeleteProject"
          @rename-project="handleRenameProject"
          @refresh-projects="refreshProjects"
        />
      </div>

      <div ref="canvasContainer" class="flex-1 relative">
        <div class="absolute top-4 left-4 z-20 bg-ink/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-wood/30">
          <div class="text-wood text-sm font-bold tracking-widest">{{ currentJointInfo.name }}</div>
          <div class="text-wood-light/60 text-xs mt-0.5">{{ currentJointInfo.description }}</div>
        </div>

        <div class="absolute top-4 right-4 z-20 flex gap-2">
          <div class="flex bg-ink/80 backdrop-blur-sm rounded-lg border border-wood/30 overflow-hidden">
            <button
              @click="viewMode = 'single'"
              class="px-3 py-2 text-xs font-bold tracking-wider bg-wood text-white"
            >
              单视图
            </button>
            <button
              @click="viewMode = 'compare'"
              class="px-3 py-2 text-xs tracking-wider text-wood-light hover:bg-wood-dark/50 transition-all"
            >
              ⇄ 对比
            </button>
          </div>
        </div>

        <div class="absolute bottom-4 left-4 z-20 bg-ink/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-wood/30 text-[11px] text-wood-light/70 leading-relaxed">
          <div>🖱️ 拖动旋转 · 滚轮/双指缩放</div>
          <div>📱 单指旋转 · 双指捏合缩放</div>
        </div>

        <button
          class="absolute bottom-4 right-4 z-20 bg-ink/80 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-wood/30 text-wood text-sm hover:bg-ink hover:border-wood/60 transition-all flex items-center gap-2 shadow-lg"
          @click="historyPanelOpen = true"
        >
          <span>📜</span>
          <span class="tracking-wider font-bold">历史记录</span>
          <span v-if="historyList.length > 1" class="bg-wood text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {{ historyList.length }}
          </span>
        </button>

        <button
          class="absolute top-4 right-4 z-20 md:hidden bg-ink/80 backdrop-blur-sm px-3 py-2 rounded border border-wood/30 text-wood text-sm mt-10"
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
              :projects="projects"
              :current-project-id="currentProjectId"
              @select-type="v => { selectType(v); mobilePanelOpen = false }"
              @param-change="updateParam"
              @explode-change="setExplode"
              @toggle-explode="toggleExplode"
              @animate-explode="animateExplode"
              @toggle-wireframe="wireframeMode = !wireframeMode"
              @toggle-annotations="toggleAnnotations"
              @export-bom="showBom = true; mobilePanelOpen = false"
              @save-project="handleSaveProject"
              @load-project="id => { handleLoadProject(id); mobilePanelOpen = false }"
              @delete-project="handleDeleteProject"
              @rename-project="handleRenameProject"
              @refresh-projects="refreshProjects"
            />
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="w-full h-full flex flex-col">
        <div class="px-4 py-2 border-b border-wood-dark/40 bg-ink/90 backdrop-blur-sm flex items-center justify-between flex-shrink-0">
          <div class="text-wood text-sm font-bold tracking-widest">
            ⇄ 并排对比模式
          </div>
          <div class="flex gap-2">
            <div class="flex bg-ink/80 backdrop-blur-sm rounded-lg border border-wood/30 overflow-hidden">
              <button
                @click="viewMode = 'single'"
                class="px-3 py-1.5 text-xs tracking-wider text-wood-light hover:bg-wood-dark/50 transition-all"
              >
                单视图
              </button>
              <button
                @click="viewMode = 'compare'"
                class="px-3 py-1.5 text-xs font-bold tracking-wider bg-wood text-white"
              >
                ⇄ 对比
              </button>
            </div>
            <button
              @click="viewMode = 'single'"
              class="px-3 py-1.5 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood-dark/50 hover:bg-wood-dark/70 transition-all"
            >
              ✕ 退出对比
            </button>
          </div>
        </div>
        <div class="flex-1 min-h-0">
          <CompareView v-if="viewMode === 'compare'" @exit-compare="viewMode = 'single'" />
        </div>
      </div>
    </template>

    <BomDialog
      v-if="showBom"
      :components="bomComponents"
      :joint-name="currentJointInfo.name"
      :project-name="currentProjectName"
      @close="showBom = false"
    />

    <HistoryPanel
      :open="historyPanelOpen"
      :history="historyList"
      :current-index="historyIndex"
      @close="historyPanelOpen = false"
      @undo="undoHistory"
      @reset-default="resetToDefault"
      @goto="gotoHistory"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive, nextTick } from 'vue'
import { SceneManager } from './utils/SceneManager.js'
import { JOINT_TYPES, INGFA_NAMES } from './models/jointTypes.js'
import {
  listProjects,
  saveProject,
  loadProject,
  deleteProject,
  renameProject
} from './utils/projectManager.js'
import ControlPanel from './components/ControlPanel.vue'
import BomDialog from './components/BomDialog.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import CompareView from './components/CompareView.vue'

const viewMode = ref('single')
const canvasContainer = ref(null)
const scene = ref(null)
const currentType = ref('straight')
const explodeProgress = ref(0)
const wireframeMode = ref(true)
const showAnnotations = ref(true)
const showBom = ref(false)
const mobilePanelOpen = ref(false)
const animating = ref(false)
const projects = ref([])
const currentProjectId = ref(null)
const historyPanelOpen = ref(false)
const historyList = ref([])
const historyIndex = ref(-1)
const isRestoringHistory = ref(false)

const defaultParams = computed(() => {
  const ps = {}
  for (const p of JOINT_TYPES[currentType.value].params) {
    ps[p.key] = p.default
  }
  return ps
})

const currentParams = reactive({ ...defaultParams.value })

const currentJointInfo = computed(() => JOINT_TYPES[currentType.value])

const currentProjectName = computed(() => {
  if (currentProjectId.value) {
    const p = projects.value.find(x => x.id === currentProjectId.value)
    if (p) return p.name
  }
  return ''
})

const bomComponents = computed(() => {
  if (!scene.value) return []
  const raw = scene.value.getComponents()
  const names = INGFA_NAMES[currentType.value] || []
  return raw.map((c, i) => ({
    ...c,
    name: names[i] ? `${names[i].name}（${c.name}）` : c.name
  }))
})

function getStateSnapshot() {
  return {
    type: currentType.value,
    params: { ...currentParams },
    explodeProgress: explodeProgress.value,
    wireframeMode: wireframeMode.value,
    showAnnotations: showAnnotations.value
  }
}

function addHistory(label, type, detail = '') {
  if (isRestoringHistory.value) return
  const snapshot = getStateSnapshot()
  const newItem = {
    id: Date.now() + Math.random(),
    label,
    type,
    detail,
    timestamp: Date.now(),
    state: snapshot
  }
  if (historyIndex.value < historyList.value.length - 1) {
    historyList.value = historyList.value.slice(0, historyIndex.value + 1)
  }
  historyList.value.push(newItem)
  historyIndex.value = historyList.value.length - 1
}

function restoreState(state) {
  isRestoringHistory.value = true
  try {
    if (state.type) {
      currentType.value = state.type
    }
    if (state.params) {
      Object.assign(currentParams, state.params)
    }
    if (typeof state.explodeProgress === 'number') {
      explodeProgress.value = state.explodeProgress
    }
    if (typeof state.wireframeMode === 'boolean') {
      wireframeMode.value = state.wireframeMode
    }
    if (typeof state.showAnnotations === 'boolean') {
      showAnnotations.value = state.showAnnotations
    }
    loadJoint()
  } finally {
    setTimeout(() => {
      isRestoringHistory.value = false
    }, 0)
  }
}

function gotoHistory(index) {
  if (index < 0 || index >= historyList.value.length) return
  const item = historyList.value[index]
  if (item && item.state) {
    historyIndex.value = index
    restoreState(item.state)
  }
}

function undoHistory() {
  if (historyIndex.value > 0) {
    gotoHistory(historyIndex.value - 1)
  }
}

function resetToDefault() {
  if (historyList.value.length > 0 && historyList.value[0]) {
    historyIndex.value = 0
    restoreState(historyList.value[0].state)
  }
}

function selectType(type) {
  const oldType = currentType.value
  currentType.value = type
  Object.assign(currentParams, defaultParams.value)
  loadJoint()
  const typeName = JOINT_TYPES[type]?.name || type
  addHistory(`切换为「${typeName}」`, 'select-type', `从「${JOINT_TYPES[oldType]?.name || oldType}」切换`)
}

function updateParam(key, value) {
  currentParams[key] = value
  loadJoint()
  const paramDef = JOINT_TYPES[currentType.value]?.params?.find(p => p.key === key)
  const paramName = paramDef?.name || key
  const unit = paramDef?.unit || ''
  const formattedVal = Number.isInteger(value) ? value : value.toFixed(2)
  addHistory(`调整 ${paramName}`, 'param-change', `${formattedVal}${unit}`)
}

function setExplode(v) {
  explodeProgress.value = v
  if (scene.value) scene.value.setExplode(v)
  debouncedAddExplodeHistory(v)
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
      addHistory(`调整拆解进度`, 'explode-change', `${Math.round(target * 100)}%`)
    }
  }
  requestAnimationFrame(step)
}

function toggleAnnotations() {
  showAnnotations.value = !showAnnotations.value
  if (scene.value) scene.value.setShowAnnotations(showAnnotations.value)
  addHistory(showAnnotations.value ? '显示标注' : '隐藏标注', 'toggle-annotations')
}

let explodeDebounceTimer = null
function debouncedAddExplodeHistory(v) {
  if (explodeDebounceTimer) clearTimeout(explodeDebounceTimer)
  explodeDebounceTimer = setTimeout(() => {
    addHistory(`调整拆解进度`, 'explode-change', `${Math.round(v * 100)}%`)
  }, 300)
}

function loadJoint() {
  if (!scene.value) return
  scene.value.loadJoint(currentType.value, { ...currentParams })
  scene.value.setExplode(explodeProgress.value)
  scene.value.setWireframe(wireframeMode)
  scene.value.setShowAnnotations(showAnnotations.value)
}

function refreshProjects() {
  projects.value = listProjects()
}

function handleSaveProject(name, onSuccess, onError) {
  const data = {
    type: currentType.value,
    params: { ...currentParams },
    explodeProgress: explodeProgress.value,
    wireframeMode: wireframeMode.value,
    showAnnotations: showAnnotations.value
  }
  const result = saveProject(name, data)
  if (result.success) {
    currentProjectId.value = result.project.id
    refreshProjects()
    onSuccess && onSuccess()
  } else {
    onError && onError(result.error)
  }
}

function handleLoadProject(id) {
  const project = loadProject(id)
  if (!project) return
  const d = project.data || {}
  if (d.type) {
    currentType.value = d.type
    const defs = {}
    for (const p of JOINT_TYPES[d.type].params) {
      defs[p.key] = p.default
    }
    Object.assign(currentParams, { ...defs, ...(d.params || {}) })
  }
  if (typeof d.explodeProgress === 'number') {
    explodeProgress.value = d.explodeProgress
  }
  if (typeof d.wireframeMode === 'boolean') {
    wireframeMode.value = d.wireframeMode
  }
  if (typeof d.showAnnotations === 'boolean') {
    showAnnotations.value = d.showAnnotations
  }
  currentProjectId.value = project.id
  loadJoint()
  addHistory(`加载项目「${project.name}」`, 'load-project')
}

function handleDeleteProject(id, onSuccess) {
  const result = deleteProject(id)
  if (result.success) {
    if (currentProjectId.value === id) {
      currentProjectId.value = null
    }
    onSuccess && onSuccess()
  }
}

function handleRenameProject(id, newName, onSuccess, onError) {
  const result = renameProject(id, newName)
  if (result.success) {
    refreshProjects()
    onSuccess && onSuccess()
  } else {
    onError && onError(result.error)
  }
}

watch(wireframeMode, v => {
  if (scene.value) scene.value.setWireframe(v)
  if (!isRestoringHistory.value) {
    addHistory(v ? '切换为线框模式' : '切换为实体模式', 'toggle-wireframe')
  }
})

watch(showAnnotations, v => {
  if (scene.value) scene.value.setShowAnnotations(v)
})

onMounted(async () => {
  await nextTick()
  refreshProjects()
  if (canvasContainer.value) {
    scene.value = new SceneManager(canvasContainer.value)
    loadJoint()
  }
  nextTick(() => {
    const initItem = {
      id: Date.now(),
      label: '初始默认状态',
      type: 'init',
      detail: '刚打开时的默认状态',
      timestamp: Date.now(),
      state: getStateSnapshot()
    }
    historyList.value = [initItem]
    historyIndex.value = 0
  })
})
</script>
