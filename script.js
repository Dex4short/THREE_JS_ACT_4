import * as THREE from 'three';
import waterVertexShader from 'https://dex4short.github.io/THREE_JS_ACT_4/shaders/water_vertex.glsl';
import waterFragmentShader from 'https://dex4short.github.io/THREE_JS_ACT_4/shaders/water_fragment.glsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Canvas
const canvas = document.querySelector('canvas.webgl') 

// Scene
const scene = new THREE.Scene()

/*Water*/
const waterGeometry = new THREE.PlaneGeometry(2, 2, 128, 128);
const waterMaterial = new THREE.MeshBasicMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms:
  {
    uBigWavesElevation: { value: 0.2 }
  }
});;
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5 
scene.add(water);

/*Sizes*/
const sizes = {width: window.innerWidth, height: window.innerHeight};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});

/*Camera*/
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 1, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/*Renderer*/
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/*Animate*/
const clock = new THREE.Clock()

const tick = function() {
    const elapsedTime = clock.getElapsedTime();
    controls.update();
    
    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
}

tick();
