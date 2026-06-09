<template>
  <div
    v-if="open"
    class="fixed inset-0 z-40 flex items-center justify-center"
    @click.self="$emit('close')"
  >
    <div class="absolute inset-0 bg-black/60" @click="$emit('close')"></div>
    <div class="relative border border-wood/40 rounded-lg shadow-2xl w-[640px] max-w-[92vw] max-h-[80vh] flex flex-col font-song" style="background-color: var(--color-ink);">
      <div class="px-5 py-4 border-b border-wood-dark/40 flex items-center justify-between">
        <div>
          <h3 class="text-wood font-bold text-lg tracking-wider">⌨️ 键盘快捷键</h3>
          <p class="text-xs text-wood-light/50 mt-0.5">按 <kbd class="kbd-inline">?</kbd> 或 <kbd class="kbd-inline">/</kbd> 随时呼出此面板</p>
        </div>
        <button
          @click="$emit('close')"
          class="text-wood-light/60 hover:text-wood text-xl leading-none transition-colors"
        >
          ✕
        </button>
      </div>

      <div class="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">
        <div v-for="group in shortcutGroups" :key="group.title" class="mb-5 last:mb-0">
          <div class="text-xs text-wood/80 font-bold tracking-wider mb-2.5 pb-1.5 border-b border-wood-dark/30">
            {{ group.title }}
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <div
              v-for="item in group.items"
              :key="item.label"
              class="flex items-center justify-between px-3 py-2 rounded bg-wood-dark/20 border border-wood-dark/30"
            >
              <span class="text-sm text-wood-light/85">{{ item.label }}</span>
              <div class="flex items-center gap-1">
                <kbd v-for="(key, idx) in item.keys" :key="idx" class="kbd">
                  {{ key }}
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-5 py-3 border-t border-wood-dark/40 bg-wood-dark/10 flex items-center justify-between">
        <span class="text-[11px] text-wood-light/50">
          提示：Ctrl / ⌘ 键在 Mac 与 Windows 通用
        </span>
        <button
          @click="$emit('close')"
          class="px-4 py-1.5 text-xs bg-wood/80 text-white rounded border border-wood-light hover:bg-wood transition-all tracking-wider"
        >
          知道了
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false }
})

defineEmits(['close'])

const shortcutGroups = [
  {
    title: '视图控制',
    items: [
      { label: '切换线框 / 实体模式', keys: ['W'] },
      { label: '重置视角（居中）', keys: ['R'] },
      { label: '正视', keys: ['F1'] },
      { label: '侧视', keys: ['F2'] },
      { label: '俯视', keys: ['F3'] },
      { label: '45°等轴测', keys: ['F4'] },
      { label: '重置视角（平滑过渡）', keys: ['F5'] },
      { label: '切换标注显示', keys: ['N'] },
      { label: '显示 / 隐藏快捷键面板', keys: ['?'] }
    ]
  },
  {
    title: '拆解动画',
    items: [
      { label: '拆解 / 复原（切换）', keys: ['E'] },
      { label: '播放拆解动画', keys: ['Space'] },
      { label: '拆解进度 +10%', keys: ['→'] },
      { label: '拆解进度 -10%', keys: ['←'] }
    ]
  },
  {
    title: '榫卯类型切换',
    items: [
      { label: '直榫', keys: ['1'] },
      { label: '燕尾榫', keys: ['2'] },
      { label: '粽角榫', keys: ['3'] },
      { label: '楔钉榫', keys: ['4'] },
      { label: '格肩榫', keys: ['5'] },
      { label: '切换到上一种类型', keys: ['↑'] },
      { label: '切换到下一种类型', keys: ['↓'] }
    ]
  },
  {
    title: '历史操作',
    items: [
      { label: '撤销上一步', keys: ['Ctrl', 'Z'] },
      { label: '打开历史记录面板', keys: ['H'] },
      { label: '恢复默认状态', keys: ['Ctrl', 'R'] }
    ]
  },
  {
    title: '导出与分享',
    items: [
      { label: '导出物料清单 (BOM)', keys: ['Ctrl', 'B'] },
      { label: '导出 STL（整体）', keys: ['Ctrl', 'S'] },
      { label: '分享当前模型', keys: ['Ctrl', 'K'] }
    ]
  }
]
</script>

<style scoped>
.kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 22px;
  padding: 0 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--kbd-text);
  background: var(--kbd-bg);
  border: 1px solid var(--kbd-border);
  border-bottom-width: 2px;
  border-radius: 4px;
  line-height: 1;
  transition: background-color 0.4s ease, border-color 0.4s ease, color 0.4s ease;
}

.kbd-inline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  height: 16px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  font-weight: 600;
  color: var(--kbd-text);
  background: var(--kbd-bg);
  border: 1px solid var(--kbd-border);
  border-bottom-width: 2px;
  border-radius: 3px;
  line-height: 1;
  transition: background-color 0.4s ease, border-color 0.4s ease, color 0.4s ease;
}
</style>
