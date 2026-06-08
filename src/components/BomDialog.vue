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

      <div ref="contentRef" class="flex-1 overflow-auto scrollbar-thin px-6 py-4">
        <div v-if="projectName" class="mb-4 pb-3 border-b border-wood-dark/30">
          <div class="text-xs text-wood-light/50 tracking-wider">项目名称</div>
          <div class="text-wood text-lg font-bold tracking-wider mt-1">{{ projectName }}</div>
        </div>
        <div class="mb-3">
          <div class="text-xs text-wood-light/50 tracking-wider">榫卯类型</div>
          <div class="text-wood-light font-bold tracking-wider mt-0.5">{{ jointName }}</div>
        </div>

        <table class="w-full text-sm mt-4">
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

        <div class="mt-5 p-4 bg-wood/10 rounded border border-wood/40">
          <div class="flex items-center justify-between mb-3">
            <div class="text-wood text-sm font-bold tracking-wider">🪵 用料估算汇总</div>
            <div class="relative">
              <select
                v-model="selectedWoodId"
                class="appearance-none bg-ink/60 border border-wood/40 text-wood-light text-xs rounded px-3 py-1.5 pr-8 focus:outline-none focus:border-wood cursor-pointer"
              >
                <option v-for="w in WOOD_TYPES" :key="w.id" :value="w.id">
                  {{ w.name }} ({{ w.density.toFixed(2) }} g/cm³)
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-wood/60 text-xs">▼</div>
            </div>
          </div>

          <div v-if="selectedWood" class="mb-3 text-xs text-wood-light/50 leading-relaxed">
            {{ selectedWood.note }}
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="bg-wood-dark/30 rounded p-3 border border-wood-dark/40">
              <div class="text-wood-light/50 text-[11px] tracking-wider mb-1">总毛料体积</div>
              <div class="text-wood-light font-mono font-bold">
                {{ formatVolume(totalRawVolume) }}
              </div>
              <div class="text-wood/60 text-[10px] mt-0.5">= {{ components.length }} 件构件</div>
            </div>
            <div class="bg-wood-dark/30 rounded p-3 border border-wood-dark/40">
              <div class="text-wood-light/50 text-[11px] tracking-wider mb-1">总净料体积</div>
              <div class="text-wood-light font-mono font-bold">
                {{ formatVolume(totalNetVolume) }}
              </div>
              <div class="text-wood/60 text-[10px] mt-0.5">刨削损耗率 ~{{ wasteRate }}%</div>
            </div>
            <div class="bg-wood-dark/30 rounded p-3 border border-wood-dark/40">
              <div class="text-wood-light/50 text-[11px] tracking-wider mb-1">预估重量（毛料）</div>
              <div class="text-wood font-mono font-bold text-base">
                {{ formatWeight(totalRawWeight) }}
              </div>
              <div class="text-wood/60 text-[10px] mt-0.5">ρ = {{ selectedWood?.density.toFixed(2) }} g/cm³</div>
            </div>
            <div class="bg-wood-dark/30 rounded p-3 border border-wood-dark/40">
              <div class="text-wood-light/50 text-[11px] tracking-wider mb-1">预估重量（净料）</div>
              <div class="text-wood font-mono font-bold text-base">
                {{ formatWeight(totalNetWeight) }}
              </div>
              <div class="text-wood/60 text-[10px] mt-0.5">实际成品重量</div>
            </div>
          </div>

          <div class="mt-3 p-2.5 bg-ink/40 rounded border border-wood-dark/30">
            <div class="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
              <div class="text-wood-light/60">
                <span class="text-wood/70">各构件毛料明细：</span>
              </div>
              <div v-for="(c, i) in components" :key="c.id" class="text-wood-light/70 font-mono">
                {{ c.name.split('（')[0] }}: {{ formatVolume(componentRawVolume(c)) }}
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 text-right text-xs text-wood-light/40">
          生成时间：{{ formatDate(new Date()) }}
        </div>
      </div>

      <div class="flex gap-3 px-6 py-4 border-t border-wood-dark/40">
        <button
          @click="exportPDF"
          :disabled="exporting"
          class="flex-1 px-4 py-2 bg-wood text-white rounded border border-wood-light hover:bg-wood-dark transition-all text-sm tracking-widest font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ exporting ? '生成中...' : '📄 导出 PDF' }}
        </button>
        <button
          @click="exportCSV"
          class="flex-1 px-4 py-2 bg-wood-dark/50 text-wood-light rounded border border-wood-dark/60 hover:bg-wood-dark/70 transition-all text-sm tracking-widest font-bold"
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
import { ref, computed } from 'vue'
import { COMPONENT_COLORS, WOOD_TYPES } from '../models/jointTypes.js'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const props = defineProps({
  components: { type: Array, default: () => [] },
  jointName: { type: String, default: '' },
  projectName: { type: String, default: '' }
})

