import * as THREE from 'three'
import { box, mergeGeometries } from '../utils/geometry.js'

function createStraightTenon(params) {
  const { sectionW, sectionH, tenonLength, tenonWidthRatio, tenonHeightRatio, shoulderRatio } = params
  const tenonW = sectionW * tenonWidthRatio
  const tenonH = sectionH * tenonHeightRatio
  const shoulderW = (sectionW - tenonW) / 2
  const shoulderH = (sectionH - tenonH) / 2
  const baseLen = 120

  const tenonShapes = []
  tenonShapes.push(box(shoulderW, sectionH, baseLen, -tenonW / 2 - shoulderW / 2, 0, 0))
  tenonShapes.push(box(shoulderW, sectionH, baseLen, tenonW / 2 + shoulderW / 2, 0, 0))
  tenonShapes.push(box(tenonW, shoulderH, baseLen, 0, -tenonH / 2 - shoulderH / 2, 0))
  tenonShapes.push(box(tenonW, shoulderH, baseLen, 0, tenonH / 2 + shoulderH / 2, 0))
  tenonShapes.push(box(tenonW, tenonH, baseLen + tenonLength, 0, 0, -tenonLength / 2))
  const tenonGeo = mergeGeometries(tenonShapes)

  const mortiseShapes = []
  mortiseShapes.push(box(sectionW, sectionH, baseLen, 0, 0, 0))
  mortiseShapes.push(box(tenonW, tenonH, tenonLength, 0, 0, baseLen / 2))
  const mortiseGeo = mergeGeometries(mortiseShapes)

  return [
    {
      id: 'tenon',
      name: '榫头',
      geometry: tenonGeo,
      position: new THREE.Vector3(0, 0, 0),
      explodeDir: new THREE.Vector3(0, 0, -1),
      rawSize: { w: sectionW, h: sectionH, l: baseLen + tenonLength },
      netSize: { w: sectionW, h: sectionH, l: baseLen },
      allowance: `榫头余量: ${tenonLength}mm`,
      stresses: [{ dir: new THREE.Vector3(0, 0, 1), length: 40, label: '压力' }]
    },
    {
      id: 'mortise',
      name: '卯口',
      geometry: mortiseGeo,
      position: new THREE.Vector3(0, 0, baseLen / 2 + tenonLength / 2),
      explodeDir: new THREE.Vector3(0, 0, 1),
      rawSize: { w: sectionW, h: sectionH, l: baseLen },
      netSize: { w: sectionW, h: sectionH, l: baseLen },
      allowance: `卯口深度: ${tenonLength}mm`,
      stresses: [{ dir: new THREE.Vector3(0, 0, -1), length: 40, label: '压力' }]
    }
  ]
}

