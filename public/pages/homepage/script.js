import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

const canvas = document.querySelector("canvas");
const scene = new THREE.Scene();

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.3, 2000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const radius = 11;
const widthSegments = 150;
const heightSegments = 150;

// Geometry
const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

// Materials
const points = new THREE.Points(
  geometry,
  new THREE.PointsMaterial({
    color: 0x6ee7b7,
    size: 0.07,
    opacity: 1,
  })
);

scene.add(points);
camera.position.z = 30;

let time = 0;
const expansionSpeed = 0.025;
const maxExpansion = 5;

function animate() {
  requestAnimationFrame(animate);

  time += expansionSpeed;

  const scale = 1 + Math.sin(time) * (maxExpansion / radius);

  points.scale.set(scale, scale, scale);

  const waveStrength = 0.09;
  const waveFrequency = 0.56;
  const currentTime = Date.now() * 0.004;
  const position = points.geometry.attributes.position;

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);

    const wave = Math.sin(x * waveFrequency + currentTime) * waveStrength;
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