/** CanvasWrapper.jsx
 * Desc: CanvasWrapper Component
 * Keeps the canvas full screen and hidden overflow
 * Date: 02/02/2025
 * Author: Omar Ibrahim for SciVis-2025
 */

import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { ACESFilmicToneMapping } from "three";

/* eslint-disable react/prop-types */
const CanvasWrapper = (props) => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  return (
    <div className="w-screen h-screen fixed-0 overflow-hidden p-0 m-0 relative">
      <div id="canvas-dom-target" className="absolute top-0 left-0 z-10"></div>
      <Canvas
        gl={{ antialias: true, toneMapping: ACESFilmicToneMapping }}
        camera={{ position: [0, 0, 8], fov: 20 }}
        dpr={window.devicePixelRatio}
      >
        {props.children}
      </Canvas>
    </div>
  );
};

export default CanvasWrapper;
