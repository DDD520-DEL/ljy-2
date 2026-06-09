<template>
  <div class="w-full h-full flex bg-ink text-white">
    <template v-if="viewMode === 'single'">
      <div class="hidden md:block w-80 lg:w-96 flex-shrink-0 z-10 shadow-2xl">
        <ControlPanel
          :current-type="currentType"
          :params="currentParams"
          :presets="presets"
          :current-preset-id="currentPresetId"
          :explode-progress="explodeProgress"
          :wireframe-mode="wireframeMode"
          :show-annotations="showAnnotations"
          :projects="projects"
          :current-project-id="currentProjectId"
          :user="auth.state.user"
          :cloud-projects="cloudProjects"
          :sync-loading="syncLoading"
          :is-recording="isRecording"
          :recording-info="recordingInfo"
          @select-type="selectType"
          @param-change="updateParam"
          @apply-preset="handleApplyPreset"
          @save-preset="handleSavePreset"
          @delete-preset="handleDeletePreset"
          @explode-change="setExplode"
          @toggle-explode="toggleExplode"
          @animate-explode="animateExplode"
          @toggle-wireframe="wireframeMode = !wireframeMode"
          @toggle-annotations="toggleAnnotations"
          @export-bom="showBom = true"
          @export-stl-all="handleExportSTLAll"
          @export-stl-separate="handleExportSTLSeparate"
          @save-project="handleSaveProject"
          @load-project="handleLoadProject"
          @delete-project="handleDeleteProject"
          @rename-project="handleRenameProject"
          @refresh-projects="refreshProjects"
          @refresh-cloud="refreshCloudProjects"
          @upload-to-cloud="handleUploadToCloud"
          @download-from-cloud="handleDownloadFromCloud"
          @logout="handleLogout"
          @go-login="goLogin"
          @start-recording="handleStartRecording"
          @stop-recording="handleStopRecording"
          @export-animation-gif="handleExportGIF"
          @export-animation-video="handleExportVideo"
          @open-share="handleOpenShare"
        />
      </div>

      <div ref="canvasContainer" class="flex-1 relative">
        <div class="absolute top-4 left-4 z-20 bg-ink/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-wood/30">
          <div class="text-wood text-sm font-bold tracking-widest">{{ currentJointInfo.name }}</div>
          <div class="text-wood-light/60 text-xs mt-0.5">{{ currentJointInfo.description }}</div>
        </div>

        <div class="absolute top-4 right-4 z-20 hidden md:flex items-start gap-2">
          <div class="flex bg-ink/80 backdrop-blur-sm rounded-lg border border-wood/30 overflow-hidden mt-1">
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
          <KnowledgeCard :joint-type="currentType" />
        </div>

        <div class="absolute top-4 right-4 z-20 md:hidden">
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

        <div class="absolute bottom-14 left-4 z-20 bg-ink/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-wood/30 text-[11px] text-wood-light/70 leading-relaxed">
          <div>🖱️ 拖动旋转 · 滚轮/双指缩放</div>
          <div>📱 单指旋转 · 双指捏合缩放</div>
          <div class="text-wood/60 mt-1 pt-1 border-t border-wood-dark/30">⌨️ 按 <span class="text-wood font-bold">?</span> 查看所有快捷键</div>
        </div>

        <div class="absolute bottom-14 right-4 z-20 flex flex-col items-end gap-2">
          <div class="flex bg-ink/80 backdrop-blur-sm rounded-lg border border-wood/30 overflow-hidden shadow-lg">
            <button
              class="px-3 py-2 text-xs tracking-wider text-wood-light hover:bg-wood-dark/50 transition-all border-r border-wood-dark/40"
              @click="handleViewPreset('front')"
              title="正视 (Front)"
            >
              正视
            </button>
            <button
              class="px-3 py-2 text-xs tracking-wider text-wood-light hover:bg-wood-dark/50 transition-all border-r border-wood-dark/40"
              @click="handleViewPreset('side')"
              title="侧视 (Side)"
            >
              侧视
            </button>
            <button
              class="px-3 py-2 text-xs tracking-wider text-wood-light hover:bg-wood-dark/50 transition-all border-r border-wood-dark/40"
              @click="handleViewPreset('top')"
              title="俯视 (Top)"
            >
              俯视
            </button>
            <button
              class="px-3 py-2 text-xs tracking-wider text-wood-light hover:bg-wood-dark/50 transition-all border-r border-wood-dark/40"
              @click="handleViewPreset('isometric')"
              title="45°等轴测 (Isometric)"
            >
              45°等轴
            </button>
            <button
              class="px-3 py-2 text-xs tracking-wider text-wood hover:bg-wood-dark/50 transition-all font-bold"
              @click="handleResetView"
              title="重置视角"
            >
              ↺ 重置
            </button>
          </div>
          <div class="flex gap-2">
            <button
              class="bg-ink/80 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-wood/30 text-wood text-sm hover:bg-ink hover:border-wood/60 transition-all flex items-center gap-2 shadow-lg"
              @click="shortcutsPanelOpen = true"
              title="键盘快捷键 (按 ? 呼出)"
            >
              <span>⌨️</span>
              <span class="tracking-wider font-bold">快捷键</span>
            </button>
            <button
              class="bg-ink/80 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-wood/30 text-wood text-sm hover:bg-ink hover:border-wood/60 transition-all flex items-center gap-2 shadow-lg"
              @click="historyPanelOpen = true"
            >
              <span>📜</span>
              <span class="tracking-wider font-bold">历史记录</span>
              <span v-if="historyList.length > 1" class="bg-wood text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {{ historyList.length }}
              </span>
            </button>
          </div>
        </div>

        <div
          v-if="isRecording"
          class="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-red-600/90 backdrop-blur-sm px-5 py-2 rounded-full border border-red-400 text-white text-sm shadow-2xl flex items-center gap-2 animate-pulse"
        >
          <span class="w-3 h-3 bg-white rounded-full animate-ping"></span>
          <span class="font-bold tracking-wider">录制中</span>
          <span class="text-red-200 text-xs font-mono">
            {{ recordingInfo.frameCount }} 帧 · {{ recordingInfo.duration.toFixed(1) }}s
          </span>
        </div>

        <button
          class="absolute top-4 right-4 z-20 md:hidden bg-ink/80 backdrop-blur-sm px-3 py-2 rounded border border-wood/30 text-wood text-sm mt-10"
          @click="mobilePanelOpen = !mobilePanelOpen"
        >
          ⚙ 参数
        </button>

        <div class="absolute bottom-0 left-0 right-0 z-20">
          <StatusBar
            :fps="statusFPS"
            :camera-position="statusCameraPosition"
            :joint-type-name="currentJointInfo.name"
            :component-count="statusComponentCount"
          />
        </div>

        <div v-if="mobilePanelOpen" class="absolute inset-0 z-30 md:hidden">
          <div class="absolute inset-0 bg-black/50" @click="mobilePanelOpen = false"></div>
          <div class="absolute right-0 top-0 bottom-0 w-80">
            <ControlPanel
              :current-type="currentType"
              :params="currentParams"
              :presets="presets"
              :current-preset-id="currentPresetId"
              :explode-progress="explodeProgress"
              :wireframe-mode="wireframeMode"
              :show-annotations="showAnnotations"
              :projects="projects"
              :current-project-id="currentProjectId"
              :user="auth.state.user"
              :cloud-projects="cloudProjects"
              :sync-loading="syncLoading"
              :is-recording="isRecording"
              :recording-info="recordingInfo"
              @select-type="v => { selectType(v); mobilePanelOpen = false }"
              @param-change="updateParam"
              @apply-preset="handleApplyPreset"
              @save-preset="handleSavePreset"
              @delete-preset="handleDeletePreset"
              @explode-change="setExplode"
              @toggle-explode="toggleExplode"
              @animate-explode="animateExplode"
              @toggle-wireframe="wireframeMode = !wireframeMode"
              @toggle-annotations="toggleAnnotations"
              @export-bom="showBom = true; mobilePanelOpen = false"
              @export-stl-all="() => { handleExportSTLAll(); mobilePanelOpen = false }"
              @export-stl-separate="() => { handleExportSTLSeparate(); mobilePanelOpen = false }"
              @save-project="handleSaveProject"
              @load-project="id => { handleLoadProject(id); mobilePanelOpen = false }"
              @delete-project="handleDeleteProject"
              @rename-project="handleRenameProject"
              @refresh-projects="refreshProjects"
              @refresh-cloud="refreshCloudProjects"
              @upload-to-cloud="handleUploadToCloud"
              @download-from-cloud="handleDownloadFromCloud"
              @logout="handleLogout"
              @go-login="goLogin"
              @start-recording="handleStartRecording"
              @stop-recording="handleStopRecording"
              @export-animation-gif="handleExportGIF"
              @export-animation-video="handleExportVideo"
              @open-share="handleOpenShare"
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

    <ShareDialog
      :open="shareDialogOpen"
      :type="currentType"
      :params="currentParams"
      :view-state="getStateSnapshot()"
      :thumbnail="shareThumbnail"
      @close="shareDialogOpen = false"
    />

    <KeyboardShortcutsPanel
      :open="shortcutsPanelOpen"
      @close="shortcutsPanelOpen = false"
    />

    <div v-if="toast" class="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-ink border border-wood/50 text-wood-light px-5 py-2.5 rounded-lg shadow-2xl text-sm tracking-wider">
      {{ toast }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, reactive, nextTick, shallowRef } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { SceneManager } from '../utils/SceneManager.js'
