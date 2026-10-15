'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Color, Material, Mesh, Object3D, Skeleton, SkinnedMesh, Texture, WebGLRenderer } from 'three';
import type { DeviceModelAsset } from '@/lib/device-models';

type ModelState = 'loading' | 'ready' | 'fallback';

/** Keeps the existing device preview visible until every model resource is ready. */
export function DeviceModel({
  asset,
  screenImage,
  screenFrame,
  modelFrame,
  label,
  fallback,
}: {
  asset: DeviceModelAsset;
  screenImage?: string | null;
  /** Display height and top edge as fractions of the model canvas. */
  screenFrame?: { height: number; top: number };
  /** Overall device height and bottom edge as fractions of the model canvas. */
  modelFrame?: { height: number; bottom: number };
  label: string;
  fallback: ReactNode;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ModelState>('loading');
  const { src, format, materials, resourcePath, screenName, screenFlipY, screenAspect, screenBackground } = asset;
  const [insetTop = 0, insetRight = 0, insetBottom = 0, insetLeft = 0] = asset.screenInsets ?? [];
  const capture = asset.screenImage ?? screenImage;
  const frameHeight = screenFrame?.height;
  const frameTop = screenFrame?.top ?? 0;
  const modelFrameHeight = modelFrame?.height;
  const modelFrameBottom = modelFrame?.bottom ?? 1;
  const [rotateX = 0, rotateY = 0, rotateZ = 0] = asset.rotation ?? [];
  const {
    ambient = 0.8,
    key = 1.5,
    fill = 0.25,
    keyColor = '#fff3de',
    fillColor = '#c3c0dd',
    bodyTint,
    exposure = 0.75,
  } = asset.lighting ?? {};
  const [keyX = -3, keyY = 5, keyZ = 4] = asset.lighting?.keyPosition ?? [];

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
    delete node.dataset.screenHeight;
    delete node.dataset.screenTop;
    delete node.dataset.screenFitClamped;
    delete node.dataset.modelClipped;
    delete node.dataset.modelLeft;
    delete node.dataset.modelRight;
    delete node.dataset.modelTop;
    delete node.dataset.modelBottom;
    delete node.dataset.modelHeight;
    delete node.dataset.modelFitClamped;
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
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = exposure;
        node.appendChild(renderer.domElement);
        renderer.domElement.addEventListener('webglcontextlost', loseContext);
        renderer.domElement.addEventListener('webglcontextrestored', restoreContext);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 10);
        const group = new THREE.Group();
        const modelSize = new THREE.Vector3();
        const modelPoints: number[] = [];
        const modelBoundsPoints: number[] = [];
        const screenPoints: number[] = [];
        scene.add(group);
        scene.add(new THREE.HemisphereLight(0xded9d3, 0x282633, ambient));
        const keyLight = new THREE.DirectionalLight(keyColor, key);
        keyLight.position.set(keyX, keyY, keyZ);
        scene.add(keyLight);
        const fillLight = new THREE.DirectionalLight(fillColor, fill);
        fillLight.position.set(3, 1, 2);
        scene.add(fillLight);

        render = () => {
          if (cancelled || failed || contextLost || !modelReady || resourcesLoading || !renderer) return;
          const width = node.clientWidth;
          const height = node.clientHeight;
          if (width <= 0 || height <= 0) return;
          const aspect = width / height;
          const verticalTangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
          const styles = window.getComputedStyle(node);
          const cssFrameHeight = Number.parseFloat(styles.getPropertyValue('--device-screen-fraction'));
          const cssFrameTop = Number.parseFloat(styles.getPropertyValue('--device-screen-top'));
          const targetHeight = Number.isFinite(cssFrameHeight) ? cssFrameHeight : frameHeight;
          const targetTop = Number.isFinite(cssFrameTop) ? cssFrameTop : frameTop;
          const cssModelHeight = Number.parseFloat(styles.getPropertyValue('--device-model-fraction'));
          const cssModelBottom = Number.parseFloat(styles.getPropertyValue('--device-model-bottom'));
          const targetModelHeight = Number.isFinite(cssModelHeight) ? cssModelHeight : modelFrameHeight;
          const targetModelBottom = Number.isFinite(cssModelBottom) ? cssModelBottom : modelFrameBottom;
          const projectBounds = (points: number[], distance: number, offset = 0, margin?: number) => {
            let left = Infinity;
            let right = -Infinity;
            let top = Infinity;
            let bottom = -Infinity;
            let topSlope = 0;
            let bottomSlope = 0;
            for (let i = 0; i < points.length; i += 3) {
              const depth = distance - points[i + 2];
              if (depth <= camera.near) return { left: -Infinity, right: Infinity, top: -Infinity, bottom: Infinity, heightSlope: 0 };
              const x = (1 + points[i] / (depth * verticalTangent * aspect)) / 2;
              const y = (1 - points[i + 1] / (depth * verticalTangent)) / 2 - offset;
              if (margin !== undefined && (x < margin || x > 1 - margin || y < margin || y > 1 - margin)) {
                return { left: -Infinity, right: Infinity, top: -Infinity, bottom: Infinity, heightSlope: 0 };
              }
              left = Math.min(left, x);
              right = Math.max(right, x);
              if (y < top) {
                top = y;
                topSlope = points[i + 1] / (2 * verticalTangent * depth * depth);
              }
              if (y > bottom) {
                bottom = y;
                bottomSlope = points[i + 1] / (2 * verticalTangent * depth * depth);
              }
            }
            return { left, right, top, bottom, heightSlope: bottomSlope - topSlope };
          };
          const fittedBodyBounds = new Map<number, ReturnType<typeof projectBounds>>();
          // Fit the nearest corners of the rotated bounds with a small margin.
          // Including depth keeps the keyboard and phone corners inside the frame.
          let distance = modelSize.z / 2 + Math.max(
            modelSize.y / (2 * verticalTangent),
            modelSize.x / (2 * verticalTangent * aspect),
          ) * 1.08;
          let screenOffset = 0;
          let clamped = false;
          let usesModelFrame = false;
          if (targetModelHeight !== undefined && Number.isFinite(targetModelHeight) && targetModelHeight > 0 && targetModelHeight < 1 &&
            Number.isFinite(targetModelBottom) && targetModelBottom > 0.02 && targetModelBottom < 0.98) {
            usesModelFrame = true;
            const minimumDistance = modelSize.z / 2 + camera.near * 2;
            let nearDistance = minimumDistance;
            let farDistance = Math.max(distance, minimumDistance * 2);
            const coarseHeightAt = (at: number) => {
              const projected = projectBounds(modelBoundsPoints, at);
              return projected.bottom - projected.top;
            };
            while (coarseHeightAt(farDistance) > targetModelHeight) farDistance *= 2;
            for (let i = 0; i < 28; i++) {
              const middle = (nearDistance + farDistance) / 2;
              if (coarseHeightAt(middle) > targetModelHeight) nearDistance = middle;
              else farDistance = middle;
            }
            distance = farDistance;
            let actual = projectBounds(modelPoints, distance);
            // Correct the conservative box fit using exact silhouette extrema and
            // their distance derivative, without scanning every vertex 28 times.
            for (let i = 0; i < 5; i++) {
              const error = actual.bottom - actual.top - targetModelHeight;
              if (Math.abs(error * height) < 0.025 || actual.heightSlope >= 0) break;
              const nextDistance = Math.max(minimumDistance, distance - error / actual.heightSlope);
              if (!Number.isFinite(nextDistance) || nextDistance === distance) break;
              distance = nextDistance;
              actual = projectBounds(modelPoints, distance);
            }
            screenOffset = actual.bottom - targetModelBottom;
            if (actual.left < 0.02 || actual.right > 0.98 || actual.top - screenOffset < 0.02) {
              clamped = true;
              const insideModelMarginAt = (at: number) => {
                const projected = projectBounds(modelBoundsPoints, at);
                return projected.left >= 0.02 && projected.right <= 0.98 &&
                  targetModelBottom - (projected.bottom - projected.top) >= 0.02;
              };
              nearDistance = distance;
              farDistance = distance * 2;
              for (let i = 0; i < 20 && !insideModelMarginAt(farDistance); i++) farDistance *= 2;
              for (let i = 0; i < 24; i++) {
                const middle = (nearDistance + farDistance) / 2;
                if (insideModelMarginAt(middle)) farDistance = middle;
                else nearDistance = middle;
              }
              distance = farDistance;
              actual = projectBounds(modelPoints, distance);
              screenOffset = actual.bottom - targetModelBottom;
            }
            fittedBodyBounds.set(distance, { ...actual, top: actual.top - screenOffset, bottom: actual.bottom - screenOffset });
          } else if (modelFrameHeight === undefined && !Number.isFinite(cssModelHeight) && screenPoints.length &&
            targetHeight !== undefined && Number.isFinite(targetHeight) &&
            targetHeight > 0 && targetHeight < 1 && Number.isFinite(targetTop) && targetTop > 0.02 && targetTop < 0.98) {
            let nearDistance = modelSize.z / 2 + camera.near * 2;
            let farDistance = Math.max(distance, nearDistance * 2);
            const screenHeightAt = (at: number) => {
              const projected = projectBounds(screenPoints, at);
              return projected.bottom - projected.top;
            };
            while (screenHeightAt(farDistance) > targetHeight) farDistance *= 2;
            for (let i = 0; i < 28; i++) {
              const middle = (nearDistance + farDistance) / 2;
              if (screenHeightAt(middle) > targetHeight) nearDistance = middle;
              else farDistance = middle;
            }
            distance = farDistance;
            const insideMarginAt = (at: number) => {
              if (fittedBodyBounds.has(at)) return true;
              const screen = projectBounds(screenPoints, at);
              // Stop on the first clipped vertex; retain complete bounds only for valid fits.
              const bounds = projectBounds(modelPoints, at, screen.top - targetTop, 0.02);
              const fits = bounds.left >= 0.02 && bounds.right <= 0.98 && bounds.top >= 0.02 && bounds.bottom <= 0.98;
              if (fits) fittedBodyBounds.set(at, bounds);
              return fits;
            };
            if (!insideMarginAt(distance)) {
              // Keep the complete keyboard and chassis visible if a canvas is too narrow.
              clamped = true;
              nearDistance = distance;
              farDistance = distance * 2;
              for (let i = 0; i < 20 && !insideMarginAt(farDistance); i++) farDistance *= 2;
              for (let i = 0; i < 24; i++) {
                const middle = (nearDistance + farDistance) / 2;
                if (insideMarginAt(middle)) farDistance = middle;
                else nearDistance = middle;
              }
              distance = farDistance;
            }
            screenOffset = projectBounds(screenPoints, distance).top - targetTop;
          }
          camera.aspect = aspect;
          camera.clearViewOffset();
          camera.position.set(0, 0, distance);
          camera.far = Math.max(10, distance + modelSize.z + 1);
          camera.updateProjectionMatrix();
          // A lens shift changes placement without pitching the camera or device.
          if (screenOffset) camera.setViewOffset(width, height, 0, screenOffset * height, width, height);
          if (screenPoints.length) {
            const screen = projectBounds(screenPoints, distance, screenOffset);
            node.dataset.screenHeight = ((screen.bottom - screen.top) * height).toFixed(3);
            node.dataset.screenTop = (screen.top * height).toFixed(3);
          }
          const visibleBounds = fittedBodyBounds.get(distance) ?? projectBounds(modelPoints, distance, screenOffset);
          node.dataset.modelLeft = (visibleBounds.left * width).toFixed(3);
          node.dataset.modelRight = (visibleBounds.right * width).toFixed(3);
          node.dataset.modelTop = (visibleBounds.top * height).toFixed(3);
          node.dataset.modelBottom = (visibleBounds.bottom * height).toFixed(3);
          node.dataset.modelHeight = ((visibleBounds.bottom - visibleBounds.top) * height).toFixed(3);
          node.dataset.modelClipped = String(visibleBounds.left < 0 || visibleBounds.right > 1 ||
            visibleBounds.top < 0 || visibleBounds.bottom > 1);
          node.dataset.screenFitClamped = String(clamped);
          node.dataset.modelFitClamped = String(usesModelFrame && clamped);
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

        if (bodyTint) {
          const tint = new THREE.Color(bodyTint);
          const softTint = new THREE.Color(1, 1, 1).lerp(tint, 0.35);
          const tintedMaterials = new Set<Material>();
          model.traverse(child => {
            const mesh = child as Mesh;
            if (!mesh.isMesh || mesh.name === screenName || /screen|display|glass|lens|camera/i.test(mesh.name)) return;
            for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
              if (tintedMaterials.has(material) || material.name === screenName ||
                /screen|display|glass|lens|camera|gloss|光泽/i.test(material.name) ||
                material.transparent || material.opacity < 1) continue;
              const surface = material as Material & {
                color?: Color;
                roughness?: number;
                metalness?: number;
                transmission?: number;
              };
              if (!surface.color?.isColor || (surface.transmission ?? 0) > 0) continue;
              tintedMaterials.add(material);
              if (/^key(?:\.\d+)?$/i.test(material.name)) {
                // Keep graphite keycaps readable instead of multiplying them to black.
                const brightness = Math.max(surface.color.r, surface.color.g, surface.color.b);
                surface.color.set(brightness > 0.05 ? '#5b6065' : '#26292e');
                if (surface.roughness !== undefined) surface.roughness = Math.max(surface.roughness, 0.48);
                if (surface.metalness !== undefined) surface.metalness = 0;
              } else if ((surface.metalness ?? 0) > 0.45) {
                // A soft coating provides diffuse room light without an environment map.
                surface.color.lerp(tint, 0.35);
                surface.metalness = Math.min(surface.metalness ?? 0, 0.35);
                if (surface.roughness !== undefined) surface.roughness = Math.max(surface.roughness, 0.42);
              } else {
                surface.color.multiply(softTint);
              }
            }
          });
        }

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
          const captureTexture = await new THREE.TextureLoader(manager).loadAsync(capture);
          ownTexture(captureTexture);
          if (cancelled || failed) return;
          let screenTexture: Texture = captureTexture;
          if (screenAspect !== undefined && Number.isFinite(screenAspect) && screenAspect > 0) {
            const sourceImage = captureTexture.image as HTMLImageElement;
            const sourceWidth = sourceImage.naturalWidth || sourceImage.width;
            const sourceHeight = sourceImage.naturalHeight || sourceImage.height;
            if (sourceWidth <= 0 || sourceHeight <= 0) throw new Error('The screen capture has no usable image dimensions.');
            const nativeWidth = Math.max(sourceWidth, sourceHeight * screenAspect);
            const maxDimension = renderer.capabilities.maxTextureSize;
            const resolutionScale = Math.min(1, maxDimension / nativeWidth, maxDimension / (nativeWidth / screenAspect));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(nativeWidth * resolutionScale));
            canvas.height = Math.min(maxDimension, Math.max(1, Math.round(canvas.width / screenAspect)));
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Could not prepare the contained screen capture.');
            if (screenBackground !== undefined) {
              context.fillStyle = screenBackground;
            } else {
              context.drawImage(sourceImage, 0, 0, 1, 1, 0, 0, 1, 1);
              const color = context.getImageData(0, 0, 1, 1).data;
              context.clearRect(0, 0, canvas.width, canvas.height);
              context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`;
            }
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.imageSmoothingQuality = 'high';
            const top = THREE.MathUtils.clamp(insetTop, 0, 0.45) * canvas.height;
            const right = THREE.MathUtils.clamp(insetRight, 0, 0.45) * canvas.width;
            const bottom = THREE.MathUtils.clamp(insetBottom, 0, 0.45) * canvas.height;
            const left = THREE.MathUtils.clamp(insetLeft, 0, 0.45) * canvas.width;
            const safeWidth = canvas.width - left - right;
            const safeHeight = canvas.height - top - bottom;
            const scale = Math.min(safeWidth / sourceWidth, safeHeight / sourceHeight);
            const drawnWidth = sourceWidth * scale;
            const drawnHeight = sourceHeight * scale;
            // Contain the whole website inside the display's bezel/camera safe area.
            context.drawImage(sourceImage, left + (safeWidth - drawnWidth) / 2,
              top + (safeHeight - drawnHeight) / 2, drawnWidth, drawnHeight);
            screenTexture = new THREE.CanvasTexture(canvas);
            ownTexture(screenTexture);
          }
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
        group.updateMatrixWorld(true);
        bounds.getSize(modelSize);
        modelSize.x = Math.max(modelSize.x, 0.0001);
        modelSize.y = Math.max(modelSize.y, 0.0001);
        const vertex = new THREE.Vector3();
        model.traverseVisible(child => {
          const mesh = child as Mesh;
          if (!mesh.isMesh) return;
          const geometry = mesh.geometry;
          const positions = geometry.getAttribute('position');
          if (!positions) return;
          if (!geometry.boundingBox) geometry.computeBoundingBox();
          const box = geometry.boundingBox;
          if (box && !box.isEmpty()) {
            for (const x of [box.min.x, box.max.x]) {
              for (const y of [box.min.y, box.max.y]) {
                for (const z of [box.min.z, box.max.z]) {
                  vertex.set(x, y, z).applyMatrix4(mesh.matrixWorld);
                  modelBoundsPoints.push(vertex.x, vertex.y, vertex.z);
                }
              }
            }
          }
          const index = geometry.getIndex();
          const start = Math.max(0, geometry.drawRange.start);
          const end = Math.min(index?.count ?? positions.count, start + geometry.drawRange.count);
          const meshMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const screenMaterialIndices = new Set(meshMaterials.flatMap((material, i) => material.name === screenName ? [i] : []));
          const screenVertices = new Set<number>();
          const collectScreenRange = (rangeStart: number, rangeEnd: number) => {
            for (let i = Math.max(start, rangeStart); i < Math.min(end, rangeEnd); i++) {
              screenVertices.add(index ? index.getX(i) : i);
            }
          };
          if (screenMaterialIndices.size && Array.isArray(mesh.material)) {
            // A multi-material lid includes bezel geometry outside the actual display.
            for (const range of geometry.groups) {
              if (screenMaterialIndices.has(range.materialIndex ?? 0)) collectScreenRange(range.start, range.start + range.count);
            }
          } else if (screenMaterialIndices.size || mesh.name === screenName) {
            collectScreenRange(start, end);
          }
          const usedVertices = new Set<number>();
          for (let i = start; i < end; i++) usedVertices.add(index ? index.getX(i) : i);
          for (const i of usedVertices) {
            mesh.getVertexPosition(i, vertex).applyMatrix4(mesh.matrixWorld);
            modelPoints.push(vertex.x, vertex.y, vertex.z);
            if (screenVertices.has(i)) screenPoints.push(vertex.x, vertex.y, vertex.z);
          }
        });
        camera.position.set(0, 0, 2);
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
  }, [src, format, materials, resourcePath, screenName, capture, screenFlipY, screenAspect, screenBackground,
    insetTop, insetRight, insetBottom, insetLeft, rotateX, rotateY, rotateZ,
    ambient, key, fill, keyColor, fillColor, bodyTint, exposure, keyX, keyY, keyZ,
    frameHeight, frameTop, modelFrameHeight, modelFrameBottom]);

  return (
    <div className="device-model" data-model-state={state} role="img" aria-label={label}>
      <div className="device-model-fallback" aria-hidden="true">{fallback}</div>
      <div className="device-model-canvas" ref={host} aria-hidden="true" />
    </div>
  );
}
