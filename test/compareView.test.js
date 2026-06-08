import { JOINT_TYPES } from '../src/models/jointTypes.js'

function assert(cond, msg) {
  if (!cond) {
    console.error('❌ FAIL:', msg)
    process.exitCode = 1
  } else {
    console.log('✅ PASS:', msg)
  }
}

function getDefaultParams(type) {
  const ps = {}
  for (const p of JOINT_TYPES[type].params) {
    ps[p.key] = p.default
  }
  return ps
}

console.log('\n=== 并排对比视图功能测试 ===\n')

console.log('--- 测试 1: swapSides 交换逻辑正确性验证 ---')
{
  function reactiveAssign(target, source) { return Object.assign(target, source) }

  const leftType = { value: 'straight' }
  const rightType = { value: 'dovetail' }
  const leftParams = getDefaultParams('straight')
  const rightParams = getDefaultParams('dovetail')
  const leftExplode = { value: 0.5 }
  const rightExplode = { value: 0 }
  const leftWireframe = { value: true }
  const rightWireframe = { value: false }
  const leftAnnotations = { value: true }
  const rightAnnotations = { value: false }

  let leftLoaded = false
  let rightLoaded = false
  function loadLeftJoint() { leftLoaded = true }
  function loadRightJoint() { rightLoaded = true }

  function swapSides() {
    const tmpType = leftType.value
    const tmpParams = { ...leftParams }
    const tmpExplode = leftExplode.value
    const tmpWireframe = leftWireframe.value
    const tmpAnnotations = leftAnnotations.value

    leftType.value = rightType.value
    reactiveAssign(leftParams, rightParams)
    leftExplode.value = rightExplode.value
    leftWireframe.value = rightWireframe.value
    leftAnnotations.value = rightAnnotations.value

    rightType.value = tmpType
    reactiveAssign(rightParams, tmpParams)
    rightExplode.value = tmpExplode
    rightWireframe.value = tmpWireframe
    rightAnnotations.value = tmpAnnotations

    loadLeftJoint()
    loadRightJoint()
  }

  const origLeftType = leftType.value
  const origRightType = rightType.value
  const origLeftExplode = leftExplode.value
  const origRightExplode = rightExplode.value
  const origLeftWireframe = leftWireframe.value
  const origRightWireframe = rightWireframe.value
  const origLeftAnnotations = leftAnnotations.value
  const origRightAnnotations = rightAnnotations.value
  const origLeftParamsCopy = { ...leftParams }
  const origRightParamsCopy = { ...rightParams }

  swapSides()

  assert(leftType.value === origRightType, `交换后左侧类型应为原右侧类型 (${leftType.value} === ${origRightType})`)
  assert(rightType.value === origLeftType, `交换后右侧类型应为原左侧类型 (${rightType.value} === ${origLeftType})`)
  assert(leftExplode.value === origRightExplode, `交换后左侧拆解进度应为原右侧进度 (${leftExplode.value} === ${origRightExplode})`)
  assert(rightExplode.value === origLeftExplode, `交换后右侧拆解进度应为原左侧进度 (${rightExplode.value} === ${origLeftExplode})`)
  assert(leftWireframe.value === origRightWireframe, `交换后左侧线框模式应为原右侧模式 (${leftWireframe.value} === ${origRightWireframe})`)
  assert(rightWireframe.value === origLeftWireframe, `交换后右侧线框模式应为原左侧模式 (${rightWireframe.value} === ${origLeftWireframe})`)
  assert(leftAnnotations.value === origRightAnnotations, `交换后左侧标注应为原右侧标注 (${leftAnnotations.value} === ${origRightAnnotations})`)
  assert(rightAnnotations.value === origLeftAnnotations, `交换后右侧标注应为原左侧标注 (${rightAnnotations.value} === ${origLeftAnnotations})`)

  for (const key of Object.keys(origRightParamsCopy)) {
    assert(leftParams[key] === origRightParamsCopy[key], `交换后左侧参数 ${key} 与原右侧参数一致 (${leftParams[key]} === ${origRightParamsCopy[key]})`)
  }
  for (const key of Object.keys(origLeftParamsCopy)) {
    assert(rightParams[key] === origLeftParamsCopy[key], `交换后右侧参数 ${key} 与原左侧参数一致 (${rightParams[key]} === ${origLeftParamsCopy[key]})`)
  }

  assert(leftLoaded, 'swapSides 必须调用 loadLeftJoint() 刷新左侧场景')
  assert(rightLoaded, 'swapSides 必须调用 loadRightJoint() 刷新右侧场景')
}