function createDovetail(params) {
  const { sectionW, sectionH, tenonLength, tailAngle, tailCount, pinRatio } = params
  const panelLen = 150
  const tanA = Math.tan(tailAngle * Math.PI / 180)

  const tails = []
  const totalTailW = sectionW * pinRatio
  const gap = (sectionW - totalTailW) / (tailCount + 1)
  const tailTopW = totalTailW / tailCount
  const tailBotW = tailTopW - 2 * tenonLength * tanA

  for (let i = 0; i < tailCount; i++) {
    const xCenter = -sectionW / 2 + gap + tailTopW / 2 + i * (tailTopW + gap)
    tails.push({ xCenter, topW: tailTopW, botW: tailBotW })
  }

  const tailShapes = []
  tailShapes.push(box(sectionW, sectionH, panelLen, 0, 0, 0))
  for (const t of tails) {
    const pts = []
    const hw1 = t.topW / 2
    const hw2 = t.botW / 2
    pts.push(new THREE.Vector3(t.xCenter - hw1, -sectionH / 2, tenonLength))
    pts.push(new THREE.Vector3(t.xCenter + hw1, -sectionH / 2, tenonLength))
    pts.push(new THREE.Vector3(t.xCenter + hw2, -sectionH / 2, 0))
    pts.push(new THREE.Vector3(t.xCenter - hw2, -sectionH / 2, 0))
    const shape = new THREE.Shape()
    shape.moveTo(pts[0].x, pts[0].z)
    for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i].x, pts[i].z)
    shape.closePath()
    const g = new THREE.ExtrudeGeometry(shape, { depth: sectionH, bevelEnabled: false })
    g.rotateX(-Math.PI / 2)
    g.translate(0, 0, -tenonLength)
    tailShapes.push(g)
  }
  const tailGeo = mergeGeometries(tailShapes)

  const pinShapes = []
  pinShapes.push(box(sectionW, sectionH, panelLen, 0, 0, 0))
  for (const t of tails) {
    const pts = []
    const hw1 = t.topW / 2
    const hw2 = t.botW / 2
    pts.push(new THREE.Vector3(t.xCenter - hw2, -sectionH / 2, panelLen))
    pts.push(new THREE.Vector3(t.xCenter + hw2, -sectionH / 2, panelLen))
    pts.push(new THREE.Vector3(t.xCenter + hw1, -sectionH / 2, panelLen + tenonLength))
    pts.push(new THREE.Vector3(t.xCenter - hw1, -sectionH / 2, panelLen + tenonLength))
    const shape = new THREE.Shape()
    shape.moveTo(pts[0].x, pts[0].z)
    for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i].x, pts[i].z)
    shape.closePath()
    const g = new THREE.ExtrudeGeometry(shape, { depth: sectionH, bevelEnabled: false })
    g.rotateX(-Math.PI / 2)
    g.translate(0, 0, -panelLen)
    pinShapes.push(g)
  }
  const pinGeo = mergeGeometries(pinShapes)

  return [
    {
      id: 'tail-board',
      name: '尾板',
      geometry: tailGeo,
      position: new THREE.Vector3(0, 0, 0),
      explodeDir: new THREE.Vector3(0, -1, -0.5).normalize(),
      rawSize: { w: sectionW, h: sectionH, l: panelLen + tenonLength },
      netSize: { w: sectionW, h: sectionH, l: panelLen },
      allowance: `燕尾榫头长: ${tenonLength}mm, 数量: ${tailCount}`,
      stresses: [{ dir: new THREE.Vector3(0, 0, 1), length: 40, label: '拉力' }]
    },
    {
      id: 'pin-board',
      name: '梢板',
      geometry: pinGeo,
      position: new THREE.Vector3(0, 0, panelLen / 2 + tenonLength / 2),
      explodeDir: new THREE.Vector3(0, 1, 0.5).normalize(),
      rawSize: { w: sectionW, h: sectionH, l: panelLen + tenonLength },
      netSize: { w: sectionW, h: sectionH, l: panelLen },
      allowance: `燕尾槽深: ${tenonLength}mm, 数量: ${tailCount}`,
      stresses: [{ dir: new THREE.Vector3(0, 0, -1), length: 40, label: '拉力' }]
    }
  ]
}

