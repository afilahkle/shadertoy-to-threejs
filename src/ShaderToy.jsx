import React, { useEffect } from 'react';
import * as THREE from 'three';

// ShaderToy component takes a Three.js scene as a prop
const ShaderToy = ({ scene }) => {
  useEffect(() => {
    // Return early if there's no scene
    if (!scene) return;

    // Set up a custom shader material with uniforms for time and resolution
    const customShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(600,600) },
      },
      // Vertex shader positions vertices in 3D space
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      // Fragment shader calculates the color of each pixel
      fragmentShader: `
      uniform vec2 iResolution;
      uniform float iTime;
      
      void mainImage( out vec4 outputColor, in vec2 inputCoordinates ) {
          vec3 color;
          float lengthToOrigin, waveOffset = iTime;
      
          for(int i=0; i<3; i++) {
              vec2 uvCoordinates, normalizedCoordinates = inputCoordinates.xy / iResolution;
              uvCoordinates = normalizedCoordinates;
      
              normalizedCoordinates -= 0.5;
              normalizedCoordinates.x *= iResolution.x / iResolution.y;
      
              waveOffset += 0.8;
              lengthToOrigin = length(normalizedCoordinates);
      
              uvCoordinates += normalizedCoordinates / lengthToOrigin * (sin(waveOffset) + 1.) * (sin(lengthToOrigin * 9. - waveOffset *.21 ));
              color[i] = .01 / length(fract(uvCoordinates) - 0.5);
          }
      
          outputColor = vec4(color / lengthToOrigin, iTime);
      } 
      void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
    }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    // Create a mesh using a plane geometry and the custom shader material
    const planeGeometry = new THREE.PlaneGeometry(6, 6);
    const shaderMesh = new THREE.Mesh(planeGeometry, customShaderMaterial);
    shaderMesh.position.set(0, 0, -3);
    scene.add(shaderMesh);

    // Update the shader material's resolution uniform
    customShaderMaterial.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);

    // Set up an animation loop that updates the time uniform
    const animate = () => {
      if (!scene) return;
      customShaderMaterial.uniforms.iTime.value = performance.now() / 1000;
      requestAnimationFrame(animate);
    };
    animate();

    // Clean up when the component is unmounted
    return () => {
      if (scene) {
        scene.remove(shaderMesh);
      }
    };
  }, [scene]);

  return null;
};

export default ShaderToy;
