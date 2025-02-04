export function hyperbolicFunction(u, v, target) {
  // Range: u, v in [0, 1], mapped to x,y in [-2,2]
  const x = 4 * u - 2
  const y = 4 * v - 2
  const z = (x * x) - (y * y) // x^2 - y^2
  target.set(x, y, z)
}

export function constructBilerpSurface(a, b, c, d, offset=0.5) {
	return (u, v, target) => {
    // x and y in [0,1] for (u,v)
    const x = u;
    const y = v;

    // Bilinear interpolation for z:
    const z = a * (1 - u) * (1 - v)
            + b * (1 - u) * v
            + c * u       * (1 - v)
            + d * u       * v;

    // Pass the result to 'target' (a THREE.Vector3).
    target.set(x - offset, z  - offset, y - offset);
  };
}

export function constructHyperBilerpSurface(m, s0, t0, h, offset=0.5) {
  // Compute approximate corner heights using hyperbolic paraboloid properties
  const a = h - m * s0 * t0;
  const b = h - m * s0 * (t0 - 1);
  const c = h - m * (s0 - 1) * t0;
  const d = h - m * (s0 - 1) * (t0 - 1);

  // Return a parametric function for Three.js
  return (u, v, target) => {
    const x = u; // s-axis
    const y = v; // t-axis

    // Perform bilinear interpolation
    const z = a * (1 - u) * (1 - v) +
              b * (1 - u) * v +
              c * u * (1 - v) +
              d * u * v;

    target.set(x - offset, z , y - offset);
  };
}