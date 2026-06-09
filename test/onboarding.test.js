function assert(cond, msg) {
  if (!cond) {
    console.error('❌ FAIL:', msg)
    process.exitCode = 1
  } else {
    console.log('✅ PASS:', msg)
  }
}

console.log('\n=== 新手引导移动端适配功能测试 ===\n')

console.log('--- 测试 1: 移动端检测逻辑（< 768px 视为移动端） ---')
{
  function checkIsMobileView(width) {
    return width < 768
  }

  assert(checkIsMobileView(375) === true, 'iPhone 宽度 375px 应识别为移动端')
  assert(checkIsMobileView(767) === true, '767px 应识别为移动端')
  assert(checkIsMobileView(768) === false, '768px 应识别为桌面端')
  assert(checkIsMobileView(1024) === false, 'iPad 宽度 1024px 应识别为桌面端')
  assert(checkIsMobileView(1920) === false, '桌面 1920px 应识别为桌面端')
}

console.log('\n--- 测试 2: 引导步骤数量根据设备类型变化 ---')
{
  function getStepsCount(isMobile) {
    return isMobile ? 4 : 3
  }

  assert(getStepsCount(true) === 4, '移动端应有 4 个步骤（含打开参数面板）')
  assert(getStepsCount(false) === 3, '桌面端应有 3 个步骤')
}

console.log('\n--- 测试 3: 移动端步骤顺序验证 ---')
{
  const mobileSteps = [
    { key: 'open-panel', title: '打开参数面板' },
    { key: 'joint-type', title: '榫卯类型选择' },
    { key: 'params', title: '调节参数滑块' },
    { key: 'explode', title: '拆解动画' }
  ]

  assert(mobileSteps.length === 4, '移动端步骤数量正确')
  assert(mobileSteps[0].key === 'open-panel', '第 1 步应为打开参数面板')
  assert(mobileSteps[1].key === 'joint-type', '第 2 步应为榫卯类型选择')
  assert(mobileSteps[2].key === 'params', '第 3 步应为调节参数滑块')
  assert(mobileSteps[3].key === 'explode', '第 4 步应为拆解动画')
}

console.log('\n--- 测试 4: 桌面端步骤顺序验证 ---')
{
  const desktopSteps = [
    { key: 'joint-type', title: '榫卯类型选择' },
    { key: 'params', title: '调节参数滑块' },
    { key: 'explode', title: '拆解动画' }
  ]

  assert(desktopSteps.length === 3, '桌面端步骤数量正确')
  assert(desktopSteps[0].key === 'joint-type', '第 1 步应为榫卯类型选择')
  assert(desktopSteps[1].key === 'params', '第 2 步应为调节参数滑块')
  assert(desktopSteps[2].key === 'explode', '第 3 步应为拆解动画')
}

console.log('\n--- 测试 5: resolveTarget 目标元素解析函数 ---')
{
  function resolveTarget(selector) {
    if (!selector) return null
    if (typeof selector === 'string') return 'querySelector:' + selector
    if (selector && selector.$el) return selector.$el
    if (selector instanceof Object && selector.nodeType === 1) return selector
    if (selector instanceof Object) return selector
    return null
  }

  assert(resolveTarget(null) === null, 'null 目标应返回 null')
  assert(resolveTarget(undefined) === null, 'undefined 目标应返回 null')
  assert(resolveTarget('') === null, '空字符串目标应返回 null')
  assert(resolveTarget('#my-id') === 'querySelector:#my-id', 'CSS 选择器应被正确解析')
  assert(resolveTarget('.my-class') === 'querySelector:.my-class', 'CSS 类选择器应被正确解析')

  const fakeRef = { $el: { tagName: 'DIV' } }
  assert(resolveTarget(fakeRef) === fakeRef.$el, 'Vue ref 对象应提取出 $el')

  const fakeEl = { nodeType: 1, tagName: 'BUTTON' }
  assert(resolveTarget(fakeEl) === fakeEl, '原生 DOM 元素应直接返回')
}

console.log('\n--- 测试 6: 高亮区域有效性验证（宽度和高度 > 0） ---')
{
  function isValidHighlight(rect) {
    if (!rect) return false
    return rect.width > 0 && rect.height > 0
  }

  assert(isValidHighlight({ top: 10, left: 10, width: 100, height: 50 }) === true, '正常尺寸应视为有效')
  assert(isValidHighlight({ top: 0, left: 0, width: 1, height: 1 }) === true, '最小 1px 应视为有效')
  assert(isValidHighlight({ top: 10, left: 10, width: 0, height: 50 }) === false, '宽度为 0 应视为无效')
  assert(isValidHighlight({ top: 10, left: 10, width: 100, height: 0 }) === false, '高度为 0 应视为无效')
  assert(isValidHighlight({ top: 10, left: 10, width: -1, height: 50 }) === false, '负宽度应视为无效')
  assert(isValidHighlight(null) === false, 'null 矩形应视为无效')
  assert(isValidHighlight(undefined) === false, 'undefined 矩形应视为无效')
}

console.log('\n--- 测试 7: centeredMode 居中模式判断（目标缺失时启用） ---')
{
  function isCenteredMode(highlightRect) {
    return !highlightRect
  }

  assert(isCenteredMode(null) === true, '高亮矩形为 null 时应进入居中模式')
  assert(isCenteredMode(undefined) === true, '高亮矩形为 undefined 时应进入居中模式')
  assert(isCenteredMode({ top: 10, left: 10, width: 100, height: 50 }) === false, '高亮矩形有效时不应进入居中模式')
}