function createMitered(params) {
  const { sectionW, sectionH, armLength, tenonRatio } = params
  const t = armLength
  const tenonW = sectionW * tenonRatio
  const tenonH = sectionH * tenonRatio
  const mortiseDepth = Math.min(sectionW, sectionH) * 0.45

  const postShapes = []
  postShapes.push(box(sectionW, t, sectionH, 0, -t / 2, 0))
  postShapes.push(
    box(tenonW, sectionH, tenonH,
      sectionW / 2 + mortiseDepth / 2 - tenonW / 2,
      sectionH / 4,
      0)
  )
  postShapes.push(
    box(tenonH, sectionH, tenonW,
      0,
      -sectionH / 4,
      sectionH / 2 + mortiseDepth / 2 - tenonW / 2)
  )
  const postGeo = mergeGeometries(postShapes)

  const xArmShapes = []
  xArmShapes.push(box(t, sectionH, sectionW, t / 2, 0, 0))
  xArmShapes.push(
    box(mortiseDepth, (sectionH - tenonH) / 2, sectionW,
      -mortiseDepth / 2,
      sectionH / 4 + tenonH / 4,
      0)
  )
  xArmShapes.push(
    box(mortiseDepth, (sectionH - tenonH) / 2, sectionW,
      -mortiseDepth / 2,
      -sectionH / 4 - tenonH / 4,
      0)
  )
  xArmShapes.push(
    box(mortiseDepth, tenonH, (sectionW - tenonW) / 2,
      -mortiseDepth / 2,
      0,
      -sectionW / 4 - tenonW / 4)
  )
  xArmShapes.push(
    box(mortiseDepth, tenonH, (sectionW - tenonW) / 2,
      -mortiseDepth / 2,
      0,
      sectionW / 4 + tenonW / 4)
  )
  xArmShapes.push(
    box(tenonW, sectionH, tenonW,
      0,
      -sectionH / 4,
      sectionW / 2 + mortiseDepth / 2 - tenonW / 2)
  )
  const xArmGeo = mergeGeometries(xArmShapes)

  const zArmShapes = []
  // 短边主体：沿 Z 轴正向延伸
  zArmShapes.push(box(sectionW, sectionH, t, 0, 0, t / 2))
  // 立柱榫卯口-左侧壁（Y上半，X负方向保留部分）
  zArmShapes.push(
    box((sectionW - tenonH) / 2, sectionH, mortiseDepth,
      -sectionW / 4 - tenonH / 4,
      sectionH / 4,
      -mortiseDepth / 2)
  )
  // 立柱榫卯口-右侧壁（Y上半，X正方向保留部分）
  zArmShapes.push(
    box((sectionW - tenonH) / 2, sectionH, mortiseDepth,
      sectionW / 4 + tenonH / 4,
      sectionH / 4,
      -mortiseDepth / 2)
  )
  // 立柱榫卯口-上侧壁（Y上半，Y正方向保留部分）
  zArmShapes.push(
    box(tenonH, (sectionH - tenonH) / 2, mortiseDepth,
      0,
      sectionH / 4 + tenonH / 4,
      -mortiseDepth / 2)
  )
  // 立柱榫卯口-下侧壁（Y上半，中间横隔板，分隔上下双卯口）
  zArmShapes.push(
    box(tenonH, (sectionH - tenonH) / 2, mortiseDepth,
      0,
      -sectionH / 4 - tenonH / 4,
      -mortiseDepth / 2)
  )
  // 长边榫卯口-左侧壁（Y下半，X负方向保留部分）
  zArmShapes.push(
    box((sectionW - tenonW) / 2, sectionH, mortiseDepth,
      -sectionW / 4 - tenonW / 4,
      -sectionH / 4,
      -mortiseDepth / 2)
  )
  // 长边榫卯口-右侧壁（Y下半，X正方向保留部分）
  zArmShapes.push(
    box((sectionW - tenonW) / 2, sectionH, mortiseDepth,
      sectionW / 4 + tenonW / 4,
      -sectionH / 4,
      -mortiseDepth / 2)
  )
  // 长边榫卯口-上侧壁（Y下半，紧邻中间隔板下侧）
  zArmShapes.push(
    box(tenonW, (sectionH - tenonW) / 2, mortiseDepth,
      0,
      -sectionH / 4 + tenonW / 4,
      -mortiseDepth / 2)
  )
  // 长边榫卯口-下侧壁（Y下半，Y负方向保留部分）
  zArmShapes.push(
    box(tenonW, (sectionH - tenonW) / 2, mortiseDepth,
      0,
      -sectionH / 4 - tenonW / 4 - (sectionH - tenonW) / 2,
      -mortiseDepth / 2)
  )
  const zArmGeo = mergeGeometries(zArmShapes)
  return [
    {
      id: 'post',
      name: '立柱',
      geometry: postGeo,
      position: new THREE.Vector3(0, 0, 0),
      explodeDir: new THREE.Vector3(0, -1, 0),
      rawSize: { w: sectionW, h: t + sectionH, l: sectionH },
      netSize: { w: sectionW, h: t, l: sectionH },
      allowance: `榫舌: +X向 ${tenonW.toFixed(0)}×${tenonH.toFixed(0)}, +Z向 ${tenonH.toFixed(0)}×${tenonW.toFixed(0)}`,
      stresses: [{ dir: new THREE.Vector3(0, -1, 0), length: 40, label: '压力' }]
    },
    {
      id: 'x-arm',
      name: '长边',
      geometry: xArmGeo,
      position: new THREE.Vector3(0, 0, 0),
      explodeDir: new THREE.Vector3(1, 0, 0),
      rawSize: { w: t + sectionW, h: sectionH, l: sectionW },
      netSize: { w: t, h: sectionH, l: sectionW },
      allowance: `卯口(-X向): ${tenonW.toFixed(0)}×${tenonH.toFixed(0)}, 榫舌(+Z向): ${tenonW.toFixed(0)}×${tenonW.toFixed(0)}`,
      stresses: [{ dir: new THREE.Vector3(-1, 0, 0), length: 40, label: '压力' }]
    },
    {
      id: 'z-arm',
      name: '短边',
      geometry: zArmGeo,
      position: new THREE.Vector3(0, 0, 0),
      explodeDir: new THREE.Vector3(0, 0, 1),
      rawSize: { w: sectionW, h: sectionH, l: t + sectionH },
      netSize: { w: sectionW, h: sectionH, l: t },
      allowance: `卯口(-Z向): 立柱榫+长边榫, 深度 ${mortiseDepth.toFixed(0)}mm`,
      stresses: [{ dir: new THREE.Vector3(0, 0, -1), length: 40, label: '压力' }]
    }
  ]
}

