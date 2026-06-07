import * as THREE from 'three'

export class OrbitControls {
  constructor(camera, domElement) {
    this.camera = camera
    this.dom = domElement
    this.target = new THREE.Vector3(0, 0, 0)
    this.spherical = new THREE.Spherical()
    this.sphericalDelta = new THREE.Spherical()
    this.scale = 1
    this.minDistance = 50
    this.maxDistance = 2000
    this.minPolar = 0.1
    this.maxPolar = Math.PI - 0.1
    this.rotateSpeed = 0.005
    this.zoomSpeed = 0.001
    this.enabled = true
    this._isRotating = false
    this._lastX = 0
    this._lastY = 0
    this._touchDist = 0
    this._bindEvents()
    const offset = new THREE.Vector3().copy(camera.position).sub(this.target)
    this.spherical.setFromVector3(offset)
  }

  _bindEvents() {
    const dom = this.dom
    dom.addEventListener('contextmenu', e => e.preventDefault())
    dom.addEventListener('mousedown', e => this._onMouseDown(e))
    dom.addEventListener('touchstart', e => this._onTouchStart(e), { passive: false })
    window.addEventListener('mousemove', e => this._onMouseMove(e))
    window.addEventListener('touchmove', e => this._onTouchMove(e), { passive: false })
    window.addEventListener('mouseup', () => this._onEnd())
    window.addEventListener('touchend', () => this._onEnd())
    dom.addEventListener('wheel', e => this._onWheel(e), { passive: false })
  }

  _onMouseDown(e) {
    if (!this.enabled) return
    this._isRotating = true
    this._lastX = e.clientX
    this._lastY = e.clientY
  }

  _onTouchStart(e) {
    if (!this.enabled) return
    if (e.touches.length === 1) {
      this._isRotating = true
      this._lastX = e.touches[0].clientX
      this._lastY = e.touches[0].clientY
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      this._touchDist = Math.sqrt(dx * dx + dy * dy)
    }
    e.preventDefault()
  }

  _onMouseMove(e) {
    if (!this._isRotating) return
    const dx = e.clientX - this._lastX
    const dy = e.clientY - this._lastY
    this._lastX = e.clientX
    this._lastY = e.clientY
    this.sphericalDelta.theta -= dx * this.rotateSpeed
    this.sphericalDelta.phi -= dy * this.rotateSpeed
  }

  _onTouchMove(e) {
    if (e.touches.length === 1 && this._isRotating) {
      const dx = e.touches[0].clientX - this._lastX
      const dy = e.touches[0].clientY - this._lastY
      this._lastX = e.touches[0].clientX
      this._lastY = e.touches[0].clientY
      this.sphericalDelta.theta -= dx * this.rotateSpeed
      this.sphericalDelta.phi -= dy * this.rotateSpeed
      e.preventDefault()
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const delta = this._touchDist - dist
      this.scale *= 1 + delta * 0.005
      this._touchDist = dist
      e.preventDefault()
    }
  }

  _onEnd() {
    this._isRotating = false
  }

  _onWheel(e) {
    if (!this.enabled) return
    e.preventDefault()
    this.scale *= 1 + e.deltaY * this.zoomSpeed
  }

  update() {
    const offset = new THREE.Vector3()
    this.spherical.theta += this.sphericalDelta.theta
    this.spherical.phi += this.sphericalDelta.phi
    this.spherical.phi = Math.max(this.minPolar, Math.min(this.maxPolar, this.spherical.phi))
    this.spherical.radius *= this.scale
    this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius))
    this.sphericalDelta.set(0, 0, 0)
    this.scale = 1
    offset.setFromSpherical(this.spherical)
    this.camera.position.copy(this.target).add(offset)
    this.camera.lookAt(this.target)
  }
}
