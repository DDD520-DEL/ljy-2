<template>
  <Transition name="loader-fade">
    <div
      v-if="visible"
      class="scene-loader"
    >
      <div class="loader-content">
        <div class="loader-icon-wrapper">
          <svg class="loader-saw" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#d4a574;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#8b5a2b;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#5c3a1e;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#a0a0a0;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#606060;stop-opacity:1" />
              </linearGradient>
            </defs>
            <g class="saw-handle">
              <rect x="55" y="8" width="10" height="32" rx="3" fill="url(#woodGrad)" />
              <rect x="50" y="32" width="20" height="8" rx="2" fill="url(#woodGrad)" />
              <rect x="52" y="14" width="6" height="20" rx="1" fill="#5c3a1e" opacity="0.3" />
            </g>
            <g class="saw-blade-wrap">
              <line x1="60" y1="40" x2="60" y2="100" stroke="url(#metalGrad)" stroke-width="3" />
              <polygon
                class="saw-teeth"
                points="
                  44,44 48,48 44,52 48,56 44,60 48,64 44,68 48,72 44,76 48,80 44,84 48,88 44,92 48,96 44,100
                  76,44 72,48 76,52 72,56 76,60 72,64 76,68 72,72 76,76 72,80 76,84 72,88 76,92 72,96 76,100
                "
                fill="url(#metalGrad)"
              />
              <circle cx="60" cy="40" r="5" fill="#5c3a1e" stroke="#d4a574" stroke-width="1" />
            </g>
          </svg>
          <div class="sawdust-particles">
            <span v-for="n in 8" :key="n" class="particle" :style="particleStyle(n)"></span>
          </div>
        </div>
        <div class="loader-text">
          <h1 class="loader-title">榫卯参数化工具</h1>
          <p class="loader-subtitle">传统营造 · 古法今用</p>
        </div>
        <div class="loader-progress">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="progress-text">
            <span class="progress-dots">
              <span>●</span><span>●</span><span>●</span>
            </span>
            <span>正在渲染3D场景</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: true
  }
})

function particleStyle(n) {
  const delay = (n * 0.15).toFixed(2) + 's'
  const angle = ((n - 1) * 45).toFixed(0) + 'deg'
  const size = (4 + (n % 3) * 2).toFixed(0) + 'px'
  return {
    '--delay': delay,
    '--angle': angle,
    '--size': size
  }
}
</script>

<style scoped>
.scene-loader {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, var(--color-ink-alpha-95) 0%, var(--color-ink) 100%);
  overflow: hidden;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.loader-icon-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
}

.loader-saw {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 12px rgba(139, 90, 43, 0.4));
}

.saw-handle {
  transform-origin: 60px 40px;
  animation: saw-rock 1.2s ease-in-out infinite;
}

.saw-blade-wrap {
  transform-origin: 60px 40px;
  animation: saw-rock 1.2s ease-in-out infinite;
}

@keyframes saw-rock {
  0%, 100% {
    transform: rotate(-8deg);
  }
  50% {
    transform: rotate(8deg);
  }
}

.saw-teeth {
  animation: teeth-shimmer 0.8s ease-in-out infinite;
}

@keyframes teeth-shimmer {
  0%, 100% {
    opacity: 0.9;
  }
  50% {
    opacity: 1;
    filter: brightness(1.15);
  }
}

.sawdust-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--size);
  height: var(--size);
  background: #d4a574;
  border-radius: 50%;
  opacity: 0;
  transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0);
  animation: particle-fly 1.5s ease-out var(--delay) infinite;
}

@keyframes particle-fly {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(0.5);
  }
  20% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(70px) scale(0.2);
  }
}

.loader-text {
  text-align: center;
}

.loader-title {
  font-size: 28px;
  font-weight: bold;
  color: var(--color-wood-light);
  letter-spacing: 0.3em;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 8px rgba(139, 90, 43, 0.3);
  animation: title-glow 2s ease-in-out infinite;
}

@keyframes title-glow {
  0%, 100% {
    text-shadow: 0 2px 8px rgba(139, 90, 43, 0.3);
  }
  50% {
    text-shadow: 0 2px 16px rgba(212, 165, 116, 0.5), 0 0 32px rgba(139, 90, 43, 0.2);
  }
}

.loader-subtitle {
  font-size: 13px;
  color: var(--color-wood);
  letter-spacing: 0.4em;
  margin: 0;
  opacity: 0.8;
}

.loader-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 240px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--color-wood-dark);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, var(--color-wood-dark), var(--color-wood-light), var(--color-wood-dark));
  background-size: 200% 100%;
  border-radius: 2px;
  animation: progress-slide 1.5s ease-in-out infinite;
}

@keyframes progress-slide {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.progress-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-wood);
  letter-spacing: 0.15em;
  opacity: 0.7;
}

.progress-dots {
  display: inline-flex;
  gap: 3px;
}

.progress-dots span {
  font-size: 8px;
  color: var(--color-wood-light);
  animation: dot-bounce 1.2s ease-in-out infinite;
}

.progress-dots span:nth-child(2) {
  animation-delay: 0.15s;
}

.progress-dots span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes dot-bounce {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.6s ease-out;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}
</style>