function createWedge(params) {
  const { sectionW, sectionH, tenonLength, wedgeWidth, wedgeHeight } = params
  const armLen = 100
  const slotW = wedgeWidth
  const slotH = sectionH * 0.6
  const tongueH = sectionH - slotH

  const leftShapes = []
  leftShapes.push(box(armLen, sectionH, sectionW, -armLen / 2 - tenonLength / 2, 0, 0))
  leftShapes.push(box(tenonLength, tongueH, sectionW, tenonLength / 2, 0, 0))
  const leftGeo = mergeGeometries(leftShapes)

  const rightShapes = []
  rightShapes.push(box(armLen, sectionH, sectionW, armLen / 2 + tenonLength / 2, 0, 0))
  rightShapes.push(box(tenonLength, tongueH, sectionW, -tenonLength / 2, 0, 0))
  const rightGeo = mergeGeometries(rightShapes)

  const wedgeGeo = mergeGeometries([
    box(wedgeWidth, wedgeHeight, sectionW * 0.9, 0, 0, 0)
  ])

  return [
    {
      id: 'left',
      name: '左段',
      geometry: leftGeo,
      position: new THREE.Vector3(0, 0, 0),
      explodeDir: new THREE.Vector3(-1, 0, 0),
      rawSize: { w: armLen + tenonLength, h: sectionH, l: sectionW },
      netSize: { w: armLen, h: sectionH, l: sectionW },
      allowance: `榫头长: ${tenonLength}mm, 开口槽: ${slotW.toFixed(0)}×${slotH.toFixed(0)}mm, 舌片高: ${tongueH.toFixed(0)}mm`,
      stresses: [{ dir: new THREE.Vector3(1, 0, 0), length: 40, label: '拉力' }]
    },
    {
      id: 'right',
      name: '右段',
      geometry: rightGeo,
      position: new THREE.Vector3(tenonLength, 0, 0),
      explodeDir: new THREE.Vector3(1, 0, 0),
      rawSize: { w: armLen + tenonLength, h: sectionH, l: sectionW },
      netSize: { w: armLen, h: sectionH, l: sectionW },
      allowance: `榫头长: ${tenonLength}mm, 开口槽: ${slotW.toFixed(0)}×${slotH.toFixed(0)}mm, 舌片高: ${tongueH.toFixed(0)}mm`,
      stresses: [{ dir: new THREE.Vector3(-1, 0, 0), length: 40, label: '拉力' }]
    },
    {
      id: 'wedge',
      name: '楔钉',
      geometry: wedgeGeo,
      position: new THREE.Vector3(tenonLength / 2, 0, 0),
      explodeDir: new THREE.Vector3(0, 1, 0),
      rawSize: { w: wedgeWidth, h: wedgeHeight, l: sectionW * 0.9 },
      netSize: { w: wedgeWidth, h: wedgeHeight, l: sectionW * 0.9 },
      allowance: '楔入固定',
      stresses: [{ dir: new THREE.Vector3(0, -1, 0), length: 30, label: '挤压力' }]
    }
  ]
}

