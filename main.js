// Global variables
let scene, camera, renderer, clock;
let giftBox, boy, curtains, ring;
let photoIndex = 0;
const photos = [
  'assets/images/photo1.jpg',
  'assets/images/photo2.jpg',
  'assets/images/photo3.jpg'
];
const videoSrc = 'assets/video/edit.mp4';
let music;
let fireworksParticles = [];
let confettiParticles = [];
let container;

// ---------------- Initialize Three.js Scene ----------------
function initScene(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  
  camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0,2,6);
  
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff,1);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff,0.6);
  directionalLight.position.set(0,5,5);
  scene.add(directionalLight);

  clock = new THREE.Clock();

  // Window resize handler
  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ---------------- Load Models ----------------
function loadModels(){
  const loader = new THREE.GLTFLoader();

  // Try to load models, fallback to basic shapes if loading fails
  
  // Gift Box - fallback to cube
  loader.load(
    'assets/models/giftBox.glb',
    gltf => {
      giftBox = gltf.scene;
      giftBox.position.set(0,0,0);
      scene.add(giftBox);
    },
    undefined,
    error => {
      console.log('Using fallback gift box');
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
      giftBox = new THREE.Mesh(geometry, material);
      giftBox.position.set(0, 0.5, 0);
      scene.add(giftBox);
    }
  );

  // Boy - fallback to cylinder
  loader.load(
    'assets/models/boy.glb',
    gltf => {
      boy = gltf.scene;
      boy.position.set(0,0,0);
      boy.visible = false;
      scene.add(boy);
    },
    undefined,
    error => {
      console.log('Using fallback boy model');
      const geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 32);
      const material = new THREE.MeshStandardMaterial({ color: 0x4169e1 });
      boy = new THREE.Mesh(geometry, material);
      boy.position.set(-1.5, 0.75, 0);
      boy.visible = false;
      scene.add(boy);
    }
  );

  // Curtains - fallback to plane
  loader.load(
    'assets/models/curtains.glb',
    gltf => {
      curtains = gltf.scene;
      curtains.position.set(0,0,-1);
      scene.add(curtains);
    },
    undefined,
    error => {
      console.log('Using fallback curtains');
      const geometry = new THREE.PlaneGeometry(10, 6);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x8b0000, 
        side: THREE.DoubleSide 
      });
      curtains = new THREE.Mesh(geometry, material);
      curtains.position.set(0, 3, -2);
      scene.add(curtains);
    }
  );

  // Ring placeholder
  const geometry = new THREE.TorusGeometry(0.15, 0.04, 16, 100);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0xffd700, 
    metalness: 1, 
    roughness: 0.2 
  });
  ring = new THREE.Mesh(geometry, material);
  ring.position.set(0.3, 1, 0); 
  ring.rotation.x = Math.PI/2;
  scene.add(ring);
}

// ---------------- Countdown ----------------
function startCountdown(){
  const countdownEl = document.getElementById('countdown');
  let timeLeft = 5;
  countdownEl.innerText = timeLeft;
  const interval = setInterval(()=>{
    timeLeft--;
    countdownEl.innerText = timeLeft;
    if(timeLeft<=0){
      clearInterval(interval);
      document.getElementById('countdown-container').classList.add('hidden');
      showWishMessage();
      triggerFireworks();
    }
  },1000);
}

// ---------------- Wish Message ----------------
function showWishMessage(){
  const wish = document.getElementById('wish-message');
  wish.classList.remove('hidden');
  wish.style.opacity = '0';
  gsap.to(wish, {opacity:1, duration:2, onComplete:showMusicBox});
}

// ---------------- Music ----------------
function showMusicBox(){
  const musicBox = document.getElementById('music-box');
  musicBox.classList.remove('hidden');
  document.getElementById('play-music').addEventListener('click', ()=>{
    music.play();
    musicBox.classList.add('hidden');
    showGiftBox();
  });
}

// ---------------- Gift Box Animation ----------------
function showGiftBox(){
  if(giftBox){
    gsap.to(giftBox.rotation,{y:Math.PI*2,duration:1,onComplete:showPhotos});
  } else {
    setTimeout(showPhotos, 1000);
  }
}

// ---------------- Photos Animation ----------------
function showPhotos(){
  // Hide wish message before showing photos
  document.getElementById('wish-message').classList.add('hidden');
  
  const container = document.getElementById('photo-container');
  container.classList.remove('hidden');
  displayPhoto(photoIndex);
}

function displayPhoto(index){
  const container = document.getElementById('photo-container');
  const img = document.createElement('img');
  img.src = photos[index];
  container.innerHTML = '';
  container.appendChild(img);
  
  gsap.fromTo(img,{scale:0},{scale:1,duration:1,onComplete:()=>{
    photoIndex++;
    if(photoIndex<photos.length){
      setTimeout(()=>displayPhoto(photoIndex),800);
    }else{
      setTimeout(playVideo,1000);
    }
  }});
}

