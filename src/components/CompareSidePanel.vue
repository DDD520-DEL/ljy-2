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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { JOINT_TYPES } from '../models/jointTypes.js'

const props = defineProps({
  currentType: { type: String, default: 'straight' },
  params: { type: Object, default: () => ({}) },
  explodeProgress: { type: Number, default: 0 },
  wireframeMode: { type: Boolean, default: true },
  showAnnotations: { type: Boolean, default: true }
})

defineEmits([
  'select-type',
  'param-change',
  'explode-change',
  'toggle-explode',
  'animate-explode',
  'toggle-wireframe',
  'toggle-annotations',
  'close'
])

const jointTypesList = computed(() => Object.values(JOINT_TYPES))
const currentJointType = computed(() => JOINT_TYPES[props.currentType])

function formatValue(v) {
  if (typeof v !== 'number') return v
  return Number.isInteger(v) ? v : v.toFixed(2)
}
</script>