import { JOINT_TYPES, INGFA_NAMES } from '../models/jointTypes.js'
import {
  listProjects,
  saveProject,
  loadProject,
  deleteProject,
  renameProject
} from '../utils/projectManager.js'
import {
  getAllPresets,
  saveCustomPreset,
  deleteCustomPreset,
  presetNameExists
} from '../utils/presetManager.js'
import { api } from '../utils/api.js'
import { useAuth } from '../stores/auth.js'
import { decodeShareData } from '../utils/shareUtils.js'
import ControlPanel from '../components/ControlPanel.vue'
import BomDialog from '../components/BomDialog.vue'
import HistoryPanel from '../components/HistoryPanel.vue'
import CompareView from '../components/CompareView.vue'
import ShareDialog from '../components/ShareDialog.vue'
import KnowledgeCard from '../components/KnowledgeCard.vue'
import KeyboardShortcutsPanel from '../components/KeyboardShortcutsPanel.vue'
import StatusBar from '../components/StatusBar.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuth()

const viewMode = ref('single')
const canvasContainer = ref(null)
const scene = shallowRef(null)
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
const cloudProjects = ref([])
const syncLoading = ref(false)
const toast = ref('')
const isRecording = ref(false)
const recordingInfo = ref({ frameCount: 0, duration: 0 })
const _recordingUpdateInterval = ref(null)
const shareDialogOpen = ref(false)
const shareThumbnail = ref('')
const shareLoading = ref(false)
const isSharedView = ref(false)
const presets = ref([])
const currentPresetId = ref(null)
const shortcutsPanelOpen = ref(false)
const jointTypeKeys = Object.keys(JOINT_TYPES)
const statusFPS = ref(0)
const statusCameraPosition = ref({ x: '0.0', y: '0.0', z: '0.0' })
const statusComponentCount = ref(0)
let _statusUpdateInterval = null

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

