import * as THREE from 'three'
import { geometryToSTL, mergeGeometriesWithTransform } from '../src/utils/stlExporter.js'
import { generateJoint } from '../src/models/jointGeometry.js'
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

function nearEq(a, b, eps = 1e-4) {
  return Math.abs(a - b) < eps
}

function vNearEq(a, b, eps = 1e-4) {
  return nearEq(a.x, b.x, eps) && nearEq(a.y, b.y, eps) && nearEq(a.z, b.z, eps)
}

function readSTLHeader(buffer) {
  const dv = new DataView(buffer)
  let str = ''
  for (let i = 0; i < 80; i++) {
    str += String.fromCharCode(dv.getUint8(i))
  }
  return str.trim()
}

function readSTLTriangleCount(buffer) {
  const dv = new DataView(buffer)
  return dv.getUint32(80, true)
}

function readSTLNormal(buffer, triIndex) {
  const dv = new DataView(buffer)
  const offset = 84 + triIndex * 50
  return new THREE.Vector3(
    dv.getFloat32(offset, true),
    dv.getFloat32(offset + 4, true),
    dv.getFloat32(offset + 8, true)
  )
}

function readSTLVertex(buffer, triIndex, vertexIndex) {
  const dv = new DataView(buffer)
  const offset = 84 + triIndex * 50 + 12 + vertexIndex * 12
  return new THREE.Vector3(
    dv.getFloat32(offset, true),
    dv.getFloat32(offset + 4, true),
    dv.getFloat32(offset + 8, true)
  )
}

console.log('\n=== STL 导出与法线变换测试 ===\n')

console.log('--- 测试 1: geometryToSTL 基本格式验证 ---')
{
  const geo = new THREE.BoxGeometry(2, 2, 2)
  const buffer = geometryToSTL(geo, 'TestBox')

  assert(buffer instanceof ArrayBuffer, '返回值为 ArrayBuffer')
  assert(buffer.byteLength > 0, '缓冲区非空')

  const header = readSTLHeader(buffer)
  assert(header.includes('TestBox'), `STL 头部包含对象名 ("${header}")`)

  const triCount = readSTLTriangleCount(buffer)
  assert(triCount === 12, `BoxGeometry(2,2,2) 三角形数 = 12 (实际 ${triCount})`)

  const expectedSize = 80 + 4 + triCount * 50
  assert(buffer.byteLength === expectedSize, `缓冲区大小正确 (${buffer.byteLength} === ${expectedSize})`)
}

console.log('\n--- 测试 2: geometryToSTL 顶点坐标正确 ---')
{
  const size = 10
  const geo = new THREE.BoxGeometry(size, size, size)
  const buffer = geometryToSTL(geo)

  const triCount = readSTLTriangleCount(buffer)
  let minV = new THREE.Vector3(Infinity, Infinity, Infinity)
  let maxV = new THREE.Vector3(-Infinity, -Infinity, -Infinity)

  for (let t = 0; t < triCount; t++) {
    for (let v = 0; v < 3; v++) {
      const vt = readSTLVertex(buffer, t, v)
      minV.min(vt)
      maxV.max(vt)
    }
  }

  const half = size / 2
  assert(
    vNearEq(minV, new THREE.Vector3(-half, -half, -half), 0.1),
    `顶点最小坐标正确 (${minV.x.toFixed(1)}, ${minV.y.toFixed(1)}, ${minV.z.toFixed(1)})`
  )
  assert(
    vNearEq(maxV, new THREE.Vector3(half, half, half), 0.1),
    `顶点最大坐标正确 (${maxV.x.toFixed(1)}, ${maxV.y.toFixed(1)}, ${maxV.z.toFixed(1)})`
  )
}

console.log('\n--- 测试 3: geometryToSTL 法线方向正确性（带预算法线）---')
{
  const geo = new THREE.BoxGeometry(2, 2, 2)
  const buffer = geometryToSTL(geo)
  const triCount = readSTLTriangleCount(buffer)

  let validNormals = 0
  for (let t = 0; t < triCount; t++) {
    const n = readSTLNormal(buffer, t)
    const len = n.length()
    if (nearEq(len, 1, 0.01)) validNormals++

    const v0 = readSTLVertex(buffer, t, 0)
    const v1 = readSTLVertex(buffer, t, 1)
    const v2 = readSTLVertex(buffer, t, 2)

    const ab = new THREE.Vector3().subVectors(v1, v0)
    const ac = new THREE.Vector3().subVectors(v2, v0)
    const faceN = new THREE.Vector3().crossVectors(ab, ac).normalize()

    const dot = Math.abs(n.dot(faceN))
    assert(dot > 0.9, `三角形 ${t}: 法线与面法线方向一致 (dot=${dot.toFixed(3)})`)
  }
  assert(validNormals === triCount, `所有 ${triCount} 个法线均为单位向量 (${validNormals}/${triCount})`)
}

