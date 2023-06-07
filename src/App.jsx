import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import './App.css';
import ShaderToy from './ShaderToy';

// Function to create a moving directional light
// Takes scene and direction as arguments, with direction defaulting to 1
function createOrbitingDirectionalLight(scene, direction=1) {
  // Constants for the light orbit
  const radius = 100;
  const angularSpeed = direction *  0.005; // Low speed for smooth motion

  // Create a new directional light and add it to the scene
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(directionalLight);

  // Update function to move the light along an orbit
  function updateLightPosition() {
    // Get elapsed time in seconds and calculate the new angle
    const elapsedTime = performance.now() * 0.1; 
    const angle = elapsedTime * angularSpeed;

    // Update the position of the light
    directionalLight.position.x = radius * Math.cos(angle);
    directionalLight.position.z = radius * Math.sin(angle);
    directionalLight.position.y = 100; // Set a fixed height above the origin

    // Point the light towards the center (origin)
    directionalLight.lookAt(0, 0, 0);

    // Call the update function again in the next frame
    requestAnimationFrame(updateLightPosition);
  }

  // Start updating the light position
  updateLightPosition();
}

function App() {
  // Use React's useState to create a scene state variable
  let [scene, setScene] = useState(null);

  // Use React's useEffect to set up Three.js when the component mounts
  useEffect(() => {
    // Set up a new Three.js scene, camera, and renderer
    scene = new THREE.Scene();
    setScene(scene);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    // Create two orbiting directional lights
    createOrbitingDirectionalLight(scene, 1);
    createOrbitingDirectionalLight(scene, -1);

    // Create an ambient light and add it to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Configure the renderer size and add it to the DOM
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('threejs-container').appendChild(renderer.domElement);

    // Create a clock for delta time and a render loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);

      // Get delta time and dispatch an update event to the scene
      const delta = clock.getDelta();
      scene.dispatchEvent({ type: 'update', delta });

      // Render the scene
      renderer.render(scene, camera);
    };

    // Handle window resizing
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Add event listener for window resizing
    window.addEventListener('resize', onWindowResize);

    animate();

    // Clean up when the component is unmounted
    return () => {
      renderer.dispose();
      window.cancelAnimationFrame(animate);
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  // Render a div for Three.js and the ShaderToy component
  return (
    <>
    <div id="threejs-container" style={{ width: '100%', height: '100%' }}></div>
    <ShaderToy scene={scene} />
    </>
  );
}

export default App;
