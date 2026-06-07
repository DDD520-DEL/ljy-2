<template>
  <div class="bg-ink/90 backdrop-blur-sm text-wood-light h-full flex flex-col overflow-hidden font-song">
    <div class="px-5 py-4 border-b border-wood-dark/40">
      <h1 class="text-wood text-xl font-bold tracking-widest">榫卯参数化工具</h1>
      <p class="text-xs text-wood-light/60 mt-1">传统营造 · 古法今用</p>
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
  'export-bom'
])

const jointTypesList = computed(() => Object.values(JOINT_TYPES))
const currentJointType = computed(() => JOINT_TYPES[props.currentType])

function formatValue(v) {
  if (typeof v !== 'number') return v
  return Number.isInteger(v) ? v : v.toFixed(2)
}
</script>
