/** Surface.jsx
 * Desc: A surface component
 * Date: 03/02/2025
 * Author: Omar Ibrahim for SciVis-2025
 */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";
import {
  constructBilerpSurface,
  constructHyperBilerpSurface,
} from "../../lib/3d/surfaces";
import { isoContourShader } from "../../lib/3d/shaders";

function Surface({
  position,
  controlPoints,
  color,
  segments = 20,
  visualizationMode = "bilerp",
  textureMode = "iso",
  isoLines = 10,
  size = 1,
  boundingBox = false,
}) {
  const surfaceGeom = useRef(null);

  const surfaceGeometry = useMemo(() => {
    if (visualizationMode === "hyper") {
      surfaceGeom.current?.dispose();
      surfaceGeom.current = new ParametricGeometry(
        constructHyperBilerpSurface(...controlPoints),
        segments,
        segments
      );
      surfaceGeom.current.computeVertexNormals();
      return surfaceGeom.current;
    }
    surfaceGeom.current?.dispose();
    surfaceGeom.current = new ParametricGeometry(
      constructBilerpSurface(...controlPoints),
      segments,
      segments
    );
    surfaceGeom.current.computeVertexNormals();
    return surfaceGeom.current;
  }, [controlPoints, visualizationMode]);

  const planeImage = useMemo(() => {
    const uv =
      visualizationMode === "hyper"
        ? constructHyperBilerpSurface(...controlPoints)
        : constructBilerpSurface(...controlPoints);

    const samplingPoints = 384;
    const image = new Uint8Array(samplingPoints * samplingPoints * 4); // RGBA (4 values per pixel)

    for (let j = 0; j < samplingPoints; j++) {
      for (let i = 0; i < samplingPoints; i++) {
        const u = i / (samplingPoints - 1);
        const v = j / (samplingPoints - 1);
        const index = (j * samplingPoints + i) * 4; // Row-major order

        const target = new THREE.Vector3();
        uv(u, v, target);

        const height = target.y + 0.5;
        const valMod = (height * isoLines) % 1;

        if (valMod < 0.05) {
          image[index] = 0;
          image[index + 1] = 0;
          image[index + 2] = 0;
        } else {
          const c = Math.min(Math.max(height, 0), 1); // Clamp height
          const color = new THREE.Color().setHSL(c * 0.15 + 0.05, 1, 0.5); // Better range

          image[index] = Math.round(color.r * 255);
          image[index + 1] = Math.round(color.g * 255);
          image[index + 2] = Math.round(color.b * 255);
        }

        image[index + 3] = 255; // Alpha channel
      }
    }

    return image;
  }, [controlPoints, visualizationMode, isoLines]);

  const physicsMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: color,
      emissive: 0x072534,
      emissiveIntensity: 0.5,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
  });

  const normalMaterial = useMemo(() => {
    return new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
  });

  const isocontourMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: isoContourShader.vertex,
      fragmentShader: isoContourShader.fragment,
      side: THREE.DoubleSide,
    });
  }, []);

  // Add uIsoLines uniform to the isocontour material
  useEffect(() => {
    isocontourMaterial.uniforms.uIsoLines = { value: isoLines };
    isocontourMaterial.uniforms.uBoundingBox = {
      value: boundingBox
        ? new THREE.Vector2(-size / 2, size / 2)
        : new THREE.Vector2(-10, 10),
    };
    isocontourMaterial.needsUpdate = true;
  }, [isoLines, isocontourMaterial, textureMode, boundingBox]);

  const materials = {
    iso: isocontourMaterial,
    normal: normalMaterial,
    physical: physicsMaterial,
  };

  useEffect(() => {
    return () => {
      surfaceGeom.current?.dispose();
    };
  }, []);

  useEffect(() => {
    const domTarget = document.querySelector(`#canvas-dom-target`);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 384;
    canvas.height = 384;
    const imageData = ctx.createImageData(384, 384);
    imageData.data.set(planeImage);
    ctx.putImageData(imageData, 0, 0);

    // Get image in an image tag

    let img = document.getElementById("plane-image");
    if (!img) {
      img = document.createElement("img");
      domTarget.appendChild(img);
      img.id = "plane-image";
      img.width = 150;
      img.height = 150;
      img.className =
        "object-cover hover:opacity-80 transition-all m-3 rounded-md shadow-md";
    }

    img.src = canvas.toDataURL();

    return () => {};
  }, [planeImage, size]);

  return (
    <mesh
      scale={size}
      position={position}
      geometry={surfaceGeometry}
      material={materials[textureMode] || isocontourMaterial}
    />
  );
}

export default Surface;
