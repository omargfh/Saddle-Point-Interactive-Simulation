export const isoContourShader = {
  vertex: `
		uniform float uIsoLines; // Number of contour lines
		uniform vec2 uBoundingBox; // Bounding box

		varying vec3 vPosition; // Pass the position to the fragment shader
		varying float vIsoLines; // Pass the number of contour lines to the fragment shader
		varying vec2 vBoundingBox; // Pass the bounding box to the fragment shader
		varying vec3 vNormal; // Pass the normal to the fragment shader

		void main() {
				vPosition = position; // Store the position
				vIsoLines = float(uIsoLines); // Store the number of contour lines
				vBoundingBox = uBoundingBox; // Store the bounding box
				vNormal = normal; // Store the normal

				// Standard transformation
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`,
  fragment: `
		varying vec3 vPosition; // Receive the position from vertex shader
		varying float vIsoLines; // Receive the number of contour lines from vertex shader
		varying vec2 vBoundingBox; // Receive the bounding box from vertex shader
		varying vec3 vNormal; // Receive the normal from vertex shader

		void main() {
				if (vPosition.x < vBoundingBox.x || vPosition.x > vBoundingBox.y ||
						vPosition.y < vBoundingBox.x || vPosition.y > vBoundingBox.y ||
						vPosition.z < vBoundingBox.x || vPosition.z > vBoundingBox.y) {
						discard;
				}
				float vZ = vPosition.y; // Z-coordinate
				float stripes = vIsoLines; // Number of contour lines
				float valMod = fract(vZ * stripes); // Get the fractional part

				// If valMod is near 0, draw a black contour line
				if (valMod < 0.05) {
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black contour line
				} else {
						// Gradient from orange to yellow
						float c = clamp(vZ, 0.0, 1.0);
						vec3 color = mix(vec3(1.0, 0.6, 0.0), // Orange
														vec3(1.0, 1.0, 0.0), // Yellow
														c);
						gl_FragColor = vec4(color, 1.0);
				}

				// Apply lighting
				vec3 normal = normalize(vNormal);
				vec3 lightDirection = normalize(vec3(0.0, -1.0, 1.0));
				float lightIntensity = max(dot(normal, lightDirection), 0.0) * 1.0;
				gl_FragColor.rgb *= 0.5;
				gl_FragColor.rgb += gl_FragColor.rgb * lightIntensity;
		}
	`,
};
