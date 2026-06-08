import * as THREE from 'three'
import { OrbitControls } from './OrbitControls.js'
import { COMPONENT_COLORS } from '../models/jointTypes.js'
import { generateJoint } from '../models/jointGeometry.js'
import { geometryToSTL, mergeGeometriesWithTransform, downloadSTL } from './stlExporter.js'
import { AnimationRecorder } from './animationRecorder.js'

export class SceneManager {
  constructor(container) {
    this.container = container
    this.componentMeshes = []
    this.annotationObjects = []
    this.wireframeMode = true
    this.explodeProgress = 0
    this.showAnnotations = true
    this.currentJoint = null
    this.currentParams = null
    this._animId = null
    this.animationRecorder = null
    this.isRecording = false
    this._frameCaptureInterval = null
    this._init()
    this._animate()
  }

  _init() {
    const w = this.container.clientWidth
    const h = this.container.clientHeight

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x1a0f08)

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 5000)
    this.camera.position.set(250, 200, 250)

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(w, h)
    this.renderer.localClippingEnabled = true
    this.container.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this._addLights()
    this._addGrid()
    this._addAxes()

    window.addEventListener('resize', () => this._onResize())
  }

  _addLights() {
    const amb = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(amb)

    const dir1 = new THREE.DirectionalLight(0xfff4e6, 0.8)
    dir1.position.set(200, 300, 150)
    this.scene.add(dir1)

    const dir2 = new THREE.DirectionalLight(0xe6d4b4, 0.4)
    dir2.position.set(-200, 100, -150)
    this.scene.add(dir2)
  }

  _addGrid() {
    const grid = new THREE.GridHelper(600, 20, 0x5c3a1e, 0x3a2414)
    grid.position.y = -120
    this.scene.add(grid)
  }

  _addAxes() {
    const axes = new THREE.AxesHelper(80)
    axes.position.set(-250, -119, -250)
    this.scene.add(axes)
  }

  _onResize() {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  clearJoint() {
    for (const m of this.componentMeshes) {
      this.scene.remove(m)
      m.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(mat => mat.dispose())
          else obj.material.dispose()
        }
      })
    }
    this.componentMeshes = []
    this._clearAnnotations()
  }

  _clearAnnotations() {
    for (const a of this.annotationObjects) {
      this.scene.remove(a)
    }
    this.annotationObjects = []
  }

  loadJoint(type, params) {
    this.currentJoint = type
    this.currentParams = params
    this.clearJoint()
    const components = generateJoint(type, params)
    this._buildMeshes(components)
    this.centerView()
  }

  _buildMeshes(components) {
    components.forEach((comp, i) => {
      const group = new THREE.Group()

      const color = COMPONENT_COLORS[i % COMPONENT_COLORS.length]
      const mat = new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity: this.wireframeMode ? 0.25 : 0.85,
        roughness: 0.75,
        metalness: 0.05,
        side: THREE.DoubleSide
      })
      const mesh = new THREE.Mesh(comp.geometry, mat)
      mesh.castShadow = true
      group.add(mesh)

      const edges = new THREE.EdgesGeometry(comp.geometry, 20)
      const lineMat = new THREE.LineBasicMaterial({ color: 0xffd9a0, linewidth: 2 })
      const line = new THREE.LineSegments(edges, lineMat)
      group.add(line)

      group.userData = {
        id: comp.id,
        name: comp.name,
        basePosition: comp.position.clone(),
        explodeDir: comp.explodeDir.clone(),
        rawSize: comp.rawSize,
        netSize: comp.netSize,
        allowance: comp.allowance,
        stresses: comp.stresses || []
      }

      group.position.copy(comp.position)
      this.scene.add(group)
      this.componentMeshes.push(group)
    })

    this.updateExplode()
    if (this.showAnnotations) this._addAnnotations()
  }

  setWireframe(enabled) {
    this.wireframeMode = enabled
    for (const g of this.componentMeshes) {
      const mesh = g.children.find(c => c.isMesh)
      if (mesh) mesh.material.opacity = enabled ? 0.25 : 0.85
    }
  }

  setExplode(progress) {
    this.explodeProgress = progress
    this.updateExplode()
  }

  updateExplode() {
    const amount = this.explodeProgress * 120
    for (const g of this.componentMeshes) {
      const d = g.userData.explodeDir
      const base = g.userData.basePosition
      g.position.set(
        base.x + d.x * amount,
        base.y + d.y * amount,
        base.z + d.z * amount
      )
    }
  }

  setShowAnnotations(show) {
    this.showAnnotations = show
    if (show) {
      this._addAnnotations()
    } else {
      this._clearAnnotations()
    }
  }

  _addAnnotations() {
    this._clearAnnotations()
    for (const g of this.componentMeshes) {
      const box = new THREE.Box3().setFromObject(g)
      const center = new THREE.Vector3()
      box.getCenter(center)
      const size = new THREE.Vector3()
      box.getSize(size)

      const stresses = g.userData.stresses || []
      for (const s of stresses) {
        const dir = s.dir.clone().normalize()
        const origin = center.clone()
        const arrow = new THREE.ArrowHelper(dir, origin, s.length, 0xff4444, 8, 5)
        this.annotationObjects.push(arrow)
        this.scene.add(arrow)
      }

      const namePos = center.clone()
      namePos.y += size.y / 2 + 20
      const sprite = this._makeTextSprite(g.userData.name, 0xffd9a0)
      sprite.position.copy(namePos)
      this.annotationObjects.push(sprite)
      this.scene.add(sprite)
    }
  }

  _makeTextSprite(text, color = 0xffffff) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const fontSize = 64
    ctx.font = `bold ${fontSize}px "Source Han Serif SC", "Noto Serif SC", serif`
    const metrics = ctx.measureText(text)
    const w = Math.ceil(metrics.width) + 40
    const h = fontSize + 20
    canvas.width = w
    canvas.height = h
    ctx.font = `bold ${fontSize}px "Source Han Serif SC", "Noto Serif SC", serif`
    ctx.fillStyle = `rgba(44, 24, 16, 0.85)`
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = `#${new THREE.Color(color).getHexString()}`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillText(text, w / 2, h / 2)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
    const sprite = new THREE.Sprite(mat)
    sprite.scale.set(w * 0.4, h * 0.4, 1)
    return sprite
  }

  getComponents() {
    return this.componentMeshes.map(g => ({
      id: g.userData.id,
      name: g.userData.name,
      rawSize: g.userData.rawSize,
      netSize: g.userData.netSize,
      allowance: g.userData.allowance
    }))
  }

  centerView() {
    if (this.componentMeshes.length === 0) return
    const box = new THREE.Box3()
    for (const g of this.componentMeshes) {
      const b = new THREE.Box3().setFromObject(g)
      box.union(b)
    }
    const center = new THREE.Vector3()
    box.getCenter(center)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    this.controls.target.copy(center)
    const dist = maxDim * 2.2
    const dir = new THREE.Vector3(1, 0.8, 1).normalize()
    this.camera.position.copy(center).add(dir.multiplyScalar(dist))
    this.camera.lookAt(center)
    this.controls.spherical.setFromVector3(this.camera.position.clone().sub(center))
  }

  exportAllSTL(filename = 'mortise_tenon') {
    if (this.componentMeshes.length === 0) {
      console.warn('没有可导出的几何体')
      return false
    }

    const geometries = []
    const transforms = []

    for (const g of this.componentMeshes) {
      const mesh = g.children.find(c => c.isMesh)
      if (mesh && mesh.geometry) {
        g.updateMatrixWorld(true)
        geometries.push(mesh.geometry)
        transforms.push(g.matrixWorld.clone())
      }
    }

    if (geometries.length === 0) {
      console.warn('没有可导出的几何体')
      return false
    }

    const merged = mergeGeometriesWithTransform(geometries, transforms)
    const buffer = geometryToSTL(merged, filename)
    downloadSTL(buffer, filename)
    return true
  }

  exportComponentSTL(componentId, filename) {
    const group = this.componentMeshes.find(g => g.userData.id === componentId)
    if (!group) {
      console.warn('未找到构件:', componentId)
      return false
    }

    const mesh = group.children.find(c => c.isMesh)
    if (!mesh || !mesh.geometry) {
      console.warn('构件没有几何体:', componentId)
      return false
    }

    group.updateMatrixWorld(true)

    const geo = mesh.geometry.clone()

    if (!geo.getAttribute('normal')) {
      geo.computeVertexNormals()
    }

    const normalMatrix = new THREE.Matrix3().getNormalMatrix(group.matrixWorld)
    const posAttr = geo.getAttribute('position')
    const normAttr = geo.getAttribute('normal')
    const tmpPos = new THREE.Vector3()
    const tmpNorm = new THREE.Vector3()

    for (let i = 0; i < posAttr.count; i++) {
      tmpPos.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i))
      tmpPos.applyMatrix4(group.matrixWorld)
      posAttr.setXYZ(i, tmpPos.x, tmpPos.y, tmpPos.z)

      tmpNorm.set(normAttr.getX(i), normAttr.getY(i), normAttr.getZ(i))
      tmpNorm.applyMatrix3(normalMatrix).normalize()
      normAttr.setXYZ(i, tmpNorm.x, tmpNorm.y, tmpNorm.z)
    }

    posAttr.needsUpdate = true
    normAttr.needsUpdate = true
    geo.computeBoundingBox()
    geo.computeBoundingSphere()

    const name = filename || group.userData.name || componentId
    const buffer = geometryToSTL(geo, name)
    downloadSTL(buffer, name)
    return true
  }

  exportComponentsSeparate(baseFilename = 'mortise_tenon') {
    if (this.componentMeshes.length === 0) {
      console.warn('没有可导出的几何体')
      return false
    }

    let count = 0
    for (const g of this.componentMeshes) {
      const name = g.userData.name || g.userData.id || `component_${count + 1}`
      const safeName = name.replace(/[\\/:*?"<>|]/g, '_')
      const result = this.exportComponentSTL(g.userData.id, `${baseFilename}_${safeName}`)
      if (result) count++
    }
    return count > 0
  }

  getComponentMeshes() {
    return this.componentMeshes.map(g => ({
      id: g.userData.id,
      name: g.userData.name
    }))
  }

  getCanvas() {
    return this.renderer.domElement
  }

  captureFrame() {
    this.renderer.render(this.scene, this.camera)
    const canvas = this.renderer.domElement
    const ctx = canvas.getContext('2d') || canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (ctx && typeof ctx.readPixels === 'function') {
      const width = canvas.width
      const height = canvas.height
      const pixels = new Uint8Array(width * height * 4)
      ctx.readPixels(0, 0, width, height, ctx.RGBA || 0x1908, ctx.UNSIGNED_BYTE || 0x1401, pixels)
      const flippedPixels = new Uint8Array(width * height * 4)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const srcIdx = ((height - 1 - y) * width + x) * 4
          const dstIdx = (y * width + x) * 4
          flippedPixels[dstIdx] = pixels[srcIdx]
          flippedPixels[dstIdx + 1] = pixels[srcIdx + 1]
          flippedPixels[dstIdx + 2] = pixels[srcIdx + 2]
          flippedPixels[dstIdx + 3] = pixels[srcIdx + 3]
        }
      }
      return { data: flippedPixels, width, height }
    }
    return null
  }

  _initRecorder() {
    if (this.animationRecorder) return
    const canvas = this.renderer.domElement
    const width = Math.min(canvas.width, 1280)
    const height = Math.min(canvas.height, 720)
    this.animationRecorder = new AnimationRecorder(canvas, {
      fps: 30,
      width,
      height
    })
  }

  startAnimationRecording(mode = 'both') {
    if (this.isRecording) return false
    this._initRecorder()

    this.isRecording = true
    this.explodeProgress = 0
    this.setExplode(0)

    if (mode === 'gif' || mode === 'both') {
      this.animationRecorder.startRecording()
      this._startFrameCapture()
    }
    if (mode === 'video' || mode === 'both') {
      try {
        this.animationRecorder.startMediaRecording()
      } catch (e) {
        console.warn('视频录制不可用:', e.message)
      }
    }
    return true
  }

  _startFrameCapture() {
    const fps = 30
    const interval = 1000 / fps
    let lastCapture = 0
    const captureLoop = (t) => {
      if (!this.isRecording) return
      if (t - lastCapture >= interval) {
        this.animationRecorder.captureFrame()
        lastCapture = t
      }
      this._frameCaptureInterval = requestAnimationFrame(captureLoop)
    }
    this._frameCaptureInterval = requestAnimationFrame(captureLoop)
  }

  _stopFrameCapture() {
    if (this._frameCaptureInterval) {
      cancelAnimationFrame(this._frameCaptureInterval)
      this._frameCaptureInterval = null
    }
  }

  async stopAnimationRecording() {
    if (!this.isRecording) return null
    this.isRecording = false
    this._stopFrameCapture()

    await this.animationRecorder.stopRecording()
    return {
      frameCount: this.animationRecorder.getFrameCount(),
      duration: this.animationRecorder.getRecordedDuration()
    }
  }

  async exportGIF(filename) {
    if (!this.animationRecorder) throw new Error('录制器未初始化')
    return await this.animationRecorder.exportGIF(filename)
  }

  async exportVideo(filename, format = 'webm') {
    if (!this.animationRecorder) throw new Error('录制器未初始化')
    if (format === 'mp4') {
      return await this.animationRecorder.exportMP4(filename)
    }
    return await this.animationRecorder.exportWebM(filename)
  }

  getRecordingInfo() {
    if (!this.animationRecorder) return null
    return {
      isRecording: this.isRecording,
      frameCount: this.animationRecorder.getFrameCount(),
      duration: this.animationRecorder.getRecordedDuration()
    }
  }

  _animate = () => {
    this._animId = requestAnimationFrame(this._animate)
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    if (this._animId !== null) {
      cancelAnimationFrame(this._animId)
      this._animId = null
    }
    this._stopFrameCapture()
    if (this.animationRecorder) {
      this.animationRecorder.clear()
      this.animationRecorder = null
    }
    this.renderer.dispose()
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
  }
}
