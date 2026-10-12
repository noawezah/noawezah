'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Material, Mesh, Object3D, Skeleton, SkinnedMesh, Texture, WebGLRenderer } from 'three';
import type { DeviceModelAsset } from '@/lib/device-models';

type ModelState = 'loading' | 'ready' | 'fallback';

/** Keeps the existing device preview visible until every model resource is ready. */
export function DeviceModel({
  asset,
  screenImage,
  label,
  fallback,
}: {
  asset: DeviceModelAsset;
  screenImage?: string | null;
  label: string;
  fallback: ReactNode;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ModelState>('loading');
  const { src, format, materials, resourcePath, screenName, screenFlipY } = asset;
  const capture = asset.screenImage ?? screenImage;
  const [rotateX = 0, rotateY = 0, rotateZ = 0] = asset.rotation ?? [];

  useEffect(() => {
    const node = host.current;
    if (!node) return;

    let cancelled = false;
    let started = false;
    let failed = false;
    let contextLost = false;
    let resourcesLoading = false;
    let modelReady = false;
    let renderer: WebGLRenderer | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let render = () => {};
    const requests = new AbortController();
    const ownedMaterials = new Set<Material>();
    const ownedTextures = new Set<Texture>();
    const ownedImages = new Set<ImageBitmap>();
    const ownedGeometries = new Set<Mesh['geometry']>();
    const ownedSkeletons = new Set<Skeleton>();
    const embeddedImageUrls = new Set<string>();
    setState('loading');

    const ownTexture = (texture: Texture) => {
      ownedTextures.add(texture);
      const image = texture.source.data;
      if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap && !ownedImages.has(image)) {
        ownedImages.add(image);
        if (cancelled) image.close();
      }
      if (cancelled) texture.dispose();
    };
    const ownMaterial = (material: Material) => {
      ownedMaterials.add(material);
      // The imported material types expose their texture slots as own properties.
      for (const value of Object.values(material)) {
        if (value && typeof value === 'object' && 'isTexture' in value && value.isTexture) {
          ownTexture(value as Texture);
        }
      }
      if (cancelled) material.dispose();
    };
    const ownObject = (object: Object3D) => {
      object.traverse(child => {
        const mesh = child as Mesh;
        if (!mesh.isMesh) return;
        ownedGeometries.add(mesh.geometry);
        if (cancelled) mesh.geometry.dispose();
        const skinnedMesh = mesh as SkinnedMesh;
        if (skinnedMesh.isSkinnedMesh) {
          ownedSkeletons.add(skinnedMesh.skeleton);
          if (cancelled) skinnedMesh.skeleton.dispose();
        }
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          ownMaterial(material);
        }
      });
    };
    const fail = () => {
      if (cancelled) return;
      failed = true;
      setState('fallback');
    };
    const loseContext = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      if (!cancelled) setState('fallback');
    };
    const restoreContext = () => {
      contextLost = false;
      render();
    };
    const fetchAsset = async (url: string) => {
      const response = await fetch(url, { signal: requests.signal });
      if (!response.ok) throw new Error(`Could not load device asset (${response.status}).`);
      return response;
    };
    const folderFor = (url: string) => new URL('.', new URL(url, window.location.href)).href;

    const start = async () => {
      if (started || cancelled) return;
      started = true;
      try {
        const THREE = await import('three');
        if (cancelled) return;

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        node.appendChild(renderer.domElement);
        renderer.domElement.addEventListener('webglcontextlost', loseContext);
        renderer.domElement.addEventListener('webglcontextrestored', restoreContext);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
        const group = new THREE.Group();
        const modelSize = new THREE.Vector3();
        scene.add(group);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x526075, 2.5));
        const keyLight = new THREE.DirectionalLight(0xffffff, 3);
        keyLight.position.set(2, 3, 4);
        scene.add(keyLight);
        const fillLight = new THREE.DirectionalLight(0xdce8ff, 1.5);
        fillLight.position.set(-3, 1, 2);
        scene.add(fillLight);

        render = () => {
          if (cancelled || failed || contextLost || !modelReady || resourcesLoading || !renderer) return;
          const width = node.clientWidth;
          const height = node.clientHeight;
          if (width <= 0 || height <= 0) return;
          const aspect = width / height;
          const viewHeight = Math.max(modelSize.y, modelSize.x / aspect) * 1.08;
          const viewWidth = viewHeight * aspect;
          camera.left = -viewWidth / 2;
          camera.right = viewWidth / 2;
          camera.top = viewHeight / 2;
          camera.bottom = -viewHeight / 2;
          camera.updateProjectionMatrix();
          try {
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.setSize(width, height, false);
            renderer.render(scene, camera);
            setState('ready');
          } catch {
            fail();
          }
        };

        const manager = new THREE.LoadingManager();
        manager.onStart = () => { resourcesLoading = true; };
        manager.setURLModifier(url => {
          if (url.startsWith('blob:')) embeddedImageUrls.add(url);
          return url;
        });
        manager.onLoad = () => { resourcesLoading = false; render(); };
        manager.onError = fail;

        let model: Object3D;
        if (format === 'obj') {
          const { OBJLoader } = await import('three/addons/loaders/OBJLoader.js');
          if (cancelled) return;
          const loader = new OBJLoader(manager);
          if (materials) {
            const { MTLLoader } = await import('three/addons/loaders/MTLLoader.js');
            if (cancelled) return;
            const response = await fetchAsset(materials);
            const materialText = await response.text();
            if (cancelled) return;
            const materialLoader = new MTLLoader(manager);
            if (resourcePath) materialLoader.setResourcePath(resourcePath);
            const materialLibrary = materialLoader.parse(materialText, folderFor(materials));
            materialLibrary.preload();
            Object.values(materialLibrary.materials).forEach(ownMaterial);
            loader.setMaterials(materialLibrary);
          }
          const response = await fetchAsset(src);
          const modelText = await response.text();
          if (cancelled) return;
          model = loader.parse(modelText);
        } else if (format === 'fbx') {
          const { FBXLoader } = await import('three/addons/loaders/FBXLoader.js');
          if (cancelled) return;
          const response = await fetchAsset(src);
          const modelData = await response.arrayBuffer();
          if (cancelled) return;
          const loader = new FBXLoader(manager);
          if (resourcePath) loader.setResourcePath(resourcePath);
          model = loader.parse(modelData, resourcePath ?? folderFor(src));
        } else {
          const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
            import('three/addons/loaders/GLTFLoader.js'),
            import('three/addons/libs/meshopt_decoder.module.js'),
          ]);
          if (cancelled) return;
          const response = await fetchAsset(src);
          const modelData = await response.arrayBuffer();
          if (cancelled) return;
          const loader = new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder);
          const gltf = await loader.parseAsync(modelData, resourcePath ?? folderFor(src));
          model = gltf.scene;
        }
        ownObject(model);
        if (cancelled || failed) return;

        if (screenName && capture) {
          const matches: Array<{ mesh: Mesh; materials: Material[] }> = [];
          model.traverse(child => {
            const mesh = child as Mesh;
            if (!mesh.isMesh) return;
            const meshMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            if (mesh.name === screenName || meshMaterials.some(material => material.name === screenName)) {
              matches.push({ mesh, materials: meshMaterials });
            }
          });
          if (matches.length === 0) throw new Error('The configured screen mesh or material was not found.');
          const screenTexture = await new THREE.TextureLoader(manager).loadAsync(capture);
          ownTexture(screenTexture);
          if (cancelled || failed) return;
          screenTexture.colorSpace = THREE.SRGBColorSpace;
          if (screenFlipY !== undefined) screenTexture.flipY = screenFlipY;
          for (const match of matches) {
            const replacements = match.materials.map(material => {
              if (match.mesh.name !== screenName && material.name !== screenName) return material;
              const replacement = new THREE.MeshBasicMaterial({
                name: material.name,
                map: screenTexture,
                side: material.side,
                toneMapped: false,
              });
              ownMaterial(replacement);
              return replacement;
            });
            match.mesh.material = Array.isArray(match.mesh.material) ? replacements : replacements[0];
          }
        }

        group.add(model);
        group.rotation.set(
          THREE.MathUtils.degToRad(rotateX),
          THREE.MathUtils.degToRad(rotateY),
          THREE.MathUtils.degToRad(rotateZ),
        );
        group.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(group);
        bounds.getSize(modelSize);
        const extent = Math.max(modelSize.x, modelSize.y, modelSize.z);
        if (!Number.isFinite(extent) || extent <= 0) throw new Error('The device model has no usable geometry.');
        group.scale.setScalar(1 / extent);
        group.updateMatrixWorld(true);
        bounds.setFromObject(group);
        group.position.sub(bounds.getCenter(new THREE.Vector3()));
        bounds.getSize(modelSize);
        modelSize.x = Math.max(modelSize.x, 0.0001);
        modelSize.y = Math.max(modelSize.y, 0.0001);
        camera.position.set(0, 0, modelSize.z + 2);
        camera.lookAt(0, 0, 0);
        modelReady = true;
        resizeObserver = new ResizeObserver(render);
        resizeObserver.observe(node);
        window.addEventListener('resize', render);
        render();
      } catch {
        fail();
      }
    };

    const visibility = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        visibility.disconnect();
        void start();
      }
    }, { rootMargin: '120px' });
    visibility.observe(node);

    return () => {
      cancelled = true;
      requests.abort();
      visibility.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', render);
      for (const geometry of ownedGeometries) geometry.dispose();
      for (const skeleton of ownedSkeletons) skeleton.dispose();
      for (const material of ownedMaterials) material.dispose();
      for (const texture of ownedTextures) texture.dispose();
      for (const image of ownedImages) image.close();
      for (const url of embeddedImageUrls) URL.revokeObjectURL(url);
      if (renderer) {
        renderer.domElement.removeEventListener('webglcontextlost', loseContext);
        renderer.domElement.removeEventListener('webglcontextrestored', restoreContext);
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      }
    };
  }, [src, format, materials, resourcePath, screenName, capture, screenFlipY, rotateX, rotateY, rotateZ]);

  return (
    <div className="device-model" data-model-state={state} role="img" aria-label={label}>
      <div className="device-model-fallback" aria-hidden="true">{fallback}</div>
      <div className="device-model-canvas" ref={host} aria-hidden="true" />
    </div>
  );
}
