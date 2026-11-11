// Majakka World v0.4 — a true georeferenced 3D Node on the MapLibre map.
// Prototype geometry only; no real POI, GPS, Kaiku asset or fake "3D" billboard.
import * as THREE from 'https://unpkg.com/three@0.178.0/build/three.module.js';

export function createNode3DLayer(maplibregl, coords, onFault = () => {}) {
  const coordinate = maplibregl.MercatorCoordinate.fromLngLat(coords, 0);
  const scale = coordinate.meterInMercatorCoordinateUnits();
  // MapLibre uses +Z altitude, while the Three scene uses +Y up.
  const model = new THREE.Matrix4()
    .makeTranslation(coordinate.x, coordinate.y, coordinate.z)
    .scale(new THREE.Vector3(scale, -scale, scale))
    .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  const projection = new THREE.Matrix4();
  let active = true;
  let reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const layer = {
    id: 'majakka-georeferenced-node-3d',
    type: 'custom',
    renderingMode: '3d',
    onAdd(map, gl) {
      this.map = map;
      this.camera = new THREE.Camera();
      this.scene = new THREE.Scene();
      this.nodeRoot = new THREE.Group();
      this.scene.add(this.nodeRoot);
      const core = new THREE.Group();
      core.position.y = 42;
      this.nodeRoot.add(core);
      this.core = core;
      this.rings = [];

      // Actual volumetric, faceted geometry — not a planar icon.
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x2ccac1, emissive: 0x15d6cb, emissiveIntensity: 0.58,
        metalness: 0.48, roughness: 0.24, flatShading: true
      });
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(14, 1), crystalMat);
      crystal.scale.set(0.82, 1.55, 0.82);
      core.add(crystal);

      const shell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(18.6, 1),
        new THREE.MeshBasicMaterial({
          color: 0x74fff0, wireframe: true, transparent: true,
          opacity: 0.23, depthWrite: false
        })
      );
      core.add(shell);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(20, 20, 12),
        new THREE.MeshBasicMaterial({
          color: 0x40d8d1, transparent: true, opacity: 0.045,
          blending: THREE.AdditiveBlending, depthWrite: false,
          side: THREE.BackSide
        })
      );
      core.add(glow);

      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0x79eee3, transparent: true, opacity: 0.63, depthWrite: false
      });
      for (let i = 0; i < 2; i++) {
        const orbit = new THREE.Mesh(
          new THREE.TorusGeometry(23 + i * 6, 0.64, 5, 72), orbitMat.clone()
        );
        orbit.rotation.x = Math.PI / 2 + (i === 0 ? 0.32 : -0.43);
        orbit.rotation.y = i * 0.8;
        core.add(orbit);
        this.rings.push(orbit);
      }

      const finMat = new THREE.MeshBasicMaterial({
        color: 0x61e5da, transparent: true, opacity: 0.28,
        side: THREE.DoubleSide, depthWrite: false
      });
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(1.3, 7.4, 48, 12, 1, true), finMat
      );
      beam.position.y = 12;
      this.nodeRoot.add(beam);
      const foot = new THREE.Mesh(
        new THREE.RingGeometry(12, 24, 48),
        new THREE.MeshBasicMaterial({
          color: 0x30d4cb, side: THREE.DoubleSide,
          transparent: true, opacity: 0.26, depthWrite: false
        })
      );
      foot.rotation.x = -Math.PI / 2;
      foot.position.y = 1.2;
      this.nodeRoot.add(foot);

      const ambient = new THREE.AmbientLight(0x81b8bb, 1.2);
      const key = new THREE.DirectionalLight(0xc6fffa, 2);
      key.position.set(70, 130, 40);
      const fill = new THREE.DirectionalLight(0x647bbf, 1);
      fill.position.set(-60, 30, -60);
      this.scene.add(ambient, key, fill);

      this.renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(), context: gl, alpha: true, antialias: true
      });
      this.renderer.autoClear = false;
      this.start = performance.now();
      this.failed = false;
    },
    render(gl, args) {
      if (!active || !this.renderer || !args?.defaultProjectionData?.mainMatrix) return;
      try {
        const seconds = (performance.now() - this.start) / 1000;
        if (!reducedMotion && !document.hidden) {
          this.core.position.y = 42 + Math.sin(seconds * 1.12) * 2.3;
          this.core.rotation.y = seconds * 0.19;
          this.rings[0].rotation.z = seconds * 0.11;
          this.rings[1].rotation.z = -seconds * 0.09;
        }
        // The georeferenced world-camera transform is from MapLibre itself.
        // No screen position / marker DOM trickery: pan, pitch, orbit and zoom
        // apply to the same 3D Node without recalculating pixels.
        projection.fromArray(args.defaultProjectionData.mainMatrix);
        this.camera.projectionMatrix.copy(projection).multiply(model);
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
        if (!reducedMotion && !document.hidden) this.map.triggerRepaint();
      } catch (error) {
        if (!this.failed) {
          this.failed = true;
          console.error('Majakka 3D Node render error', error);
          onFault(error);
        }
        active = false; // don't trap the map in a failure/repaint loop
      }
    },
    onRemove() {
      active = false;
      this.scene?.traverse(object => {
        object.geometry?.dispose?.();
        const mats = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
        mats.forEach(material => material.dispose?.());
      });
      this.renderer?.dispose();
      this.renderer = null;
    },
    setEnabled(value) { active = Boolean(value); if (active) this.map?.triggerRepaint(); },
    getEnabled() { return active; }
  };
  return layer;
}
