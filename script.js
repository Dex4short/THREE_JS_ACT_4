import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/*GUI*/
const gui = new dat.GUI();
const debugObject = {};
debugObject.depthColor = '#ffffff';
debugObject.surfaceColor = '#ffffff';
const parameters = { color: 0xff0000 };
gui.addColor(parameters, 'color').onChange( () => {
  material.color.set(parameters.color);
});

/**background**/
const background_textures = [
  new THREE.TextureLoader().load('https://dex4short.github.io/THREE_JS_ACT_4/textures/background_right.png'),
  new THREE.TextureLoader().load('https://dex4short.github.io/THREE_JS_ACT_4/textures/background_left.png'),
  new THREE.TextureLoader().load('https://dex4short.github.io/THREE_JS_ACT_4/textures/background_top.png'),
  new THREE.TextureLoader().load('https://dex4short.github.io/THREE_JS_ACT_4/textures/background_bottom.png'),
  new THREE.TextureLoader().load('https://dex4short.github.io/THREE_JS_ACT_4/textures/background_front.png'),
  new THREE.TextureLoader().load('https://dex4short.github.io/THREE_JS_ACT_4/textures/background_back.png'),
];
const background_materials = [
    new THREE.MeshBasicMaterial({map: background_textures[0], side: THREE.BackSide}),
    new THREE.MeshBasicMaterial({map: background_textures[1], side: THREE.BackSide}),
    new THREE.MeshBasicMaterial({map: background_textures[2], side: THREE.BackSide}),
    new THREE.MeshBasicMaterial({map: background_textures[3], side: THREE.BackSide}),
    new THREE.MeshBasicMaterial({map: background_textures[4], side: THREE.BackSide}),
    new THREE.MeshBasicMaterial({map: background_textures[5], side: THREE.BackSide}),
]
const background_geometry = new THREE.BoxGeometry(100, 100, 100);
const background_mesh = new THREE.Mesh(background_geometry, background_materials);
scene.add(background_mesh);
background_mesh.position.y = 10;

/*Water*/
const waterGeometry = new THREE.PlaneGeometry(100, 100, 128, 128); 
const waterTexture = new THREE.TextureLoader().load('https://dex4short.github.io/THREE_JS_ACT_4/textures/sea.png');
//waterTexture.wrapS = THREE.RepeatWrapping;
//waterTexture.wrapT = THREE.RepeatWrapping;
//waterTexture.repeat.set(100, 100);
const waterVertexShader = `
      uniform float uBigWavesElevation;
      uniform float uTime;
      uniform float uBigWavesSpeed;
      uniform vec2 uBigWavesFrequency;
      
      varying float vElevation;
      varying vec2 vUv;
      
      void main() {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          float elevation = sin(modelPosition.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) *
                            sin(modelPosition.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) *
                            uBigWavesElevation;
          modelPosition.y += elevation;
          vElevation = elevation;
          
          vUv = uv;
          
          vec4 viewPosition = viewMatrix * modelPosition;
          
          vec4 projectedPosition = projectionMatrix * viewPosition;
          
          gl_Position = projectedPosition;
      }
`;
const waterFragmentShader = `
      uniform vec3 uDepthColor;
      uniform vec3 uSurfaceColor;
      uniform float uTime;
      uniform float uColorOffset;
      uniform float uColorMultiplier;
      uniform float uTextureSpeed;
      uniform sampler2D waterTexture;
      
      varying float vElevation;
      varying vec2 vUv;
      
      void main(){
        vec2 animatedUV = vUv + vec2(uTime * uTextureSpeed, 0.0);
        animatedUV = mod(animatedUV, 1.0);
        
        vec4 texColor = texture(waterTexture, animatedUV);
      
        float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
        vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);
        
        gl_FragColor = texColor * vec4(color, 1.0);
      }
`;
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms:
  {
    waterTexture: { value: waterTexture },
    uTime: { value: 0 },
    uBigWavesElevation: { value: 0.2 },
    uBigWavesFrequency: { value: new THREE.Vector2(10, 10) },
    uBigWavesSpeed: { value: 0.75 },
    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: { value: 0.25 },
    uColorMultiplier: { value: 2 },
    uTextureSpeed: { value: -0.05 },
  },
});
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5 
scene.add(water);
gui.add(waterMaterial.uniforms.uBigWavesElevation,'value').min(0).max(1).step(0.001).name('uBigWavesElevation');
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX');
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value,'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY');
gui.add(waterMaterial.uniforms.uBigWavesSpeed,'value').min(0).max(4).step(0.001).name('uBigWavesSpeed');
gui.add(waterMaterial.uniforms.uColorOffset,'value').min(0).max(1).step(0.001).name('uColorOffset')
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier')
gui.addColor(debugObject, 'depthColor').onChange(() => {
  waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor) })
