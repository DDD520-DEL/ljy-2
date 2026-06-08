class GIFEncoder {
  constructor(width, height, options = {}) {
    this.width = width
    this.height = height
    this.frames = []
    this.delay = options.delay || 100
    this.quality = options.quality || 10
    this.repeat = options.repeat || 0
  }

  addFrame(imageData) {
    this.frames.push({
      data: this._quantize(imageData),
      delay: this.delay
    })
  }

  _quantize(imageData) {
    const palette = []
    const paletteMap = new Map()
    const pixels = new Uint8Array(this.width * this.height)

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i]
      const g = imageData.data[i + 1]
      const b = imageData.data[i + 2]
      const key = (r << 16) | (g << 8) | b

      let idx = paletteMap.get(key)
      if (idx === undefined) {
        if (palette.length < 256) {
          idx = palette.length
          paletteMap.set(key, idx)
          palette.push(r, g, b)
        } else {
          let minDist = Infinity
          idx = 0
          for (let j = 0; j < palette.length; j += 3) {
            const dr = r - palette[j]
            const dg = g - palette[j + 1]
            const db = b - palette[j + 2]
            const dist = dr * dr + dg * dg + db * db
            if (dist < minDist) {
              minDist = dist
              idx = j / 3
            }
          }
        }
      }
      pixels[i / 4] = idx
    }

    while (palette.length < 768) palette.push(0)

    return { pixels, palette }
  }

  encode() {
    const parts = []

    parts.push(this._writeHeader())
    parts.push(this._writeLogicalScreenDescriptor())
    parts.push(this._writeGlobalColorTable(this.frames[0]?.palette || new Array(768).fill(0)))
    if (this.repeat >= 0) {
      parts.push(this._writeNetscapeExtension(this.repeat))
    }

    for (let i = 0; i < this.frames.length; i++) {
      const frame = this.frames[i]
      parts.push(this._writeGraphicControlExtension(frame.delay))
      parts.push(this._writeImageDescriptor())
      parts.push(this._writeImageData(frame.pixels))
    }

    parts.push(new Uint8Array([0x3B]))

    const totalLen = parts.reduce((sum, p) => sum + p.length, 0)
    const result = new Uint8Array(totalLen)
    let offset = 0
    for (const p of parts) {
      result.set(p, offset)
      offset += p.length
    }
    return result
  }

  _writeHeader() {
    const header = 'GIF89a'
    const buf = new Uint8Array(6)
    for (let i = 0; i < 6; i++) buf[i] = header.charCodeAt(i)
    return buf
  }

  _writeLogicalScreenDescriptor() {
    const buf = new Uint8Array(7)
    buf[0] = this.width & 0xff
    buf[1] = (this.width >> 8) & 0xff
    buf[2] = this.height & 0xff
    buf[3] = (this.height >> 8) & 0xff
    buf[4] = 0xf7
    buf[5] = 0
    buf[6] = 0
    return buf
  }

  _writeGlobalColorTable(palette) {
    const buf = new Uint8Array(768)
    for (let i = 0; i < 768 && i < palette.length; i++) {
      buf[i] = palette[i]
    }
    return buf
  }

  _writeNetscapeExtension(repeat) {
    const buf = new Uint8Array(19)
    buf[0] = 0x21
    buf[1] = 0xff
    buf[2] = 0x0b
    const app = 'NETSCAPE2.0'
    for (let i = 0; i < 11; i++) buf[i + 3] = app.charCodeAt(i)
    buf[14] = 0x03
    buf[15] = 0x01
    buf[16] = repeat & 0xff
    buf[17] = (repeat >> 8) & 0xff
    buf[18] = 0x00
    return buf
  }

  _writeGraphicControlExtension(delay) {
    const delayCs = Math.round(delay / 10)
    const buf = new Uint8Array(8)
    buf[0] = 0x21
    buf[1] = 0xf9
    buf[2] = 0x04
    buf[3] = 0x04
    buf[4] = delayCs & 0xff
    buf[5] = (delayCs >> 8) & 0xff
    buf[6] = 0x00
    buf[7] = 0x00
    return buf
  }

  _writeImageDescriptor() {
    const buf = new Uint8Array(10)
    buf[0] = 0x2c
    buf[1] = 0
    buf[2] = 0
    buf[3] = 0
    buf[4] = 0
    buf[5] = this.width & 0xff
    buf[6] = (this.width >> 8) & 0xff
    buf[7] = this.height & 0xff
    buf[8] = (this.height >> 8) & 0xff
    buf[9] = 0x00
    return buf
  }

  _writeImageData(pixels) {
    const minCodeSize = 8
    const clearCode = 1 << minCodeSize
    const eoiCode = clearCode + 1

    const output = []
    let codeSize = minCodeSize + 1
    let codeTable = new Map()
    let nextCode = eoiCode + 1

    const resetCodeTable = () => {
      codeTable.clear()
      for (let i = 0; i < clearCode; i++) {
        codeTable.set(String(i), i)
      }
      nextCode = eoiCode + 1
      codeSize = minCodeSize + 1
    }

    resetCodeTable()
    output.push(clearCode)

    let current = String(pixels[0])

    for (let i = 1; i < pixels.length; i++) {
      const key = current + ',' + pixels[i]
      if (codeTable.has(key)) {
        current = key
      } else {
        output.push(codeTable.get(current))
        if (nextCode < 4096) {
          codeTable.set(key, nextCode++)
          if (nextCode > (1 << codeSize) && codeSize < 12) {
            codeSize++
          }
        } else {
          output.push(clearCode)
          resetCodeTable()
        }
        current = String(pixels[i])
      }
    }

    output.push(codeTable.get(current))
    output.push(eoiCode)

    const bitStream = []
    let bitBuffer = 0
    let bitCount = 0

    for (const code of output) {
      bitBuffer |= (code << bitCount)
      bitCount += codeSize
      while (bitCount >= 8) {
        bitStream.push(bitBuffer & 0xff)
        bitBuffer >>= 8
        bitCount -= 8
      }
    }
    if (bitCount > 0) {
      bitStream.push(bitBuffer & 0xff)
    }

    const blocks = []
    for (let i = 0; i < bitStream.length; i += 255) {
      const chunk = bitStream.slice(i, i + 255)
      blocks.push(chunk.length, ...chunk)
    }
    blocks.push(0)

    const buf = new Uint8Array(1 + blocks.length)
    buf[0] = minCodeSize
    for (let i = 0; i < blocks.length; i++) {
      buf[i + 1] = blocks[i]
    }
    return buf
  }
}

