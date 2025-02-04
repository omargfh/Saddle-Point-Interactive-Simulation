/** App.jsx
 * Desc: Three.js Application Entrypoint
 * for saddle point visualization in 3D
 * Date: 02/02/2025
 * Author: Omar Ibrahim for SciVis-2025
 */

import "./App.scss";
import CanvasWrapper from "./components/CanvasWrapper";
import Credits from "./components/Credits";
import HyperbolicParaboloidScene from "./components/examples/HyperbolicParaboloid";
import SaddlePointVisualization from "./components/SaddlePointVisualization/SaddlePointVisualization";

function App() {
  return (
    <div>
      <CanvasWrapper>
        <SaddlePointVisualization />
      </CanvasWrapper>
      <Credits />
    </div>
  );
}

export default App;