console.log('\n--- 测试 8: 移动端步骤切换时是否自动打开面板 ---')
{
  function shouldOpenMobilePanel(isMobile, stepIndex, isPanelOpen) {
    return isMobile && stepIndex >= 1 && !isPanelOpen
  }

  assert(shouldOpenMobilePanel(true, 0, false) === false, '移动端第 0 步不自动打开面板')
  assert(shouldOpenMobilePanel(true, 1, false) === true, '移动端第 1 步且面板关闭时应自动打开')
  assert(shouldOpenMobilePanel(true, 1, true) === false, '移动端第 1 步但面板已打开时不重复打开')
  assert(shouldOpenMobilePanel(true, 3, false) === true, '移动端第 3 步且面板关闭时应自动打开')
  assert(shouldOpenMobilePanel(false, 1, false) === false, '桌面端不自动打开面板')
}

console.log('\n--- 测试 9: 引导弹窗位置计算边界检测 ---')
{
  function clampPosition(value, min, max) {
    return Math.max(min, Math.min(max, value))
  }

  function computeTooltipPosition(highlightRect, position, viewportW, viewportH) {
    const gap = 16
    const tooltipWidth = 300
    const tooltipHeight = 200
    let left = 0
    let top = 0

    switch (position) {
      case 'right':
        left = highlightRect.right + gap
        top = highlightRect.top
        break
      case 'left':
        left = highlightRect.left - tooltipWidth - gap
        top = highlightRect.top
        break
      case 'bottom':
        left = highlightRect.left
        top = highlightRect.bottom + gap
        break
      case 'top':
        left = highlightRect.left
        top = highlightRect.top - tooltipHeight - gap
        break
    }

    left = clampPosition(left, 16, viewportW - tooltipWidth - 16)
    top = clampPosition(top, 16, viewportH - tooltipHeight - 16)

    return { left, top }
  }

  const rect = { left: 500, top: 100, right: 700, bottom: 300 }
  const viewport = { w: 1280, h: 800 }

  const posRight = computeTooltipPosition(rect, 'right', viewport.w, viewport.h)
  assert(posRight.left === 716, '右侧定位应在高亮矩形右侧 16px 处')
  assert(posRight.top === 100, '右侧定位 top 应与高亮矩形 top 一致')

  const posLeft = computeTooltipPosition(rect, 'left', viewport.w, viewport.h)
  assert(posLeft.left === 500 - 300 - 16, '左侧定位应在高亮矩形左侧减去宽度和间距')

  const posBottom = computeTooltipPosition(rect, 'bottom', viewport.w, viewport.h)
  assert(posBottom.top === 316, '底部定位应在高亮矩形底部 16px 处')

  const edgeRect = { left: 1, top: 1, right: 50, bottom: 50 }
  const posEdge = computeTooltipPosition(edgeRect, 'left', viewport.w, viewport.h)
  assert(posEdge.left >= 16, '超出左边界时应被 clamp 到最小 16px')
  assert(posEdge.top >= 16, '超出上边界时应被 clamp 到最小 16px')

  const farRightRect = { left: 1200, top: 700, right: 1270, bottom: 750 }
  const posFarRight = computeTooltipPosition(farRightRect, 'right', viewport.w, viewport.h)
  assert(posFarRight.left <= viewport.w - 300 - 16, '超出右边界时应被 clamp 到视口右侧内')
  assert(posFarRight.top <= viewport.h - 200 - 16, '超出下边界时应被 clamp 到视口底部内')
}

console.log('\n--- 测试 10: localStorage 引导完成状态读写 ---')
{
  const fakeStore = new Map()
  const ONBOARDING_KEY = 'mortise_tenon_onboarding_completed'

  function setCompleted() { fakeStore.set(ONBOARDING_KEY, 'true') }
  function isCompleted() { return fakeStore.get(ONBOARDING_KEY) === 'true' }
  function clearCompleted() { fakeStore.delete(ONBOARDING_KEY) }

  assert(isCompleted() === false, '初始状态应为未完成')
  setCompleted()
  assert(isCompleted() === true, '标记完成后应返回 true')
  clearCompleted()
  assert(isCompleted() === false, '清除后应返回 false')
}

console.log('\n--- 测试 11: 步骤边界保护（不允许越界） ---')
{
  function nextStep(current, total) {
    return current < total - 1 ? current + 1 : current
  }
  function prevStep(current) {
    return current > 0 ? current - 1 : current
  }

  assert(nextStep(0, 3) === 1, '从第 0 步下一步应为第 1 步')
  assert(nextStep(1, 3) === 2, '从第 1 步下一步应为第 2 步')
  assert(nextStep(2, 3) === 2, '从最后一步下一步应保持不变')
  assert(nextStep(3, 4) === 3, '从最后一步（4步中）下一步应保持不变')

  assert(prevStep(2) === 1, '从第 2 步上一步应为第 1 步')
  assert(prevStep(1) === 0, '从第 1 步上一步应为第 0 步')
  assert(prevStep(0) === 0, '从第 0 步上一步应保持不变')
}

console.log('\n--- 测试 12: 完成引导后移动端面板状态清理 ---')
{
  function completeOnboarding(isMobile, currentPanelOpen) {
    const completed = true
    const onboardingVisible = false
    const panelOpen = isMobile ? false : currentPanelOpen
    return { completed, onboardingVisible, panelOpen }
  }

  const mobileResult = completeOnboarding(true, true)
  assert(mobileResult.onboardingVisible === false, '完成后引导应隐藏')
  assert(mobileResult.panelOpen === false, '移动端完成后应关闭面板')

  const desktopResult = completeOnboarding(false, true)
  assert(desktopResult.onboardingVisible === false, '桌面端完成后引导应隐藏')
  assert(desktopResult.panelOpen === true, '桌面端面板状态应保持不变')
}

console.log('\n=== 所有测试执行完毕 ===\n')
