<template>
  <div class="backdrop-blur-sm text-wood-light h-full flex flex-col overflow-hidden font-song" style="background-color: var(--panel-bg);">
    <div class="px-5 py-4 border-b border-wood-dark/40">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-wood text-xl font-bold tracking-widest">榫卯参数化工具</h1>
          <p class="text-xs text-wood-light/60 mt-1">传统营造 · 古法今用</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="handleToggleTheme"
            :title="themeState.theme === 'dark' ? '切换到浅色原木主题' : '切换到深色木纹主题'"
            class="relative w-10 h-10 rounded-full border border-wood/40 flex items-center justify-center overflow-hidden group transition-all duration-500 hover:border-wood/70"
            :class="themeState.theme === 'dark' ? 'bg-wood-dark/50 hover:bg-wood-dark/70' : 'bg-surface hover:bg-surface-hover'"
          >
            <span
              class="absolute inset-0 flex items-center justify-center transition-all duration-500 text-base"
              :class="themeState.theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'"
            >
              🌙
            </span>
            <span
              class="absolute inset-0 flex items-center justify-center transition-all duration-500 text-base"
              :class="themeState.theme === 'dark' ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'"
            >
              ☀️
            </span>
          </button>
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

    <div ref="jointTypeSection" class="px-5 py-4 border-b border-wood-dark/40">
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

    <div class="px-5 py-4 border-b border-wood-dark/40">
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs text-wood-light/70 tracking-wider">参数预设</label>
        <button
          @click="openSavePresetDialog"
          class="text-[11px] text-wood hover:text-wood-light transition-all tracking-wider flex items-center gap-1"
        >
          <span>💾</span>
          <span>保存当前</span>
        </button>
      </div>
      <div class="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
        <template v-if="presets.length === 0">
          <div class="text-xs text-wood-light/40 py-2 text-center italic">暂无预设</div>
        </template>
        <template v-else>
          <div
            v-for="p in presets"
            :key="p.id"
            :class="[
              'group flex items-center gap-2 px-3 py-2 rounded border transition-all cursor-pointer',
              currentPresetId === p.id
                ? 'bg-wood/20 border-wood/50'
                : 'bg-wood-dark/30 border-wood-dark/50 hover:bg-wood-dark/50'
            ]"
            @click="$emit('apply-preset', p)"
          >
            <div class="flex-1 min-w-0">
              <div class="text-sm text-wood-light/90 truncate flex items-center gap-1.5">
                <span v-if="p.builtIn" class="text-[10px] bg-wood/30 text-wood px-1.5 py-0.5 rounded">内置</span>
                <span v-else class="text-[10px] bg-wood-dark/50 text-wood-light/60 px-1.5 py-0.5 rounded">自定义</span>
                <span>{{ p.name }}</span>
              </div>
              <div v-if="p.description" class="text-[10px] text-wood-light/40 mt-0.5 truncate">
                {{ p.description }}
              </div>
            </div>
            <button
              v-if="!p.builtIn"
              @click.stop="confirmDeletePreset(p)"
              class="opacity-0 group-hover:opacity-100 text-xs text-red-400/70 hover:text-red-400 transition-all px-1 py-0.5"
              title="删除预设"
            >
              🗑️
            </button>
          </div>
        </template>
      </div>
    </div>

    <div ref="paramSlidersSection" class="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">
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

    <div ref="explodeSection" class="px-5 py-4 border-t border-wood-dark/40 space-y-3">
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

      <div class="pt-3 border-t border-wood-dark/30">
        <div class="text-xs text-wood-light/70 mb-2 tracking-wider flex items-center justify-between">
          <span>🎬 拆解动画录制</span>
          <span v-if="recordingInfo.frameCount > 0" class="text-[10px] text-wood/60 font-mono">
            {{ recordingInfo.frameCount }} 帧 · {{ recordingInfo.duration.toFixed(1) }}s
          </span>
        </div>
        <div class="flex gap-2">
          <button
            v-if="!isRecording"
            @click="$emit('start-recording')"
            class="flex-1 px-3 py-2 text-xs bg-red-600/80 text-white rounded border border-red-500 hover:bg-red-600 transition-all tracking-wider font-bold flex items-center justify-center gap-1"
          >
            <span class="w-2 h-2 bg-white rounded-full"></span>
            开始录制
          </button>
          <button
            v-else
            @click="$emit('stop-recording')"
            class="flex-1 px-3 py-2 text-xs bg-red-700 text-white rounded border border-red-400 hover:bg-red-800 transition-all tracking-wider font-bold flex items-center justify-center gap-1 animate-pulse"
          >
            <span class="w-2 h-2 bg-red-200 rounded-sm"></span>
            停止录制
          </button>
        </div>
        <div v-if="recordingInfo.frameCount > 0 && !isRecording" class="mt-2">
          <button
            @click="showExportMenu = !showExportMenu"
            class="w-full px-3 py-2 text-xs bg-wood/20 text-wood rounded border border-wood/50 hover:bg-wood/30 transition-all tracking-wider font-bold flex items-center justify-center gap-1"
          >
            💾 导出动画
            <span class="text-[10px]">▼</span>
          </button>
          <div v-if="showExportMenu" class="mt-2 space-y-1.5 bg-wood-dark/20 rounded border border-wood-dark/40 p-2">
            <button
              @click="handleExportGIF"
              class="w-full px-3 py-2 text-xs bg-wood/70 text-white rounded border border-wood-light hover:bg-wood transition-all text-left tracking-wider"
            >
              🎞️ 导出为 GIF 动图
            </button>
            <button
              @click="handleExportVideo('webm')"
              class="w-full px-3 py-2 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood-dark/60 hover:bg-wood-dark/70 transition-all text-left tracking-wider"
            >
              🎥 导出为 WebM 视频
            </button>
            <button
              @click="handleExportVideo('mp4')"
              class="w-full px-3 py-2 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood-dark/60 hover:bg-wood-dark/70 transition-all text-left tracking-wider"
            >
              📹 导出为 MP4 视频
            </button>
          </div>
        </div>
        <div class="mt-2 text-[10px] text-wood-light/40 leading-relaxed">
          点击录制后将自动播放完整拆解动画（拆解+复原）
        </div>
      </div>

      <button
        @click="$emit('open-share')"
        class="w-full px-3 py-2.5 text-sm bg-gradient-to-r from-wood to-wood-dark text-white rounded border border-wood-light hover:from-wood-dark hover:to-wood transition-all tracking-widest font-bold shadow-lg flex items-center justify-center gap-2"
      >
        <span>🔗</span>
        <span>分享模型</span>
      </button>

      <button
        @click="$emit('export-bom')"
        class="w-full px-3 py-2.5 text-sm bg-wood text-white rounded border border-wood-light hover:bg-wood-dark transition-all tracking-widest font-bold shadow-lg"
      >
        📋 导出物料清单 (BOM)
      </button>

      <div class="pt-3 border-t border-wood-dark/30">
        <div class="text-xs text-wood-light/70 mb-2 tracking-wider">3D 模型导出 (STL)</div>
        <div class="flex gap-2">
          <button
            @click="showSTLMenu = !showSTLMenu"
            class="flex-1 px-3 py-2 text-xs bg-wood/20 text-wood rounded border border-wood/50 hover:bg-wood/30 transition-all tracking-wider font-bold flex items-center justify-center gap-1"
          >
            🖨 导出 STL
            <span class="text-[10px]">▼</span>
          </button>
        </div>
        <div v-if="showSTLMenu" class="mt-2 space-y-1.5 bg-wood-dark/20 rounded border border-wood-dark/40 p-2">
          <button
            @click="handleExportSTLAll"
            class="w-full px-3 py-2 text-xs bg-wood/70 text-white rounded border border-wood-light hover:bg-wood transition-all text-left tracking-wider"
          >
            📦 整体导出（合并为一个文件）
          </button>
          <button
            @click="handleExportSTLSeparate"
            class="w-full px-3 py-2 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood-dark/60 hover:bg-wood-dark/70 transition-all text-left tracking-wider"
          >
            🧩 分构件导出（每个构件单独文件）
          </button>
        </div>
      </div>
    </div>

    <div v-if="saveDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/60" @click="closeSaveDialog"></div>
      <div class="relative border border-wood/40 rounded-lg p-5 w-80 shadow-2xl" style="background-color: var(--color-ink);">
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
      <div class="relative border border-wood/40 rounded-lg p-5 w-80 shadow-2xl" style="background-color: var(--color-ink);">
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
      <div class="relative border border-wood/40 rounded-lg p-5 w-80 shadow-2xl" style="background-color: var(--color-ink);">
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

    <div v-if="savePresetDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/60" @click="closeSavePresetDialog"></div>
      <div class="relative border border-wood/40 rounded-lg p-5 w-80 shadow-2xl" style="background-color: var(--color-ink);">
        <h3 class="text-wood font-bold text-lg mb-4 tracking-wider">保存参数预设</h3>
        <label class="block text-xs text-wood-light/70 mb-2">预设名称</label>
        <input
          v-model="savePresetName"
          type="text"
          placeholder="请输入预设名称"
          class="w-full bg-wood-dark/30 border border-wood-dark/50 rounded px-3 py-2 text-sm text-wood-light focus:outline-none focus:border-wood/60"
          @keyup.enter="doSavePreset"
        />
        <label class="block text-xs text-wood-light/70 mb-2 mt-3">描述（可选）</label>
        <input
          v-model="savePresetDesc"
          type="text"
          placeholder="预设用途说明"
          class="w-full bg-wood-dark/30 border border-wood-dark/50 rounded px-3 py-2 text-sm text-wood-light focus:outline-none focus:border-wood/60"
        />
        <div v-if="savePresetError" class="text-xs text-red-400 mt-2">{{ savePresetError }}</div>
        <div class="flex gap-2 mt-5">
          <button
            @click="closeSavePresetDialog"
            class="flex-1 px-3 py-2 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood-dark/50 hover:bg-wood-dark/70 transition-all tracking-wider"
          >
            取消
          </button>
          <button
            @click="doSavePreset"
            class="flex-1 px-3 py-2 text-xs bg-wood text-white rounded border border-wood-light hover:bg-wood-dark transition-all tracking-wider font-bold"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <div v-if="deletePresetDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/60" @click="closeDeletePresetDialog"></div>
      <div class="relative border border-wood/40 rounded-lg p-5 w-80 shadow-2xl" style="background-color: var(--color-ink);">
        <h3 class="text-wood font-bold text-lg mb-2 tracking-wider">确认删除</h3>
        <p class="text-sm text-wood-light/70 leading-relaxed mb-4">
          确定要删除预设「<span class="text-wood font-bold">{{ deletePresetTarget?.name }}</span>」吗？此操作不可撤销。
        </p>
        <div class="flex gap-2 mt-5">
          <button
            @click="closeDeletePresetDialog"
            class="flex-1 px-3 py-2 text-xs bg-wood-dark/50 text-wood-light rounded border border-wood-dark/50 hover:bg-wood-dark/70 transition-all tracking-wider"
          >
            取消
          </button>
          <button
            @click="doDeletePreset"
            class="flex-1 px-3 py-2 text-xs bg-red-600 text-white rounded border border-red-500 hover:bg-red-700 transition-all tracking-wider font-bold"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <div v-if="uploadDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/60" @click="closeUploadDialog"></div>
      <div class="relative border border-wood/40 rounded-lg p-5 w-80 shadow-2xl" style="background-color: var(--color-ink);">
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
import { useTheme } from '../stores/theme.js'

