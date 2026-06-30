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

// ─── Sun Corona ───────────────────────────────────────────────────────────────
function SolarCorona({ alertLevel }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const outerRef = useRef();

  const colors = {
    GREEN:  { core: '#fff7b0', mid: '#f4a623', outer: '#22c55e', glow: '#22c55e' },
    YELLOW: { core: '#fff7b0', mid: '#f4a623', outer: '#eab308', glow: '#eab308' },
    ORANGE: { core: '#ffffff', mid: '#f4a623', outer: '#f4a623', glow: '#f4a623' },
    RED:    { core: '#ffffff', mid: '#ef4444', outer: '#ef4444', glow: '#ef4444' },
  };
  const palette = colors[alertLevel] || colors.GREEN;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.z = t * 0.08;
      const pulse = 1 + Math.sin(t * 1.5) * 0.03;
      meshRef.current.scale.setScalar(pulse);
    }
    if (glowRef.current) {
      glowRef.current.rotation.z = -t * 0.05;
      const pulse2 = 1 + Math.sin(t * 0.8 + 1) * 0.06;
      glowRef.current.scale.setScalar(pulse2);
    }
    if (outerRef.current) {
      outerRef.current.rotation.z = t * 0.03;
      const pulse3 = 1 + Math.sin(t * 0.5 + 2) * 0.1;
      outerRef.current.scale.setScalar(pulse3);
    }
  });

  return (
    <group position={[8, 4, -25]}>
      {/* Outer halo */}
      <mesh ref={outerRef}>
        <ringGeometry args={[3.8, 6.5, 64]} />
        <meshBasicMaterial
          color={palette.glow}
          transparent
          opacity={0.04}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Mid corona ring */}
      <mesh ref={glowRef}>
        <ringGeometry args={[2.2, 4.2, 64]} />
        <meshBasicMaterial
          color={palette.outer}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner corona */}
      <mesh>
        <ringGeometry args={[1.5, 2.5, 64]} />
        <meshBasicMaterial
          color={palette.mid}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Sun body */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshBasicMaterial color={palette.core} />
      </mesh>

      {/* Solar flare arcs */}
      {[0, 60, 120, 200, 280, 340].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = Math.cos(rad) * 1.8;
        const y = Math.sin(rad) * 1.8;
        return (
          <mesh key={i} position={[x, y, 0]} rotation={[0, 0, rad]}>
            <torusGeometry args={[0.4, 0.05, 8, 20, Math.PI * 0.7]} />
            <meshBasicMaterial color={palette.mid} transparent opacity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Floating particles (active during flare) ─────────────────────────────────
function FlareParticles({ active }) {
  const ref = useRef();
  const particles = useMemo(() => {
    const count = 80;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 0.5 + Math.random() * 0.5;
      positions[i * 3]     = 8 + r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = 4 + r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = -25 + r * Math.cos(phi);
      velocities.push({
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        vz: (Math.random() - 0.5) * 0.01,
      });
    }
    return { positions, velocities };
  }, []);

  useFrame(() => {
    if (!ref.current || !active) return;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < 80; i++) {
      pos[i * 3]     += particles.velocities[i].vx;
      pos[i * 3 + 1] += particles.velocities[i].vy;
      pos[i * 3 + 2] += particles.velocities[i].vz;
      // Reset if too far
      const dx = pos[i * 3] - 8;
      const dy = pos[i * 3 + 1] - 4;
      if (Math.sqrt(dx * dx + dy * dy) > 8) {
        pos[i * 3] = 8;
        pos[i * 3 + 1] = 4;
        pos[i * 3 + 2] = -25;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <Points ref={ref} positions={particles.positions} stride={3}>
      <PointMaterial
        transparent
        color="#ef4444"
        size={0.15}
        sizeAttenuation
        depthWrite={false}
        opacity={0.8}
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
    camera.position.x = target.current.x;
    camera.position.y = target.current.y;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── Scene ─────────────────────────────────────────────────────────────────────
function Scene({ alertLevel, xClassActive }) {
  return (
    <>
      <ParallaxCamera />
      <StarField count={4000} />
      <SolarCorona alertLevel={alertLevel} />
      <FlareParticles active={xClassActive || alertLevel === 'RED'} />
      <ambientLight intensity={0.3} />
      <pointLight position={[8, 4, -20]} intensity={2} color="#f4a623" />
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
