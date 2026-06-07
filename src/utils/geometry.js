import * as THREE from 'three'

export function box(w, h, d, cx = 0, cy = 0, cz = 0) {
  const g = new THREE.BoxGeometry(w, h, d)
  g.translate(cx, cy, cz)
  return g
}

export function mergeGeometries(geos) {
  if (geos.length === 0) return new THREE.BufferGeometry()
  const merged = new THREE.BufferGeometry()
  const positions = []
  const normals = []
  const indices = []
  let offset = 0
  for (const g of geos) {
    const pos = g.attributes.position
    const nor = g.attributes.normal
    const idx = g.index
    if (idx) {
      for (let i = 0; i < idx.count; i++) {
        indices.push(idx.array[i] + offset)
      }
    } else {
      for (let i = 0; i < pos.count; i++) {
        indices.push(i + offset)
      }
    }
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.array[i * 3], pos.array[i * 3 + 1], pos.array[i * 3 + 2])
      normals.push(nor.array[i * 3], nor.array[i * 3 + 1], nor.array[i * 3 + 2])
    }
    offset += pos.count
  }
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  merged.setIndex(indices)
  return merged
}

export function cloneGeometry(g) {
  return g.clone()
}
