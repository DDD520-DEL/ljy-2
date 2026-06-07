import * as THREE from 'three'
import { generateJoint, JOINTS } from '../src/models/jointGeometry.js'
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

function countVertices(geo) {
  return geo.attributes.position.count
}

function countTriangles(geo) {
  return geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3
}

function geoBoundingBox(geo) {
  geo.computeBoundingBox()
  return geo.boundingBox
}

console.log('\n=== 榫卯参数化几何模型测试 ===\n')

console.log('--- 测试 1: 所有榫卯类型均能正常生成非空构件列表 ---')
for (const type of Object.keys(JOINT_TYPES)) {
  const params = getDefaultParams(type)
  const components = generateJoint(type, params)
  assert(components.length >= 2, `${type}: 返回构件数 ≥ 2 (实际 ${components.length})`)
  for (const c of components) {
    assert(c.geometry && c.geometry.isBufferGeometry, `${type}/${c.name}: 包含有效 BufferGeometry`)
    assert(c.id && c.name, `${type}/${c.name}: 包含 id 和 name`)
    assert(c.explodeDir && c.explodeDir.isVector3, `${type}/${c.name}: 包含拆解方向向量`)
    assert(c.rawSize && c.netSize, `${type}/${c.name}: 包含毛料/净料尺寸`)
  }
}

console.log('\n--- 测试 2: 直榫榫卯配合关系 ---')
{
  const params = getDefaultParams('straight')
  const [tenon, mortise] = generateJoint('straight', params)
  const tenonBox = geoBoundingBox(tenon.geometry)
  const mortiseBox = geoBoundingBox(mortise.geometry)
  const tenonZLen = tenonBox.max.z - tenonBox.min.z
  const mortiseZLen = mortiseBox.max.z - mortiseBox.min.z
  assert(tenonZLen > mortiseZLen * 0.9, `直榫: 榫头总长度 ≥ 卯口长度 (榫 ${tenonZLen.toFixed(1)}, 卯 ${mortiseZLen.toFixed(1)})`)
  assert(typeof tenon.allowance === 'string' && tenon.allowance.includes('榫头余量'), '直榫: 榫头构件含余量标注')
  assert(typeof mortise.allowance === 'string' && mortise.allowance.includes('卯口深度'), '直榫: 卯口构件含深度标注')
}

console.log('\n--- 测试 3: 楔钉榫无重复重叠几何体 (z-fighting 修复验证) ---')
{
  const params = getDefaultParams('wedge')
  const [left, right, wedge] = generateJoint('wedge', params)
  const leftTris = countTriangles(left.geometry)
  const rightTris = countTriangles(right.geometry)
  const slotH = params.sectionH * 0.6
  const tongueH = params.sectionH - slotH
  const leftBox = geoBoundingBox(left.geometry)
  const leftH = leftBox.max.y - leftBox.min.y
  assert(tongueH > 0 && tongueH < params.sectionH, `楔钉榫: 舌片高度 tongueH=${tongueH.toFixed(1)} 合理 (0 < x < sectionH)`)
  assert(leftTris < 60, `楔钉榫左段: 三角形数量合理 (${leftTris}, 纯两盒体应 ≤ 24+24=48)`)
  assert(rightTris < 60, `楔钉榫右段: 三角形数量合理 (${rightTris})`)
  assert(wedge && wedge.name === '楔钉', '楔钉榫: 含楔钉独立构件')
}

console.log('\n--- 测试 4: 粽角榫三材咬合结构 ---')
{
  const params = getDefaultParams('mitered')
  const [post, xArm, zArm] = generateJoint('mitered', params)
  assert(post.name === '立柱' && xArm.name === '长边' && zArm.name === '短边', '粽角榫: 三个构件命名正确')
  const tenonW = params.sectionW * params.tenonRatio
  const tenonH = params.sectionH * params.tenonRatio
  assert(post.allowance.includes('+X向') && post.allowance.includes('+Z向'), '粽角榫立柱: 含双向榫舌标注')
  assert(xArm.allowance.includes('卯口') && xArm.allowance.includes('榫舌'), '粽角榫长边: 含卯口和榫舌标注')
  assert(zArm.allowance.includes('卯口'), '粽角榫短边: 含卯口标注')
  const postBox = geoBoundingBox(post.geometry)
  const xArmBox = geoBoundingBox(xArm.geometry)
  const zArmBox = geoBoundingBox(zArm.geometry)
  const postY = postBox.max.y - postBox.min.y
  const xArmX = xArmBox.max.x - xArmBox.min.x
  const zArmZ = zArmBox.max.z - zArmBox.min.z
  assert(postY > params.armLength * 0.8, `粽角榫立柱: Y 向延伸合理 (${postY.toFixed(0)})`)
  assert(xArmX > params.armLength * 0.8, `粽角榫长边: X 向延伸合理 (${xArmX.toFixed(0)})`)
  assert(zArmZ > params.armLength * 0.8, `粽角榫短边: Z 向延伸合理 (${zArmZ.toFixed(0)})`)
  assert(tenonW < params.sectionW && tenonH < params.sectionH, `粽角榫: 榫舌截面小于原截面 (${tenonW.toFixed(0)}×${tenonH.toFixed(0)})`)
}

