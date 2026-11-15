import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const DEPARTMENT_NODES = [
  { name: 'Computer Science', color: 0x3b82f6, radius: 1.4 },
  { name: 'Artificial Intelligence', color: 0x8b5cf6, radius: 1.3 },
  { name: 'Information Science', color: 0x06b6d4, radius: 1.2 },
  { name: 'Electronics & Comm', color: 0x10b981, radius: 1.2 },
  { name: 'Electrical & Electronics', color: 0xf59e0b, radius: 1.1 },
  { name: 'Mechanical Eng', color: 0xef4444, radius: 1.1 },
  { name: 'Civil Engineering', color: 0x14b8a6, radius: 1.0 },
  { name: 'Management (MBA)', color: 0xec4899, radius: 1.1 }
];

export const ConnectedCommunityCanvas = ({ className = '' }) => {
  const containerRef = useRef(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scene, camera, renderer, animationFrameId;
    let nodesGroup, particlesMesh, linesMesh;
    let isVisible = true;
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch (e) {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 520;

    // 1. Scene & Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 28;

    // 2. Renderer
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn('WebGL init failed, falling back:', err);
      setHasWebGL(false);
      return;
    }

    // 3. Central Node Network (Student Community)
    nodesGroup = new THREE.Group();
    scene.add(nodesGroup);

    const nodePositions = [];
    const nodeSpheres = [];

    // Main Department hubs placed on 3D spherical orbits
    DEPARTMENT_NODES.forEach((dept, i) => {
      const phi = Math.acos(-1 + (2 * i) / DEPARTMENT_NODES.length);
      const theta = Math.sqrt(DEPARTMENT_NODES.length * Math.PI) * phi;
      const radius = 10 + (i % 3) * 1.5;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      const pos = new THREE.Vector3(x, y, z);
      nodePositions.push(pos);

      // Node Geometry & Material
      const geo = new THREE.SphereGeometry(dept.radius * 0.7, 24, 24);
      const mat = new THREE.MeshBasicMaterial({
        color: dept.color,
        transparent: true,
        opacity: 0.88
      });
      const sphere = new THREE.Mesh(geo, mat);
      sphere.position.copy(pos);
      sphere.userData = { originalY: y, speed: 0.001 + Math.random() * 0.002, phase: Math.random() * Math.PI };
      nodesGroup.add(sphere);
      nodeSpheres.push(sphere);

      // Glowing Halo Ring around each main department node
      const ringGeo = new THREE.RingGeometry(dept.radius * 0.9, dept.radius * 1.15, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: dept.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.rotation.x = Math.PI / 2;
      nodesGroup.add(ring);
    });

    // Secondary Student Nodes (smaller connected particles)
    const extraNodeCount = 28;
    for (let j = 0; j < extraNodeCount; j++) {
      const radius = 7 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      const pos = new THREE.Vector3(x, y, z);
      nodePositions.push(pos);

      const geo = new THREE.SphereGeometry(0.35 + Math.random() * 0.25, 12, 12);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.65
      });
      const smallSphere = new THREE.Mesh(geo, mat);
      smallSphere.position.copy(pos);
      smallSphere.userData = { originalY: y, speed: 0.002, phase: Math.random() * Math.PI };
      nodesGroup.add(smallSphere);
      nodeSpheres.push(smallSphere);
    }

    // Dynamic Connection Lines between close nodes
    const lineIndices = [];
    const linePositions = [];
    const maxDistance = 9.5;

    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        const dist = nodePositions[i].distanceTo(nodePositions[j]);
        if (dist < maxDistance) {
          linePositions.push(nodePositions[i].x, nodePositions[i].y, nodePositions[i].z);
          linePositions.push(nodePositions[j].x, nodePositions[j].y, nodePositions[j].z);
        }
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending
    });
    linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    nodesGroup.add(linesMesh);

    // Ambient floating star/particle field
    const particleCount = 140;
    const particleGeometry = new THREE.BufferGeometry();
    const particleCoords = [];
    for (let p = 0; p < particleCount * 3; p += 3) {
      particleCoords.push((Math.random() - 0.5) * 60);
      particleCoords.push((Math.random() - 0.5) * 45);
      particleCoords.push((Math.random() - 0.5) * 40);
    }
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particleCoords, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xbfdbfe,
      size: 0.65,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    particlesMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlesMesh);

    // Mouse Interaction
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.45;
      targetY = y * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // IntersectionObserver to pause when off-screen
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow parallax
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      nodesGroup.rotation.y = elapsedTime * 0.08 + mouseX * 0.8;
      nodesGroup.rotation.x = Math.sin(elapsedTime * 0.05) * 0.15 + mouseY * 0.6;
      nodesGroup.rotation.z = Math.cos(elapsedTime * 0.04) * 0.08;

      particlesMesh.rotation.y = -elapsedTime * 0.02;

      // Subtle pulse on nodes
      nodeSpheres.forEach((sphere, idx) => {
        sphere.position.y = sphere.userData.originalY + Math.sin(elapsedTime * 2 + sphere.userData.phase) * 0.3;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, []);

  if (!hasWebGL) {
    return (
      <div className={`connected-community-fallback ${className}`}>
        <div className="css-particle-field" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`connected-community-canvas ${className}`}
      aria-hidden="true"
    />
  );
};

export default ConnectedCommunityCanvas;
