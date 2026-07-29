// 3D hero centerpiece — rotating particle sphere (Three.js, vendored locally)
import * as THREE from "./three.module.js";

const mount = document.getElementById("scene");
if (mount) {
  try {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 3.4;

    const renderer = new THREE.WebGLRenderer({ canvas: mount, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // ---- particle sphere (Fibonacci distribution) ----
    const N = 2800;
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const cInner = new THREE.Color(0x10b981);
    const cOuter = new THREE.Color(0xa9ffe0);
    const R = 1.35;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const jitter = 0.94 + Math.random() * 0.1;
      const x = Math.cos(theta) * rad * R * jitter;
      const yy = y * R * jitter;
      const z = Math.sin(theta) * rad * R * jitter;
      positions[i * 3] = x;
      positions[i * 3 + 1] = yy;
      positions[i * 3 + 2] = z;
      const mix = (y + 1) / 2;
      const col = cInner.clone().lerp(cOuter, mix);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.022, vertexColors: true, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // ---- faint wireframe core ----
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.82, 1),
      new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.14 })
    );
    scene.add(core);

    const group = new THREE.Group();
    scene.add(group);
    group.add(points);
    group.add(core);

    function resize() {
      const w = mount.clientWidth || mount.parentElement.clientWidth;
      const h = mount.clientHeight || mount.parentElement.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    let mx = 0, my = 0;
    window.addEventListener("mousemove", function (e) {
      mx = (e.clientX / window.innerWidth - 0.5);
      my = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });

    let t = 0;
    function animate() {
      t += 0.005;
      group.rotation.y += 0.0018;
      core.rotation.y -= 0.0032;
      core.rotation.x += 0.0012;
      // gentle tilt toward pointer
      const targetX = my * 0.35;
      const targetY = group.rotation.y + mx * 0.0025;
      group.rotation.x += (targetX - group.rotation.x) * 0.05;
      group.rotation.y = targetY;
      group.scale.setScalar(1 + Math.sin(t) * 0.015);
      renderer.render(scene, camera);
      if (!reduce) requestAnimationFrame(animate);
    }
    animate();
    if (reduce) renderer.render(scene, camera);
  } catch (err) {
    // WebGL unavailable — fail silently, rest of the page is unaffected
    mount.style.display = "none";
  }
}
