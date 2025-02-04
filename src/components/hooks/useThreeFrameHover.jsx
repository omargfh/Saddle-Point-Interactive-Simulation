/** useThreeFrameHover.jsx
* Streamlines defining hover effects on 3D objects
* Date: 03/02/2025
* Author: Omar Ibrahim for SciVis-2025
*/

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

const useThreeFrameHover = (cb) => {
    const hovered = useRef(false);

    function onPointerEnter(event) {
        hovered.current = true;
    }

    function onPointerLeave(event) {
        hovered.current = false;
    }

    useFrame((state, delta, frame) => {
        cb({
            hovered: hovered.current,
            state,
            delta,
            frame
        });
    });

    return {
        hovered,
        eventCallbacks: {
            onPointerEnter,
            onPointerLeave
        }
    }
}

export default useThreeFrameHover;