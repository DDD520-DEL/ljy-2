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

      <div class="text-xs text-wood-light/70 mb-2 tracking-wider">已保存项目</div>
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
  currentProjectId: { type: String, default: null }
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
  'refresh-projects'
])

const projectPanelOpen = ref(false)
const saveDialogOpen = ref(false)
const saveName = ref('')
const saveError = ref('')
const renameDialogOpen = ref(false)
const renameTarget = ref(null)
const renameName = ref('')
const renameError = ref('')
const deleteDialogOpen = ref(false)
const deleteTarget = ref(null)

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
</script>
