/* Regalos en 3D que salen de la bolsa: un termo, una cobija doblada y una wafflera dentro de su caja.
   Todo se dibuja con código (sin imágenes externas). Se renderiza en un lienzo WebGL oculto y se copia a uno 2D. */
(function(){
  const T = window.THREE; const API = window.GIFTS3D = {ok: false};
  if(!T) return;
  let renderer;
  try{ renderer = new T.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'high-performance'}); }catch(e){ return; }
  if(!renderer || !renderer.getContext()) return;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const host = document.createElement('div'); host.id = 'gift3d';
  const gl = renderer.domElement; gl.style.display = 'none'; host.appendChild(gl);
  const cv = document.createElement('canvas'); cv.style.cssText = 'width:100%;height:100%;display:block;touch-action:none'; host.appendChild(cv);
  document.body.appendChild(host);
  const cx = cv.getContext('2d');

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(32, 1, .1, 60); camera.position.set(0, 0, 11);
  scene.add(new T.AmbientLight(0xffffff, .78));
  const key = new T.DirectionalLight(0xfff3e2, .95); key.position.set(3, 5, 7); scene.add(key);
  const fill = new T.DirectionalLight(0x9fe9f2, .5); fill.position.set(-5, 2, 4); scene.add(fill);
  const rim = new T.DirectionalLight(0xffc2dc, .45); rim.position.set(0, 4, -6); scene.add(rim);

  const M = (c, r = .5, m = 0, extra) => new T.MeshStandardMaterial(Object.assign({color: c, roughness: r, metalness: m}, extra || {}));
  const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.anisotropy = 4; return t; };

  /* ---------- dibujos pequeños ---------- */
  function kittyFace(g, x, y, s){
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = '#fff'; g.strokeStyle = '#3a2a30'; g.lineWidth = 2.4;
    g.beginPath(); g.moveTo(-34, -22); g.lineTo(-30, -48); g.lineTo(-10, -32); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(34, -22); g.lineTo(30, -48); g.lineTo(10, -32); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(0, 0, 42, 33, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#2b2025'; g.beginPath(); g.ellipse(-16, -2, 3.6, 4.6, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(16, -2, 3.6, 4.6, 0, 0, 7); g.fill();
    g.fillStyle = '#ffc21a'; g.beginPath(); g.ellipse(0, 6, 5, 3.6, 0, 0, 7); g.fill();
    g.strokeStyle = '#3a2a30'; g.lineWidth = 1.6;
    [[-26, 3, -46, -1], [-26, 8, -46, 10], [26, 3, 46, -1], [26, 8, 46, 10]].forEach(l => { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); });
    g.fillStyle = '#e8456b'; g.strokeStyle = '#a02848'; g.lineWidth = 1.6;
    g.beginPath(); g.ellipse(22, -30, 11, 8, -.3, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(36, -22, 8, 11, .3, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.arc(28, -27, 4.6, 0, 7); g.fillStyle = '#ff7a99'; g.fill(); g.stroke();
    g.restore();
  }
  function star(g, x, y, r, col){ g.fillStyle = col; g.beginPath(); for(let i = 0; i < 8; i++){ const a = i*Math.PI/4, rr = i%2 ? r*.32 : r; g.lineTo(x + Math.cos(a)*rr, y + Math.sin(a)*rr); } g.closePath(); g.fill(); }
  function heart(g, x, y, s, col, line){ g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.strokeStyle = line || 'none'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 12); g.bezierCurveTo(-30, -6, -16, -30, 0, -12); g.bezierCurveTo(16, -30, 30, -6, 0, 12); g.fill(); if(line) g.stroke(); g.restore(); }
  function shell(g, x, y, s, col, line){ g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.strokeStyle = line; g.lineWidth = 3;
    g.beginPath(); g.moveTo(0, 18); g.bezierCurveTo(-30, 8, -30, -22, 0, -22); g.bezierCurveTo(30, -22, 30, 8, 0, 18); g.fill(); g.stroke();
    for(let i = -2; i <= 2; i++){ g.beginPath(); g.moveTo(0, 16); g.lineTo(i*11, -18); g.stroke(); } g.restore(); }

  /* ---------- 1. TERMO ---------- */
  function makeTermo(){
    const grp = new T.Group();
    const R = y => .5 + .25*Math.pow(y/1.5, .9);                 // el termo se ensancha hacia arriba
    const prof = []; prof.push(new T.Vector2(0, 0)); prof.push(new T.Vector2(.42, 0)); prof.push(new T.Vector2(.5, .05));
    for(let y = .12; y <= 1.5; y += .1) prof.push(new T.Vector2(R(y), y));
    const pink = M(0xf8a9c6, .38, .05);
    const body = new T.Mesh(new T.LatheGeometry(prof, 56), pink); grp.add(body);
    const band = new T.Mesh(new T.CylinderGeometry(R(1.52) + .008, R(1.38) + .008, .17, 56, 1, true), M(0xd96fb0, .4, .05, {side: T.DoubleSide})); band.position.y = 1.43; grp.add(band);
    /* calcomanía "HELLO FRIENDS" */
    const dec = tex(768, 512, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      const block = (txt, x, y, sz) => { g.font = '900 ' + sz + 'px Impact, "Arial Black", sans-serif'; g.textAlign = 'center';
        for(let d = 10; d > 0; d--){ g.fillStyle = d > 5 ? '#f0763a' : '#d9602a'; g.fillText(txt, x + d, y + d); }
        g.fillStyle = '#8fd6ea'; g.fillText(txt, x, y); g.lineWidth = 3; g.strokeStyle = '#f0763a'; g.strokeText(txt, x, y); };
      block('HELLO', 330, 190, 150); block('FRIENDS', 360, 350, 136);
      kittyFace(g, 120, 150, 1.25);
      star(g, 600, 80, 22, '#ffd36a'); star(g, 690, 250, 16, '#fff'); star(g, 70, 330, 18, '#ffd36a'); star(g, 640, 430, 20, '#fff'); star(g, 250, 450, 14, '#ffd36a');
      g.fillStyle = '#e8456b'; g.font = 'italic 700 40px "Segoe Script", cursive'; g.fillText('Smile', 640, 60);
      g.fillStyle = '#ffd36a'; g.beginPath(); g.arc(90, 430, 28, 0, 7); g.fill(); g.fillStyle = '#3a2a30'; g.beginPath(); g.arc(80, 425, 3.4, 0, 7); g.arc(100, 425, 3.4, 0, 7); g.fill();
    });
    const len = 2.5;
    const dm = new T.Mesh(new T.CylinderGeometry(R(1.3) + .012, R(.45) + .012, .86, 56, 1, true, -len/2, len), new T.MeshBasicMaterial({map: dec, transparent: true, side: T.FrontSide}));
    dm.material = M(0xffffff, .4, 0, {map: dec, transparent: true, side: T.FrontSide}); dm.position.y = .88; grp.add(dm);
    /* tapa, tapa rosa y popote */
    const lid = new T.Mesh(new T.CylinderGeometry(R(1.5) + .02, R(1.5) + .02, .28, 56), M(0xffffff, .12, 0, {transparent: true, opacity: .32})); lid.position.y = 1.62; grp.add(lid);
    const cap = new T.Mesh(new T.CylinderGeometry(R(1.5) - .08, R(1.5) - .02, .16, 56), M(0xe98fbf, .4)); cap.position.y = 1.78; grp.add(cap);
    const flip = new T.Mesh(new T.BoxGeometry(.3, .16, .26), M(0xe98fbf, .4)); flip.position.set(-.3, 1.92, 0); grp.add(flip);
    const straw = new T.Mesh(new T.CylinderGeometry(.045, .045, 1.15, 14), M(0xff7fb0, .3)); straw.position.set(.16, 2.2, 0); straw.rotation.z = -.08; grp.add(straw);
    const tip = new T.Mesh(new T.CylinderGeometry(.05, .045, .22, 14), M(0xff7fb0, .3)); tip.position.set(.2, 2.82, 0); tip.rotation.z = -.35; grp.add(tip);
    /* asa */
    const curve = new T.CatmullRomCurve3([[.72, 1.34, 0], [1.2, 1.32, 0], [1.34, .96, 0], [1.2, .52, 0], [.66, .44, 0]].map(p => new T.Vector3(...p)));
    const handle = new T.Mesh(new T.TubeGeometry(curve, 40, .1, 12, false), pink); grp.add(handle);
    grp.scale.setScalar(.93); grp.position.y = -.9;
    const wrap = new T.Group(); wrap.add(grp); wrap.rotation.z = .03; wrap.userData.h = 2.9;
    return wrap;
  }

  /* ---------- 2. COBIJA doblada ---------- */
  function makeCobija(){
    const grp = new T.Group();
    const W = 2.0, H = 1.2, rad = .3;
    const sh = new T.Shape(); sh.moveTo(-W/2 + rad, -H/2); sh.lineTo(W/2 - rad, -H/2); sh.quadraticCurveTo(W/2, -H/2, W/2, -H/2 + rad); sh.lineTo(W/2, H/2 - rad); sh.quadraticCurveTo(W/2, H/2, W/2 - rad, H/2);
    sh.lineTo(-W/2 + rad, H/2); sh.quadraticCurveTo(-W/2, H/2, -W/2, H/2 - rad); sh.lineTo(-W/2, -H/2 + rad); sh.quadraticCurveTo(-W/2, -H/2, -W/2 + rad, -H/2);
    const geo = new T.ExtrudeGeometry(sh, {depth: .62, bevelEnabled: true, bevelThickness: .17, bevelSize: .14, bevelSegments: 8, curveSegments: 10});
    geo.translate(0, 0, -.31);
    const chk = tex(256, 256, (g, w, h) => { g.fillStyle = '#fff6f9'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(247,170,198,.62)'; g.fillRect(0, 0, w/2, h/2); g.fillRect(w/2, h/2, w/2, h/2); });
    chk.wrapS = chk.wrapT = T.RepeatWrapping; chk.repeat.set(2.2, 2.2);
    const blanket = new T.Mesh(geo, M(0xffe3ee, .95, 0, {map: chk})); grp.add(blanket);
    /* dibujos de la tela */
    const front = tex(1024, 640, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.fillStyle = '#ffd23a'; g.strokeStyle = '#2b2025'; g.lineWidth = 6;
      g.beginPath(); g.arc(160, 170, 76, 0, 7); g.fill(); g.stroke();
      for(let i = 0; i < 12; i++){ const a = i*Math.PI/6; g.beginPath(); g.moveTo(160 + Math.cos(a)*86, 170 + Math.sin(a)*86); g.lineTo(160 + Math.cos(a + .13)*120, 170 + Math.sin(a + .13)*120); g.lineTo(160 + Math.cos(a - .13)*120, 170 + Math.sin(a - .13)*120); g.closePath(); g.fill(); g.stroke(); }
      kittyFace(g, 560, 220, 2.5); shell(g, 880, 120, 2.0, '#ffd23a', '#2b2025'); shell(g, 780, 470, 1.6, '#ffd23a', '#2b2025'); shell(g, 130, 500, 1.7, '#ffd23a', '#2b2025');
      heart(g, 330, 480, 2.4, '#ff3f86', '#2b2025'); heart(g, 960, 330, 1.6, '#ff3f86', '#2b2025'); heart(g, 430, 80, 1.2, '#ff3f86', '#2b2025');
    });
    const decal = new T.Mesh(new T.PlaneGeometry(W + .04, H + .04), new T.MeshBasicMaterial({map: front, transparent: true})); decal.position.z = .31 + .17 + .002; grp.add(decal);
    const decalB = decal.clone(); decalB.rotation.y = Math.PI; decalB.position.z = -decal.position.z; grp.add(decalB);
    /* cinta blanca y asa */
    const band = new T.Mesh(new T.BoxGeometry(.34, H + .46, .62 + .46), M(0xffffff, .8)); band.position.x = .55; grp.add(band);
    const strap = new T.Mesh(new T.TorusGeometry(.3, .04, 10, 32, Math.PI), M(0xffffff, .7)); strap.position.set(.55, H/2 + .22, 0); strap.scale.set(1, .8, 1); grp.add(strap);
    /* etiqueta de cartón */
    const lab = tex(300, 400, (g, w, h) => {
      g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#f08aa2'; g.fillRect(0, 0, w, 90);
      g.fillStyle = '#fff'; for(let i = 0; i < 12; i++){ g.beginPath(); g.arc(12 + i*24, 6, 6, 0, 7); g.fill(); }
      g.fillStyle = '#fff'; g.font = '700 26px Arial'; g.textAlign = 'center'; g.fillText('HELLO KITTY', w/2, 40); g.fillText('AND FRIENDS', w/2, 70);
      g.fillStyle = '#e8d6e0'; g.fillRect(24, 110, w - 48, 150); kittyFace(g, w/2, 185, 1.2);
      g.fillStyle = '#2c9a8c'; g.fillRect(0, 290, w, 110); g.fillStyle = '#fff'; g.font = '700 30px Arial'; g.fillText('Frazada', w/2, 330);
      g.fillStyle = '#fff'; g.fillRect(190, 345, 90, 40); g.fillStyle = '#222'; for(let i = 0; i < 18; i++) g.fillRect(194 + i*4.8, 349, i%3 ? 2 : 3, 32);
    });
    const label = new T.Mesh(new T.PlaneGeometry(.78, 1.04), M(0xffffff, .7, 0, {map: lab})); label.position.set(-.3, -.12, .31 + .17 + .34 + .02); label.rotation.z = .05; grp.add(label);
    const labB = new T.Mesh(new T.BoxGeometry(.8, 1.06, .02), M(0xffffff, .7)); labB.position.copy(label.position); labB.position.z -= .012; labB.rotation.z = .05; grp.add(labB);
    grp.rotation.x = -.18; grp.userData.h = 1.9; const wrap = new T.Group(); wrap.add(grp); wrap.userData.h = 1.9;
    return wrap;
  }

  /* ---------- 3. WAFFLERA en su caja ---------- */
  function makeWafflera(){
    const grp = new T.Group();
    const BW = 1.75, BH = 1.95, BD = .95;
    const front = tex(640, 720, (g, w, h) => {
      g.fillStyle = '#fffdfb'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#f1c9d3'; g.lineWidth = 2; for(let x = 0; x < w; x += 40){ g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 190); g.stroke(); } for(let y = 0; y < 190; y += 40){ g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      g.fillStyle = '#7a4a2c'; g.font = '900 78px Impact, "Arial Black", sans-serif'; g.textAlign = 'center';
      g.lineWidth = 8; g.strokeStyle = '#fff'; g.strokeText('HELLO KITTY', 300, 128); g.fillText('HELLO KITTY', 300, 128);
      g.fillStyle = '#e8456b'; g.beginPath(); g.ellipse(560, 100, 38, 26, -.25, 0, 7); g.fill(); g.beginPath(); g.ellipse(610, 118, 26, 36, .35, 0, 7); g.fill(); g.fillStyle = '#ff7a99'; g.beginPath(); g.arc(588, 108, 14, 0, 7); g.fill();
      /* wafflera */
      g.fillStyle = '#f7ecd8'; g.strokeStyle = '#d8c7a6'; g.lineWidth = 4; g.beginPath(); g.ellipse(320, 400, 190, 150, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#f1e2c4'; g.beginPath(); g.ellipse(320, 400, 160, 124, 0, 0, 7); g.fill();
      g.fillStyle = '#e8456b'; g.beginPath(); g.ellipse(250, 330, 26, 18, -.25, 0, 7); g.fill(); g.beginPath(); g.ellipse(390, 330, 26, 18, .25, 0, 7); g.fill();
      kittyFace(g, 320, 410, 1.9);
      g.fillStyle = '#4a2a2f'; g.beginPath(); g.ellipse(120, 640, 110, 38, 0, 0, 7); g.fill();
      g.fillStyle = '#f2b36a'; g.beginPath(); g.ellipse(120, 640, 92, 28, 0, 0, 7); g.fill(); g.strokeStyle = '#d98a3a'; g.lineWidth = 2; for(let i = -3; i <= 3; i++){ g.beginPath(); g.moveTo(120 + i*24, 616); g.lineTo(120 + i*24, 664); g.stroke(); }
      g.fillStyle = '#f9d6de'; g.fillRect(0, 680, w, 40); g.fillStyle = '#7a4a2c'; g.font = '700 26px Arial'; g.textAlign = 'left'; g.fillText('Wafflera Eléctrica', 28, 708);
      g.fillStyle = '#f3c3cf'; g.fillRect(470, 190, 160, 150); g.fillStyle = '#7a4a2c'; g.font = '600 18px Arial'; g.textAlign = 'center'; g.fillText('Waffles', 550, 230); g.fillText('hechos con', 550, 255); g.fillText('amor', 550, 280);
    });
    const side = tex(320, 720, (g, w, h) => { g.fillStyle = '#fbe4ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8456b'; g.font = '900 52px Impact, sans-serif'; g.textAlign = 'center'; g.save(); g.translate(160, 360); g.rotate(-Math.PI/2); g.fillText('HELLO KITTY', 0, 16); g.restore(); heart(g, 160, 80, 1.1, '#fff'); heart(g, 160, 640, 1.1, '#fff'); });
    const top = tex(640, 320, (g, w, h) => { g.fillStyle = '#fffdfb'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f1c9d3'; g.lineWidth = 2; for(let x = 0; x < w; x += 40){ g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for(let y = 0; y < h; y += 40){ g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.fillStyle = '#e8456b'; g.beginPath(); g.ellipse(250, 160, 44, 30, -.25, 0, 7); g.fill(); g.beginPath(); g.ellipse(390, 160, 44, 30, .25, 0, 7); g.fill(); g.fillStyle = '#ff7a99'; g.beginPath(); g.arc(320, 160, 22, 0, 7); g.fill(); });
    const m = t => M(0xffffff, .55, 0, {map: t});
    const box = new T.Mesh(new T.BoxGeometry(BW, BH, BD), [m(side), m(side), m(top), M(0xf6e1e6, .6), m(front), m(front)]);
    grp.add(box);
    grp.rotation.x = -.1; grp.userData.h = 2.0;
    const wrap = new T.Group(); wrap.add(grp); wrap.userData.h = 2.0;
    return wrap;
  }

  const makers = [makeTermo, makeCobija, makeWafflera];
  const models = [];
  let cur = null, state = 'idle', t0 = 0, from = null, to = null, spin = 0, dragX = 0, dragV = 0, drag = false, lastX = 0, alpha = 1, clipY = 0;
  let W = 0, H = 0;

  function resize(){
    W = host.clientWidth || innerWidth; H = host.clientHeight || innerHeight;
    renderer.setSize(W, H, false); gl.width = Math.round(W*renderer.getPixelRatio()); gl.height = Math.round(H*renderer.getPixelRatio());
    cv.width = gl.width; cv.height = gl.height; camera.aspect = W/H; camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
  }
  addEventListener('resize', resize);
  const toWorld = (px, py) => { const v = new T.Vector3((px/W)*2 - 1, -(py/H)*2 + 1, .5).unproject(camera); const d = v.sub(camera.position).normalize(); const k = -camera.position.z/d.z; return camera.position.clone().add(d.multiplyScalar(k)); };
  const ease = k => 1 - Math.pow(1 - k, 3), back = k => { const c = 1.5; return 1 + (c + 1)*Math.pow(k - 1, 3) + c*Math.pow(k - 1, 2); };

  host.addEventListener('pointerdown', e => { if(state !== 'shown') return; drag = true; lastX = e.clientX; try{ host.setPointerCapture(e.pointerId); }catch(_){} });
  host.addEventListener('pointermove', e => { if(!drag) return; dragV = (e.clientX - lastX)*.012; lastX = e.clientX; spin += dragV; });
  const up = () => { drag = false; }; host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);

  function frame(now){
    requestAnimationFrame(frame);
    if(state === 'idle' || !cur) return;
    const t = now - t0;
    if(state === 'rising'){
      const k = Math.min(1, t/1900), e = ease(k), b = back(Math.min(1, k*1.02));
      cur.position.set(from.x + (to.x - from.x)*e, from.y + (to.y - from.y)*b, 0);
      const sc = .22 + (1 - .22)*e; cur.scale.setScalar(sc*cur.userData.base);
      spin += .018*(1 - e); cur.rotation.y = spin + (1 - e)*1.6; cur.rotation.z = Math.sin(k*5)*.12*(1 - k);
      if(k >= 1){ state = 'shown'; API._res && API._res(); }
    } else if(state === 'shown'){
      if(!drag){ dragV *= .94; spin += .008 + dragV; }
      cur.rotation.y = spin; cur.rotation.z = Math.sin(now/900)*.03; cur.position.y = to.y + Math.sin(now/700)*.06; cur.position.x = to.x;
    } else if(state === 'leaving'){
      const k = Math.min(1, t/900), e = k*k; cur.position.y = to.y + e*3.4; spin += .05; cur.rotation.y = spin; cur.scale.setScalar(cur.userData.base*(1 + .3*e)); alpha = 1 - k;
      if(k >= 1){ scene.remove(cur); cur = null; state = 'idle'; host.classList.remove('on'); API._res && API._res(); }
    }
    renderer.render(scene, camera);
    cx.clearRect(0, 0, cv.width, cv.height); cx.globalAlpha = Math.max(0, alpha);
    cx.save(); cx.beginPath(); cx.rect(0, 0, cv.width, clipY ? clipY*renderer.getPixelRatio() : cv.height); cx.clip(); cx.drawImage(gl, 0, 0, cv.width, cv.height); cx.restore();
  }
  requestAnimationFrame(frame);

  API.ok = true;
  /* sale de la bolsa: mouth = {x, y} en píxeles (la boca de la bolsa); target = {x, y} dónde se queda */
  API.emerge = (i, mouth, target, px) => new Promise(res => {
    resize();
    if(!models[i]){
      const m = makers[i](), bb = new T.Box3().setFromObject(m), c = bb.getCenter(new T.Vector3()), sz = bb.getSize(new T.Vector3());
      m.children[0].position.sub(c); m.userData.h = sz.y; models[i] = m;      // el centro del regalo queda en el origen
    }
    cur = models[i]; const h = cur.userData.h;
    cur.userData.base = Math.min(1.1, ((px || H*.34)/(H/6.3))/h);          // alto del regalo en pantalla
    scene.add(cur); host.classList.add('on'); alpha = 1; spin = -.5; dragV = 0;
    from = toWorld(mouth.x, mouth.y); from.y -= .6; to = toWorld(target.x, target.y);
    clipY = mouth.y + 6;
    state = 'rising'; t0 = performance.now(); API._res = res;
  });
  API.leave = () => new Promise(res => { if(!cur){ res(); return; } state = 'leaving'; t0 = performance.now(); API._res = res; });
  API.state = () => state;
  API.dbg = () => cur ? [state, cur.position.x.toFixed(2), cur.position.y.toFixed(2), cur.scale.x.toFixed(2), to.y.toFixed(2), from.y.toFixed(2), cur.userData.h.toFixed(2)].join(' ') : state;
})();