gui.addColor(debugObject, 'surfaceColor').onChange(() => {
  waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor) })
gui.add(waterMaterial, 'wireframe');
gui.add(water, 'visible');

/*Light*/
const light_1 = new THREE.DirectionalLight(0xffe7a6, 1);
light_1.position.set(-20, 10, 10);
scene.add(light_1);

const light_2 = new THREE.DirectionalLight(0xffffff, 0.8);
light_2.position.set(20, 10, 0);
scene.add(light_2);

const light_3 = new THREE.DirectionalLight(0xb0fbff, 0.5);
light_3.position.set(0, -10, -10);
scene.add(light_3);

/*Goin Merry*/
const goin_merry_loader = new GLTFLoader();
goin_merry_loader.load( 
  'https://dex4short.github.io/THREE_JS_ACT_4/models/goin_merry.glb',
  (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => { 
      if (child.material) {
        child.material.side = THREE.DoubleSide;
      }
    });
    scene.add(model);
    model.position.set(0, -0.5, 0);
  }
);

/*Characters*/
class Model{
  constructor(name, position, rotation, scale, animation){
    this.name = name;
    this.position = position;
    this.rotation = rotation;
    this.scale = [scale, scale, scale];
    this.animation = animation;
    this.mixer = null;
    this.clock = new THREE.Clock();
  }
}
const models = [
  new Model('luffy',[-2, 0.85, 0],[0, -1, 0],0.15, 8),
  new Model('zoro',[-1.5, 0.31, 0.45],[0, -1, 0], 0.31, 0),
  new Model('nami',[-1.5, 0.85, -0.45],[0, -1.5, 0], 0.29, 0),
  new Model('sanji',[0, 0.36, -0.45],[0, -1, 0], 0.0028, 0),
  new Model('robin',[0, 0.75, 0.45],[0, -1, 0], 0.0025, 0),
  new Model('usopp',[-0.3, 3.8, -0.3],[0, -1.9, 0], 0.0024, 0),
  new Model('chopper',[1.5, 0.93, 0.3],[0, -1.9, 0], 0.0024, 0),
];
for(let m=0; m<models.length; m++){
  const loader = new GLTFLoader();
  loader.load( 
    'https://dex4short.github.io/THREE_JS_ACT_4/models/'+models[m].name+'.glb',
    (gltf) => {
      const model = gltf.scene;
      model.traverse((child) => { 
        if (child.material) {
          child.material.side = THREE.DoubleSide;
        }
      });
      scene.add(model);
      model.position.set(models[m].position[0], models[m].position[1], models[m].position[2]);
      model.rotation.set(models[m].rotation[0], models[m].rotation[1], models[m].rotation[2]);
      model.scale.set(models[m].scale[0], models[m].scale[1], models[m].scale[2]);

      if (gltf.animations && gltf.animations.length > 0) {
        models[m].mixer = new AnimationMixer(model);
        const clip = gltf.animations[models[m].animation];
        const action = models[m].mixer.clipAction(clip);
        action.play();
      }
    }
  );
}

const audio = new Audio('https://dex4short.github.io/THREE_JS_ACT_4/sound/one_piece.mp3');
let play = false;
canvas.addEventListener('mousedown', (event) => {
  if(!play){
    audio.play();
    play = true;
  }
});

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
const clock = new THREE.Clock();
const tick = function() {
    const elapsedTime = clock.getElapsedTime();
    controls.update();
  
    for(let m=0; m<models.length; m++){
      if(models[m].mixer){
        models[m].mixer.update(models[m].clock.getDelta());
      }
    }
    waterMaterial.uniforms.uTime.value = elapsedTime;
  
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}
tick();

