import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

const canvas = document.querySelector("canvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.3, 2000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas });

renderer.setSize(window.innerWidth, window.innerHeight);

const radius = 12;
const widthSegments = 150;
const heightSegments = 150;
const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

const points = new THREE.Points(geometry, new THREE.PointsMaterial({
  color: 0x34d399,
  size: 0.08,
  opacity: 1,
}));

scene.add(points);

camera.position.z = 30;

function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.004;
  const position = points.geometry.attributes.position;

  const waveStrength = 0.11; 
  const waveFrequency = 0.56

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);

    const wave = Math.sin(1.8 * x * waveFrequency + time) * waveStrength;

    position.setZ(i, z + wave);
  }

  position.needsUpdate = true;

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});