function createShouldered(params) {
  const { sectionW, sectionH, railW, railH, tenonLength, shoulderDepth } = params
  const postLen = 160
  const railLen = 120
  const tenonW = railW * 0.7
  const tenonH = railH * 0.7

  const postShapes = []
  postShapes.push(box(sectionW, postLen, sectionH, 0, 0, 0))
  postShapes.push(box(tenonW, tenonH, tenonLength + 0.1, sectionW / 2 + tenonLength / 2, 0, 0))
  const postGeo = mergeGeometries(postShapes)

  const railShapes = []
  railShapes.push(box(railLen, railH, railW, railLen / 2, 0, 0))
  railShapes.push(box(tenonLength, tenonH, tenonW, railLen + tenonLength / 2, 0, 0))
  railShapes.push(box(shoulderDepth, railH - tenonH, railW, railLen + shoulderDepth / 2, railH / 2 - (railH - tenonH) / 2, 0))
  railShapes.push(box(shoulderDepth, railH - tenonH, railW, railLen + shoulderDepth / 2, -railH / 2 + (railH - tenonH) / 2, 0))
  const railGeo = mergeGeometries(railShapes)

  return [
    {
      id: 'post',
      name: '立柱',
      geometry: postGeo,
      position: new THREE.Vector3(0, 0, 0),
      explodeDir: new THREE.Vector3(-0.3, -1, 0).normalize(),
      rawSize: { w: sectionW, h: postLen, l: sectionH },
      netSize: { w: sectionW, h: postLen, l: sectionH },
      allowance: `卯口: ${tenonW.toFixed(0)}×${tenonH.toFixed(0)}×${tenonLength}mm`,
      stresses: [{ dir: new THREE.Vector3(0, -1, 0), length: 40, label: '压力' }]
    },
    {
      id: 'rail',
      name: '横枨',
      geometry: railGeo,
      position: new THREE.Vector3(sectionW / 2 + tenonLength / 2, 0, 0),
      explodeDir: new THREE.Vector3(1, 0.3, 0).normalize(),
      rawSize: { w: railLen + tenonLength, h: railH, l: railW },
      netSize: { w: railLen, h: railH, l: railW },
      allowance: `榫长: ${tenonLength}mm, 格肩深: ${shoulderDepth}mm`,
      stresses: [{ dir: new THREE.Vector3(-1, 0, 0), length: 40, label: '剪力' }]
    }
  ]
}

export const JOINTS = {
  straight: createStraightTenon,
  dovetail: createDovetail,
  mitered: createMitered,
  wedge: createWedge,
  shouldered: createShouldered
}

export function generateJoint(type, params) {
  const fn = JOINTS[type]
  if (!fn) return []
  return fn(params)
}
