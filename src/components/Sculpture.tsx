import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Group, Mesh, PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

function SculptureObject({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);
  const knot = useRef<Mesh>(null);
  const { gl, scene } = useThree();
  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = generator.fromScene(room, 0.04);
    scene.environment = env.texture;
    return () => {
      scene.environment = null;
      env.dispose();
      room.dispose();
      generator.dispose();
    };
  }, [gl, scene]);
  useFrame(({ clock, pointer }, delta) => {
    if (!group.current || !knot.current || reduced) return;
    const time = clock.getElapsedTime();
    group.current.rotation.y +=
      (pointer.x * 0.18 - group.current.rotation.y) * Math.min(delta * 2, 1);
    group.current.rotation.x +=
      (-pointer.y * 0.12 - group.current.rotation.x) * Math.min(delta * 2, 1);
    group.current.position.y = Math.sin(time * 0.65) * 0.085;
    knot.current.rotation.y += delta * 0.11;
    knot.current.rotation.z += delta * 0.055;
  });
  return (
    <group ref={group} rotation={[0.08, -0.1, 0]}>
      <mesh ref={knot} rotation={[0.3, 0.2, -0.2]}>
        <torusKnotGeometry args={[1.02, 0.27, 180, 24, 2, 3]} />
        <meshPhysicalMaterial
          color="#dbc18a"
          metalness={1}
          roughness={0.23}
          clearcoat={1}
          clearcoatRoughness={0.2}
        />
      </mesh>
      <mesh rotation={[1.12, 0.3, 0.2]}>
        <torusGeometry args={[2.12, 0.012, 8, 160]} />
        <meshStandardMaterial color="#a89166" metalness={0.8} roughness={0.32} />
      </mesh>
      <mesh rotation={[0.7, -0.6, -0.65]}>
        <torusGeometry args={[1.87, 0.007, 8, 140]} />
        <meshStandardMaterial color="#c4b28c" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[1.65, 1.15, 0.4]}>
        <sphereGeometry args={[0.085, 20, 20]} />
        <meshStandardMaterial color="#ff4d9a" emissive="#ff1979" emissiveIntensity={1.3} />
      </mesh>
      <mesh position={[-1.9, -0.4, 0.5]}>
        <sphereGeometry args={[0.062, 20, 20]} />
        <meshStandardMaterial color="#eddbb0" emissive="#eddbb0" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.3, -1.85, 0.7]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#d9c99e" emissive="#d9c99e" emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

export default function Sculpture({
  reduced = false,
  active = true,
}: {
  reduced?: boolean;
  active?: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 37 }}
      dpr={[1, 1.5]}
      frameloop={reduced || !active ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 5, 3]} intensity={3} color="#fff1d4" />
      <pointLight position={[-3, -1, 2]} intensity={8} color="#fd1b82" />
      <SculptureObject reduced={reduced} />
    </Canvas>
  );
}
