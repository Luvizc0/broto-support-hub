import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

const BLOOM_SCENE = 1;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewPosition * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D baseTexture;
  uniform sampler2D bloomTexture;
  uniform float bloomStrength;
  varying vec2 vUv;
  void main() {
    gl_FragColor = (texture2D(baseTexture, vUv) + texture2D(bloomTexture, vUv) * bloomStrength);
  }
`;

export const BloomSpheres = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const bloomComposerRef = useRef<EffectComposer | null>(null);
  const finalComposerRef = useRef<EffectComposer | null>(null);
  const frameIdRef = useRef<number>(0);
  const spheresRef = useRef<THREE.Mesh[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const pointerRef = useRef<THREE.Vector2>(new THREE.Vector2());

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 200);
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 2, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xa855f7, 2, 50);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x22d3ee, 1.5, 50);
    pointLight3.position.set(0, 10, -10);
    scene.add(pointLight3);

    // Bloom Layer
    const bloomLayer = new THREE.Layers();
    bloomLayer.set(BLOOM_SCENE);

    // Bloom parameters (matching Three.js example)
    const params = {
      threshold: 0,
      strength: 1.5,
      radius: 0.75,
    };

    // Dark material for non-bloomed objects
    const darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
    const materials: { [key: string]: THREE.Material | THREE.Material[] } = {};

    // Create spheres
    const geometry = new THREE.IcosahedronGeometry(1, 15);
    const spheres: THREE.Mesh[] = [];

    // Colors: neon blue, purple, cyan
    const colors = [
      { h: 0.65, s: 0.8, l: 0.5 }, // Blue
      { h: 0.75, s: 0.7, l: 0.5 }, // Purple
      { h: 0.5, s: 0.9, l: 0.5 },  // Cyan
      { h: 0.85, s: 0.8, l: 0.4 }, // Magenta
      { h: 0.6, s: 0.9, l: 0.4 },  // Indigo
    ];

    for (let i = 0; i < 50; i++) {
      const colorChoice = colors[Math.floor(Math.random() * colors.length)];
      const color = new THREE.Color();
      color.setHSL(
        colorChoice.h + (Math.random() - 0.5) * 0.1,
        colorChoice.s,
        colorChoice.l + (Math.random() - 0.5) * 0.2
      );

      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: 0.8,
        emissive: color,
        emissiveIntensity: 0.3,
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.x = Math.random() * 10 - 5;
      sphere.position.y = Math.random() * 10 - 5;
      sphere.position.z = Math.random() * 10 - 5;
      sphere.position.normalize().multiplyScalar(Math.random() * 4.0 + 2.0);
      sphere.scale.setScalar(Math.random() * 0.8 + 0.3);
      
      // Store initial position for animation
      (sphere as any).initialPosition = sphere.position.clone();
      (sphere as any).animationOffset = Math.random() * Math.PI * 2;
      (sphere as any).animationSpeed = 0.3 + Math.random() * 0.4;

      scene.add(sphere);
      spheres.push(sphere);

      // Enable bloom on most spheres initially
      if (Math.random() < 0.7) {
        sphere.layers.enable(BLOOM_SCENE);
      }
    }
    spheresRef.current = spheres;

    // Render Pass
    const renderScene = new RenderPass(scene, camera);

    // Bloom Pass
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      params.strength,
      params.radius,
      params.threshold
    );

    // Bloom Composer
    const bloomRenderTarget = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.HalfFloatType,
    });
    const bloomComposer = new EffectComposer(renderer, bloomRenderTarget);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);
    bloomComposerRef.current = bloomComposer;

    // Mix Pass
    const mixPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture },
          bloomStrength: { value: params.strength },
        },
        vertexShader,
        fragmentShader,
        defines: {},
      }),
      "baseTexture"
    );
    mixPass.needsSwap = true;

    // Output Pass
    const outputPass = new OutputPass();

    // Final Composer
    const finalRenderTarget = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.HalfFloatType,
      samples: 4,
    });
    const finalComposer = new EffectComposer(renderer, finalRenderTarget);
    finalComposer.addPass(renderScene);
    finalComposer.addPass(mixPass);
    finalComposer.addPass(outputPass);
    finalComposerRef.current = finalComposer;

    // Darken non-bloomed objects
    const darkenNonBloomed = (obj: THREE.Object3D) => {
      if ((obj as THREE.Mesh).isMesh && bloomLayer.test(obj.layers) === false) {
        materials[obj.uuid] = (obj as THREE.Mesh).material;
        (obj as THREE.Mesh).material = darkMaterial;
      }
    };

    // Restore materials
    const restoreMaterial = (obj: THREE.Object3D) => {
      if (materials[obj.uuid]) {
        (obj as THREE.Mesh).material = materials[obj.uuid];
        delete materials[obj.uuid];
      }
    };

    // Render function
    const render = () => {
      scene.traverse(darkenNonBloomed);
      bloomComposer.render();
      scene.traverse(restoreMaterial);
      finalComposer.render();
    };

    // Animation loop
    let time = 0;
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Animate spheres
      spheres.forEach((sphere) => {
        const initial = (sphere as any).initialPosition;
        const offset = (sphere as any).animationOffset;
        const speed = (sphere as any).animationSpeed;

        sphere.position.x = initial.x + Math.sin(time * speed + offset) * 0.3;
        sphere.position.y = initial.y + Math.cos(time * speed + offset * 1.3) * 0.3;
        sphere.position.z = initial.z + Math.sin(time * speed * 0.7 + offset) * 0.2;

        sphere.rotation.x += 0.002;
        sphere.rotation.y += 0.003;
      });

      // Camera movement based on mouse/touch position
      const targetX = mouseRef.current.x * 3;
      const targetY = mouseRef.current.y * 3;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      render();
    };

    animate();

    // Update pointer position for raycasting
    const updatePointer = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    // Handle click/tap to toggle bloom
    const handleInteraction = (clientX: number, clientY: number) => {
      updatePointer(clientX, clientY);
      
      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(spheres, false);

      if (intersects.length > 0) {
        const object = intersects[0].object as THREE.Mesh;
        
        // Toggle bloom layer
        if (bloomLayer.test(object.layers)) {
          object.layers.disable(BLOOM_SCENE);
        } else {
          object.layers.enable(BLOOM_SCENE);
        }
      }
    };

    // Mouse move handler
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    // Touch move handler
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const rect = container.getBoundingClientRect();
        mouseRef.current.x = ((touch.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseRef.current.y = -((touch.clientY - rect.top) / rect.height - 0.5) * 2;
      }
    };

    // Click handler
    const handleClick = (event: MouseEvent) => {
      handleInteraction(event.clientX, event.clientY);
    };

    // Touch end handler (for tap)
    const handleTouchEnd = (event: TouchEvent) => {
      if (event.changedTouches.length > 0) {
        const touch = event.changedTouches[0];
        handleInteraction(touch.clientX, touch.clientY);
      }
    };

    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("click", handleClick);
    container.addEventListener("touchend", handleTouchEnd);

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      bloomComposer.setSize(w, h);
      finalComposer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("click", handleClick);
      container.removeEventListener("touchend", handleTouchEnd);
      cancelAnimationFrame(frameIdRef.current);
      
      spheres.forEach((sphere) => {
        sphere.geometry.dispose();
        if (Array.isArray(sphere.material)) {
          sphere.material.forEach((m) => m.dispose());
        } else {
          sphere.material.dispose();
        }
      });
      
      renderer.dispose();
      bloomComposer.dispose();
      finalComposer.dispose();
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-pointer"
      style={{ zIndex: 0, touchAction: "none" }}
    />
  );
};