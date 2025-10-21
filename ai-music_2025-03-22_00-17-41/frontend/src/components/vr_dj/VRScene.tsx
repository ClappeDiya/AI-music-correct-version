"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
} from "@react-three/drei";
import { useVRDJ } from "./VRDJProvider";
import { useVRDJStore, VRDJControl } from "@/services/vrDjService";
import { XR, Controllers, Hands, VRButton } from "@react-three/xr";

function Turntable({
  position,
  rotation,
  onControl,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  onControl: (value: number) => void;
}) {
  const { nodes, materials } = useGLTF("/models/turntable.glb");
  const turntableRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (turntableRef.current) {
      // Animate turntable rotation based on control value
      turntableRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={turntableRef}
        geometry={nodes.turntable.geometry}
        material={materials.turntable}
        onClick={() => onControl(Math.random())} // Temporary control for testing
      />
    </group>
  );
}

function Mixer({ position }: { position: [number, number, number] }) {
  const { nodes, materials } = useGLTF("/models/mixer.glb");

  return (
    <group position={position}>
      <mesh geometry={nodes.mixer.geometry} material={materials.mixer} />
    </group>
  );
}

function VRControls() {
  const { scene, camera } = useThree();

  useEffect(() => {
    // VR-specific camera setup
    camera.position.set(0, 1.6, 0);
  }, [camera]);

  return (
    <>
      <Controllers />
      <Hands />
    </>
  );
}

function Environment3D() {
  const environment = useVRDJStore((state) => state.environment);

  if (!environment) return null;

  return (
    <Environment
      preset={environment.lighting_preset === "ambient" ? "night" : "studio"}
    />
  );
}

export function VRScene() {
  const { isVRSupported, startVRSession } = useVRDJ();

  const handleControl = async (controlType: string, value: number) => {
    const control: Omit<VRDJControl, "id" | "timestamp"> = {
      session: useVRDJStore.getState().session?.id || "",
      control_type: controlType,
      value,
    };

    try {
      await vrDjService.sendControl(control);
    } catch (error) {
      console.error("Failed to send control:", error);
    }
  };

  return (
    <div className="w-full h-screen">
      <VRButton className="absolute top-4 right-4 z-10" />
      <Canvas>
        <XR>
          <PerspectiveCamera makeDefault position={[0, 1.6, 3]} />
          <OrbitControls enableDamping />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          <Turntable
            position={[-1, 1, 0]}
            rotation={[0, 0, 0]}
            onControl={(value) => handleControl("turntable_left", value)}
          />
          <Turntable
            position={[1, 1, 0]}
            rotation={[0, 0, 0]}
            onControl={(value) => handleControl("turntable_right", value)}
          />
          <Mixer position={[0, 1, 0]} />

          <Environment3D />
          <VRControls />
        </XR>
      </Canvas>
    </div>
  );
}
