"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Cube } from "lucide-react";
import type { VrArSetting } from "@/types/virtual_studio";

interface VrArVisualizationProps {
  settings: VrArSetting;
  width?: number;
  height?: number;
}

export function VrArVisualization({
  settings,
  width = 800,
  height = 600,
}: VrArVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // Create room based on settings
    const roomSize = (settings.config?.room_size || 50) / 10;
    const roomGeometry = new THREE.BoxGeometry(
      roomSize,
      roomSize * 0.7,
      roomSize,
    );
    const roomMaterial = new THREE.MeshPhongMaterial({
      color: 0x808080,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.3,
    });
    const room = new THREE.Mesh(roomGeometry, roomMaterial);
    scene.add(room);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(roomSize, 10);
    scene.add(gridHelper);

    // Add environment-specific elements
    if (settings.config?.environment === "studio") {
      addStudioElements(scene, roomSize);
    } else if (settings.config?.environment === "concert_hall") {
      addConcertHallElements(scene, roomSize);
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, [settings, width, height]);

  // Helper function to add studio-specific elements
  const addStudioElements = (scene: THREE.Scene, roomSize: number) => {
    // Add mixing console
    const consoleGeometry = new THREE.BoxGeometry(
      roomSize * 0.4,
      roomSize * 0.1,
      roomSize * 0.2,
    );
    const consoleMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
    const console = new THREE.Mesh(consoleGeometry, consoleMaterial);
    console.position.set(0, -roomSize * 0.3, 0);
    scene.add(console);

    // Add monitors
    const monitorGeometry = new THREE.BoxGeometry(
      roomSize * 0.1,
      roomSize * 0.15,
      roomSize * 0.1,
    );
    const monitorMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });

    const leftMonitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
    leftMonitor.position.set(-roomSize * 0.2, -roomSize * 0.1, -roomSize * 0.2);
    scene.add(leftMonitor);

    const rightMonitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
    rightMonitor.position.set(roomSize * 0.2, -roomSize * 0.1, -roomSize * 0.2);
    scene.add(rightMonitor);
  };

  // Helper function to add concert hall-specific elements
  const addConcertHallElements = (scene: THREE.Scene, roomSize: number) => {
    // Add stage
    const stageGeometry = new THREE.BoxGeometry(
      roomSize * 0.8,
      roomSize * 0.1,
      roomSize * 0.4,
    );
    const stageMaterial = new THREE.MeshPhongMaterial({ color: 0x4a3520 });
    const stage = new THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.set(0, -roomSize * 0.3, -roomSize * 0.2);
    scene.add(stage);

    // Add speakers
    const speakerGeometry = new THREE.BoxGeometry(
      roomSize * 0.1,
      roomSize * 0.2,
      roomSize * 0.1,
    );
    const speakerMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });

    const leftSpeaker = new THREE.Mesh(speakerGeometry, speakerMaterial);
    leftSpeaker.position.set(-roomSize * 0.3, -roomSize * 0.1, -roomSize * 0.3);
    scene.add(leftSpeaker);

    const rightSpeaker = new THREE.Mesh(speakerGeometry, speakerMaterial);
    rightSpeaker.position.set(roomSize * 0.3, -roomSize * 0.1, -roomSize * 0.3);
    scene.add(rightSpeaker);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cube className="h-5 w-5" />
          VR/AR Environment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="relative rounded-lg overflow-hidden"
          style={{
            width,
            height,
            background: "rgb(26, 26, 26)",
          }}
        />
      </CardContent>
    </Card>
  );
}
