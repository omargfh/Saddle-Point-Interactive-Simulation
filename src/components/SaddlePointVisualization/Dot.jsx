/** Dot.jsx
 * Desc: Dot Component
 * A simple dot component
 * Date: 03/02/2025
 * Author: Omar Ibrahim for SciVis-2025
 */

import { useRef } from "react";
import useThreeFrameHover from "../hooks/useThreeFrameHover";
import { DragControls, Text } from "@react-three/drei";

function Dot({
  position,
  color,
  size,
  dotName,
  dragProps = {},
  visible = true,
}) {
  const objectRef = useRef();
  const { eventCallbacks } = useThreeFrameHover(({ hovered }) => {
    const objectScale = objectRef.current.scale.x;
    const targetScale = hovered ? 1.5 : 1.0;
    const lerpedScale = objectScale + (targetScale - objectScale) * 0.1;
    objectRef.current.scale.set(lerpedScale, lerpedScale, lerpedScale);
  });

  const textPosition = [...position];
  textPosition[1] += 0.1;

  return (
    <DragControls {...dragProps}>
      <group visible={visible}>
        <mesh position={position} ref={objectRef} {...eventCallbacks}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <Text
          position={textPosition}
          fontSize={0.05}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {dotName}
        </Text>
      </group>
    </DragControls>
  );
}

export default Dot;