const { state: themeState, toggleTheme } = useTheme()

const jointTypeSection = ref(null)
const paramSlidersSection = ref(null)
const explodeSection = ref(null)

defineExpose({
  jointTypeSection,
  paramSlidersSection,
  explodeSection
})

function handleToggleTheme() {
  toggleTheme()
}

const props = defineProps({
  currentType: { type: String, default: 'straight' },
  params: { type: Object, default: () => ({}) },
  presets: { type: Array, default: () => [] },
  currentPresetId: { type: String, default: null },
  explodeProgress: { type: Number, default: 0 },
  wireframeMode: { type: Boolean, default: true },
  showAnnotations: { type: Boolean, default: true },
  projects: { type: Array, default: () => [] },
  currentProjectId: { type: String, default: null },
  user: { type: Object, default: null },
  cloudProjects: { type: Array, default: () => [] },
  syncLoading: { type: Boolean, default: false },
  isRecording: { type: Boolean, default: false },
  recordingInfo: { type: Object, default: () => ({ frameCount: 0, duration: 0 }) }
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
  'export-bom',
  'export-stl-all',
  'export-stl-separate',
  'save-project',
  'load-project',
  'delete-project',
  'rename-project',
  'refresh-projects',
  'refresh-cloud',
  'upload-to-cloud',
  'download-from-cloud',
  'logout',
  'go-login',
  'start-recording',
  'stop-recording',
  'export-animation-gif',
  'export-animation-video',
  'open-share'
])

const showExportMenu = ref(false)

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
const showSTLMenu = ref(false)
const savePresetDialogOpen = ref(false)
const savePresetName = ref('')
const savePresetDesc = ref('')
const savePresetError = ref('')
const deletePresetDialogOpen = ref(false)
const deletePresetTarget = ref(null)

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
  uploadError.value = ''
  emit('upload-to-cloud', uploadTarget.value.id,
    () => {
      closeUploadDialog()
    },
    (err) => {
      uploading.value = false
      uploadError.value = err || '上传失败'
    }
  )
}

function handleDownload(project) {
  emit('download-from-cloud', project.id)
}

function handleRefreshCloud() {
  emit('refresh-cloud')
}

function handleExportSTLAll() {
  showSTLMenu.value = false
  emit('export-stl-all')
}

function handleExportSTLSeparate() {
  showSTLMenu.value = false
  emit('export-stl-separate')
}

function handleExportGIF() {
  showExportMenu.value = false
  emit('export-animation-gif')
}

function handleExportVideo(format) {
  showExportMenu.value = false
  emit('export-animation-video', format)
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
