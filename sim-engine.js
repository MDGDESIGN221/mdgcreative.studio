/* light-sim — real 3D head lighting simulator (Three.js) for MDG Learning Center.
   A <light-sim> web component: loads a photoscanned head, orbit-controls to rotate,
   colored key / fill / rim lights, fresnel + normals debug views. */
(function () {
  if (customElements.get('light-sim')) return;

  const THREE_URL = 'https://unpkg.com/three@0.160.0/build/three.module.js';
  const ADDON = 'https://unpkg.com/three@0.160.0/examples/jsm/';
  const HEAD_URL = 'https://threejs.org/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb';

  let sharedLibs = null;
  async function loadLibs() {
    if (sharedLibs) return sharedLibs;
    const THREE = await import(THREE_URL);
    const { OrbitControls } = await import(ADDON + 'controls/OrbitControls.js');
    const { GLTFLoader } = await import(ADDON + 'loaders/GLTFLoader.js');
    sharedLibs = { THREE, OrbitControls, GLTFLoader };
    return sharedLibs;
  }

  // cache the loaded head geometry across every instance on the page
  let headGeomPromise = null;
  function loadHeadGeometry(THREE, GLTFLoader) {
    if (headGeomPromise) return headGeomPromise;
    headGeomPromise = new Promise((resolve) => {
      const loader = new GLTFLoader();
      loader.load(HEAD_URL, (gltf) => {
        let geom = null;
        gltf.scene.traverse((o) => { if (o.isMesh && !geom) geom = o.geometry; });
        if (geom) { geom = geom.clone(); geom.computeVertexNormals(); resolve({ geom, real: true }); }
        else resolve({ geom: fallbackGeom(THREE), real: false });
      }, undefined, () => resolve({ geom: fallbackGeom(THREE), real: false }));
    });
    return headGeomPromise;
  }
  function fallbackGeom(THREE) {
    // organic blob so rim light still reads if the model can't load
    const g = new THREE.IcosahedronGeometry(1, 24);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const s = 1 + 0.18 * Math.sin(y * 3.1) + 0.12 * Math.cos(x * 2.4) - 0.15 * Math.max(0, z);
      p.setXYZ(i, x * s * 0.8, y * s * 1.15, z * s * 0.85);
    }
    g.computeVertexNormals();
    return g;
  }

  function kelvinToRGB(k) {
    k = Math.max(1500, Math.min(12000, k)) / 100;
    let r, g, b;
    if (k <= 66) r = 255; else r = 329.698727446 * Math.pow(k - 60, -0.1332047592);
    if (k <= 66) g = 99.4708025861 * Math.log(k) - 161.1195681661;
    else g = 288.1221695283 * Math.pow(k - 60, -0.0755148492);
    if (k >= 66) b = 255; else if (k <= 19) b = 0;
    else b = 138.5177312231 * Math.log(k - 10) - 305.0447927307;
    const c = (v) => Math.max(0, Math.min(255, v)) / 255;
    return [c(r), c(g), c(b)];
  }
  function hexToRGB(h) {
    h = String(h).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    if (isNaN(n)) return null;
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  const NUM = ['intensity', 'softness', 'distance', 'kelvin', 'azimuth', 'elevation',
    'rimwrap', 'falloffboost', 'view', 'yaw'];
  const BOOL = ['keyon', 'fillon', 'rimon', 'autoorbit', 'interactive', 'gizmo'];

  class LightSim extends HTMLElement {
    static get observedAttributes() {
      return ['mode', 'intensity', 'softness', 'distance', 'kelvin', 'azimuth', 'elevation',
        'rim-wrap', 'falloff-boost', 'view', 'key-on', 'fill-on', 'rim-on',
        'auto-orbit', 'interactive', 'gizmo', 'yaw', 'color-hex', 'rim-hex',
        'rimwrap', 'falloffboost', 'keyon', 'fillon', 'rimon', 'autoorbit', 'colorhex', 'rimhex'];
    }
    constructor() {
      super();
      this.p = {
        mode: 'single', intensity: 1.4, softness: 0.4, distance: 2.2, kelvin: 5400,
        azimuth: 42, elevation: 26, rimwrap: 0.75, falloffboost: 0, view: 0, yaw: 0,
        colorhex: '', rimhex: '#3DBFA3',
        keyon: true, fillon: true, rimon: false, autoorbit: false, interactive: true, gizmo: true,
      };
      this._ready = false; this._visible = true; this._userOrbiting = false;
      this.onLightMove = null;
      // define camelCase property setters so the DC host can pass values as
      // properties OR attributes (both routes funnel into _setP)
      ['mode', 'intensity', 'softness', 'distance', 'kelvin', 'azimuth', 'elevation',
        'rimWrap', 'falloffBoost', 'view', 'keyOn', 'fillOn', 'rimOn',
        'autoOrbit', 'interactive', 'gizmo', 'yaw', 'colorHex', 'rimHex'].forEach((camel) => {
        const key = camel.toLowerCase();
        Object.defineProperty(this, camel, {
          configurable: true,
          get() { return this.p[key]; },
          set(v) { this._setP(key, v); },
        });
      });
    }
    attributeChangedCallback(name, _o, val) { this._setP(name.replace(/-/g, ''), val); }
    _setP(name, v) {
      if (BOOL.indexOf(name) >= 0) v = (v === true || v === 'true' || v === '' || v === 1);
      else if (NUM.indexOf(name) >= 0) { v = parseFloat(v); if (isNaN(v)) return; }
      if (this.p[name] === v) return;
      this.p[name] = v; this._dirty = true;
    }

    connectedCallback() {
      if (this._started) return; this._started = true;
      this.style.display = this.style.display || 'block';
      loadLibs().then((libs) => this._init(libs)).catch((e) => {
        console.error('light-sim init failed', e);
        this.innerHTML = '<div style="color:#888;font:13px sans-serif;padding:20px">3D indisponible</div>';
      });
    }
    disconnectedCallback() {
      this._stopped = true;
      if (this._ro) this._ro.disconnect();
      if (this._io) this._io.disconnect();
      if (this._renderer) this._renderer.dispose();
    }

    async _init({ THREE, OrbitControls, GLTFLoader }) {
      this.THREE = THREE;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
      renderer.setClearColor(0x0b0c0d, 1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;';
      this.appendChild(renderer.domElement);
      this._renderer = renderer;

      const scene = new THREE.Scene();
      this._scene = scene;
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0.15, 5.2);
      this._camera = camera;

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 3.2; controls.maxDistance = 8;
      controls.minPolarAngle = 0.6; controls.maxPolarAngle = 2.2;
      controls.target.set(0, 0.05, 0);
      controls.addEventListener('start', () => { this._userOrbiting = true; });
      this._controls = controls;

      // ambient + backdrop + ground so shadows and colored wash read
      scene.add(new THREE.AmbientLight(0x2a2f36, 0.6));
      const backdrop = new THREE.Mesh(
        new THREE.PlaneGeometry(24, 16),
        new THREE.MeshStandardMaterial({ color: 0x0e0f11, roughness: 1, metalness: 0 }));
      backdrop.position.set(0, 0, -2.4); backdrop.receiveShadow = true;
      scene.add(backdrop);
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(24, 24),
        new THREE.MeshStandardMaterial({ color: 0x0c0d0f, roughness: 1, metalness: 0 }));
      ground.rotation.x = -Math.PI / 2; ground.position.y = -1.55; ground.receiveShadow = true;
      scene.add(ground);

      // materials
      this._rimUniforms = {
        uRimColor: { value: new THREE.Color(0x3dbfa3) },
        uRimDirView: { value: new THREE.Vector3(0, 0, 1) },
        uRimPower: { value: 3.0 },
        uRimStrength: { value: 0.0 },
      };
      const skin = new THREE.MeshStandardMaterial({ color: 0xd8c3b1, roughness: 0.66, metalness: 0.0 });
      skin.onBeforeCompile = (sh) => {
        sh.uniforms.uRimColor = this._rimUniforms.uRimColor;
        sh.uniforms.uRimDirView = this._rimUniforms.uRimDirView;
        sh.uniforms.uRimPower = this._rimUniforms.uRimPower;
        sh.uniforms.uRimStrength = this._rimUniforms.uRimStrength;
        sh.fragmentShader = 'uniform vec3 uRimColor;uniform vec3 uRimDirView;uniform float uRimPower;uniform float uRimStrength;\n' + sh.fragmentShader;
        sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>',
          'float _fres = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), uRimPower);\n' +
          'float _face = smoothstep(-0.25, 0.55, dot(normalize(normal), normalize(uRimDirView)));\n' +
          'gl_FragColor.rgb += uRimColor * _fres * _face * uRimStrength;\n' +
          '#include <dithering_fragment>');
      };
      this._skinMat = skin;
      this._normalMat = new THREE.MeshNormalMaterial();
      this._fresnelMat = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(0x3dbfa3) } },
        vertexShader: 'varying vec3 vN;varying vec3 vP;void main(){vN=normalMatrix*normal;vec4 mv=modelViewMatrix*vec4(position,1.0);vP=-mv.xyz;gl_Position=projectionMatrix*mv;}',
        fragmentShader: 'varying vec3 vN;varying vec3 vP;uniform vec3 uColor;void main(){float f=pow(1.0-clamp(dot(normalize(vN),normalize(vP)),0.0,1.0),2.6);gl_FragColor=vec4(mix(vec3(0.03),uColor,f),1.0);}',
      });

      // lights
      const key = new THREE.SpotLight(0xffffff, 40, 0, 0.7, 0.4, 2);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 0.5; key.shadow.camera.far = 20;
      key.shadow.bias = -0.0006; key.shadow.blurSamples = 24;
      scene.add(key); scene.add(key.target);
      this._key = key;
      const fill = new THREE.PointLight(0xbcd2f0, 6, 0, 2);
      scene.add(fill); this._fill = fill;
      const rim = new THREE.SpotLight(0x3dbfa3, 60, 0, 0.9, 0.6, 2);
      scene.add(rim); scene.add(rim.target);
      this._rim = rim;

      // gizmo
      const giz = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff }));
      scene.add(giz); this._giz = giz;

      // head
      const head = new THREE.Group();
      scene.add(head); this._head = head;
      const { geom, real } = await loadHeadGeometry(THREE, GLTFLoader);
      const mesh = new THREE.Mesh(geom, this._skinMat);
      mesh.castShadow = true; mesh.receiveShadow = true;
      // normalize size/position of the loaded model
      geom.computeBoundingBox();
      const bb = geom.boundingBox, size = new THREE.Vector3(), ctr = new THREE.Vector3();
      bb.getSize(size); bb.getCenter(ctr);
      const scl = 2.15 / Math.max(size.x, size.y, size.z);
      mesh.scale.setScalar(scl);
      mesh.position.set(-ctr.x * scl, -ctr.y * scl + 0.05, -ctr.z * scl);
      if (real) mesh.rotation.y = 0;
      head.add(mesh); this._mesh = mesh;

      this._ro = new ResizeObserver(() => this._resize()); this._ro.observe(this);
      this._io = new IntersectionObserver((en) => { this._visible = en[0].isIntersecting; }, { threshold: 0.02 });
      this._io.observe(this);
      this._resize();
      this._ready = true; this._dirty = true;
      this._t0 = performance.now();
      renderer.setAnimationLoop(() => this._frame());
    }

    _resize() {
      if (!this._renderer) return;
      const w = Math.max(2, this.clientWidth), h = Math.max(2, this.clientHeight);
      this._renderer.setSize(w, h, false);
      this._camera.aspect = w / h; this._camera.updateProjectionMatrix();
      this._dirty = true;
    }

    _sph(az, el, r, cy) {
      const a = az * Math.PI / 180, e = el * Math.PI / 180;
      return [r * Math.sin(a) * Math.cos(e), (cy || 0.05) + r * Math.sin(e), r * Math.cos(a) * Math.cos(e)];
    }

    _frame() {
      if (this._stopped || !this._ready) return;
      const THREE = this.THREE, p = this.p, controls = this._controls;
      controls.enabled = !!p.interactive;
      // auto-orbit rotates the head until the user grabs it
      if (p.autoorbit && !this._userOrbiting) {
        const t = (performance.now() - this._t0) / 1000;
        this._head.rotation.y = Math.sin(t * 0.32) * 0.5;
        this._dirty = true;
      } else {
        this._head.rotation.y = (p.yaw || 0) * Math.PI / 180;
      }
      controls.update();

      // --- lights every frame (cheap) ---
      const kc = (p.colorhex && hexToRGB(p.colorhex)) || kelvinToRGB(p.kelvin);
      let az = p.azimuth, el = p.elevation, dist = p.distance;
      const radius = dist * 1.55;
      const compensate = p.falloffboost <= 0.001;
      const baseKey = 34;
      const kp = this._sph(az, el, radius);
      this._key.position.set(kp[0], kp[1], kp[2]);
      this._key.target.position.set(0, 0.02, 0);
      this._key.color.setRGB(kc[0], kc[1], kc[2]);
      this._key.penumbra = 0.15 + p.softness * 0.85;
      this._key.angle = 0.5 + p.softness * 0.35;
      this._key.shadow.radius = 1 + p.softness * 22;
      this._key.intensity = (p.keyon ? 1 : 0) * baseKey * p.intensity *
        (compensate ? (radius * radius) / 6.0 : 1.0);
      this._key.visible = !!p.keyon;

      const fp = this._sph(-52, 12, radius * 1.05);
      this._fill.position.set(fp[0], fp[1], fp[2]);
      this._fill.intensity = (p.fillon ? 1 : 0) * 5.5 * (radius * radius) / 6.0;
      this._fill.visible = !!p.fillon;

      // rim: in fresnel mode driven by rim-wrap (front->behind); else fixed behind
      const rimCol = hexToRGB(p.rimhex) || [0.24, 0.75, 0.64];
      let rimAz, rimEl, rimActive;
      if (p.mode === 'fresnel') {
        rimAz = 12 + p.rimwrap * 156; rimEl = 24; rimActive = true;
        // dim frontal key so the wrap reads
        const kp2 = this._sph(-32, 26, radius);
        this._key.position.set(kp2[0], kp2[1], kp2[2]);
        this._key.intensity = baseKey * 0.35 * (radius * radius) / 6.0;
        this._key.visible = true;
      } else {
        rimAz = 152; rimEl = 30; rimActive = !!p.rimon;
      }
      const rp = this._sph(rimAz, rimEl, radius * 0.95);
      this._rim.position.set(rp[0], rp[1], rp[2]);
      this._rim.target.position.set(0, 0.02, 0);
      this._rim.color.setRGB(rimCol[0], rimCol[1], rimCol[2]);
      this._rim.intensity = rimActive ? 55 * (p.mode === 'fresnel' ? p.intensity : 1.3) : 0;
      this._rim.visible = rimActive;

      // fresnel rim glow injected into skin material
      this._rimUniforms.uRimColor.value.setRGB(rimCol[0], rimCol[1], rimCol[2]);
      this._rimUniforms.uRimStrength.value = rimActive ? (p.mode === 'fresnel' ? 1.6 : 1.1) : 0.0;
      const rimDir = new THREE.Vector3(rp[0], rp[1], rp[2]).normalize().transformDirection(this._camera.matrixWorldInverse);
      this._rimUniforms.uRimDirView.value.copy(rimDir);

      // gizmo
      const gp = (p.mode === 'fresnel') ? rp : kp;
      this._giz.visible = !!p.gizmo && (p.mode === 'fresnel' ? true : !!p.keyon);
      this._giz.position.set(gp[0], gp[1], gp[2]);
      this._giz.material.color.setRGB(
        (p.mode === 'fresnel' ? rimCol : kc)[0],
        (p.mode === 'fresnel' ? rimCol : kc)[1],
        (p.mode === 'fresnel' ? rimCol : kc)[2]);

      // view mode material swap
      let mat = this._skinMat;
      if (p.view > 1.5) mat = this._normalMat;
      else if (p.view > 0.5) { mat = this._fresnelMat; this._fresnelMat.uniforms.uColor.value.setRGB(rimCol[0], rimCol[1], rimCol[2]); }
      if (this._mesh && this._mesh.material !== mat) this._mesh.material = mat;

      if (this._visible) this._renderer.render(this._scene, this._camera);
    }
  }
  customElements.define('light-sim', LightSim);
})();