console.log('\n--- 测试 4: geometryToSTL 无预算法线时自动计算 ---')
{
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array([
    0, 0, 0,
    1, 0, 0,
    0, 1, 0,

    0, 0, 0,
    0, 1, 0,
    0, 0, 1
  ])
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  assert(!geo.getAttribute('normal'), '测试几何体没有法线属性')

  const buffer = geometryToSTL(geo, 'NoNormals')
  const triCount = readSTLTriangleCount(buffer)

  assert(triCount === 2, `三角形数正确 (${triCount})`)

  const n0 = readSTLNormal(buffer, 0)
  assert(vNearEq(n0, new THREE.Vector3(0, 0, 1), 0.01), `XY平面三角形法线 = +Z (${n0.x.toFixed(2)}, ${n0.y.toFixed(2)}, ${n0.z.toFixed(2)})`)

  const n1 = readSTLNormal(buffer, 1)
  const expectedN1 = new THREE.Vector3(1, 0, 0)
  const dot1 = Math.abs(n1.dot(expectedN1))
  assert(dot1 > 0.95, `YZ平面三角形法线 = +X (dot=${dot1.toFixed(3)})`)
}

console.log('\n--- 测试 5: mergeGeometriesWithTransform 位置变换正确 ---')
{
  const g1 = new THREE.BoxGeometry(1, 1, 1)
  const g2 = new THREE.BoxGeometry(1, 1, 1)

  const t1 = new THREE.Matrix4().makeTranslation(-5, 0, 0)
  const t2 = new THREE.Matrix4().makeTranslation(5, 0, 0)

  const merged = mergeGeometriesWithTransform([g1, g2], [t1, t2])

  merged.computeBoundingBox()
  const bb = merged.boundingBox

  assert(nearEq(bb.min.x, -5.5, 0.01), `合并后 min.x = -5.5 (实际 ${bb.min.x.toFixed(2)})`)
  assert(nearEq(bb.max.x, 5.5, 0.01), `合并后 max.x = 5.5 (实际 ${bb.max.x.toFixed(2)})`)
  assert(nearEq(bb.min.y, -0.5, 0.01), `合并后 min.y = -0.5 (实际 ${bb.min.y.toFixed(2)})`)
  assert(nearEq(bb.max.y, 0.5, 0.01), `合并后 max.y = 0.5 (实际 ${bb.max.y.toFixed(2)})`)
}

console.log('\n--- 测试 6: mergeGeometriesWithTransform 法线随旋转正确变换（预算法线）---')
{
  const geo = new THREE.BoxGeometry(1, 1, 1)
  assert(!!geo.getAttribute('normal'), '测试几何体有预算法线')

  const rotZ = new THREE.Matrix4().makeRotationZ(Math.PI / 2)
  const merged = mergeGeometriesWithTransform([geo], [rotZ])

  const posAttr = merged.getAttribute('position')
  const normAttr = merged.getAttribute('normal')
  assert(!!normAttr, '合并后几何体有法线属性')

  const mergedBuffer = geometryToSTL(merged)
  const triCount = readSTLTriangleCount(mergedBuffer)
  assert(triCount === 12, `旋转后三角形数正确 (${triCount})`)

  for (let t = 0; t < triCount; t++) {
    const n = readSTLNormal(mergedBuffer, t)
    const v0 = readSTLVertex(mergedBuffer, t, 0)
    const v1 = readSTLVertex(mergedBuffer, t, 1)
    const v2 = readSTLVertex(mergedBuffer, t, 2)

    const ab = new THREE.Vector3().subVectors(v1, v0)
    const ac = new THREE.Vector3().subVectors(v2, v0)
    const faceN = new THREE.Vector3().crossVectors(ab, ac).normalize()

    const dot = Math.abs(n.dot(faceN))
    assert(dot > 0.9, `旋转后三角形 ${t}: 法线与面法线一致 (dot=${dot.toFixed(3)})`)
  }
}

console.log('\n--- 测试 7: mergeGeometriesWithTransform 无预算法线时回退计算（核心修复验证）---')
{
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array([
    0, 0, 0,
    1, 0, 0,
    0, 1, 0
  ])
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  assert(!geo.getAttribute('normal'), '测试几何体没有法线属性')

  const rotY = new THREE.Matrix4().makeRotationY(-Math.PI / 2)
  const merged = mergeGeometriesWithTransform([geo], [rotY])

  const normAttr = merged.getAttribute('normal')
  assert(!!normAttr, '合并后正确生成了法线属性')

  const buffer = geometryToSTL(merged)
  const n = readSTLNormal(buffer, 0)

  const v0 = readSTLVertex(buffer, 0, 0)
  const v1 = readSTLVertex(buffer, 0, 1)
  const v2 = readSTLVertex(buffer, 0, 2)
  const ab = new THREE.Vector3().subVectors(v1, v0)
  const ac = new THREE.Vector3().subVectors(v2, v0)
  const faceN = new THREE.Vector3().crossVectors(ab, ac).normalize()

  const dot = Math.abs(n.dot(faceN))
  assert(dot > 0.95, `无预算法线 + 旋转变换后: 计算法线与面法线一致 (dot=${dot.toFixed(3)})`)
  assert(nearEq(n.length(), 1, 0.01), `回退计算的法线是单位向量 (length=${n.length().toFixed(3)})`)

  const notBad = !(nearEq(n.x, 0) && nearEq(n.y, 0) && nearEq(n.z, 1))
  assert(notBad, `法线不是错误的默认值 (0,0,1): 实际 (${n.x.toFixed(2)}, ${n.y.toFixed(2)}, ${n.z.toFixed(2)})`)
}