// ---------------- Video ----------------
function playVideo(){
  // Hide photos before showing video
  document.getElementById('photo-container').classList.add('hidden');
  
  const video = document.getElementById('video-edit');
  video.src = videoSrc;
  video.classList.remove('hidden');
  music.volume(0.2);
  video.play();
  video.onended = ()=>{
    music.volume(0.5);
    video.classList.add('hidden');
    showCurtains();
  };
}

// ---------------- Curtains ----------------
function showCurtains(){
  if(curtains){
    gsap.to(curtains.position,{y:curtains.position.y + 4,duration:1,ease:"power2.inOut",onComplete:showProposal});
  } else {
    setTimeout(showProposal, 1000);
  }
}

// ---------------- Proposal ----------------
function showProposal(){
  if(boy) boy.visible = true;
  const proposal = document.getElementById('proposal-container');
  proposal.classList.remove('hidden');
  const yesBtn = document.getElementById('yes-btn');
  const noBtn = document.getElementById('no-btn');
  yesBtn.onclick = acceptProposal;
  noBtn.onclick = ()=>{}; // keep repeating until yes
}

function acceptProposal(){
  document.getElementById('proposal-container').classList.add('hidden');
  if(ring){
    gsap.to(ring.position,{x:-0.2,y:1.2,z:0,duration:2,ease:"power2.inOut",onComplete:hugAnimation});
  } else {
    hugAnimation();
  }
}

function hugAnimation(){
  if(boy){
    gsap.to(boy.rotation,{y:Math.PI/4,duration:1,ease:"power2.inOut"});
  }
  triggerConfetti();
  setTimeout(showFinalMessage,2500);
}

// ---------------- Fireworks ----------------
function triggerFireworks(){
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('assets/textures/firework.png');
  
  for(let i=0;i<150;i++){
    const material = new THREE.PointsMaterial({
      size:0.1,
      map:texture,
      transparent:true,
      blending:THREE.AdditiveBlending,
      color:new THREE.Color(Math.random(),Math.random(),Math.random())
    });
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      (Math.random()-0.5)*5,
      0,
      (Math.random()-0.5)*5
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const particle = new THREE.Points(geometry,material);
    particle.velocity = new THREE.Vector3(
      (Math.random()-0.5)*0.4,
      Math.random()*0.6+0.4,
      (Math.random()-0.5)*0.4
    );
    scene.add(particle);
    fireworksParticles.push(particle);
  }
}

// ---------------- Confetti ----------------
function triggerConfetti(){
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('assets/textures/confetti.png');
  
  for(let i=0;i<100;i++){
    const material = new THREE.PointsMaterial({
      size:0.08,
      map:texture,
      transparent:true,
      color:new THREE.Color(Math.random(),Math.random(),Math.random())
    });
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      (Math.random()-0.5)*3,
      2+(Math.random()*1),
      (Math.random()-0.5)*3
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const particle = new THREE.Points(geometry,material);
    particle.velocity = new THREE.Vector3(
      (Math.random()-0.5)*0.05,
      -Math.random()*0.03,
      0
    );
    scene.add(particle);
    confettiParticles.push(particle);
  }
}

// ---------------- Final Message ----------------
function showFinalMessage(){
  const final = document.getElementById('final-message');
  final.classList.remove('hidden');
  gsap.fromTo(final,{scale:0,opacity:0},{scale:1,opacity:1,duration:2,ease:"elastic.out(1,0.5)"});
}

// ---------------- Animate Loop ----------------
function animate(){
  requestAnimationFrame(animate);
  
  fireworksParticles.forEach(p=>{
    const pos = p.geometry.attributes.position;
    pos.array[1] += p.velocity.y;
    pos.array[0] += p.velocity.x;
    pos.array[2] += p.velocity.z;
    p.velocity.y -= 0.02;
    pos.needsUpdate = true;
  });
  
  confettiParticles.forEach(c=>{
    const pos = c.geometry.attributes.position;
    pos.array[0] += c.velocity.x;
    pos.array[1] += c.velocity.y;
    pos.array[2] += c.velocity.z;
    if(pos.array[1]<0) pos.array[1]=3;
    pos.needsUpdate = true;
  });
  
  renderer.render(scene,camera);
}

// ---------------- Initialize Everything ----------------
// Wait for DOM to be fully loaded before running
document.addEventListener('DOMContentLoaded', function() {
  // Initialize container and music after DOM is loaded
  container = document.getElementById('canvas-container');
  music = new Howl({ 
    src: ['assets/audio/background.mp3'], 
    loop: true,
    volume: 0.5
  });
  
  initScene();
  loadModels();
  startCountdown();
  animate();
});
