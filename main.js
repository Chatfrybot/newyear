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
const music = new Howl({ 
  src: ['assets/audio/background.mp3'], 
  loop: true,
  volume: 0.5
});
let fireworksParticles = [];
let confettiParticles = [];

const container = document.getElementById('canvas-container');

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ProposalExperience = () => {
  const containerRef = useRef(null);
  const [countdown, setCountdown] = useState(5);
  const [showCountdown, setShowCountdown] = useState(true);
  const [showWish, setShowWish] = useState(false);
  const [showMusicBox, setShowMusicBox] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const giftBoxRef = useRef(null);
  const boyRef = useRef(null);
  const curtainsRef = useRef(null);
  const ringRef = useRef(null);
  const fireworksRef = useRef([]);
  const confettiRef = useRef([]);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // Sample photos - using placeholder images
  const photos = [
    'https://picsum.photos/400/300?random=1',
    'https://picsum.photos/400/300?random=2',
    'https://picsum.photos/400/300?random=3'
  ];

  useEffect(() => {
    initScene();
    loadModels();
    startCountdown();
    animate();

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const initScene = () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(0, 5, 5);
    scene.add(directionalLight);
  };

  const loadModels = () => {
    const loader = new GLTFLoader();

    // Create gift box (cube as placeholder)
    const giftGeometry = new THREE.BoxGeometry(1, 1, 1);
    const giftMaterial = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
    const giftBox = new THREE.Mesh(giftGeometry, giftMaterial);
    giftBox.position.set(0, 0.5, 0);
    sceneRef.current.add(giftBox);
    giftBoxRef.current = giftBox;

    // Create boy (cylinder as placeholder)
    const boyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 32);
    const boyMaterial = new THREE.MeshStandardMaterial({ color: 0x4169e1 });
    const boy = new THREE.Mesh(boyGeometry, boyMaterial);
    boy.position.set(-1.5, 0.75, 0);
    boy.visible = false;
    sceneRef.current.add(boy);
    boyRef.current = boy;

    // Create curtains (planes)
    const curtainGeometry = new THREE.PlaneGeometry(10, 6);
    const curtainMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8b0000, 
      side: THREE.DoubleSide 
    });
    const curtains = new THREE.Mesh(curtainGeometry, curtainMaterial);
    curtains.position.set(0, 3, -2);
    sceneRef.current.add(curtains);
    curtainsRef.current = curtains;

    // Create ring
    const ringGeometry = new THREE.TorusGeometry(0.15, 0.04, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffd700, 
      metalness: 1, 
      roughness: 0.2 
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(0.3, 1, 0);
    ring.rotation.x = Math.PI / 2;
    sceneRef.current.add(ring);
    ringRef.current = ring;
  };

  const startCountdown = () => {
    let timeLeft = 5;
    const interval = setInterval(() => {
      timeLeft--;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(interval);
        setShowCountdown(false);
        setShowWish(true);
        triggerFireworks();
        setTimeout(() => setShowMusicBox(true), 2000);
      }
    }, 1000);
  };

  const handlePlayMusic = () => {
    setMusicPlaying(true);
    setShowMusicBox(false);
    
    // Animate gift box
    const startRotation = giftBoxRef.current.rotation.y;
    const duration = 1000;
    const startTime = Date.now();
    
    const rotateGift = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      giftBoxRef.current.rotation.y = startRotation + progress * Math.PI * 2;
      
      if (progress < 1) {
        requestAnimationFrame(rotateGift);
      } else {
        setShowPhotos(true);
        displayPhotos();
      }
    };
    rotateGift();
  };

  const displayPhotos = () => {
    let index = 0;
    const showNext = () => {
      if (index < photos.length) {
        setCurrentPhoto(index);
        index++;
        setTimeout(showNext, 2000);
      } else {
        setTimeout(() => {
          setShowPhotos(false);
          setShowVideo(true);
        }, 1000);
      }
    };
    showNext();
  };

  const handleVideoEnd = () => {
    setShowVideo(false);
    
    // Animate curtains up
    const startY = curtainsRef.current.position.y;
    const duration = 1000;
    const startTime = Date.now();
    
    const moveCurtains = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      curtainsRef.current.position.y = startY + progress * 4;
      
      if (progress < 1) {
        requestAnimationFrame(moveCurtains);
      } else {
        boyRef.current.visible = true;
        setShowProposal(true);
      }
    };
    moveCurtains();
  };

  const handleAcceptProposal = () => {
    setShowProposal(false);
    
    // Animate ring
    const startPos = { ...ringRef.current.position };
    const duration = 2000;
    const startTime = Date.now();
    
    const moveRing = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      ringRef.current.position.x = startPos.x + progress * (-0.5);
      ringRef.current.position.y = startPos.y + progress * 0.2;
      
      if (progress < 1) {
        requestAnimationFrame(moveRing);
      } else {
        // Hug animation
        const startRot = boyRef.current.rotation.y;
        const rotDuration = 1000;
        const rotStartTime = Date.now();
        
        const rotateBoy = () => {
          const elapsed = Date.now() - rotStartTime;
          const progress = Math.min(elapsed / rotDuration, 1);
          boyRef.current.rotation.y = startRot + progress * Math.PI / 4;
          
          if (progress < 1) {
            requestAnimationFrame(rotateBoy);
          }
        };
        rotateBoy();
        
        triggerConfetti();
        setTimeout(() => setShowFinal(true), 2500);
      }
    };
    moveRing();
  };

  const triggerFireworks = () => {
    const particleCount = 150;
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        (Math.random() - 0.5) * 5,
        0,
        (Math.random() - 0.5) * 5
      ]);
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      
      const material = new THREE.PointsMaterial({
        size: 0.1,
        color: new THREE.Color(Math.random(), Math.random(), Math.random()),
        transparent: true,
        blending: THREE.AdditiveBlending
      });
      
      const particle = new THREE.Points(geometry, material);
      particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        Math.random() * 0.6 + 0.4,
        (Math.random() - 0.5) * 0.4
      );
      
      sceneRef.current.add(particle);
      fireworksRef.current.push(particle);
    }
  };

  const triggerConfetti = () => {
    const particleCount = 100;
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        (Math.random() - 0.5) * 3,
        2 + Math.random(),
        (Math.random() - 0.5) * 3
      ]);
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      
      const material = new THREE.PointsMaterial({
        size: 0.08,
        color: new THREE.Color(Math.random(), Math.random(), Math.random()),
        transparent: true
      });
      
      const particle = new THREE.Points(geometry, material);
      particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        -Math.random() * 0.03,
        0
      );
      
      sceneRef.current.add(particle);
      confettiRef.current.push(particle);
    }
  };

  const animate = () => {
    requestAnimationFrame(animate);

    // Update fireworks
    fireworksRef.current.forEach(p => {
      const pos = p.geometry.attributes.position;
      pos.array[1] += p.velocity.y;
      pos.array[0] += p.velocity.x;
      pos.array[2] += p.velocity.z;
      p.velocity.y -= 0.02;
      pos.needsUpdate = true;
    });

    // Update confetti
    confettiRef.current.forEach(c => {
      const pos = c.geometry.attributes.position;
      pos.array[0] += c.velocity.x;
      pos.array[1] += c.velocity.y;
      pos.array[2] += c.velocity.z;
      if (pos.array[1] < 0) pos.array[1] = 3;
      pos.needsUpdate = true;
    });

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {showCountdown && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '120px',
          fontWeight: 'bold',
          color: '#fff',
          textShadow: '0 0 30px rgba(255,255,255,0.8)',
          fontFamily: 'Arial, sans-serif'
        }}>
          {countdown}
        </div>
      )}

      {showWish && (
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#ffd700',
          textAlign: 'center',
          textShadow: '0 0 20px rgba(255,215,0,0.8)',
          animation: 'fadeIn 2s ease-in',
          fontFamily: 'Georgia, serif'
        }}>
          Happy Birthday, My Love! 🎉
        </div>
      )}

      {showMusicBox && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.8)',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#fff', fontSize: '24px', marginBottom: '20px' }}>
            Play our song? 🎵
          </p>
          <button
            onClick={handlePlayMusic}
            style={{
              padding: '15px 40px',
              fontSize: '20px',
              background: 'linear-gradient(45deg, #ff69b4, #ff1493)',
              color: '#fff',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Play Music
          </button>
        </div>
      )}

      {showPhotos && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'scaleIn 1s ease-out'
        }}>
          <img
            src={photos[currentPhoto]}
            alt="Memory"
            style={{
              maxWidth: '500px',
              maxHeight: '400px',
              borderRadius: '20px',
              boxShadow: '0 0 40px rgba(255,255,255,0.5)',
              border: '5px solid #ffd700'
            }}
          />
        </div>
      )}

      {showVideo && (
        <video
          ref={videoRef}
          autoPlay
          onEnded={handleVideoEnd}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '80%',
            maxHeight: '80%',
            borderRadius: '20px',
            boxShadow: '0 0 40px rgba(255,255,255,0.5)'
          }}
        >
          <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
        </video>
      )}

      {showProposal && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.9)',
          padding: '50px',
          borderRadius: '30px',
          textAlign: 'center',
          border: '3px solid #ffd700'
        }}>
          <h1 style={{ color: '#ffd700', fontSize: '48px', marginBottom: '30px', fontFamily: 'Georgia, serif' }}>
            Will You Marry Me? 💍
          </h1>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              onClick={handleAcceptProposal}
              style={{
                padding: '20px 50px',
                fontSize: '24px',
                background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                color: '#fff',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Yes! 💕
            </button>
            <button
              style={{
                padding: '20px 50px',
                fontSize: '24px',
                background: '#ccc',
                color: '#666',
                border: 'none',
                borderRadius: '30px',
                cursor: 'not-allowed',
                fontWeight: 'bold'
              }}
            >
              No
            </button>
          </div>
        </div>
      )}

      {showFinal && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '56px',
          fontWeight: 'bold',
          color: '#ffd700',
          textAlign: 'center',
          textShadow: '0 0 30px rgba(255,215,0,0.8)',
          animation: 'scaleInElastic 2s ease-out',
          fontFamily: 'Georgia, serif',
          lineHeight: '1.5'
        }}>
          Forever Yours! 💕<br />
          <span style={{ fontSize: '36px' }}>I Love You ❤️</span>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: translate(-50%, -50%) scale(0); }
          to { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes scaleInElastic {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ProposalExperience;

