/** Credits.jsx
 * Desc: Credits Component
 * Date: 02/03/2025
 * Author: Omar Ibrahim for SciVis-2025
 */

/* eslint-disable react/prop-types */
const Credits = (props) => {
  return (
    <div className="absolute bottom-0 right-0 p-2 text-white text-xs">
      Demo created by{" "}
      <a href="https://omar-ibrahim.com" target="_blank" rel="noreferrer">
        Omar Ibrahim
      </a>{" "}
      for{" "}
      <a
        href="https://people.cs.uchicago.edu/~glk/class/scivis"
        target="_blank"
        rel="noreferrer"
      >
        CMSC {`{2,3}3710`} Scientific Visualization
      </a>
      . (2025)
    </div>
  );
};

export default Credits;
