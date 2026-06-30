import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useDashboard } from '../context/DashboardContext';

// ─── Star Field ───────────────────────────────────────────────────────────────
function StarField({ count = 3000 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 200;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 200;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.01;
      ref.current.rotation.y = state.clock.elapsedTime * 0.005;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.25}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// ─── Custom Shaders ───────────────────────────────────────────────────────────
const SunMaterial = shaderMaterial(
  { time: 0, colorPrimary: new THREE.Color('#fff066'), colorSecondary: new THREE.Color('#f4a623') },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float time;
    uniform vec3 colorPrimary;
    uniform vec3 colorSecondary;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    // Simplex 3D Noise
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){ 
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
      vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
      i = mod(i, 289.0); 
      vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 1.0/7.0;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    float fbm(vec3 x) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100.0);
      for (int i = 0; i < 5; ++i) {
        v += a * snoise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec3 p = vPosition * 2.0;
      float q = fbm(p + time * 0.2);
      vec2 r = vec2(fbm(p + q + time * 0.3), fbm(p + q - time * 0.3));
      float f = fbm(p + vec3(r, time * 0.1));

      float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
      fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
      fresnel = pow(fresnel, 2.0);

      vec3 color = mix(colorPrimary, colorSecondary, f * 1.5);
      float spots = smoothstep(0.4, 0.9, fbm(p * 3.0 - time * 0.05));
      color = mix(color, vec3(0.2, 0.0, 0.0), spots * 0.6);
      color = mix(color, colorSecondary * 0.3, fresnel * 0.9);

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

const CoronaMaterial = shaderMaterial(
  { time: 0, glowColor: new THREE.Color('#f4a623') },
  // Vertex
  `
    varying vec3 vNormal;
    varying vec3 vPositionView;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vPositionView = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment
  `
    uniform vec3 glowColor;
    varying vec3 vNormal;
    varying vec3 vPositionView;
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vPositionView);
      float intensity = pow(0.65 - dot(normal, viewDir), 3.5);
      gl_FragColor = vec4(glowColor, intensity * 0.8);
    }
  `
);

extend({ SunMaterial, CoronaMaterial });

// ─── Realistic Sun Component ──────────────────────────────────────────────────
function RealisticSun({ alertLevel }) {
  const sunRef = useRef();
  const coronaRef = useRef();

  const colors = {
    GREEN:  { primary: '#fff066', secondary: '#f4a623', glow: '#f4a623' },
    YELLOW: { primary: '#fff066', secondary: '#e8721c', glow: '#e8721c' },
    ORANGE: { primary: '#ffe600', secondary: '#ff4d00', glow: '#ff4d00' },
    RED:    { primary: '#ffffff', secondary: '#b91c1c', glow: '#ef4444' },
  };
  const palette = colors[alertLevel] || colors.GREEN;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (sunRef.current) {
      sunRef.current.time = t;
      sunRef.current.colorPrimary.lerp(new THREE.Color(palette.primary), 0.05);
      sunRef.current.colorSecondary.lerp(new THREE.Color(palette.secondary), 0.05);
    }
    if (coronaRef.current) {
      coronaRef.current.glowColor.lerp(new THREE.Color(palette.glow), 0.05);
    }
  });

  return (
    <group position={[0, -8, -45]}>
      {/* Sun Body */}
      <mesh>
        <sphereGeometry args={[22, 128, 128]} />
        <sunMaterial ref={sunRef} />
      </mesh>

      {/* Atmospheric Corona */}
      <mesh>
        <sphereGeometry args={[27, 64, 64]} />
        <coronaMaterial ref={coronaRef} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─── Solar Prominences (Magnetic loops) ─────────────────────────────────────────
function SolarProminences({ active }) {
  const ref = useRef();
  
  const particleCount = 2000;
  const prominences = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const params = []; // Store theta, loopRadius, loopHeight, angle, speed
    
    // Create ~25 distinct magnetic loops
    const numLoops = 25;
    const loops = Array.from({ length: numLoops }, () => ({
      angle: Math.random() * Math.PI * 2,
      tilt: (Math.random() - 0.5) * Math.PI * 0.5,
      radius: 22.0 + Math.random() * 7.0,
      height: 5.0 + Math.random() * 16.0,
      speed: 0.005 + Math.random() * 0.015
    }));

    for (let i = 0; i < particleCount; i++) {
      const loop = loops[i % numLoops];
      const theta = Math.random() * Math.PI; // 0 to PI (half circle loop)
      params.push({ ...loop, theta: theta + Math.random() * 0.2 });
    }
    return { pos, params };
  }, [particleCount]);

  useFrame(() => {
    if (!ref.current || !active) return;
    const positions = ref.current.geometry.attributes.position.array;
    
    for (let i = 0; i < particleCount; i++) {
      const p = prominences.params[i];
      p.theta += p.speed;
      if (p.theta > Math.PI) {
        p.theta = 0; // Reset to start of loop
      }

      // Base circle parametric
      const distance = 22.0; // Surface of massive sun
      const r = p.radius * Math.sin(p.theta);
      const h = p.height * Math.sin(p.theta);

      // Local 2D arc
      let lx = distance + r;
      let ly = h;
      let lz = 0;

      // Apply tilt
      const ty = ly * Math.cos(p.tilt) - lz * Math.sin(p.tilt);
      const tz = ly * Math.sin(p.tilt) + lz * Math.cos(p.tilt);
      ly = ty;
      lz = tz;

      // Rotate around sun
      const gx = lx * Math.cos(p.angle) - lz * Math.sin(p.angle);
      const gz = lx * Math.sin(p.angle) + lz * Math.cos(p.angle);

      // Add to sun position (0, -8, -45)
      positions[i * 3]     = 0 + gx;
      positions[i * 3 + 1] = -8 + ly;
      positions[i * 3 + 2] = -45 + gz;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <Points ref={ref} positions={prominences.pos} stride={3}>
      <PointMaterial
        transparent
        color="#ff7b00"
        size={0.1}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.6}
      />
    </Points>
  );
}

// ─── Mouse parallax camera ─────────────────────────────────────────────────────
function ParallaxCamera() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(() => {
    target.current.x += (mouse.current.x * 1.5 - target.current.x) * 0.04;
    target.current.y += (mouse.current.y * 1.0 - target.current.y) * 0.04;
    
    // Parallax scrolling: move camera down as user scrolls down the page
    const scrollOffset = window.scrollY * 0.04;

    camera.position.x = target.current.x;
    camera.position.y = target.current.y - scrollOffset;
    
    // Look straight ahead so the scene translates smoothly upwards out of view
    camera.lookAt(target.current.x * 0.1, (target.current.y - scrollOffset) * 0.1, -100);
  });

  return null;
}

// ─── Scene ─────────────────────────────────────────────────────────────────────
function Scene({ alertLevel, xClassActive }) {
  return (
    <>
      <ParallaxCamera />
      <StarField count={8000} />
      <RealisticSun alertLevel={alertLevel} />
      <SolarProminences active={xClassActive || alertLevel === 'RED'} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, -20]} intensity={2} color="#f4a623" />
    </>
  );
}

// ─── Exported Canvas wrapper ───────────────────────────────────────────────────
export default function SpaceBackground() {
  const { state } = useDashboard();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 30], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene alertLevel={state.alertLevel} xClassActive={state.probability > 80} />
      </Canvas>
    </div>
  );
}
