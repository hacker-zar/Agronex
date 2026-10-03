import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type Particle = { x: number; y: number; z: number; phase: number; speed: number; size: number };

function Field({ count, reducedMotion, interactive }: { count: number; reducedMotion: boolean; interactive: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const pointer = useRef(new THREE.Vector2(10, 10));
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const baseColor = useMemo(() => new THREE.Color('#75926C'), []);
  const glowColor = useMemo(() => new THREE.Color('#E7FF9A'), []);
  const instanceColor = useMemo(() => new THREE.Color(), []);
  const { viewport, gl } = useThree();

  const particles = useMemo<Particle[]>(() => {
    let seed = 293;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    return Array.from({ length: count }, () => {
      // Uniform random placement fills the hero without visible rows or columns.
      const nx = random() * 2 - 1;
      // Reserve the top strip for the navigation; use the full remaining hero height.
      const ny = random() * 1.72 - 1;
      return {
        x: nx * viewport.width * 0.49,
        y: ny * viewport.height * 0.47,
        z: (random() - 0.5) * 1.4,
        phase: random() * Math.PI * 2,
        speed: 0.1 + random() * 0.16,
        size: 0.026 + random() * 0.035,
      };
    });
  }, [count, viewport.width, viewport.height]);

  useEffect(() => {
    if (!interactive) return;
    const element = gl.domElement;
    const updatePointer = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      pointer.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1),
      );
    };
    const leave = () => pointer.current.set(10, 10);
    window.addEventListener('pointermove', updatePointer, { passive: true });
    window.addEventListener('blur', leave);
    return () => {
      window.removeEventListener('pointermove', updatePointer);
      window.removeEventListener('blur', leave);
    };
  }, [gl, interactive]);

  useFrame(({ clock }) => {
    const instanced = mesh.current;
    if (!instanced) return;
    const time = reducedMotion ? 0 : clock.elapsedTime;
    const mouseX = pointer.current.x * viewport.width * 0.5;
    const mouseY = pointer.current.y * viewport.height * 0.5;
    const pushRadius = 1.5;
    const glowRadius = 3.6;

    particles.forEach((particle, i) => {
      const x0 = particle.x + Math.sin(time * particle.speed + particle.phase) * 0.065;
      const y0 = particle.y + Math.sin(time * particle.speed * 0.72 + particle.phase * 1.7) * 0.045;
      let x = x0;
      let y = y0;
      const dx = x - mouseX;
      const dy = y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const proximity = interactive && distance < glowRadius ? Math.pow(1 - distance / glowRadius, 1.35) : 0;
      if (interactive && !reducedMotion && distance < pushRadius && distance > 0.001) {
          const force = (1 - distance / pushRadius) * 0.28;
          x += (dx / distance) * force;
          y += (dy / distance) * force;
      }
      dummy.position.set(x, y, particle.z + Math.sin(time * 0.18 + particle.phase) * 0.025);
      const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 0.4 + particle.phase) * 0.06;
      dummy.scale.setScalar(particle.size * pulse * (1 + proximity * 1.7));
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
      instanceColor.copy(baseColor).lerp(glowColor, proximity);
      instanced.setColorAt(i, instanceColor);
    });
    instanced.instanceMatrix.needsUpdate = true;
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="white" transparent opacity={0.72} toneMapped={false} />
    </instancedMesh>
  );
}

/** Low contrast, decorative field backdrop for the Agronex landing hero. */
export function AgronexParticleField() {
  const [count, setCount] = useState(90);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCount(window.innerWidth < 800 ? 500 : 1050);
    const updateMotion = () => setReducedMotion(motion.matches);
    const updatePointer = () => setInteractive(pointer.matches);
    update();
    updateMotion();
    updatePointer();
    window.addEventListener('resize', update, { passive: true });
    motion.addEventListener('change', updateMotion);
    pointer.addEventListener('change', updatePointer);
    return () => {
      window.removeEventListener('resize', update);
      motion.removeEventListener('change', updateMotion);
      pointer.removeEventListener('change', updatePointer);
    };
  }, []);

  return (
    <div className="agronex-particle-field" aria-hidden="true">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 20], zoom: 52 }}
        dpr={[1, 1.35]}
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        style={{ width: '100%', height: '100%' }}
      >
        <Field count={count} reducedMotion={reducedMotion} interactive={interactive} />
      </Canvas>
    </div>
  );
}
