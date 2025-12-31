// ---------------- Countdown ----------------
let count = 5;
const countdown = document.getElementById("countdown");
const message = document.getElementById("message");

const timer = setInterval(() => {
  count--;
  countdown.innerText = count;

  if (count === 0) {
    clearInterval(timer);
    countdown.classList.add("hidden");
    message.classList.remove("hidden");
    fireworkEffect();
  }
}, 1000);

// ---------------- Music ----------------
const music = new Audio("assets/audio/background.mp3");
music.loop = true;

document.getElementById("playMusic").onclick = () => {
  music.play();
  message.classList.add("hidden");
  showPhotos();
};

// ---------------- Photos ----------------
const photos = [
  "assets/images/photo1.jpg",
  "assets/images/photo2.jpg",
  "assets/images/photo3.jpg"
];

const photoBox = document.getElementById("photos");
let photoIndex = 0;

function showPhotos() {
  photoBox.classList.remove("hidden");
  displayPhoto();
}

function displayPhoto() {
  if (photoIndex >= photos.length) {
    setTimeout(playVideo, 1000);
    return;
  }

  photoBox.innerHTML = `<img src="${photos[photoIndex]}">`;
  gsap.fromTo(photoBox, {scale:0}, {scale:1, duration:1});

  photoIndex++;
  setTimeout(displayPhoto, 1500);
}

// ---------------- Video ----------------
const video = document.getElementById("video");
video.src = "assets/video/edit.mp4";

function playVideo() {
  photoBox.classList.add("hidden");
  video.classList.remove("hidden");
  music.volume = 0.3;
  video.play();

  video.onended = () => {
    music.volume = 1;
    video.classList.add("hidden");
    document.getElementById("final").classList.remove("hidden");
  };
}

// ---------------- Fireworks ----------------
function fireworkEffect() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({alpha:true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.z = 5;

  const texture = new THREE.TextureLoader().load("assets/textures/firework.png");

  const particles = [];
  for(let i=0;i<200;i++){
    const material = new THREE.PointsMaterial({
      size: 0.15,
      map: texture,
      transparent: true,
      color: new THREE.Color(Math.random(),Math.random(),Math.random())
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position",
      new THREE.Float32BufferAttribute([0,0,0],3)
    );

    const p = new THREE.Points(geometry, material);
    p.velocity = new THREE.Vector3(
      (Math.random()-0.5)*0.5,
      Math.random()*0.5,
      (Math.random()-0.5)*0.5
    );
    scene.add(p);
    particles.push(p);
  }

  function animate(){
    requestAnimationFrame(animate);
    particles.forEach(p=>{
      p.position.add(p.velocity);
      p.velocity.y -= 0.01;
    });
    renderer.render(scene,camera);
  }
  animate();
}