defineEmits(['close'])

const contentRef = ref(null)
const exporting = ref(false)
const selectedWoodId = ref(WOOD_TYPES[0].id)

const selectedWood = computed(() => WOOD_TYPES.find(w => w.id === selectedWoodId.value))

function componentRawVolume(c) {
  return c.rawSize.w * c.rawSize.h * c.rawSize.l
}

function componentNetVolume(c) {
  return c.netSize.w * c.netSize.h * c.netSize.l
}

const totalRawVolumeMm3 = computed(() => {
  return props.components.reduce((sum, c) => sum + componentRawVolume(c), 0)
})

const totalNetVolumeMm3 = computed(() => {
  return props.components.reduce((sum, c) => sum + componentNetVolume(c), 0)
})

const totalRawVolume = computed(() => totalRawVolumeMm3.value)
const totalNetVolume = computed(() => totalNetVolumeMm3.value)

const wasteRate = computed(() => {
  if (totalRawVolumeMm3.value === 0) return '0.0'
  const rate = (1 - totalNetVolumeMm3.value / totalRawVolumeMm3.value) * 100
  return rate.toFixed(1)
})

const totalRawWeight = computed(() => {
  if (!selectedWood.value) return 0
  const volumeCm3 = totalRawVolumeMm3.value / 1000
  return volumeCm3 * selectedWood.value.density
})

const totalNetWeight = computed(() => {
  if (!selectedWood.value) return 0
  const volumeCm3 = totalNetVolumeMm3.value / 1000
  return volumeCm3 * selectedWood.value.density
})

function formatVolume(mm3) {
  if (mm3 >= 1e9) {
    return (mm3 / 1e9).toFixed(3) + ' m³'
  } else if (mm3 >= 1e6) {
    return (mm3 / 1e6).toFixed(2) + ' dm³'
  } else if (mm3 >= 1e3) {
    return (mm3 / 1e3).toFixed(1) + ' cm³'
  }
  return mm3.toFixed(0) + ' mm³'
}

function formatWeight(grams) {
  if (grams >= 1000) {
    return (grams / 1000).toFixed(2) + ' kg'
  }
  return grams.toFixed(1) + ' g'
}

function colorHex(i) {
  const c = COMPONENT_COLORS[i % COMPONENT_COLORS.length]
  return '#' + c.toString(16).padStart(6, '0')
}

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

function getFileName() {
  const base = props.projectName || props.jointName || '物料清单'
  const date = new Date().toISOString().slice(0, 10)
  return `${base}_BOM_${date}.pdf`
}

async function exportPDF() {
  if (!contentRef.value || exporting.value) return
  exporting.value = true
  try {
    const target = contentRef.value
    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: '#1a1a1a',
      useCORS: true,
      logging: false
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'l' : 'p',
      unit: 'mm',
      format: 'a4'
    })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const finalWidth = imgWidth * ratio
    const finalHeight = imgHeight * ratio
    const offsetX = (pdfWidth - finalWidth) / 2
    const offsetY = (pdfHeight - finalHeight) / 2
    pdf.addImage(imgData, 'PNG', offsetX, offsetY, finalWidth, finalHeight)
    pdf.save(getFileName())
  } catch (e) {
    console.error('PDF导出失败:', e)
    alert('PDF导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

function exportCSV() {
  const rows = [
    ['序号', '构件名称', '净料宽(mm)', '净料高(mm)', '净料长(mm)', '毛料宽(mm)', '毛料高(mm)', '毛料长(mm)', '净料体积(cm³)', '毛料体积(cm³)', '余量标注']
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
      (componentNetVolume(c) / 1000).toFixed(2),
      (componentRawVolume(c) / 1000).toFixed(2),
      c.allowance
    ])
  })
  rows.push([])
  rows.push(['===== 用料估算汇总 ====='])
  rows.push(['木材种类', selectedWood.value?.name || '', '密度(g/cm³)', selectedWood.value?.density || ''])
  rows.push(['总毛料体积', formatVolume(totalRawVolumeMm3.value), '总净料体积', formatVolume(totalNetVolumeMm3.value)])
  rows.push(['预估毛料重量', formatWeight(totalRawWeight.value), '预估净料重量', formatWeight(totalNetWeight.value)])
  rows.push(['刨削损耗率(%)', wasteRate.value])
  const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const base = props.projectName || props.jointName || '物料清单'
  a.download = `${base}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
