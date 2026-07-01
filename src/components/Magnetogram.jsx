import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useDashboard } from '../context/DashboardContext';

import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// ─── Custom Shaders ───────────────────────────────────────────────────────────
// We update the SunMaterial to look more like the magnetogram screenshot
const MagnetogramMaterial = shaderMaterial(
  { time: 0, colorPrimary: new THREE.Color('#777788'), colorSecondary: new THREE.Color('#d0d0d8') },
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
      
      // Base grainy noise for magnetogram
      float grain = snoise(p * 15.0 + time * 0.1) * 0.5 + 0.5;
      float f = fbm(p + time * 0.05);

      vec3 color = mix(colorPrimary, colorSecondary, grain * f);

      // Add Active Regions (ARs) - simulated with localized noise peaks
      float arNoise = fbm(p * 2.5 - time * 0.1);
      
      // Regions map
      if (arNoise > 0.65) {
         // High activity (Red/Yellow/Blue like the screenshot)
         float heat = smoothstep(0.65, 1.0, arNoise);
         if (heat > 0.7) {
             color = mix(color, vec3(1.0, 0.0, 0.0), (heat - 0.7) * 3.3); // Red center
         } else if (heat > 0.4) {
             color = mix(color, vec3(1.0, 0.8, 0.0), (heat - 0.4) * 3.3); // Yellow mid
         } else {
             color = mix(color, vec3(0.0, 0.5, 1.0), heat * 2.5); // Blue edges
         }
      }

      // Fresnel edge lighting
      float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
      fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
      fresnel = pow(fresnel, 3.0);
      color = mix(color, vec3(0.1, 0.1, 0.2), fresnel);

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ MagnetogramMaterial });

// ─── Active Region Marker Overlay ──────────────────────────────────────────────
function ActiveRegionMarker({ position, label, isHot }) {
  return (
    <Html position={position} center>
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{
          width: '110px',
          height: '110px',
          border: isHot ? '2px solid rgba(255, 255, 255, 0.9)' : '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: isHot ? '0 0 15px rgba(255, 255, 255, 0.6)' : 'none',
          marginBottom: '6px'
        }} />
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '18px',
          fontWeight: '700',
          color: 'white',
          textShadow: '0 0 6px black'
        }}>
          {label}
        </div>
      </div>
    </Html>
  );
}

// ─── Magnetogram Sphere ────────────────────────────────────────────────────────
function MagnetogramSphere({ alertLevel }) {
  const sunRef = useRef();
  const groupRef = useRef();
  
  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.time = state.clock.elapsedTime;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group position={[0, 0, 0]} ref={groupRef}>
      <mesh>
        <sphereGeometry args={[14, 128, 128]} />
        <magnetogramMaterial ref={sunRef} />
      </mesh>
      
      {/* Markers placed on the sphere surface */}
      <group>
        <ActiveRegionMarker position={[-4, 6, 12.5]} label="AR4087" isHot={true} />
        <ActiveRegionMarker position={[8, 1, 11]} label="AR4081" isHot={false} />
        <ActiveRegionMarker position={[-2, -6, 12.5]} label="AR4085" isHot={true} />
      </group>
    </group>
  );
}

// ─── Controls & Overlays ───────────────────────────────────────────────────────
function MagnetogramOverlay() {
  const [timeStr, setTimeStr] = useState('');
  
  useEffect(() => {
    const intv = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(intv);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{
          fontFamily: 'Orbitron, sans-serif',
          fontWeight: '700',
          fontSize: '14px',
          letterSpacing: '1px',
          color: 'white'
        }}>
          REAL-TIME MAGNETOGRAM <span style={{opacity: 0.5, marginLeft: '4px'}}>ⓘ</span>
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.7)'
        }}>
          {timeStr}
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>N90</div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>E90</div>
        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>W90</div>
      </div>
    </div>
  );
}

// ─── Exported Component ────────────────────────────────────────────────────────
export default function Magnetogram() {
  const { state } = useDashboard();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MagnetogramOverlay />
      <Canvas
        camera={{ position: [0, 0, 16], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <MagnetogramSphere alertLevel={state.alertLevel} />
      </Canvas>
    </div>
  );
}