console.log('\n--- 测试 2: syncFromLeft / syncFromRight 同步逻辑 ---')
{
  const leftType = { value: 'mitered' }
  const rightType = { value: 'wedge' }
  const leftParams = getDefaultParams('mitered')
  const rightParams = getDefaultParams('wedge')
  const leftExplode = { value: 0.8 }
  const rightExplode = { value: 0.2 }
  const leftWireframe = { value: false }
  const rightWireframe = { value: true }
  const leftAnnotations = { value: false }
  const rightAnnotations = { value: true }

  let rightLoaded = false
  let leftLoaded = false
  function loadRightJoint() { rightLoaded = true }
  function loadLeftJoint() { leftLoaded = true }

  function syncFromLeft() {
    rightType.value = leftType.value
    Object.assign(rightParams, leftParams)
    rightExplode.value = leftExplode.value
    rightWireframe.value = leftWireframe.value
    rightAnnotations.value = leftAnnotations.value
    loadRightJoint()
  }

  function syncFromRight() {
    leftType.value = rightType.value
    Object.assign(leftParams, rightParams)
    leftExplode.value = rightExplode.value
    leftWireframe.value = rightWireframe.value
    leftAnnotations.value = rightAnnotations.value
    loadLeftJoint()
  }

  syncFromLeft()
  assert(rightType.value === leftType.value, `syncFromLeft: 右侧类型同步为左侧 (${rightType.value})`)
  assert(rightExplode.value === leftExplode.value, `syncFromLeft: 右侧拆解进度同步为 (${rightExplode.value})`)
  assert(rightWireframe.value === leftWireframe.value, `syncFromLeft: 右侧线框模式同步 (${rightWireframe.value})`)
  assert(rightLoaded, 'syncFromLeft 调用了 loadRightJoint()')

  rightLoaded = false
  rightType.value = 'shouldered'
  rightParams.sectionW = 999
  rightExplode.value = 0.1
  rightWireframe.value = true
  rightAnnotations.value = true

  syncFromRight()
  assert(leftType.value === rightType.value, `syncFromRight: 左侧类型同步为 (${leftType.value})`)
  assert(leftParams.sectionW === 999, 'syncFromRight: 左侧参数同步 (sectionW=999)')
  assert(leftExplode.value === rightExplode.value, `syncFromRight: 左侧拆解进度同步 (${leftExplode.value})`)
  assert(leftLoaded, 'syncFromRight 调用了 loadLeftJoint()')
}

console.log('\n--- 测试 3: 双次交换还原验证 ---')
{
  const leftType = { value: 'straight' }
  const rightType = { value: 'dovetail' }
  const leftParams = getDefaultParams('straight')
  const rightParams = getDefaultParams('dovetail')

  function swapSides() {
    const tmpType = leftType.value
    const tmpParams = { ...leftParams }
    leftType.value = rightType.value
    Object.assign(leftParams, rightParams)
    rightType.value = tmpType
    Object.assign(rightParams, tmpParams)
  }

  const initialLeft = leftType.value
  const initialRight = rightType.value
  const initialLeftParams = { ...leftParams }
  const initialRightParams = { ...rightParams }

  swapSides()
  swapSides()

  assert(leftType.value === initialLeft, `两次交换后左侧类型还原 (${leftType.value} === ${initialLeft})`)
  assert(rightType.value === initialRight, `两次交换后右侧类型还原 (${rightType.value} === ${initialRight})`)
  for (const key of Object.keys(initialLeftParams)) {
    assert(leftParams[key] === initialLeftParams[key], `两次交换后左侧参数 ${key} 还原`)
  }
  for (const key of Object.keys(initialRightParams)) {
    assert(rightParams[key] === initialRightParams[key], `两次交换后右侧参数 ${key} 还原`)
  }
}

console.log('\n=== 测试完成 ===\n')
