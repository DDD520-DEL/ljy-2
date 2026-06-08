import * as THREE from 'three'

export function geometryToSTL(geometry, objectName = 'object') {
  if (!geometry.isBufferGeometry) {
    geometry = new THREE.BufferGeometry().fromGeometry(geometry)
  }

  const posAttr = geometry.getAttribute('position')
  const normAttr = geometry.getAttribute('normal')
  const indexAttr = geometry.getIndex()

  let triangleCount = 0
  if (indexAttr) {
    triangleCount = indexAttr.count / 3
  } else {
    triangleCount = posAttr.count / 3
  }

  const headerSize = 80
  const triSize = 50
  const bufferSize = headerSize + 4 + triangleCount * triSize
  const buffer = new ArrayBuffer(bufferSize)
  const dv = new DataView(buffer)

  const header = `Exported by Mortise & Tenon Tool - ${objectName}`.padEnd(80, ' ')
  for (let i = 0; i < 80; i++) {
    dv.setUint8(i, header.charCodeAt(i))
  }

  dv.setUint32(80, triangleCount, true)

  const tmpNormal = new THREE.Vector3()
  const tmpA = new THREE.Vector3()
  const tmpB = new THREE.Vector3()
  const tmpC = new THREE.Vector3()

  let offset = 84

  function writeVector(v) {
    dv.setFloat32(offset, v.x, true)
    dv.setFloat32(offset + 4, v.y, true)
    dv.setFloat32(offset + 8, v.z, true)
    offset += 12
  }

  for (let tri = 0; tri < triangleCount; tri++) {
    let iA, iB, iC
    if (indexAttr) {
      iA = indexAttr.getX(tri * 3)
      iB = indexAttr.getX(tri * 3 + 1)
      iC = indexAttr.getX(tri * 3 + 2)
    } else {
      iA = tri * 3
      iB = tri * 3 + 1
      iC = tri * 3 + 2
    }

    tmpA.set(posAttr.getX(iA), posAttr.getY(iA), posAttr.getZ(iA))
    tmpB.set(posAttr.getX(iB), posAttr.getY(iB), posAttr.getZ(iB))
    tmpC.set(posAttr.getX(iC), posAttr.getY(iC), posAttr.getZ(iC))

    if (normAttr) {
      tmpNormal.set(
        (normAttr.getX(iA) + normAttr.getX(iB) + normAttr.getX(iC)) / 3,
        (normAttr.getY(iA) + normAttr.getY(iB) + normAttr.getY(iC)) / 3,
        (normAttr.getZ(iA) + normAttr.getZ(iB) + normAttr.getZ(iC)) / 3
      )
      tmpNormal.normalize()
    } else {
      const ab = new THREE.Vector3().subVectors(tmpB, tmpA)
      const ac = new THREE.Vector3().subVectors(tmpC, tmpA)
      tmpNormal.crossVectors(ab, ac).normalize()
    }

    writeVector(tmpNormal)
    writeVector(tmpA)
    writeVector(tmpB)
    writeVector(tmpC)
    dv.setUint16(offset, 0, true)
    offset += 2
  }

  return buffer
}

export function mergeGeometriesWithTransform(geometries, transforms) {
  const mergedPositions = []
  const mergedNormals = []
  const mergedIndices = []
  let vertexOffset = 0

  for (let g = 0; g < geometries.length; g++) {
    const geo = geometries[g]
    const transform = transforms[g] || new THREE.Matrix4()

    const posAttr = geo.getAttribute('position')
    const normAttr = geo.getAttribute('normal')
    const indexAttr = geo.getIndex()

    const normalMatrix = new THREE.Matrix3().getNormalMatrix(transform)
    const tmpPos = new THREE.Vector3()
    const tmpNorm = new THREE.Vector3()

    const triCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3

    for (let tri = 0; tri < triCount; tri++) {
      let iA, iB, iC
      if (indexAttr) {
        iA = indexAttr.getX(tri * 3)
        iB = indexAttr.getX(tri * 3 + 1)
        iC = indexAttr.getX(tri * 3 + 2)
      } else {
        iA = tri * 3
        iB = tri * 3 + 1
        iC = tri * 3 + 2
      }

      for (const idx of [iA, iB, iC]) {
        tmpPos.set(posAttr.getX(idx), posAttr.getY(idx), posAttr.getZ(idx))
        tmpPos.applyMatrix4(transform)
        mergedPositions.push(tmpPos.x, tmpPos.y, tmpPos.z)

        if (normAttr) {
          tmpNorm.set(normAttr.getX(idx), normAttr.getY(idx), normAttr.getZ(idx))
          tmpNorm.applyMatrix3(normalMatrix).normalize()
        } else {
          tmpNorm.set(0, 0, 1)
        }
        mergedNormals.push(tmpNorm.x, tmpNorm.y, tmpNorm.z)

        mergedIndices.push(vertexOffset++)
      }
    }
  }

  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.Float32BufferAttribute(mergedPositions, 3))
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(mergedNormals, 3))
  merged.setIndex(mergedIndices)
  return merged
}

export function downloadSTL(buffer, filename) {
  const blob = new Blob([buffer], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.stl') ? filename : filename + '.stl'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
