/** SaddlePointVisualization.jsx
 * Desc: Three.js Application
 * Date: 02/02/2025
 * Author: Omar Ibrahim for SciVis-2025
 */

import { DragControls, OrbitControls, Text } from "@react-three/drei";
import useSaddlePointVisualization from "./useSaddlePointVisualization";
import Dot from "./Dot";
import Surface from "./Surface";
import { useRef } from "react";
import { Perf } from "r3f-perf";
import { useWindowSize } from "@uidotdev/usehooks";
import { clamp } from "three/src/math/MathUtils.js";

/* eslint-disable react/prop-types */
const SaddlePointVisualization = () => {
  const groupRef = useRef();
  const { graphCube, controlPoints, surface, text } =
    useSaddlePointVisualization(groupRef);
  const { width, height } = useWindowSize();

  return (
    <>
      <ambientLight intensity={1} />
      <pointLight position={[-1, 1, 0]} intensity={5} />
      <pointLight position={[1, 1, 0]} intensity={5} />
      <pointLight position={[1, -1, 0]} intensity={5} />
      <pointLight position={[-1, -1, 0]} intensity={5} />
      <group ref={groupRef} scale={width < 768 ? width / 760 : 1}>
        <primitive object={graphCube} />
        {controlPoints.map((controlPoint, key) => {
          return <Dot key={key} {...controlPoint} />;
        })}
        <Surface {...surface} />
        {text.map((text, key) => {
          return (
            <Text key={key} {...text.props}>
              {text.text}
            </Text>
          );
        })}
      </group>
      <OrbitControls
        enablePan={true}
        enableZoom={false}
        enableRotate={true}
        minAzimuthAngle={-Math.PI}
        maxAzimuthAngle={Math.PI}
        minPolarAngle={-Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
};

export default SaddlePointVisualization;
