/** useSaddlePointVisualization.jsx
 * Desc: ...
 * Date: 02/02/2025
 * Author: Omar Ibrahim for SciVis-2025
 */

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import GUI from "lil-gui";

/* eslint-disable react/prop-types */
const useSaddlePointVisualization = (groupRef) => {
  // Configure state
  const [showcaseRotation, setShowcaseRotation] = useState({ value: true });
  const [cpv, setCpv] = useState({
    a: 0.4,
    b: 1.0,
    c: 0.6,
    d: 0.013,
  });

  const [cpvSize, setCpvSize] = useState({ value: 0.02 });
  const [surfaceProps, setSurfaceProps] = useState({
    color: "#0ca5ff",
    segments: 40,
    visualizationMode: "bilerp",
    textureMode: "iso",
    isoLines: 10,
    boundingBox: true,
  });

  // Set up GUI
  const cpTypes = useRef({
    hyper: {
      names: ["m", "s0", "t0", "h"],
      range: [
        [-5, 5],
        [-0.5, 1.5],
        [-0.5, 1.5],
        [-3, 3],
      ],
      history: [3, 0.4, 0.5, 0],
    },
    bilerp: {
      names: ["a", "b", "c", "d"],
      range: [
        [0, 1],
        [0, 1],
        [0, 1],
        [0, 1],
      ],
      history: [0.4, 1.0, 0.6, 0.013],
    },
  });

  const guiRef = useRef(null);
  useEffect(() => {
    const gui = new GUI();
    guiRef.current = gui;
    gui
      .add(showcaseRotation, "value")
      .onChange((b) => setShowcaseRotation({ value: b }))
      .name("Showcase Rotation");
    gui
      .add(cpvSize, "value", 0.01, 0.5, 0.01)
      .onChange((v) => setCpvSize({ value: v }))
      .name("Control Point Size");
    const surfaceFolder = gui.addFolder("Surface");
    surfaceFolder
      .add(surfaceProps, "segments", 10, 100, 1, 10)
      .onChange((v) => setSurfaceProps({ ...surfaceProps, segments: v }))
      .name("Segments");
    surfaceFolder
      .add(surfaceProps, "visualizationMode", ["Bilerp", "Hyperpoloidal"])
      .onChange((v) => {
        if (v === "hyper") {
          const history = cpTypes.current.hyper.history;
          cpv.a = history[0];
          cpv.b = history[1];
          cpv.c = history[2];
          cpv.d = history[3];
          setCpv({ a: cpv.a, b: cpv.b, c: cpv.c, d: cpv.d });
        } else {
          const history = cpTypes.current.bilerp.history;
          cpv.a = history[0];
          cpv.b = history[1];
          cpv.c = history[2];
          cpv.d = history[3];
          setCpv({ a: cpv.a, b: cpv.b, c: cpv.c, d: cpv.d });
        }
        setSurfaceProps({ ...surfaceProps, visualizationMode: v });
      })
      .name("Surface Type")
      .options({
        Bilerp: "bilerp",
        Hyperpoloidal: "hyper",
      });
    surfaceFolder
      .add(surfaceProps, "textureMode", ["Physical", "Isocountor", "Normals"])
      .onChange((v) => setSurfaceProps({ ...surfaceProps, textureMode: v }))
      .name("Texture Mode")
      .options({
        Physical: "physical",
        Normals: "normal",
        Isocountor: "iso",
      });

    if (surfaceProps.textureMode === "physical") {
      surfaceFolder
        .addColor(surfaceProps, "color")
        .onChange((v) => setSurfaceProps({ ...surfaceProps, color: v }))
        .name("Color");
    } else if (surfaceProps.textureMode === "iso") {
      surfaceFolder
        .add(surfaceProps, "isoLines", 10, 50, 10, 10)
        .onChange((v) => setSurfaceProps({ ...surfaceProps, isoLines: v }))
        .name("Isocountor Lines");
    }

    if (
      surfaceProps.visualizationMode === "hyper" &&
      surfaceProps.textureMode === "iso"
    ) {
      surfaceFolder
        .add(surfaceProps, "boundingBox")
        .onChange((v) =>
          setSurfaceProps((prev) => ({ ...prev, boundingBox: v }))
        )
        .name("Bounding Box");
    }

    const cpvFolder = gui.addFolder("Surface Control Points");
    const cpType = cpTypes.current[surfaceProps.visualizationMode];
    const cpLabel = cpType.names;
    const cpRange = cpType.range;
    ["a", "b", "c", "d"].forEach((key, index) => {
      cpvFolder
        .add(cpv, key, cpRange[index][0], cpRange[index][1], 0.01)
        .name(cpLabel[index])
        .listen()
        .onChange((v) => setCpv((prev) => ({ ...prev, [key]: v })));
    });
    return () => {
      gui.destroy();
    };
  }, [surfaceProps.visualizationMode, surfaceProps.textureMode]);

  // Save the control points
  useEffect(() => {
    if (surfaceProps.visualizationMode === "hyper") {
      cpTypes.current.hyper.history = [cpv.a, cpv.b, cpv.c, cpv.d];
    } else {
      cpTypes.current.bilerp.history = [cpv.a, cpv.b, cpv.c, cpv.d];
    }
  }, [cpv, surfaceProps.visualizationMode]);

  // Create the graph cube
  const graphSize = 1;
  const graphCube = useMemo(() => {
    const geometry = new THREE.BoxGeometry(graphSize, graphSize, graphSize);
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial();

    const edges = new THREE.LineSegments(edgesGeometry, material);

    return edges;
  }, []);

  // Constants for control points include
  // colors and positions for non-Y-axis positions
  const controlPointConstants = useMemo(() => {
    return {
      colors: [
        new THREE.Color("#ac11f0"),
        new THREE.Color("#f0adac"),
        new THREE.Color("#acadfc"),
        new THREE.Color("#a1fd1f"),
      ],
      pos2D: [
        new THREE.Vector2(-graphSize / 2, -graphSize / 2),
        new THREE.Vector2(-graphSize / 2, graphSize / 2),
        new THREE.Vector2(graphSize / 2, -graphSize / 2),
        new THREE.Vector2(graphSize / 2, graphSize / 2),
      ],
    };
  }, []);

  // Rotate the group
  useFrame(() => {
    if (groupRef.current) {
      if (showcaseRotation.value) {
        groupRef.current.rotateY(0.001);
      }
    }
  });

  // Create the control points
  const tickMarks = useMemo(() => {
    const _tickMarks = [];
    for (let i = -graphSize / 2; i <= graphSize / 2; i += 0.2) {
      const padding = 0.05;
      for (let axis of ["x", "y", "z"]) {
        const position = new THREE.Vector3();
        const rotation = new THREE.Euler(0, 0, 0);
        position[axis] = i;
        if (axis === "x") {
          position.y = -graphSize / 2 - padding;
          position.z = -graphSize / 2 - padding;
        } else if (axis === "y") {
          position.x = -graphSize / 2 - padding;
          position.z = -graphSize / 2 - padding;
        } else {
          position.x = -graphSize / 2 - padding;
          position.y = -graphSize / 2 - padding;
          rotation.y = -Math.PI / 2;
        }
        _tickMarks.push({
          props: { position, rotation, color: "#FFFFFF", fontSize: 0.05 },
          text: (i + graphSize / 2).toFixed(1),
        });
      }
    }
    return _tickMarks;
  }, []);

  return {
    graphCube,
    controlPoints: Object.keys(cpv).map((key, index) => {
      const position = controlPointConstants.pos2D[index];
      return {
        position: [
          position.x,
          cpv[key] * graphSize - graphSize / 2,
          position.y,
        ],
        visible: surfaceProps.visualizationMode === "hyper" ? false : true,
        size: cpvSize.value,
        color: controlPointConstants.colors[index],
        dotName: key,
        dragProps: {
          autoTransform: false,
          drag: false,
        },
      };
    }),
    surface: {
      position: [0, 0, 0],
      size: graphSize,
      color: new THREE.Color(surfaceProps.color),
      segments: surfaceProps.segments,
      controlPoints: [cpv.a, cpv.b, cpv.c, cpv.d],
      visualizationMode: surfaceProps.visualizationMode,
      textureMode: surfaceProps.textureMode,
      isoLines: surfaceProps.isoLines,
      boundingBox: surfaceProps.boundingBox,
    },
    text: [
      {
        text:
          surfaceProps.visualizationMode === "hyper"
            ? "Hyperpoloidal Surface"
            : "Bilerp Surface",
        props: {
          position: [0, graphSize / 2 + 0.5, 0],
          color: "#FFFFFF",
          fontSize: 0.1,
          anchorX: "center",
          anchorY: "middle",
        },
      },
      ...tickMarks,
    ],
  };
};

export default useSaddlePointVisualization;