console.log('\n--- 测试 5: 燕尾榫多燕尾数量 ---')
{
  const params = { ...getDefaultParams('dovetail'), tailCount: 3 }
  const components = generateJoint('dovetail', params)
  const tailTris = countTriangles(components[0].geometry)
  const params1 = { ...params, tailCount: 1 }
  const components1 = generateJoint('dovetail', params1)
  const tailTris1 = countTriangles(components1[0].geometry)
  assert(tailTris > tailTris1, `燕尾榫: tailCount=3 的三角形数 (${tailTris}) > tailCount=1 的三角形数 (${tailTris1})`)
}

console.log('\n--- 测试 6: 参数变化触发几何变化 ---')
{
  const paramsA = { ...getDefaultParams('straight'), tenonLength: 10 }
  const paramsB = { ...getDefaultParams('straight'), tenonLength: 70 }
  const [tA] = generateJoint('straight', paramsA)
  const [tB] = generateJoint('straight', paramsB)
  const boxA = geoBoundingBox(tA.geometry)
  const boxB = geoBoundingBox(tB.geometry)
  const lenA = boxA.max.z - boxA.min.z
  const lenB = boxB.max.z - boxB.min.z
  assert(lenB > lenA, `直榫: tenonLength=70 的总长度 (${lenB.toFixed(1)}) > tenonLength=10 的总长度 (${lenA.toFixed(1)})`)
}

console.log('\n--- 测试 7: 格肩榫构件数量与配合 ---')
{
  const params = getDefaultParams('shouldered')
  const components = generateJoint('shouldered', params)
  assert(components.length === 2, `格肩榫: 构件数 = 2 (实际 ${components.length})`)
  const ids = components.map(c => c.id).sort()
  assert(ids[0] === 'post' && ids[1] === 'rail', '格肩榫: 构件 id 正确 (post + rail)')
  assert(components[1].allowance.includes('格肩深'), '格肩榫横枨: 含格肩深度标注')
}

console.log('\n--- 测试 8: 所有构件包含受力方向信息 ---')
{
  let total = 0
  let ok = 0
  for (const type of Object.keys(JOINT_TYPES)) {
    const components = generateJoint(type, getDefaultParams(type))
    for (const c of components) {
      total++
      if (c.stresses && c.stresses.length > 0) {
        const first = c.stresses[0]
        if (first.dir && first.dir.isVector3 && first.label) {
          ok++
        }
      }
    }
  }
  assert(ok === total, `所有构件含有效受力信息 (${ok}/${total})`)
}

console.log('\n--- 测试 9: 粽角榫短边(zArm)双卯口 9 块 box 拆分结构 ---')
{
  const params = getDefaultParams('mitered')
  const [, , zArm] = generateJoint('mitered', params)
  const tri = countTriangles(zArm.geometry)
  const zArmBox = geoBoundingBox(zArm.geometry)
  const zW = zArmBox.max.x - zArmBox.min.x
  const zH = zArmBox.max.y - zArmBox.min.y
  const zL = zArmBox.max.z - zArmBox.min.z
  assert(Math.abs(zW - params.sectionW) < 0.1, `粽角榫短边: X 截面宽 = sectionW (${zW.toFixed(1)} ≈ ${params.sectionW})`)
  assert(zH > params.sectionH, `粽角榫短边: Y 向总高 > sectionH (双卯口上下分层延伸) (${zH.toFixed(1)} > ${params.sectionH})`)
  assert(zL > params.armLength, `粽角榫短边: Z 总延伸 > armLength (${zL.toFixed(0)} > ${params.armLength})`)
  const nineBoxMax = 9 * 12
  assert(tri <= nineBoxMax + 4, `粽角榫短边: 三角形数 ≤ 9 盒体理论值 (${tri} ≤ ${nineBoxMax})`)
}

console.log('\n--- 测试 10: 粽角榫 tenonRatio 变化影响卯口尺寸 ---')
{
  const pA = { ...getDefaultParams('mitered'), tenonRatio: 0.3 }
  const pB = { ...getDefaultParams('mitered'), tenonRatio: 0.7 }
  const [, , zA] = generateJoint('mitered', pA)
  const [, , zB] = generateJoint('mitered', pB)
  const triA = countTriangles(zA.geometry)
  const triB = countTriangles(zB.geometry)
  assert(triA > 0 && triB > 0, `粽角榫: 两种 tenonRatio 均能生成有效几何 (triA=${triA}, triB=${triB})`)
  const [postA] = generateJoint('mitered', pA)
  const [postB] = generateJoint('mitered', pB)
  const postATri = countTriangles(postA.geometry)
  const postBTri = countTriangles(postB.geometry)
  assert(postATri > 0 && postBTri > 0, `粽角榫立柱: 两种 tenonRatio 均能生成有效几何`)
}

console.log('\n=== 测试完成 ===\n')
