/* eslint-disable react/no-unknown-property */
/**
 * React Bits FluidGlass — `bar` mode for the AppChrome header strip.
 * Full-page FluidGlass assumes a tall viewport; here the bar is pinned to the
 * bottom of a wide, short canvas so it reads as a nav glass rail (not a center slab).
 */
import * as THREE from 'three';
import { memo, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas, createPortal, useFrame, useThree, type ThreeElements } from '@react-three/fiber';
import { MeshTransmissionMaterial, useFBO, useGLTF } from '@react-three/drei';
import { easing } from 'maath';
import type { FluidGlassBarProps } from '../chrome/fluidGlassDefaults';

const GLB = '/assets/3d/bar.glb';
const GEOMETRY_KEY = 'Cube';
const PAGE_BG = '#f6f2ea';

useGLTF.preload(GLB);

type MeshProps = ThreeElements['mesh'];

interface ModeWrapperProps extends MeshProps {
  children?: ReactNode;
  modeProps?: FluidGlassBarProps;
}

/** Header-sized bar: bottom rail only, no fullscreen buffer quad overlay. */
const HeaderBarGlass = memo(function HeaderBarGlass({
  children,
  modeProps = {},
  ...props
}: ModeWrapperProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const { nodes } = useGLTF(GLB);
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState(() => new THREE.Scene());
  const geoWidthRef = useRef(1);

  useEffect(() => {
    const geo = (nodes[GEOMETRY_KEY] as THREE.Mesh)?.geometry;
    if (!geo) return;
    geo.computeBoundingBox();
    geoWidthRef.current = geo.boundingBox!.max.x - geo.boundingBox!.min.x || 1;
  }, [nodes]);

  const {
    scale: scaleProp,
    ior = 1.15,
    thickness = 10,
    anisotropy = 0.01,
    chromaticAberration = 0.1,
    transmission = 1,
    roughness = 0,
    color = '#ffffff',
    attenuationColor = '#ffffff',
    attenuationDistance = 0.25,
    anisotropicBlur,
    ...rest
  } = modeProps;

  useFrame((state, delta) => {
    const { gl, viewport, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    // Pin glass bar to the bottom edge of the header strip (react-bits `lockToBottom`).
    const destY = -v.height / 2 + 0.14;
    easing.damp3(ref.current.position, [0, destY, 15], 0.15, delta);

    const maxWorld = v.width * 0.98;
    const desired = maxWorld / geoWidthRef.current;
    const autoS = Math.min(0.11, desired);
    const s = scaleProp ?? autoS;
    ref.current.scale.set(s, s, s);

    gl.setRenderTarget(buffer);
    gl.setClearColor(0x000000, 0);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.setClearColor(0x000000, 0);
  });

  return (
    <>
      {createPortal(children, scene)}
      {/* Only the refractive bar — no fullscreen buffer plane (that caused the gray center block). */}
      <mesh
        ref={ref}
        scale={scaleProp ?? 0.11}
        rotation-x={Math.PI / 2}
        geometry={(nodes[GEOMETRY_KEY] as THREE.Mesh)?.geometry}
        {...props}
      >
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior}
          thickness={thickness}
          anisotropy={anisotropy}
          chromaticAberration={chromaticAberration}
          transmission={transmission}
          roughness={roughness}
          color={color}
          attenuationColor={attenuationColor}
          attenuationDistance={attenuationDistance}
          anisotropicBlur={anisotropicBlur ?? anisotropy}
          {...rest}
        />
      </mesh>
    </>
  );
});

function BarScene({ modeProps }: { modeProps: FluidGlassBarProps }) {
  return (
    <HeaderBarGlass modeProps={modeProps}>
      <mesh position={[0, 0, -8]}>
        <planeGeometry args={[32, 32]} />
        <meshBasicMaterial color={PAGE_BG} />
      </mesh>
    </HeaderBarGlass>
  );
}

export interface FluidGlassBarCanvasProps {
  barProps?: FluidGlassBarProps;
  className?: string;
}

export default function FluidGlassBarCanvas({ barProps = {}, className = '' }: FluidGlassBarCanvasProps) {
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1;

  return (
    <div
      className={`fluid-glass-bar-canvas pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit] ${className}`}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 20], fov: 15 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={dpr}
        frameloop="always"
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <BarScene modeProps={barProps} />
      </Canvas>
    </div>
  );
}