console.log('\n--- 测试 8: mergeGeometriesWithTransform 缩放变换法线正确（使用 normalMatrix）---')
{
  const geo = new THREE.BoxGeometry(1, 1, 1)

  const scaleMat = new THREE.Matrix4().makeScale(1, 2, 3)
  const merged = mergeGeometriesWithTransform([geo], [scaleMat])

  const buffer = geometryToSTL(merged)
  const triCount = readSTLTriangleCount(buffer)

  for (let t = 0; t < triCount; t++) {
    const n = readSTLNormal(buffer, t)
    const v0 = readSTLVertex(buffer, t, 0)
    const v1 = readSTLVertex(buffer, t, 1)
    const v2 = readSTLVertex(buffer, t, 2)

    const ab = new THREE.Vector3().subVectors(v1, v0)
    const ac = new THREE.Vector3().subVectors(v2, v0)
    const faceN = new THREE.Vector3().crossVectors(ab, ac).normalize()

    const dot = Math.abs(n.dot(faceN))
    assert(dot > 0.9, `缩放(1,2,3)后三角形 ${t}: 法线使用 NormalMatrix 变换正确 (dot=${dot.toFixed(3)})`)
  }
}

console.log('\n--- 测试 9: 真实榫卯模型 geometryToSTL 导出 ---')
{
  const types = ['straight', 'dovetail', 'mitered', 'wedge', 'shouldered']
  for (const type of types) {
    const params = getDefaultParams(type)
    const components = generateJoint(type, params)

    for (const c of components) {
      const buffer = geometryToSTL(c.geometry, c.name)
      const triCount = readSTLTriangleCount(buffer)
      assert(triCount > 0, `${type}/${c.name}: STL 导出非空 (${triCount} 个三角形)`)
      assert(buffer.byteLength > 84, `${type}/${c.name}: STL 缓冲区大小合理`)
    }
  }
}

console.log('\n--- 测试 10: 真实榫卯模型 mergeGeometriesWithTransform 多构件合并 ---')
{
  const params = getDefaultParams('straight')
  const [tenon, mortise] = generateJoint('straight', params)

  const t1 = new THREE.Matrix4().copy(tenon.position)
  const t2 = new THREE.Matrix4().copy(mortise.position)

  const merged = mergeGeometriesWithTransform(
    [tenon.geometry, mortise.geometry],
    [t1, t2]
  )

  merged.computeBoundingBox()
  const bb = merged.boundingBox

  const buffer = geometryToSTL(merged, 'straight_joint')
  const triCount = readSTLTriangleCount(buffer)

  const tTri = tenon.geometry.index
    ? tenon.geometry.index.count / 3
    : tenon.geometry.attributes.position.count / 3
  const mTri = mortise.geometry.index
    ? mortise.geometry.index.count / 3
    : mortise.geometry.attributes.position.count / 3

  assert(triCount === tTri + mTri, `合并后三角形总数 = 两构件之和 (${triCount} === ${tTri} + ${mTri})`)
  assert(bb.min.x < bb.max.x && bb.min.y < bb.max.y && bb.min.z < bb.max.z, '合并后包围盒体积有效')
}

console.log('\n--- 测试 11: 非均匀缩放 + 旋转变换下的法线正确性（综合验证）---')
{
  const geo = new THREE.BoxGeometry(1, 2, 3)

  const transform = new THREE.Matrix4()
    .makeRotationX(Math.PI / 4)
    .multiply(new THREE.Matrix4().makeScale(2, 1, 0.5))
    .multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 6))

  const merged = mergeGeometriesWithTransform([geo], [transform])
  const buffer = geometryToSTL(merged)
  const triCount = readSTLTriangleCount(buffer)

  let allValid = true
  for (let t = 0; t < triCount; t++) {
    const n = readSTLNormal(buffer, t)
    const v0 = readSTLVertex(buffer, t, 0)
    const v1 = readSTLVertex(buffer, t, 1)
    const v2 = readSTLVertex(buffer, t, 2)

    const ab = new THREE.Vector3().subVectors(v1, v0)
    const ac = new THREE.Vector3().subVectors(v2, v0)
    const faceN = new THREE.Vector3().crossVectors(ab, ac).normalize()

    const dot = n.dot(faceN)
    if (dot < 0.9) {
      allValid = false
      console.warn(`  三角形 ${t} 法线异常: dot=${dot.toFixed(3)}, n=(${n.x.toFixed(2)},${n.y.toFixed(2)},${n.z.toFixed(2)})`)
    }
  }
  assert(allValid, `复杂变换(旋转+缩放+旋转): 所有 ${triCount} 个三角形法线均与面法线一致`)
}

console.log('\n=== STL 测试完成 ===\n')
