/**
 * HyperbolicParaboloidScene.jsx
 */
import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js'

// 1) The parametric function f(u,v) for the hyperbolic paraboloid
export function hyperbolicFunction(u, v, target) {
  // Range: u, v in [0, 1], mapped to x,y in [-2,2]
  const x = 4 * u - 2
  const y = 4 * v - 2
  const z = (x * x) - (y * y) // x^2 - y^2
  target.set(x, y, z)
}

// 2) A helper function that returns color from (x,y,z)
export function parabolaColor(x, y, z) {
  // NOTE: If x/y/z might be outside [0,1], the color
  // will clamp. Original code was new THREE.Color(x,y,z) directly.
  return new THREE.Color(x, y, z)
}

// 3) Create the main mesh geometry using useMemo
function HyperbolicParaboloid() {
  const geometry = useMemo(() => {
    // Create a parametric geometry subdiv with 100x100
    const paramGeom = new ParametricGeometry(hyperbolicFunction, 100, 100)

    // Build color attribute
    const positions = paramGeom.getAttribute('position')
    const count = positions.count
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = positions.getZ(i)
      const c = parabolaColor(x, y, z)
      colors[i * 3 + 0] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    paramGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    return paramGeom
  }, [])

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        side={THREE.DoubleSide}
        vertexColors
        color={0xaaaaaa}
      />
    </mesh>
  )
}

// 4) A simple grid plane made of lines
function GridPlane({ width = 10, divisions = 20 }) {
  // We'll create lines by building a group of <line> components
  // (Alternatively, you could use <gridHelper>, but here we match your code)
  const lines = []

  // X lines
  for (let i = 0; i <= divisions; i++) {
    const f = i / divisions - 0.5
    const x1 = f * width
    const x2 = f * width
    const z1 = -width * 0.5
    const z2 = width * 0.5
    const points = [new THREE.Vector3(x1, z1, 0), new THREE.Vector3(x2, z2, 0)]
    lines.push(<line key={`x-${i}`}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="white" transparent opacity={0.5} />
    </line>)
  }

  // Y lines
  for (let i = 0; i <= divisions; i++) {
    const f = i / divisions - 0.5
    const x1 = -width * 0.5
    const x2 = width * 0.5
    const z1 = f * width
    const z2 = f * width
    const points = [new THREE.Vector3(x1, z1, 0), new THREE.Vector3(x2, z2, 0)]
    lines.push(<line key={`y-${i}`}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="white" transparent opacity={0.5} />
    </line>)
  }

  return <group rotation={[-Math.PI / 2, 0, 0]}>{lines}</group>
  // ^ rotation = [-Math.PI / 2, 0, 0] => plane on X/Y if you want
  //   But you may prefer the original orientation. Adjust if needed.
}

// 5) Axis Arrow component
function AxisArrow({ color = 'white' }) {
  return (
    <group>
      {/* Cylinder for the 'line' */}
      <mesh position={[0, 0.125, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 20]} />
        <meshPhongMaterial color={color} shininess={100} />
      </mesh>
      {/* Cone for the 'head' */}
      <mesh position={[0, 0.275, 0]}>
        <coneGeometry args={[0.05, 0.2, 20]} />
        <meshPhongMaterial color={color} shininess={100} />
      </mesh>
    </group>
  )
}

// 6) Axis Helper group: x=white, y=yellow, z=cyan
function AxisHelper() {
  const xRef = useRef(null)
  const yRef = useRef(null)
  const zRef = useRef(null)

  // Rotate each arrow to align with the correct axis
  return (
    <group>
      {/* X-axis arrow (white) rotated -90 deg around Z */}
      <group ref={xRef} rotation={[0, 0, -Math.PI * 0.5]}>
        <AxisArrow color="#ffffff" />
      </group>
      {/* Y-axis arrow (yellow) => no rotation */}
      <group ref={yRef}>
        <AxisArrow color="#ffff00" />
      </group>
      {/* Z-axis arrow (cyan) rotated +90 deg around X */}
      <group ref={zRef} rotation={[Math.PI * 0.5, 0, 0]}>
        <AxisArrow color="#00ffff" />
      </group>
    </group>
  )
}

// 7) A special axis helper that follows the camera
function AxisHelperCamera() {
  const ref = useRef()
  useFrame(({ camera }) => {
    if (!ref.current) return
    // We replicate your logic: axis placed near camera in the corner of the view
    // 1) scale small
    ref.current.scale.set(0.015, 0.015, 0.015)

    // 2) copy position
    ref.current.position.copy(camera.position)

    // 3) offset a bit by camera’s local axes
    const camX = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
    const camY = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion)
    const camZ = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion)
    ref.current.position.addScaledVector(camX, -0.01875)
    ref.current.position.addScaledVector(camY, 0.01875)
    ref.current.position.addScaledVector(camZ, -0.06)
  })
  return (
    <group ref={ref}>
      <AxisHelper />
    </group>
  )
}

// 8) The main Scene
function SceneContainer() {
  // We'll set up a default camera in Canvas, but let's set its up & position via useFrame or props
  // Add an ambient light
  return (
    <>
      <ambientLight intensity={1.0} />
      {/* The main hyperbolic paraboloid */}
      <HyperbolicParaboloid />

      {/* The grid plane */}
      <GridPlane width={10} divisions={20} />

      {/* Axis helper at the world origin */}
      <group position={[0, 0, 0]}>
        <AxisHelper />
      </group>

      {/* Axis helper that follows camera */}
      <AxisHelperCamera />

      {/* Orbit Controls for the camera */}
      <OrbitControls autoRotate={false} />
    </>
  )
}

// 9) The root Canvas + our Scene
export default function HyperbolicParaboloidScene() {
  return (
    <Canvas
      // camera props
      camera={{
        // match the original up vector
        up: [0, 0, 1],
        // vantage point similar to original
        position: [0, 12.99, 7.5],
        fov: 45,
        near: 0.01,
        far: 1000
      }}
      style={{
        width: '500px',
        height: '500px',
        background: '#000000',
      }}
    >
      <SceneContainer />
    </Canvas>
  )
}