export class AnimationRecorder {
  constructor(canvas, options = {}) {
    this.canvas = canvas
    this.fps = options.fps || 30
    this.quality = options.quality || 0.9
    this.width = options.width || canvas.width
    this.height = options.height || canvas.height
    this.frames = []
    this.isRecording = false
    this.mediaRecorder = null
    this.recordedChunks = []
    this.stream = null
    this._captureCanvas = document.createElement('canvas')
    this._captureCanvas.width = this.width
    this._captureCanvas.height = this.height
  }

  setSize(width, height) {
    this.width = width
    this.height = height
    this._captureCanvas.width = width
    this._captureCanvas.height = height
  }

  startRecording() {
    if (this.isRecording) return
    this.frames = []
    this.recordedChunks = []
    this.isRecording = true
  }

  captureFrame() {
    if (!this.isRecording) return

    const ctx = this._captureCanvas.getContext('2d')
    ctx.drawImage(this.canvas, 0, 0, this.width, this.height)
    const frameData = ctx.getImageData(0, 0, this.width, this.height)
    this.frames.push({
      imageData: frameData,
      timestamp: performance.now()
    })
  }

  startMediaRecording() {
    if (this.isRecording) return

    this.stream = this.canvas.captureStream(this.fps)
    this.recordedChunks = []

    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ]

    let selectedMimeType = ''
    for (const type of mimeTypes) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(type)) {
        selectedMimeType = type
        break
      }
    }

    if (!selectedMimeType && window.MediaRecorder) {
      this.mediaRecorder = new MediaRecorder(this.stream)
    } else if (window.MediaRecorder) {
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 5000000
      })
    } else {
      throw new Error('浏览器不支持 MediaRecorder API')
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data)
      }
    }

    this.mediaRecorder.start(100)
    this.isRecording = true
  }

  stopRecording() {
    this.isRecording = false
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      return new Promise((resolve) => {
        this.mediaRecorder.onstop = () => {
          resolve()
        }
        this.mediaRecorder.stop()
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop())
          this.stream = null
        }
      })
    }
    return Promise.resolve()
  }

  async exportGIF(filename = 'animation.gif', fps = null) {
    if (this.frames.length === 0) {
      throw new Error('没有录制的帧数据')
    }

    const targetFps = fps || this.fps
    const delay = 1000 / targetFps

    const encoder = new GIFEncoder(this.width, this.height, {
      delay: delay,
      repeat: 0
    })

    for (const frame of this.frames) {
      encoder.addFrame(frame.imageData)
    }

    const gifData = encoder.encode()
    const blob = new Blob([gifData], { type: 'image/gif' })
    this._downloadBlob(blob, filename)
    return blob
  }

  async exportWebM(filename = 'animation.webm') {
    if (this.recordedChunks.length === 0) {
      throw new Error('没有录制的视频数据')
    }

    const blob = new Blob(this.recordedChunks, { type: 'video/webm' })
    this._downloadBlob(blob, filename)
    return blob
  }

  async exportMP4(filename = 'animation.mp4') {
    if (this.recordedChunks.length === 0) {
      throw new Error('没有录制的视频数据')
    }

    const blob = new Blob(this.recordedChunks, { type: 'video/mp4' })
    this._downloadBlob(blob, filename)
    return blob
  }

  getFrameCount() {
    return this.frames.length
  }

  getRecordedDuration() {
    if (this.frames.length < 2) return 0
    return (this.frames[this.frames.length - 1].timestamp - this.frames[0].timestamp) / 1000
  }

  clear() {
    this.frames = []
    this.recordedChunks = []
  }

  _downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }
}
