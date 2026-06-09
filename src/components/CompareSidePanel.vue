<template>
  <div class="h-full flex flex-col overflow-hidden font-song">
    <div class="px-4 py-3 border-b border-wood-dark/40 flex items-center justify-between">
      <h3 class="text-wood text-sm font-bold tracking-widest">参数调整</h3>
      <button
        @click="$emit('close')"
        class="text-wood-light/60 hover:text-wood text-sm px-2 py-0.5"
      >
        ✕
      </button>
    </div>

    <div class="flex-1 overflow-y-auto scrollbar-thin px-4 py-3">
      <label class="block text-xs text-wood-light/70 mb-2 tracking-wider">榫卯类型</label>
      <div class="grid grid-cols-2 gap-1.5 mb-4">
        <button
          v-for="jt in jointTypesList"
          :key="jt.id"
          @click="$emit('select-type', jt.id)"
          :class="[
            'px-2 py-1.5 rounded text-xs transition-all border text-left',
            currentType === jt.id
              ? 'bg-wood text-white border-wood-light shadow'
              : 'bg-wood-dark/30 text-wood-light/80 border-wood-dark/50 hover:bg-wood-dark/50'
          ]"
        >
          <div class="font-bold tracking-wide">{{ jt.name }}</div>
        </button>
      </div>

      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs text-wood-light/70 tracking-wider">参数预设</label>
          <button
            @click="openSavePresetDialog"
            class="text-[10px] text-wood hover:text-wood-light transition-all tracking-wider flex items-center gap-1"
          >
            <span>💾</span>
            <span>保存</span>
          </button>
        </div>
        <div class="space-y-1 max-h-28 overflow-y-auto scrollbar-thin">
          <template v-if="presets.length === 0">
            <div class="text-[10px] text-wood-light/40 py-1.5 text-center italic">暂无预设</div>
          </template>
          <template v-else>
            <div
              v-for="p in presets"
              :key="p.id"
              :class="[
                'group flex items-center gap-1.5 px-2 py-1.5 rounded border transition-all cursor-pointer',
                currentPresetId === p.id
                  ? 'bg-wood/20 border-wood/50'
                  : 'bg-wood-dark/30 border-wood-dark/50 hover:bg-wood-dark/50'
              ]"
              @click="$emit('apply-preset', p)"
            >
              <div class="flex-1 min-w-0">
                <div class="text-xs text-wood-light/90 truncate flex items-center gap-1">
                  <span v-if="p.builtIn" class="text-[9px] bg-wood/30 text-wood px-1 py-0.5 rounded">内置</span>
                  <span v-else class="text-[9px] bg-wood-dark/50 text-wood-light/60 px-1 py-0.5 rounded">自定义</span>
                  <span>{{ p.name }}</span>
                </div>
              </div>
              <button
                v-if="!p.builtIn"
                @click.stop="confirmDeletePreset(p)"
                class="opacity-0 group-hover:opacity-100 text-[10px] text-red-400/70 hover:text-red-400 transition-all px-0.5"
                title="删除预设"
              >
                🗑️
              </button>
            </div>
          </template>
        </div>
      </div>

      <label class="block text-xs text-wood-light/70 mb-2 tracking-wider">参数调整</label>
      <div v-for="p in currentJointType?.params || []" :key="p.key" class="mb-3">
        <div class="flex justify-between items-center mb-0.5">
          <span class="text-xs text-wood-light/90">{{ p.name }}</span>
          <span class="text-[10px] text-wood font-mono bg-wood-dark/40 px-1.5 py-0.5 rounded">
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
      </div>
    </div>

    <div class="px-4 py-3 border-t border-wood-dark/40 space-y-2">
      <div>
        <div class="flex justify-between items-center mb-0.5">
          <span class="text-xs text-wood-light/90">拆解动画</span>
          <span class="text-[10px] text-wood font-mono">{{ Math.round(explodeProgress * 100) }}%</span>
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
      <div class="flex gap-1.5">
        <button
          @click="$emit('toggle-explode')"
          class="flex-1 px-2 py-1.5 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood/50 hover:bg-wood-dark/70 transition-all tracking-wider"
        >
          {{ explodeProgress > 0 ? '↺ 复原' : '⇄ 拆解' }}
        </button>
        <button
          @click="$emit('animate-explode')"
          class="flex-1 px-2 py-1.5 text-xs bg-wood/70 text-white rounded border border-wood-light hover:bg-wood transition-all tracking-wider"
        >
          ▶ 动画
        </button>
      </div>

      <div class="flex gap-1.5 pt-2 border-t border-wood-dark/30">
        <button
          @click="$emit('toggle-wireframe')"
          :class="[
            'flex-1 px-2 py-1 text-xs rounded border transition-all tracking-wider',
            wireframeMode ? 'bg-wood-light/20 text-wood border-wood-light/50' : 'bg-wood-dark/50 text-wood-light/70 border-wood-dark/50'
          ]"
        >
          {{ wireframeMode ? '◼ 实体' : '◻ 线框' }}
        </button>
        <button
          @click="$emit('toggle-annotations')"
          :class="[
            'flex-1 px-2 py-1 text-xs rounded border transition-all tracking-wider',
            showAnnotations ? 'bg-wood-light/20 text-wood border-wood-light/50' : 'bg-wood-dark/50 text-wood-light/70 border-wood-dark/50'
          ]"
        >
          {{ showAnnotations ? '📌 标注' : '📍 标注' }}
        </button>
      </div>
    </div>

    <div v-if="savePresetDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/60" @click="closeSavePresetDialog"></div>
      <div class="relative bg-ink border border-wood/40 rounded-lg p-4 w-72 shadow-2xl">
        <h3 class="text-wood font-bold text-sm mb-3 tracking-wider">保存参数预设</h3>
        <label class="block text-[11px] text-wood-light/70 mb-1">预设名称</label>
        <input
          v-model="savePresetName"
          type="text"
          placeholder="请输入预设名称"
          class="w-full bg-wood-dark/30 border border-wood-dark/50 rounded px-2.5 py-1.5 text-xs text-wood-light focus:outline-none focus:border-wood/60"
          @keyup.enter="doSavePreset"
        />
        <label class="block text-[11px] text-wood-light/70 mb-1 mt-2">描述（可选）</label>
        <input
          v-model="savePresetDesc"
          type="text"
          placeholder="预设用途说明"
          class="w-full bg-wood-dark/30 border border-wood-dark/50 rounded px-2.5 py-1.5 text-xs text-wood-light focus:outline-none focus:border-wood/60"
        />
        <div v-if="savePresetError" class="text-[10px] text-red-400 mt-1.5">{{ savePresetError }}</div>
        <div class="flex gap-2 mt-4">
          <button
            @click="closeSavePresetDialog"
            class="flex-1 px-2.5 py-1.5 text-[11px] bg-wood-dark/50 text-wood-light rounded border border-wood-dark/50 hover:bg-wood-dark/70 transition-all tracking-wider"
          >
            取消
          </button>
          <button
            @click="doSavePreset"
            class="flex-1 px-2.5 py-1.5 text-[11px] bg-wood text-white rounded border border-wood-light hover:bg-wood-dark transition-all tracking-wider font-bold"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <div v-if="deletePresetDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/60" @click="closeDeletePresetDialog"></div>
      <div class="relative bg-ink border border-wood/40 rounded-lg p-4 w-72 shadow-2xl">
        <h3 class="text-wood font-bold text-sm mb-2 tracking-wider">确认删除</h3>
        <p class="text-xs text-wood-light/70 leading-relaxed mb-3">
          确定要删除预设「<span class="text-wood font-bold">{{ deletePresetTarget?.name }}</span>」吗？此操作不可撤销。
        </p>
        <div class="flex gap-2 mt-3">
          <button
            @click="closeDeletePresetDialog"
            class="flex-1 px-2.5 py-1.5 text-[11px] bg-wood-dark/50 text-wood-light rounded border border-wood-dark/50 hover:bg-wood-dark/70 transition-all tracking-wider"
          >
            取消
          </button>
          <button
            @click="doDeletePreset"
            class="flex-1 px-2.5 py-1.5 text-[11px] bg-red-600 text-white rounded border border-red-500 hover:bg-red-700 transition-all tracking-wider font-bold"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { JOINT_TYPES } from '../models/jointTypes.js'

