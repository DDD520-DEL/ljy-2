<template>
  <div class="bg-ink/90 backdrop-blur-sm text-wood-light h-full flex flex-col overflow-hidden font-song">
    <div class="px-5 py-4 border-b border-wood-dark/40">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-wood text-xl font-bold tracking-widest">榫卯参数化工具</h1>
          <p class="text-xs text-wood-light/60 mt-1">传统营造 · 古法今用</p>
        </div>
        <button
          @click="projectPanelOpen = !projectPanelOpen"
          :class="[
            'px-3 py-1.5 text-xs rounded border transition-all tracking-wider',
            projectPanelOpen
              ? 'bg-wood text-white border-wood-light'
              : 'bg-wood-dark/50 text-wood-light/80 border-wood-dark/50 hover:bg-wood-dark/70'
          ]"
        >
          📁 项目
        </button>
      </div>

      <div class="mt-3 pt-3 border-t border-wood-dark/30">
        <template v-if="user">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-7 h-7 rounded-full bg-wood/30 flex items-center justify-center text-xs text-wood font-bold flex-shrink-0">
                {{ user.username.charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <div class="text-sm text-wood-light/90 truncate flex items-center gap-1">
                  {{ user.username }}
                  <span v-if="user.isDemo" class="text-[10px] bg-wood/30 text-wood px-1.5 py-0.5 rounded">演示</span>
                </div>
                <div class="text-[10px] text-wood-light/40">已登录 · 云端同步可用</div>
              </div>
            </div>
            <button
              @click="$emit('logout')"
              class="px-2.5 py-1 text-[11px] bg-wood-dark/50 text-wood-light/70 rounded border border-wood-dark/50 hover:bg-wood-dark/70 hover:text-wood-light transition-all"
            >
              退出
            </button>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center justify-between">
            <div class="text-xs text-wood-light/50">
              未登录 · 项目仅保存在本地
            </div>
            <button
              @click="$emit('go-login')"
              class="px-3 py-1 text-xs bg-wood text-white rounded border border-wood-light hover:bg-wood-dark transition-all tracking-wider font-bold"
            >
              登录 / 注册
            </button>
          </div>
        </template>
      </div>
    </div>

    <div v-if="projectPanelOpen" class="px-5 py-4 border-b border-wood-dark/40 bg-wood-dark/10">
      <div class="flex gap-2 mb-3">
        <button
          @click="openSaveDialog"
          class="flex-1 px-3 py-2 text-xs bg-wood text-white rounded border border-wood-light hover:bg-wood-dark transition-all tracking-wider font-bold"
        >
          💾 保存项目
        </button>
      </div>

      <div class="flex gap-1 mb-3">
        <button
          @click="cloudTab = false"
          :class="[
            'flex-1 px-2 py-1.5 text-[11px] rounded border transition-all tracking-wider',
            !cloudTab
              ? 'bg-wood/80 text-white border-wood-light'
              : 'bg-wood-dark/30 text-wood-light/60 border-wood-dark/50 hover:bg-wood-dark/50'
          ]"
        >
          💻 本地项目
        </button>
        <button
          @click="cloudTab = true; handleRefreshCloud()"
          :class="[
            'flex-1 px-2 py-1.5 text-[11px] rounded border transition-all tracking-wider',
            cloudTab
              ? 'bg-wood/80 text-white border-wood-light'
              : 'bg-wood-dark/30 text-wood-light/60 border-wood-dark/50 hover:bg-wood-dark/50'
          ]"
        >
          ☁️ 云端项目
          <span v-if="syncLoading" class="ml-1 animate-pulse">...</span>
        </button>
      </div>

      <template v-if="!cloudTab">
        <div class="text-xs text-wood-light/70 mb-2 tracking-wider">本地存储</div>
        <div v-if="projects.length === 0" class="text-xs text-wood-light/40 py-3 text-center italic">
          暂无保存的项目
        </div>
        <div v-else class="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
          <div
            v-for="p in projects"
            :key="p.id"
            :class="[
              'group flex items-center gap-2 px-3 py-2 rounded border transition-all',
              currentProjectId === p.id
                ? 'bg-wood/20 border-wood/50'
                : 'bg-wood-dark/30 border-wood-dark/50 hover:bg-wood-dark/50'
            ]"
          >
            <button
              @click="$emit('load-project', p.id)"
              class="flex-1 text-left min-w-0"
              :title="p.name"
            >
              <div class="text-sm text-wood-light/90 truncate">{{ p.name }}</div>
              <div class="text-[10px] text-wood-light/40 font-mono">
                {{ formatDate(p.updatedAt) }}
              </div>
            </button>
            <button
              v-if="user"
              @click.stop="handleUpload(p)"
              class="opacity-0 group-hover:opacity-100 text-xs text-wood hover:text-wood-light transition-all px-1 py-0.5"
              title="上传到云端"
            >
              ☁️↑
            </button>
            <button
              @click.stop="startRename(p)"
              class="opacity-0 group-hover:opacity-100 text-xs text-wood-light/60 hover:text-wood transition-all px-1 py-0.5"
              title="重命名"
            >
              ✏️
            </button>
            <button
              @click.stop="confirmDelete(p)"
              class="opacity-0 group-hover:opacity-100 text-xs text-red-400/70 hover:text-red-400 transition-all px-1 py-0.5"
              title="删除"
            >
              🗑️
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <template v-if="!user">
          <div class="text-xs text-wood-light/40 py-6 text-center italic leading-relaxed">
            请先登录后查看云端项目<br/>
            <button
              @click="$emit('go-login')"
              class="mt-3 px-4 py-1.5 bg-wood text-white rounded border border-wood-light hover:bg-wood-dark transition-all tracking-wider text-[11px] font-bold"
            >
              立即登录
            </button>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs text-wood-light/70 tracking-wider">云端存储</div>
            <button
              @click="handleRefreshCloud"
              class="text-[10px] text-wood-light/50 hover:text-wood transition-all"
              :disabled="syncLoading"
            >
              {{ syncLoading ? '同步中...' : '🔄 刷新' }}
            </button>
          </div>
          <div v-if="cloudProjects.length === 0" class="text-xs text-wood-light/40 py-3 text-center italic">
            云端暂无项目，从本地上传吧
          </div>
          <div v-else class="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
            <div
              v-for="p in cloudProjects"
              :key="p.id"
              class="group flex items-center gap-2 px-3 py-2 rounded border bg-wood-dark/30 border-wood-dark/50 hover:bg-wood-dark/50 transition-all"
            >
              <div class="flex-1 text-left min-w-0">
                <div class="text-sm text-wood-light/90 truncate flex items-center gap-1">
                  <span>☁️</span>
                  <span>{{ p.name }}</span>
                </div>
                <div class="text-[10px] text-wood-light/40 font-mono">
                  {{ formatDate(p.updatedAt) }}
                </div>
              </div>
              <button
                @click.stop="handleDownload(p)"
                :disabled="syncLoading"
                class="opacity-0 group-hover:opacity-100 text-xs text-wood hover:text-wood-light transition-all px-1.5 py-0.5 disabled:opacity-50"
                title="拉取到本地"
              >
                ⬇️ 拉取
              </button>
            </div>
          </div>
        </template>
      </template>
    </div>

    <div class="px-5 py-4 border-b border-wood-dark/40">
      <label class="block text-xs text-wood-light/70 mb-2 tracking-wider">榫卯类型</label>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="jt in jointTypesList"
          :key="jt.id"
          @click="$emit('select-type', jt.id)"
          :class="[
            'px-3 py-2 rounded text-sm transition-all border text-left',
            currentType === jt.id
              ? 'bg-wood text-white border-wood-light shadow-lg'
              : 'bg-wood-dark/30 text-wood-light/80 border-wood-dark/50 hover:bg-wood-dark/50 hover:border-wood/60'
          ]"
        >
          <div class="font-bold tracking-wide">{{ jt.name }}</div>
        </button>
      </div>
      <p v-if="currentJointType" class="mt-2 text-xs text-wood-light/50 leading-relaxed">
        {{ currentJointType.description }}
      </p>
    </div>

    <div class="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">
      <label class="block text-xs text-wood-light/70 mb-3 tracking-wider">参数调整</label>
      <div v-for="p in currentJointType?.params || []" :key="p.key" class="mb-4">
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm text-wood-light/90">{{ p.name }}</span>
          <span class="text-xs text-wood font-mono bg-wood-dark/40 px-2 py-0.5 rounded">
            {{ formatValue(params[p.key]) }}{{ p.unit || '' }}
          </span>
        </div>
        <input
          type="range"
          :min="p.min"
          :max="p.max"
          :step="p.step || 1"
          :value="params[p.key]"
          @input="$emit('param-change', p.key, parseFloat($event.target.value))"
          class="w-full"
        />
        <div class="flex justify-between text-[10px] text-wood-light/40 mt-0.5 font-mono">
          <span>{{ p.min }}{{ p.unit || '' }}</span>
          <span>{{ p.max }}{{ p.unit || '' }}</span>
        </div>
      </div>
    </div>

    <div class="px-5 py-4 border-t border-wood-dark/40 space-y-3">
      <div>
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm text-wood-light/90">拆解动画</span>
          <span class="text-xs text-wood font-mono">{{ Math.round(explodeProgress * 100) }}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          :value="explodeProgress"
          @input="$emit('explode-change', parseFloat($event.target.value))"
          class="w-full"
        />
      </div>
      <div class="flex gap-2">
        <button
          @click="$emit('toggle-explode')"
          class="flex-1 px-3 py-2 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood/50 hover:bg-wood-dark/70 transition-all tracking-wider"
        >
          {{ explodeProgress > 0 ? '↺ 复原' : '⇄ 拆解' }}
        </button>
        <button
          @click="$emit('animate-explode')"
          class="flex-1 px-3 py-2 text-xs bg-wood/70 text-white rounded border border-wood-light hover:bg-wood transition-all tracking-wider"
        >
          ▶ 动画
        </button>
      </div>

      <div class="flex gap-2 pt-2 border-t border-wood-dark/30">
        <button
          @click="$emit('toggle-wireframe')"
          :class="[
            'flex-1 px-3 py-1.5 text-xs rounded border transition-all tracking-wider',
            wireframeMode ? 'bg-wood-light/20 text-wood border-wood-light/50' : 'bg-wood-dark/50 text-wood-light/70 border-wood-dark/50'
          ]"
        >
          {{ wireframeMode ? '◼ 实体' : '◻ 线框' }}
        </button>
        <button
          @click="$emit('toggle-annotations')"
          :class="[
            'flex-1 px-3 py-1.5 text-xs rounded border transition-all tracking-wider',
            showAnnotations ? 'bg-wood-light/20 text-wood border-wood-light/50' : 'bg-wood-dark/50 text-wood-light/70 border-wood-dark/50'
          ]"
        >
          {{ showAnnotations ? '📌 隐藏标注' : '📍 显示标注' }}
        </button>
      </div>

      <button
        @click="$emit('export-bom')"
        class="w-full px-3 py-2.5 text-sm bg-wood text-white rounded border border-wood-light hover:bg-wood-dark transition-all tracking-widest font-bold shadow-lg"
      >
        📋 导出物料清单 (BOM)
      </button>
    </div>

    <div v-if="saveDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/60" @click="closeSaveDialog"></div>
      <div class="relative bg-ink border border-wood/40 rounded-lg p-5 w-80 shadow-2xl">
        <h3 class="text-wood font-bold text-lg mb-4 tracking-wider">保存项目</h3>
        <label class="block text-xs text-wood-light/70 mb-2">项目名称</label>
        <input
          v-model="saveName"
          type="text"
          placeholder="请输入项目名称"
          class="w-full bg-wood-dark/30 border border-wood-dark/50 rounded px-3 py-2 text-sm text-wood-light focus:outline-none focus:border-wood/60"
          @keyup.enter="doSave"
        />
        <div v-if="saveError" class="text-xs text-red-400 mt-2">{{ saveError }}</div>
        <div class="flex gap-2 mt-5">
          <button
            @click="closeSaveDialog"
            class="flex-1 px-3 py-2 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood-dark/50 hover:bg-wood-dark/70 transition-all tracking-wider"
          >
            取消
          </button>
          <button
            @click="doSave"
            class="flex-1 px-3 py-2 text-xs bg-wood text-white rounded border border-wood-light hover:bg-wood-dark transition-all tracking-wider font-bold"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <div v-if="renameDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/60" @click="closeRenameDialog"></div>
      <div class="relative bg-ink border border-wood/40 rounded-lg p-5 w-80 shadow-2xl">
        <h3 class="text-wood font-bold text-lg mb-4 tracking-wider">重命名项目</h3>
        <label class="block text-xs text-wood-light/70 mb-2">新名称</label>
        <input
          v-model="renameName"
          type="text"
          placeholder="请输入新名称"
          class="w-full bg-wood-dark/30 border border-wood-dark/50 rounded px-3 py-2 text-sm text-wood-light focus:outline-none focus:border-wood/60"
          @keyup.enter="doRename"
        />
        <div v-if="renameError" class="text-xs text-red-400 mt-2">{{ renameError }}</div>
        <div class="flex gap-2 mt-5">
          <button
            @click="closeRenameDialog"
            class="flex-1 px-3 py-2 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood-dark/50 hover:bg-wood-dark/70 transition-all tracking-wider"
          >
            取消
          </button>
          <button
            @click="doRename"
            class="flex-1 px-3 py-2 text-xs bg-wood text-white rounded border border-wood-light hover:bg-wood-dark transition-all tracking-wider font-bold"
          >
            确认
          </button>
        </div>
      </div>
    </div>

    <div v-if="deleteDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/60" @click="closeDeleteDialog"></div>
      <div class="relative bg-ink border border-wood/40 rounded-lg p-5 w-80 shadow-2xl">
        <h3 class="text-wood font-bold text-lg mb-2 tracking-wider">确认删除</h3>
        <p class="text-sm text-wood-light/70 leading-relaxed mb-4">
          确定要删除项目「<span class="text-wood font-bold">{{ deleteTarget?.name }}</span>」吗？此操作不可撤销。
        </p>
        <div class="flex gap-2 mt-5">
          <button
            @click="closeDeleteDialog"
            class="flex-1 px-3 py-2 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood-dark/50 hover:bg-wood-dark/70 transition-all tracking-wider"
          >
            取消
          </button>
          <button
            @click="doDelete"
            class="flex-1 px-3 py-2 text-xs bg-red-600 text-white rounded border border-red-500 hover:bg-red-700 transition-all tracking-wider font-bold"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <div v-if="uploadDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/60" @click="closeUploadDialog"></div>
      <div class="relative bg-ink border border-wood/40 rounded-lg p-5 w-80 shadow-2xl">
        <h3 class="text-wood font-bold text-lg mb-2 tracking-wider">上传到云端</h3>
        <p class="text-sm text-wood-light/70 leading-relaxed mb-4">
          将项目「<span class="text-wood font-bold">{{ uploadTarget?.name }}</span>」上传到云端？<br/>
          <span class="text-xs text-wood-light/50">同名项目将被覆盖</span>
        </p>
        <div v-if="uploadError" class="text-xs text-red-400 mb-3">{{ uploadError }}</div>
        <div class="flex gap-2">
          <button
            @click="closeUploadDialog"
            class="flex-1 px-3 py-2 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood-dark/50 hover:bg-wood-dark/70 transition-all tracking-wider"
          >
            取消
          </button>
          <button
            @click="doUpload"
            :disabled="uploading"
            class="flex-1 px-3 py-2 text-xs bg-wood text-white rounded border border-wood-light hover:bg-wood-dark transition-all tracking-wider font-bold disabled:opacity-50"
          >
            {{ uploading ? '上传中...' : '上传' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { JOINT_TYPES } from '../models/jointTypes.js'

const props = defineProps({
  currentType: { type: String, default: 'straight' },
  params: { type: Object, default: () => ({}) },
  explodeProgress: { type: Number, default: 0 },
  wireframeMode: { type: Boolean, default: true },
  showAnnotations: { type: Boolean, default: true },
  projects: { type: Array, default: () => [] },
  currentProjectId: { type: String, default: null },
  user: { type: Object, default: null },
  cloudProjects: { type: Array, default: () => [] },
  syncLoading: { type: Boolean, default: false }
})

const emit = defineEmits([
  'select-type',
  'param-change',
  'explode-change',
  'toggle-explode',
  'animate-explode',
  'toggle-wireframe',
  'toggle-annotations',
  'export-bom',
  'save-project',
  'load-project',
  'delete-project',
  'rename-project',
  'refresh-projects',
  'upload-to-cloud',
  'download-from-cloud',
  'logout',
  'go-login'
])

const projectPanelOpen = ref(false)
const cloudTab = ref(false)
const saveDialogOpen = ref(false)
const saveName = ref('')
const saveError = ref('')
const renameDialogOpen = ref(false)
const renameTarget = ref(null)
const renameName = ref('')
const renameError = ref('')
const deleteDialogOpen = ref(false)
const deleteTarget = ref(null)
const uploadDialogOpen = ref(false)
const uploadTarget = ref(null)
const uploadError = ref('')
const uploading = ref(false)

const jointTypesList = computed(() => Object.values(JOINT_TYPES))
const currentJointType = computed(() => JOINT_TYPES[props.currentType])

watch(projectPanelOpen, open => {
  if (open) emit('refresh-projects')
})

function formatValue(v) {
  if (typeof v !== 'number') return v
  return Number.isInteger(v) ? v : v.toFixed(2)
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function openSaveDialog() {
  saveName.value = ''
  saveError.value = ''
  saveDialogOpen.value = true
}

function closeSaveDialog() {
  saveDialogOpen.value = false
  saveName.value = ''
  saveError.value = ''
}

function doSave() {
  if (!saveName.value.trim()) {
    saveError.value = '项目名称不能为空'
    return
  }
  emit('save-project', saveName.value.trim(), closeSaveDialog, err => {
    saveError.value = err
  })
}

function startRename(project) {
  renameTarget.value = project
  renameName.value = project.name
  renameError.value = ''
  renameDialogOpen.value = true
}

function closeRenameDialog() {
  renameDialogOpen.value = false
  renameTarget.value = null
  renameName.value = ''
  renameError.value = ''
}

function doRename() {
  if (!renameName.value.trim()) {
    renameError.value = '项目名称不能为空'
    return
  }
  if (!renameTarget.value) return
  emit('rename-project', renameTarget.value.id, renameName.value.trim(), closeRenameDialog, err => {
    renameError.value = err
  })
}

function confirmDelete(project) {
  deleteTarget.value = project
  deleteDialogOpen.value = true
}

function closeDeleteDialog() {
  deleteDialogOpen.value = false
  deleteTarget.value = null
}

function doDelete() {
  if (!deleteTarget.value) return
  emit('delete-project', deleteTarget.value.id, () => {
    closeDeleteDialog()
    emit('refresh-projects')
  })
}

function handleUpload(project) {
  uploadTarget.value = project
  uploadError.value = ''
  uploadDialogOpen.value = true
}

function closeUploadDialog() {
  uploadDialogOpen.value = false
  uploadTarget.value = null
  uploadError.value = ''
  uploading.value = false
}

function doUpload() {
  if (!uploadTarget.value) return
  uploading.value = true
  emit('upload-to-cloud', uploadTarget.value.id)
  setTimeout(() => {
    closeUploadDialog()
  }, 600)
}

function handleDownload(project) {
  emit('download-from-cloud', project.id)
}

function handleRefreshCloud() {
  emit('refresh-projects')
}
</script>
