import * as THREE from "three";

/* toQuads
 * Convert a BufferGeometry to quads
 *
 * @param {THREE.BufferGeometry} g - The geometry to convert
 * @returns {THREE.BufferGeometry} - The geometry converted to quads
 */
export function toQuads(g) {
  let p = g.parameters;
  let segmentsX =
    (g.type == "TorusBufferGeometry" ? p.tubularSegments : p.radialSegments) ||
    p.widthSegments ||
    p.thetaSegments ||
    p.points.length - 1 ||
    1;
  let segmentsY =
    (g.type == "TorusBufferGeometry" ? p.radialSegments : p.tubularSegments) ||
    p.heightSegments ||
    p.phiSegments ||
    p.segments ||
    1;
  let indices = [];
  for (let i = 0; i < segmentsY + 1; i++) {
    let index11 = 0;
    let index12 = 0;
    for (let j = 0; j < segmentsX; j++) {
      index11 = (segmentsX + 1) * i + j;
      index12 = index11 + 1;
      let index21 = index11;
      let index22 = index11 + (segmentsX + 1);
      indices.push(index11, index12);
      if (index22 < (segmentsX + 1) * (segmentsY + 1) - 1) {
        indices.push(index21, index22);
      }
    }
    if (index12 + segmentsX + 1 <= (segmentsX + 1) * (segmentsY + 1) - 1) {
      indices.push(index12, index12 + segmentsX + 1);
    }
  }
  g.setIndex(indices);
  return g;
}

/* toQuadWireframe
 * Convert a BufferGeometry to a quad wireframe
 *
 * @param {THREE.BufferGeometry} geometry - The geometry to convert
 * @param {THREE.Material} material - The material to use
 * @returns {THREE.LineSegments} - The quad wireframe
 */
export function toQuadWireframe(
  geometry,
  material
) {
  const g = geometry.clone();
  toQuads(g);
  let w = new THREE.LineSegments(g, material);
  return w;
}
