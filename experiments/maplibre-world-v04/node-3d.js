// Majakka World v0.4.1 — a true georeferenced 3D Node on the MapLibre map.
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
      core.position.y = 34;
      this.nodeRoot.add(core);
      this.core = core;
      this.rings = [];

      // v0.4.1 solid silhouette: a fully OPAQUE, unlit 3D body.
      // v0.4 screenshots looked washed out because the delicate wire shell
      // and transparent beam visually dominated the weakly shaded crystal.
      // Every face is its own opaque vertex-colored facet; the 3D shape
      // remains visible independently of lighting and map brightness.
      const body = new THREE.OctahedronGeometry(15.5, 0);
      const pos = body.getAttribute('position');
      const facetColors = [
        0x3df1dc, 0x109fa7, 0x22c4c3, 0x0b697b,
        0x5bffed, 0x178c9a, 0x1badb3, 0x0d6173
      ];
      const colorAttr = new Float32Array(pos.count * 3);
      for (let face = 0; face < pos.count / 3; face++) {
        const color = new THREE.Color(facetColors[face % facetColors.length]);
        for (let corner = 0; corner < 3; corner++) {
          const k = (face * 3 + corner) * 3;
          colorAttr[k] = color.r;
          colorAttr[k + 1] = color.g;
          colorAttr[k + 2] = color.b;
        }
      }
      body.setAttribute('color', new THREE.Float32BufferAttribute(colorAttr, 3));
      const crystal = new THREE.Mesh(
        body,
        new THREE.MeshBasicMaterial({
          vertexColors: true, side: THREE.DoubleSide,
          transparent: false, opacity: 1, depthTest: true, depthWrite: true
        })
      );
      crystal.scale.set(0.86, 1.47, 0.86);
      core.add(crystal);

      // Small, genuinely solid secondary volumes make the middle read as
      // an artifact instead of a see-through cage from steep camera angles.
      const spine = new THREE.Mesh(
        new THREE.OctahedronGeometry(5.5, 0),
        new THREE.MeshBasicMaterial({
          color: 0xaffff1, transparent: false, depthWrite: true
        })
      );
      spine.scale.set(0.60, 1.88, 0.60);
      spine.position.y = 3.5;
      core.add(spine);

      // A translucent contour supports the body; it never substitutes it.
      const shell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(19.0, 1),
        new THREE.MeshBasicMaterial({
          color: 0x78fff0, wireframe: true, transparent: true,
          opacity: 0.40, depthWrite: false
        })
      );
      core.add(shell);

      // Subtle aura only. The crystal itself is NOT transparent.
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(20.5, 16, 10),
        new THREE.MeshBasicMaterial({
          color: 0x27e6d6, transparent: true, opacity: 0.028,
          blending: THREE.AdditiveBlending, depthWrite: false,
          side: THREE.BackSide
        })
      );
      core.add(glow);

      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0x78f7e8, transparent: false, opacity: 1,
        depthTest: true, depthWrite: true
      });
      for (let i = 0; i < 2; i++) {
        const orbit = new THREE.Mesh(
          new THREE.TorusGeometry(21 + i * 5, 0.85, 6, 72), orbitMat.clone()
        );
        orbit.rotation.x = Math.PI / 2 + (i === 0 ? 0.32 : -0.43);
        orbit.rotation.y = i * 0.8;
        core.add(orbit);
        this.rings.push(orbit);
      }

      // Beam and ground footprint must stay behind the strong opaque Node.
      const finMat = new THREE.MeshBasicMaterial({
        color: 0x61e5da, transparent: true, opacity: 0.12,
        side: THREE.DoubleSide, depthWrite: false
      });
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 5.3, 34, 12, 1, true), finMat
      );
      beam.position.y = 17;
      this.nodeRoot.add(beam);
      const foot = new THREE.Mesh(
        new THREE.RingGeometry(10, 23, 48),
        new THREE.MeshBasicMaterial({
          color: 0x30d4cb, side: THREE.DoubleSide,
          transparent: true, opacity: 0.19, depthWrite: false
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
          this.core.position.y = 34 + Math.sin(seconds * 1.12) * 1.6;
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
