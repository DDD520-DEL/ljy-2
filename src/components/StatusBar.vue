<template>
  <div class="status-bar">
    <div class="status-item">
      <span class="status-label">FPS</span>
      <span class="status-value" :class="fpsColor">{{ fps }}</span>
    </div>
    <div class="status-divider"></div>
    <div class="status-item">
      <span class="status-label">相机坐标</span>
      <span class="status-value mono">
        X: {{ cameraPosition.x }} &nbsp; Y: {{ cameraPosition.y }} &nbsp; Z: {{ cameraPosition.z }}
      </span>
    </div>
    <div class="status-divider"></div>
    <div class="status-item">
      <span class="status-label">榫卯类型</span>
      <span class="status-value accent">{{ jointTypeName }}</span>
    </div>
    <div class="status-divider"></div>
    <div class="status-item">
      <span class="status-label">构件数量</span>
      <span class="status-value">{{ componentCount }} 件</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  fps: {
    type: Number,
    default: 0
  },
  cameraPosition: {
    type: Object,
    default: () => ({ x: '0.0', y: '0.0', z: '0.0' })
  },
  jointTypeName: {
    type: String,
    default: ''
  },
  componentCount: {
    type: Number,
    default: 0
  }
})

const fpsColor = computed(() => {
  if (props.fps >= 50) return 'fps-good'
  if (props.fps >= 30) return 'fps-medium'
  return 'fps-low'
})
</script>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: var(--status-bg);
  backdrop-filter: blur(8px);
  border-top: 1px solid var(--status-border);
  font-family: "Source Han Serif SC", "Noto Serif SC", serif;
  user-select: none;
  transition: background-color 0.4s ease, border-color 0.4s ease;
}

.status-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.status-label {
  font-size: 11px;
  color: var(--status-label);
  letter-spacing: 1px;
  font-weight: 600;
  transition: color 0.4s ease;
}

.status-value {
  font-size: 13px;
  color: var(--status-value);
  font-weight: 500;
  transition: color 0.4s ease;
}

.status-value.mono {
  font-family: "JetBrains Mono", "Consolas", monospace;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.status-value.accent {
  color: var(--status-accent);
  font-weight: 600;
  transition: color 0.4s ease;
}

.fps-good {
  color: #6bc46b;
  font-weight: 700;
}

.fps-medium {
  color: #e6c44a;
  font-weight: 700;
}

.fps-low {
  color: #e06b6b;
  font-weight: 700;
}

.status-divider {
  width: 1px;
  height: 16px;
  background: var(--status-border);
  opacity: 0.7;
  transition: background 0.4s ease;
}
</style>
