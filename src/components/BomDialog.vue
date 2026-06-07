<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-ink border border-wood/50 rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col font-song">
      <div class="flex justify-between items-center px-6 py-4 border-b border-wood-dark/40">
        <div>
          <h2 class="text-wood text-lg font-bold tracking-widest">物料清单 BOM</h2>
          <p class="text-xs text-wood-light/50 mt-0.5">营造法式 · 构件备料</p>
        </div>
        <button @click="$emit('close')" class="text-wood-light/60 hover:text-wood text-xl leading-none px-2">×</button>
      </div>

      <div class="flex-1 overflow-auto scrollbar-thin px-6 py-4">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-wood text-left border-b border-wood/30">
              <th class="py-2 pr-3 font-bold tracking-wider">序号</th>
              <th class="py-2 pr-3 font-bold tracking-wider">构件名称</th>
              <th class="py-2 pr-3 font-bold tracking-wider">净料尺寸 (mm)</th>
              <th class="py-2 pr-3 font-bold tracking-wider">毛料尺寸 (mm)</th>
              <th class="py-2 font-bold tracking-wider">余量标注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, i) in components" :key="c.id" class="border-b border-wood-dark/20 hover:bg-wood-dark/10">
              <td class="py-3 pr-3 text-wood-light/60 font-mono">{{ String(i + 1).padStart(2, '0') }}</td>
              <td class="py-3 pr-3 text-wood-light font-bold tracking-wider">
                <span class="inline-block w-3 h-3 rounded-sm mr-2" :style="{ background: colorHex(i) }"></span>
                {{ c.name }}
              </td>
              <td class="py-3 pr-3 text-wood-light/90 font-mono text-xs">
                {{ c.netSize.w.toFixed(0) }} × {{ c.netSize.h.toFixed(0) }} × {{ c.netSize.l.toFixed(0) }}
              </td>
              <td class="py-3 pr-3 text-wood-light/90 font-mono text-xs">
                {{ c.rawSize.w.toFixed(0) }} × {{ c.rawSize.h.toFixed(0) }} × {{ c.rawSize.l.toFixed(0) }}
              </td>
              <td class="py-3 text-wood/80 text-xs">{{ c.allowance }}</td>
            </tr>
          </tbody>
        </table>

        <div class="mt-6 p-4 bg-wood-dark/20 rounded border border-wood-dark/30">
          <div class="text-wood text-xs font-bold tracking-wider mb-2">📐 备料说明</div>
          <ul class="text-xs text-wood-light/70 space-y-1.5 leading-relaxed">
            <li>· 净料尺寸：刨光、开榫后的实际装配尺寸</li>
            <li>· 毛料尺寸：已包含榫头余量、刨削余量的下料尺寸</li>
            <li>· 建议再预留 5mm~10mm 截断余量以备修整</li>
          </ul>
        </div>
      </div>

      <div class="flex gap-3 px-6 py-4 border-t border-wood-dark/40">
        <button
          @click="exportCSV"
          class="flex-1 px-4 py-2 bg-wood text-white rounded border border-wood-light hover:bg-wood-dark transition-all text-sm tracking-widest font-bold"
        >
          📥 导出 CSV
        </button>
        <button
          @click="$emit('close')"
          class="px-6 py-2 bg-wood-dark/50 text-wood-light rounded border border-wood-dark/60 hover:bg-wood-dark/70 transition-all text-sm tracking-wider"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { COMPONENT_COLORS } from '../models/jointTypes.js'

const props = defineProps({
  components: { type: Array, default: () => [] },
  jointName: { type: String, default: '' }
})

defineEmits(['close'])

function colorHex(i) {
  const c = COMPONENT_COLORS[i % COMPONENT_COLORS.length]
  return '#' + c.toString(16).padStart(6, '0')
}

function exportCSV() {
  const rows = [
    ['序号', '构件名称', '净料宽(mm)', '净料高(mm)', '净料长(mm)', '毛料宽(mm)', '毛料高(mm)', '毛料长(mm)', '余量标注']
  ]
  props.components.forEach((c, i) => {
    rows.push([
      i + 1,
      c.name,
      c.netSize.w.toFixed(0),
      c.netSize.h.toFixed(0),
      c.netSize.l.toFixed(0),
      c.rawSize.w.toFixed(0),
      c.rawSize.h.toFixed(0),
      c.rawSize.l.toFixed(0),
      c.allowance
    ])
  })
  const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `物料清单_${props.jointName}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