const props = defineProps({
  currentType: { type: String, default: 'straight' },
  params: { type: Object, default: () => ({}) },
  presets: { type: Array, default: () => [] },
  currentPresetId: { type: String, default: null },
  explodeProgress: { type: Number, default: 0 },
  wireframeMode: { type: Boolean, default: true },
  showAnnotations: { type: Boolean, default: true }
})

const emit = defineEmits([
  'select-type',
  'param-change',
  'apply-preset',
  'save-preset',
  'delete-preset',
  'explode-change',
  'toggle-explode',
  'animate-explode',
  'toggle-wireframe',
  'toggle-annotations',
  'close'
])

const savePresetDialogOpen = ref(false)
const savePresetName = ref('')
const savePresetDesc = ref('')
const savePresetError = ref('')
const deletePresetDialogOpen = ref(false)
const deletePresetTarget = ref(null)

const jointTypesList = computed(() => Object.values(JOINT_TYPES))
const currentJointType = computed(() => JOINT_TYPES[props.currentType])

function formatValue(v) {
  if (typeof v !== 'number') return v
  return Number.isInteger(v) ? v : v.toFixed(2)
}

function openSavePresetDialog() {
  savePresetName.value = ''
  savePresetDesc.value = ''
  savePresetError.value = ''
  savePresetDialogOpen.value = true
}

function closeSavePresetDialog() {
  savePresetDialogOpen.value = false
  savePresetName.value = ''
  savePresetDesc.value = ''
  savePresetError.value = ''
}

function doSavePreset() {
  if (!savePresetName.value.trim()) {
    savePresetError.value = '预设名称不能为空'
    return
  }
  emit('save-preset', savePresetName.value.trim(), savePresetDesc.value.trim(), closeSavePresetDialog, err => {
    savePresetError.value = err
  })
}

function confirmDeletePreset(preset) {
  deletePresetTarget.value = preset
  deletePresetDialogOpen.value = true
}

function closeDeletePresetDialog() {
  deletePresetDialogOpen.value = false
  deletePresetTarget.value = null
}

function doDeletePreset() {
  if (!deletePresetTarget.value) return
  emit('delete-preset', deletePresetTarget.value.id, closeDeletePresetDialog)
}
</script>