function showToast(msg, duration = 2000) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, duration)
}

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
  refreshPresets()
  const typeName = JOINT_TYPES[type]?.name || type
  addHistory(`切换为「${typeName}」`, 'select-type', `从「${JOINT_TYPES[oldType]?.name || oldType}」切换`)
}

function updateParam(key, value) {
  currentParams[key] = value
  currentPresetId.value = null
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

const VIEW_PRESET_LABELS = {
  front: '正视',
  side: '侧视',
  top: '俯视',
  isometric: '45°等轴测'
}

function handleViewPreset(preset) {
  if (!scene.value) return
  scene.value.setViewPreset(preset)
  const label = VIEW_PRESET_LABELS[preset] || preset
  showToast(`已切换到${label}`)
}

function handleResetView() {
  if (!scene.value) return
  scene.value.resetView()
  showToast('视角已重置')
}

function getSTLFilename(suffix = '') {
  const base = currentProjectName.value || currentJointInfo.value?.name || '榫卯模型'
  const safe = base.replace(/[\\/:*?"<>|]/g, '_')
  const date = new Date().toISOString().slice(0, 10)
  return suffix ? `${safe}_${suffix}_${date}` : `${safe}_${date}`
}

function handleExportSTLAll() {
  if (!scene.value) {
    showToast('场景未初始化')
    return
  }
  const filename = getSTLFilename()
  const result = scene.value.exportAllSTL(filename)
  if (result) {
    showToast('STL 模型已导出（整体）')
    addHistory('导出STL(整体)', 'export-stl')
  } else {
    showToast('导出失败，请检查模型')
  }
}

function handleExportSTLSeparate() {
  if (!scene.value) {
    showToast('场景未初始化')
    return
  }
  const baseName = getSTLFilename()
  const result = scene.value.exportComponentsSeparate(baseName)
  if (result) {
    showToast('STL 模型已导出（分构件）')
    addHistory('导出STL(分构件)', 'export-stl')
  } else {
    showToast('导出失败，请检查模型')
  }
}

function getAnimationFilename(suffix = '') {
  const base = currentProjectName.value || currentJointInfo.value?.name || '榫卯拆解动画'
  const safe = base.replace(/[\\/:*?"<>|]/g, '_')
  const date = new Date().toISOString().slice(0, 10)
  return suffix ? `${safe}_${suffix}_${date}` : `${safe}_${date}`
}

function updateRecordingInfo() {
  if (scene.value) {
    const info = scene.value.getRecordingInfo()
    if (info) {
      recordingInfo.value = {
        frameCount: info.frameCount,
        duration: info.duration
      }
    }
  }
}

async function handleStartRecording() {
  if (!scene.value) {
    showToast('场景未初始化')
    return
  }
  if (animating.value) {
    showToast('请等待当前动画完成')
    return
  }

  explodeProgress.value = 0
  if (scene.value) scene.value.setExplode(0)

  const success = scene.value.startAnimationRecording('both')
  if (success) {
    isRecording.value = true
    recordingInfo.value = { frameCount: 0, duration: 0 }
    showToast('开始录制拆解动画...')

    _recordingUpdateInterval.value = setInterval(updateRecordingInfo, 200)

    setTimeout(() => {
      animateExplodeWithRecording()
    }, 500)
  } else {
    showToast('启动录制失败')
  }
}

async function animateExplodeWithRecording() {
  animating.value = true
  const start = 0
  const end = 1
  const duration = 2400
  const t0 = performance.now()

  function step(t) {
    const k = Math.min(1, (t - t0) / duration)
    const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
    explodeProgress.value = start + (end - start) * ease
    if (scene.value) scene.value.setExplode(explodeProgress.value)
    if (k < 1) {
      requestAnimationFrame(step)
    } else {
      setTimeout(() => {
        const duration2 = 2400
        const t1 = performance.now()
        const start2 = 1
        const end2 = 0
        function step2(t) {
          const k = Math.min(1, (t - t1) / duration2)
          const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
          explodeProgress.value = start2 + (end2 - start2) * ease
          if (scene.value) scene.value.setExplode(explodeProgress.value)
          if (k < 1) {
            requestAnimationFrame(step2)
          } else {
            animating.value = false
          }
        }
        requestAnimationFrame(step2)
      }, 300)
    }
  }
  requestAnimationFrame(step)
}

async function handleStopRecording() {
  if (!scene.value) {
    showToast('场景未初始化')
    return
  }

  if (_recordingUpdateInterval.value) {
    clearInterval(_recordingUpdateInterval.value)
    _recordingUpdateInterval.value = null
  }

  const info = await scene.value.stopAnimationRecording()
  isRecording.value = false
  if (info) {
    recordingInfo.value = info
    showToast(`录制完成：${info.frameCount} 帧，${info.duration.toFixed(1)} 秒`)
  }
}

async function handleExportGIF() {
  if (!scene.value) {
    showToast('场景未初始化')
    return
  }
  try {
    showToast('正在生成 GIF 动图...')
    const filename = getAnimationFilename() + '.gif'
    await scene.value.exportGIF(filename)
    showToast('GIF 动图已导出')
    addHistory('导出拆解动画(GIF)', 'export-animation')
  } catch (e) {
    console.error(e)
    showToast('导出失败：' + e.message)
  }
}

async function handleExportVideo(format = 'webm') {
  if (!scene.value) {
    showToast('场景未初始化')
    return
  }
  try {
    showToast(`正在生成 ${format.toUpperCase()} 视频...`)
    const filename = getAnimationFilename() + '.' + format
    await scene.value.exportVideo(filename, format)
    showToast(`${format.toUpperCase()} 视频已导出`)
    addHistory(`导出拆解动画(${format.toUpperCase()})`, 'export-animation')
  } catch (e) {
    console.error(e)
    showToast('导出失败：' + e.message)
  }
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
  applyProjectData(project)
  currentProjectId.value = project.id
  addHistory(`加载项目「${project.name}」`, 'load-project')
}

function applyProjectData(project) {
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
  loadJoint()
  refreshPresets()
}

function refreshPresets() {
  presets.value = getAllPresets(currentType.value)
  currentPresetId.value = null
}

function handleApplyPreset(preset) {
  if (!preset || !preset.params) return
  Object.assign(currentParams, preset.params)
  currentPresetId.value = preset.id
  loadJoint()
  addHistory(`应用预设「${preset.name}」`, 'apply-preset', preset.description || '')
}

function handleSavePreset(name, description, onSuccess, onError) {
  if (presetNameExists(currentType.value, name)) {
    onError && onError('预设名称已存在')
    return
  }
  const result = saveCustomPreset(currentType.value, name, { ...currentParams }, description)
  if (result.success) {
    refreshPresets()
    currentPresetId.value = result.preset.id
    showToast(`预设「${name}」已保存`)
    addHistory(`保存预设「${name}」`, 'save-preset')
    onSuccess && onSuccess()
  } else {
    onError && onError(result.error || '保存失败')
  }
}

function handleDeletePreset(presetId, onSuccess) {
  const target = presets.value.find(p => p.id === presetId)
  const result = deleteCustomPreset(currentType.value, presetId)
  if (result.success) {
    if (currentPresetId.value === presetId) {
      currentPresetId.value = null
    }
    refreshPresets()
    if (target) {
      showToast(`预设「${target.name}」已删除`)
      addHistory(`删除预设「${target.name}」`, 'delete-preset')
    }
    onSuccess && onSuccess()
  }
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

async function handleUploadToCloud(localProjectId, onSuccess, onError) {
  if (!auth.isLoggedIn()) {
    showToast('请先登录后再上传')
    onError && onError('请先登录')
    router.push('/login')
    return
  }
  const local = loadProject(localProjectId)
  if (!local) {
    showToast('本地项目不存在')
    onError && onError('本地项目不存在')
    return
  }
  syncLoading.value = true
  try {
    const result = await api.saveProject(local.name, local.data)
    await refreshCloudProjects()
    showToast(`已上传到云端：${result.name}`)
    onSuccess && onSuccess()
  } catch (e) {
    showToast(e.message || '上传失败')
    onError && onError(e.message || '上传失败')
  } finally {
    syncLoading.value = false
  }
}

async function handleDownloadFromCloud(cloudProjectId) {
  if (!auth.isLoggedIn()) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  const cloud = cloudProjects.value.find(p => p.id === cloudProjectId)
  if (!cloud) {
    showToast('云端项目不存在')
    return
  }
  syncLoading.value = true
  try {
    const result = saveProject(cloud.name, cloud.data)
    if (result.success) {
      currentProjectId.value = result.project.id
      applyProjectData(result.project)
      refreshProjects()
      showToast(`已从云端拉取：${cloud.name}`)
      addHistory(`从云端加载「${cloud.name}」`, 'load-project')
    } else {
      showToast(result.error || '保存失败')
    }
  } catch (e) {
    showToast(e.message || '拉取失败')
  } finally {
    syncLoading.value = false
  }
}

async function refreshCloudProjects() {
  if (!auth.isLoggedIn()) return
  try {
    cloudProjects.value = await api.listProjects()
  } catch (e) {
    console.warn('获取云端项目失败:', e.message)
  }
}

function handleLogout() {
  auth.logout()
  cloudProjects.value = []
  showToast('已退出登录')
}

function goLogin() {
  router.push('/login')
}

async function initAuth() {
  if (auth.isLoggedIn()) {
    try {
      const me = await api.getMe()
      auth.setUser(me)
      await refreshCloudProjects()
    } catch (e) {
      auth.logout()
    }
  }
}

async function handleOpenShare() {
  if (!scene.value) {
    showToast('场景未初始化')
    return
  }
  shareLoading.value = true
  shareThumbnail.value = ''
  try {
    await nextTick()
    try {
      const thumb = scene.value.captureThumbnail(800, 600, 'image/jpeg', 0.85)
      if (thumb && thumb.dataUrl) {
        shareThumbnail.value = thumb.dataUrl
      }
    } catch (thumbErr) {
      console.warn('缩略图生成跳过:', thumbErr.message)
    }
    shareDialogOpen.value = true
  } catch (e) {
    console.error('打开分享失败:', e)
    shareDialogOpen.value = true
  } finally {
    shareLoading.value = false
  }
}

function applyShareData(shareData) {
  if (!shareData) return
  isSharedView.value = true
  if (shareData.type) {
    currentType.value = shareData.type
  }
  if (shareData.params) {
    Object.assign(currentParams, shareData.params)
  }
  const vs = shareData.viewState || {}
  if (typeof vs.explodeProgress === 'number') {
    explodeProgress.value = vs.explodeProgress
  }
  if (typeof vs.wireframeMode === 'boolean') {
    wireframeMode.value = vs.wireframeMode
  }
  if (typeof vs.showAnnotations === 'boolean') {
    showAnnotations.value = vs.showAnnotations
  }
  loadJoint()
  refreshPresets()
}

async function loadFromShareId(shareId) {
  try {
    showToast('正在加载分享模型...')
    const data = await api.getShare(shareId)
    applyShareData(data)
    showToast(`已加载分享模型：${JOINT_TYPES[data.type]?.name || data.type}`)
    return true
  } catch (e) {
    console.error('加载分享失败:', e)
    showToast('分享加载失败：' + (e.message || '链接无效'))
    return false
  }
}

function loadFromDirectEncoded(encoded) {
  const decoded = decodeShareData(encoded)
  if (decoded) {
    applyShareData(decoded)
    showToast(`已加载分享模型：${JOINT_TYPES[decoded.type]?.name || decoded.type}`)
    return true
  }
  showToast('分享链接无效')
  return false
}

async function checkShareInUrl() {
  const shareId = route.params.shareId
  const directData = route.query.d
  if (shareId) {
    await loadFromShareId(shareId)
  } else if (directData) {
    loadFromDirectEncoded(directData)
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

watch(() => [route.params.shareId, route.query.d], async ([newShareId, newDirectData]) => {
  if (newShareId) {
    await loadFromShareId(newShareId)
  } else if (newDirectData) {
    loadFromDirectEncoded(newDirectData)
  }
}, { immediate: false })

function handleKeydown(e) {
  const target = e.target
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return

  if (e.key === '?' || e.key === '/' || (e.key === 'Escape' && shortcutsPanelOpen.value)) {
    if (e.key === 'Escape' && shortcutsPanelOpen.value) {
      shortcutsPanelOpen.value = false
      e.preventDefault()
      return
    }
    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      shortcutsPanelOpen.value = !shortcutsPanelOpen.value
      e.preventDefault()
      return
    }
  }

  if (e.key === 'Escape') {
    if (historyPanelOpen.value) historyPanelOpen.value = false
    if (shortcutsPanelOpen.value) shortcutsPanelOpen.value = false
    if (showBom.value) showBom.value = false
    if (shareDialogOpen.value) shareDialogOpen.value = false
    if (mobilePanelOpen.value) mobilePanelOpen.value = false
    return
  }

  if (shortcutsPanelOpen.value) return

  const ctrl = e.ctrlKey || e.metaKey

  switch (e.key.toLowerCase()) {
    case 'w':
      if (!ctrl && !e.altKey) {
        wireframeMode.value = !wireframeMode.value
        e.preventDefault()
      }
      break
    case 'r':
      if (!ctrl && !e.altKey) {
        if (scene.value) scene.value.centerView()
        e.preventDefault()
      }
      break
    case 'n':
      if (!ctrl && !e.altKey) {
        toggleAnnotations()
        e.preventDefault()
      }
      break
    case 'e':
      if (!ctrl && !e.altKey) {
        toggleExplode()
        e.preventDefault()
      }
      break
    case ' ':
      if (!ctrl && !e.altKey) {
        animateExplode()
        e.preventDefault()
      }
      break
    case 'h':
      if (!ctrl && !e.altKey) {
        historyPanelOpen.value = !historyPanelOpen.value
        e.preventDefault()
      }
      break
    case 'z':
      if (ctrl) {
        undoHistory()
        e.preventDefault()
      }
      break
    case 'b':
      if (ctrl) {
        showBom.value = true
        e.preventDefault()
      }
      break
    case 's':
      if (ctrl) {
        handleExportSTLAll()
        e.preventDefault()
      }
      break
    case 'k':
      if (ctrl) {
        handleOpenShare()
        e.preventDefault()
      }
      break
    case 'ArrowRight':
      if (!ctrl && !e.altKey) {
        setExplode(Math.min(1, explodeProgress.value + 0.1))
        e.preventDefault()
      }
      break
    case 'ArrowLeft':
      if (!ctrl && !e.altKey) {
        setExplode(Math.max(0, explodeProgress.value - 0.1))
        e.preventDefault()
      }
      break
    case 'ArrowUp':
      if (!ctrl && !e.altKey) {
        const idx = jointTypeKeys.indexOf(currentType.value)
        const prevIdx = (idx - 1 + jointTypeKeys.length) % jointTypeKeys.length
        selectType(jointTypeKeys[prevIdx])
        e.preventDefault()
      }
      break
    case 'ArrowDown':
      if (!ctrl && !e.altKey) {
        const idx = jointTypeKeys.indexOf(currentType.value)
        const nextIdx = (idx + 1) % jointTypeKeys.length
        selectType(jointTypeKeys[nextIdx])
        e.preventDefault()
      }
      break
  }

  if (!ctrl && !e.altKey && !e.shiftKey) {
    const num = parseInt(e.key)
    if (num >= 1 && num <= jointTypeKeys.length) {
      selectType(jointTypeKeys[num - 1])
      e.preventDefault()
    }
  }

  if (ctrl && e.key.toLowerCase() === 'r') {
    resetToDefault()
    e.preventDefault()
  }

  if (!ctrl && !e.altKey && !e.shiftKey) {
    switch (e.key) {
      case 'F1':
        handleViewPreset('front')
        e.preventDefault()
        break
      case 'F2':
        handleViewPreset('side')
        e.preventDefault()
        break
      case 'F3':
        handleViewPreset('top')
        e.preventDefault()
        break
      case 'F4':
        handleViewPreset('isometric')
        e.preventDefault()
        break
      case 'F5':
        handleResetView()
        e.preventDefault()
        break
    }
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  await nextTick()
  refreshProjects()
  refreshPresets()
  await initAuth()
  if (canvasContainer.value) {
    scene.value = new SceneManager(canvasContainer.value)
    scene.value.setFPSCallback((fps) => {
      statusFPS.value = fps
    })
    loadJoint()
    _statusUpdateInterval = setInterval(() => {
      if (scene.value) {
        const s = scene.value.getStatus()
        statusCameraPosition.value = s.cameraPosition
        statusComponentCount.value = s.componentCount
      }
    }, 100)
  }
  await nextTick()
  await checkShareInUrl()
  nextTick(() => {
    const initItem = {
      id: Date.now(),
      label: isSharedView.value ? '分享模型状态' : '初始默认状态',
      type: isSharedView.value ? 'share' : 'init',
      detail: isSharedView.value ? '从分享链接加载的模型' : '刚打开时的默认状态',
      timestamp: Date.now(),
      state: getStateSnapshot()
    }
    historyList.value = [initItem]
    historyIndex.value = 0
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (_statusUpdateInterval) {
    clearInterval(_statusUpdateInterval)
    _statusUpdateInterval = null
  }
})
</script>
