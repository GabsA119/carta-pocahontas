/* Regalos en 3D que salen de la bolsa: un termo, una cobija doblada y una wafflera dentro de su caja.
   Todo se dibuja con código (sin imágenes externas). Se renderiza en un lienzo WebGL oculto y se copia a uno 2D. */
(function(){
  const T = window.THREE; const API = window.GIFTS3D = {ok: false};
  if(!T) return;
  let renderer;
  try{ renderer = new T.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'high-performance'}); }catch(e){ return; }
  if(!renderer || !renderer.getContext()) return;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
  const host = document.createElement('div'); host.id = 'gift3d';
  const gl = renderer.domElement; gl.style.display = 'none'; host.appendChild(gl);
  const cv = document.createElement('canvas'); cv.style.cssText = 'width:100%;height:100%;display:block;touch-action:none'; host.appendChild(cv);
  document.body.appendChild(host);
  const cx = cv.getContext('2d');

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(32, 1, .1, 60); camera.position.set(0, 0, 11);
  scene.add(new T.AmbientLight(0xffffff, .5));
  const key = new T.DirectionalLight(0xfff3e2, .62); key.position.set(3, 5, 7); scene.add(key);
  const fill = new T.DirectionalLight(0x9fe9f2, .32); fill.position.set(-5, 2, 4); scene.add(fill);
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

  function melodyFace(g, x, y, s){
    g.save(); g.translate(x, y); g.scale(s, s);
    g.strokeStyle = '#3a2a30'; g.lineWidth = 2.4;
    [[-27, -1], [27, 1]].forEach(([ex, sd]) => {
      g.fillStyle = '#f58fb4'; g.beginPath(); g.ellipse(ex, -44, 14, 36, sd*.22, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#ffc6da'; g.beginPath(); g.ellipse(ex, -42, 7, 25, sd*.22, 0, 7); g.fill();
    });
    g.fillStyle = '#f58fb4'; g.beginPath(); g.ellipse(0, 2, 46, 38, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, 7, 34, 27, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#2b2025'; g.beginPath(); g.arc(-13, 5, 3.4, 0, 7); g.arc(13, 5, 3.4, 0, 7); g.fill();
    g.fillStyle = '#ffc21a'; g.beginPath(); g.ellipse(0, 12, 4.4, 3.2, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,120,160,.55)'; g.beginPath(); g.arc(-22, 14, 5.5, 0, 7); g.arc(22, 14, 5.5, 0, 7); g.fill();
    g.fillStyle = '#ff4f86'; g.strokeStyle = '#b02a58'; g.lineWidth = 1.6;
    for(let i = 0; i < 5; i++){ const a = i*Math.PI*2/5; g.beginPath(); g.arc(-36 + Math.cos(a)*6, -20 + Math.sin(a)*6, 5.6, 0, 7); g.fill(); g.stroke(); }
    g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(-36, -20, 3.4, 0, 7); g.fill();
    g.restore();
  }

  /* ---------- 1. TERMO (largo, de 40 oz, con asa cuadrada) ---------- */
  function makeTermo(){
    const grp = new T.Group(), TOP = 3.0;
    const R = y => y < 1.25 ? .44 + .2*Math.sin(Math.min(1, y/1.25)*Math.PI/2) : .64 + .015*(y - 1.25)/1.75;     // angosto abajo y casi recto arriba
    const prof = [new T.Vector2(0, 0), new T.Vector2(.36, 0), new T.Vector2(.44, .05)];
    for(let y = .12; y <= TOP + .001; y += .1) prof.push(new T.Vector2(R(y), y));
    const pink = M(0xf590b8, .5, .02);
    grp.add(new T.Mesh(new T.LatheGeometry(prof, 56), pink));
    const band = new T.Mesh(new T.CylinderGeometry(R(TOP) + .012, R(TOP - .2) + .012, .22, 56, 1, true), M(0xe266ac, .4, .05, {side: T.DoubleSide})); band.position.y = TOP - .11; grp.add(band);
    const dec = tex(900, 760, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      const block = (txt, x, y, sz) => { g.font = '900 ' + sz + 'px Impact, "Arial Black", sans-serif'; g.textAlign = 'center';
        for(let d = 16; d > 0; d--){ g.fillStyle = d > 8 ? '#f08a66' : '#e0634a'; g.fillText(txt, x + d*.8, y + d); }
        g.fillStyle = '#a5dcec'; g.fillText(txt, x, y); g.lineWidth = 4; g.strokeStyle = '#f08a66'; g.strokeText(txt, x, y); };
      block('HELLO', 400, 300, 190); block('FRIENDS', 430, 490, 160);
      kittyFace(g, 700, 150, 1.1);
      g.fillStyle = '#e8456b'; g.font = 'italic 700 52px "Segoe Script", cursive'; g.save(); g.translate(740, 70); g.rotate(-.35); g.fillText('Smile', 0, 0); g.restore();
      const sp = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); for(let i = 0; i < 8; i++){ const a = i*Math.PI/4, rr = i%2 ? r*.22 : r; g.lineTo(x + Math.cos(a)*rr, y + Math.sin(a)*rr); } g.closePath(); g.fill(); };
      [[90, 120, 24, '#d9b3e8'], [200, 60, 16, '#f5c34d'], [830, 380, 22, '#d9b3e8'], [60, 420, 18, '#f5c34d'], [640, 600, 20, '#d9b3e8'], [420, 690, 16, '#f5c34d'], [850, 600, 14, '#f5c34d'], [110, 700, 16, '#d9b3e8']].forEach(a => sp(...a));
      /* Pompompurin */
      g.fillStyle = '#ffe27a'; g.strokeStyle = '#7a5a30'; g.lineWidth = 3; g.beginPath(); g.ellipse(150, 640, 70, 56, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#a06a3a'; g.beginPath(); g.ellipse(150, 590, 44, 20, 0, 0, 7); g.fill();
      g.fillStyle = '#3a2a30'; g.beginPath(); g.arc(128, 640, 4, 0, 7); g.arc(172, 640, 4, 0, 7); g.fill();
      /* Keroppi */
      g.fillStyle = '#8fd86a'; g.strokeStyle = '#3d7a2a'; g.beginPath(); g.ellipse(340, 650, 52, 40, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(320, 618, 17, 0, 7); g.arc(360, 618, 17, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#2b2025'; g.beginPath(); g.arc(322, 620, 6, 0, 7); g.arc(358, 620, 6, 0, 7); g.fill();
      /* arcoíris */
      ['#f08aa2', '#ffd36a', '#8fd6ea'].forEach((c, i) => { g.strokeStyle = c; g.lineWidth = 7; g.beginPath(); g.arc(560, 690, 46 - i*9, Math.PI, 0); g.stroke(); });
      heart(g, 760, 680, 1.1, '#ffd23a');
    });
    const dm = new T.Mesh(new T.CylinderGeometry(R(2.7) + .014, R(1.25) + .014, 1.45, 56, 1, true, -1.3, 2.6), M(0xffffff, .4, 0, {map: dec, transparent: true, side: T.FrontSide}));
    dm.position.y = 1.98; grp.add(dm);
    /* tapa transparente con tope rosa y popote */
    const lid = new T.Mesh(new T.CylinderGeometry(R(TOP) + .02, R(TOP) + .02, .3, 56), M(0xffffff, .1, 0, {transparent: true, opacity: .3})); lid.position.y = TOP + .15; grp.add(lid);
    const cap = new T.Mesh(new T.CylinderGeometry(R(TOP) - .06, R(TOP) - .02, .14, 56), M(0xe98fbf, .4)); cap.position.y = TOP + .35; grp.add(cap);
    const flip = new T.Mesh(new T.BoxGeometry(.34, .2, .3), M(0xe98fbf, .4)); flip.position.set(-.28, TOP + .5, 0); grp.add(flip);
    const straw = new T.Mesh(new T.CylinderGeometry(.05, .05, 1.35, 14), M(0xff7fb0, .3)); straw.position.set(.2, TOP + 1.05, 0); straw.rotation.z = -.07; grp.add(straw);
    const tip = new T.Mesh(new T.CylinderGeometry(.055, .05, .24, 14), M(0xff7fb0, .3)); tip.position.set(.28, TOP + 1.78, 0); tip.rotation.z = -.3; grp.add(tip);
    /* asa cuadrada */
    const hm = M(0xf8a9c6, .42, .05), hx = R(2.55) - .02, bar = (x0, y0, x1, y1) => { const m = new T.Mesh(new T.BoxGeometry(Math.abs(x1 - x0) + .17, Math.abs(y1 - y0) + .17, .2), hm); m.position.set((x0 + x1)/2, (y0 + y1)/2, 0); grp.add(m); };
    bar(hx, 2.55, hx + .62, 2.55); bar(hx + .62, 2.55, hx + .62, 1.5); bar(hx + .62, 1.5, R(1.5) - .02, 1.5);
    grp.position.y = -.2; const wrap = new T.Group(); wrap.add(grp); wrap.rotation.z = .03;
    return wrap;
  }

  /* ---------- 2. COBIJA doblada (My Melody) ---------- */
  function makeCobija(){
    const grp = new T.Group();
    const W = 2.0, H = 1.2, rad = .3;
    const sh = new T.Shape(); sh.moveTo(-W/2 + rad, -H/2); sh.lineTo(W/2 - rad, -H/2); sh.quadraticCurveTo(W/2, -H/2, W/2, -H/2 + rad); sh.lineTo(W/2, H/2 - rad); sh.quadraticCurveTo(W/2, H/2, W/2 - rad, H/2);
    sh.lineTo(-W/2 + rad, H/2); sh.quadraticCurveTo(-W/2, H/2, -W/2, H/2 - rad); sh.lineTo(-W/2, -H/2 + rad); sh.quadraticCurveTo(-W/2, -H/2, -W/2 + rad, -H/2);
    const geo = new T.ExtrudeGeometry(sh, {depth: .62, bevelEnabled: true, bevelThickness: .17, bevelSize: .14, bevelSegments: 8, curveSegments: 10});
    geo.translate(0, 0, -.31);
    const chk = tex(256, 256, (g, w, h) => { g.fillStyle = '#fff6f9'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(247,170,198,.62)'; g.fillRect(0, 0, w/2, h/2); g.fillRect(w/2, h/2, w/2, h/2); });
    chk.wrapS = chk.wrapT = T.RepeatWrapping; chk.repeat.set(2.2, 2.2);
    grp.add(new T.Mesh(geo, M(0xffe3ee, .95, 0, {map: chk})));
    const front = tex(1024, 640, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.fillStyle = '#ffd23a'; g.strokeStyle = '#2b2025'; g.lineWidth = 6;
      g.beginPath(); g.arc(160, 170, 76, 0, 7); g.fill(); g.stroke();
      for(let i = 0; i < 12; i++){ const a = i*Math.PI/6; g.beginPath(); g.moveTo(160 + Math.cos(a)*86, 170 + Math.sin(a)*86); g.lineTo(160 + Math.cos(a + .13)*120, 170 + Math.sin(a + .13)*120); g.lineTo(160 + Math.cos(a - .13)*120, 170 + Math.sin(a - .13)*120); g.closePath(); g.fill(); g.stroke(); }
      melodyFace(g, 560, 250, 2.5); shell(g, 880, 120, 2.0, '#ffd23a', '#2b2025'); shell(g, 780, 470, 1.6, '#ffd23a', '#2b2025'); shell(g, 130, 500, 1.7, '#ffd23a', '#2b2025');
      heart(g, 330, 480, 2.4, '#ff3f86', '#2b2025'); heart(g, 960, 330, 1.6, '#ff3f86', '#2b2025'); heart(g, 430, 80, 1.2, '#ff3f86', '#2b2025');
    });
    const decal = new T.Mesh(new T.PlaneGeometry(W + .04, H + .04), new T.MeshBasicMaterial({map: front, transparent: true})); decal.position.z = .31 + .17 + .002; grp.add(decal);
    const decalB = decal.clone(); decalB.rotation.y = Math.PI; decalB.position.z = -decal.position.z; grp.add(decalB);
    const band = new T.Mesh(new T.BoxGeometry(.34, H + .46, .62 + .46), M(0xffffff, .8)); band.position.x = .55; grp.add(band);
    const strap = new T.Mesh(new T.TorusGeometry(.3, .04, 10, 32, Math.PI), M(0xffffff, .7)); strap.position.set(.55, H/2 + .22, 0); strap.scale.set(1, .8, 1); grp.add(strap);
    const lab = tex(300, 400, (g, w, h) => {
      g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#f08aa2'; g.fillRect(0, 0, w, 90);
      g.fillStyle = '#fff'; for(let i = 0; i < 12; i++){ g.beginPath(); g.arc(12 + i*24, 6, 6, 0, 7); g.fill(); }
      g.fillStyle = '#fff'; g.font = '700 26px Arial'; g.textAlign = 'center'; g.fillText('MY MELODY', w/2, 40); g.fillText('AND FRIENDS', w/2, 70);
      g.fillStyle = '#e8d6e0'; g.fillRect(24, 110, w - 48, 150); melodyFace(g, w/2, 195, 1.15);
      g.fillStyle = '#2c9a8c'; g.fillRect(0, 290, w, 110); g.fillStyle = '#fff'; g.font = '700 30px Arial'; g.fillText('Frazada', w/2, 330);
      g.fillStyle = '#fff'; g.fillRect(190, 345, 90, 40); g.fillStyle = '#222'; for(let i = 0; i < 18; i++) g.fillRect(194 + i*4.8, 349, i%3 ? 2 : 3, 32);
    });
    const label = new T.Mesh(new T.PlaneGeometry(.78, 1.04), M(0xffffff, .7, 0, {map: lab})); label.position.set(-.3, -.12, .31 + .17 + .34 + .02); label.rotation.z = .05; grp.add(label);
    const labB = new T.Mesh(new T.BoxGeometry(.8, 1.06, .02), M(0xffffff, .7)); labB.position.copy(label.position); labB.position.z -= .012; labB.rotation.z = .05; grp.add(labB);
    grp.rotation.x = -.18; const wrap = new T.Group(); wrap.add(grp);
    return wrap;
  }

  /* ---------- 3. WAFFLERA en su caja de Hello Kitty ---------- */
  function makeWafflera(){
    const grp = new T.Group();
    const BW = 1.9, BH = 2.05, BD = 1.3;
    const grid = (g, w, h, step) => { g.strokeStyle = '#efd2d9'; g.lineWidth = 2; for(let x = 0; x <= w; x += step){ g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for(let y = 0; y <= h; y += step){ g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } };
    const bow = (g, x, y, s, a) => { g.save(); g.translate(x, y); g.rotate(a || 0); g.scale(s, s); g.fillStyle = '#e8708f'; g.strokeStyle = '#b8486a'; g.lineWidth = 3;
      g.beginPath(); g.ellipse(-26, 0, 28, 20, -.25, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(26, 0, 28, 20, .25, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#f59ab3'; g.beginPath(); g.arc(0, 0, 12, 0, 7); g.fill(); g.stroke(); g.restore(); };
    const wafflerOpen = (g, x, y, s) => { g.save(); g.translate(x, y); g.scale(s, s);
      g.fillStyle = '#3d3d44'; g.beginPath(); g.ellipse(0, -60, 78, 66, 0, 0, 7); g.fill(); g.strokeStyle = '#26262b'; g.lineWidth = 3; g.stroke();
      g.strokeStyle = '#50505a'; g.lineWidth = 2; for(let i = -5; i <= 5; i++){ g.beginPath(); g.moveTo(i*13, -118); g.lineTo(i*13, -4); g.stroke(); g.beginPath(); g.moveTo(-72, i*10 - 60); g.lineTo(72, i*10 - 60); g.stroke(); }
      g.fillStyle = '#f2e6d0'; g.beginPath(); g.ellipse(0, 52, 92, 34, 0, 0, 7); g.fill();
      g.fillStyle = '#d98a3a'; g.beginPath(); g.ellipse(0, 46, 72, 24, 0, 0, 7); g.fill(); g.strokeStyle = '#b06a22'; g.lineWidth = 2; for(let i = -5; i <= 5; i++){ g.beginPath(); g.moveTo(i*12, 26); g.lineTo(i*12, 66); g.stroke(); }
      g.restore(); };
    const front = tex(700, 760, (g, w, h) => {
      g.fillStyle = '#fffdfb'; g.fillRect(0, 0, w, h);
      const pg = g.createLinearGradient(0, 560, 0, h); pg.addColorStop(0, 'rgba(250,222,230,0)'); pg.addColorStop(1, 'rgba(250,212,224,1)'); g.fillStyle = pg; g.fillRect(0, 560, w, h - 560);
      /* etiqueta cuadriculada */
      g.fillStyle = '#fbf4e6'; g.fillRect(40, 40, 400, 120); g.save(); g.beginPath(); g.rect(40, 40, 400, 120); g.clip(); g.translate(40, 40); grid(g, 400, 120, 28); g.restore();
      g.fillStyle = '#9c3f2c'; g.font = '700 74px "Segoe Print", "Comic Sans MS", cursive'; g.textAlign = 'center'; g.fillText('HELLO KITTY', 240, 128);
      bow(g, 570, 100, 1.1, .2);
      /* la wafflera cerrada */
      g.fillStyle = '#ecdcbc'; g.strokeStyle = '#a89468'; g.lineWidth = 6; g.beginPath(); g.ellipse(270, 400, 210, 160, 0, 0, 7); g.fill(); g.stroke();
      const lg = g.createRadialGradient(250, 360, 20, 270, 390, 190); lg.addColorStop(0, '#e6def6'); lg.addColorStop(1, '#a798cc'); g.fillStyle = lg; g.beginPath(); g.ellipse(270, 390, 176, 124, 0, 0, 7); g.fill();
      g.fillStyle = '#e04050'; g.beginPath(); g.ellipse(235, 285, 15, 8, 0, 0, 7); g.fill(); g.fillStyle = '#3fb070'; g.beginPath(); g.ellipse(265, 285, 15, 8, 0, 0, 7); g.fill();
      g.strokeStyle = '#f08aa8'; g.lineWidth = 3; g.beginPath(); g.ellipse(270, 400, 38, 28, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(236, 380); g.lineTo(226, 350); g.lineTo(252, 366); g.moveTo(304, 380); g.lineTo(314, 350); g.lineTo(288, 366); g.stroke(); bow(g, 322, 372, .4, .2);
      g.strokeStyle = '#4a3a3a'; g.lineWidth = 5; g.beginPath(); g.moveTo(110, 485); g.lineTo(430, 485); g.stroke();
      /* iconos de características */
      [['Placas', 'antiadherentes'], ['Waffles de', '18 cm'], ['Fácil de', 'limpiar']].forEach((t, i) => {
        const y = 290 + i*118; g.strokeStyle = '#f0b9c6'; g.lineWidth = 3; g.fillStyle = '#fff'; g.beginPath(); g.arc(610, y, 32, 0, 7); g.fill(); g.stroke();
        g.fillStyle = '#e6a0b0'; g.beginPath(); g.arc(610, y, 14, 0, 7); g.fill();
        g.fillStyle = '#7a5a60'; g.font = '600 15px Arial'; g.textAlign = 'center'; g.fillText(t[0], 610, y + 52); g.fillText(t[1], 610, y + 69); });
      /* foto del waffle */
      g.fillStyle = '#2d2020'; g.fillRect(34, 568, 150, 112); g.fillStyle = '#e8a050'; g.beginPath(); g.ellipse(109, 626, 58, 38, 0, 0, 7); g.fill(); g.strokeStyle = '#b87020'; g.lineWidth = 2; for(let i = -3; i <= 3; i++){ g.beginPath(); g.moveTo(109 + i*16, 592); g.lineTo(109 + i*16, 660); g.stroke(); }
      g.fillStyle = '#f9d6de'; g.fillRect(0, 700, w, 60); g.fillStyle = '#8a5a66'; g.font = '700 28px Arial'; g.textAlign = 'right'; g.fillText('Wafflera Eléctrica', w - 30, 740);
    });
    const sideR = tex(480, 760, (g, w, h) => {
      g.fillStyle = '#fffdfb'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#f4d6de'; g.lineWidth = 3; for(let i = 0; i < 4; i++){ bow(g, 90 + (i%2)*200, 100 + i*160, .8, .2*(i%2 ? 1 : -1)); }
      g.fillStyle = '#fff'; g.strokeStyle = '#f08aa8'; g.lineWidth = 4; g.beginPath(); g.rect(40, 130, 400, 500); g.fill(); g.stroke();
      wafflerOpen(g, 250, 340, 1.5);
      g.fillStyle = '#f7c6d2'; g.fillRect(60, 160, 170, 110); g.fillStyle = '#7a4a52'; g.font = '600 18px Arial'; g.textAlign = 'center'; ['Waffles', 'crujientes por', 'fuera y suaves', 'por dentro en', 'minutos'].forEach((t, i) => g.fillText(t, 145, 188 + i*21));
      kittyFace(g, 110, 580, .85);
      g.fillStyle = '#f9d6de'; g.fillRect(0, 690, w, 70);
    });
    const sideL = tex(480, 760, (g, w, h) => { g.fillStyle = '#fffdfb'; g.fillRect(0, 0, w, h); for(let i = 0; i < 5; i++){ bow(g, 120 + (i%2)*220, 90 + i*150, .9, i%2 ? .2 : -.2); } g.fillStyle = '#f9d6de'; g.fillRect(0, 690, w, 70); });
    const top = tex(700, 480, (g, w, h) => { g.fillStyle = '#fffdfb'; g.fillRect(0, 0, w, h); for(let i = 0; i < 4; i++){ bow(g, 120 + i*150, 120 + (i%2)*150, 1.1, .2); } g.fillStyle = '#9c3f2c'; g.font = '700 56px "Segoe Print", "Comic Sans MS", cursive'; g.textAlign = 'center'; g.fillText('HELLO KITTY', w/2, h/2 + 20); });
    const back = tex(700, 760, (g, w, h) => { g.fillStyle = '#fffdfb'; g.fillRect(0, 0, w, h); bow(g, 350, 300, 2.2, .1); g.fillStyle = '#f9d6de'; g.fillRect(0, 700, w, 60); });
    const m = t => M(0xffffff, .55, 0, {map: t});
    const box = new T.Mesh(new T.BoxGeometry(BW, BH, BD), [m(sideR), m(sideL), m(top), M(0xf6e1e6, .6), m(front), m(back)]);
    grp.add(box);
    grp.rotation.x = -.1; const wrap = new T.Group(); wrap.add(grp);
    return wrap;
  }

  /* ---------- 4. CAJA azul de joyería (BAIMUDA) con collar, pulsera y anillo ---------- */
  function makeCaja(){
    const SW = 2.0, SH = .78, SD = 2.0, TH = .64, TW = SW - .14, TD = SD - .04;
    const slate = M(0x4d5a6b, .96, 0), slateD = M(0x3b4656, .96, 0);
    const logo = tex(512, 512, (g, w, h) => {
      g.fillStyle = '#4d5a6b'; g.fillRect(0, 0, w, h);
      for(let i = 0; i < 2600; i++){ g.fillStyle = 'rgba(' + (i%2 ? '255,255,255' : '0,0,0') + ',.035)'; g.fillRect(Math.random()*w, Math.random()*h, 2, 2); }
      g.fillStyle = '#d4c49a'; g.textAlign = 'center'; g.font = '700 150px Georgia, serif'; g.fillText('BMD', w/2, h/2 - 6);
      g.font = '600 38px Georgia, serif'; g.fillText('B A I M U D A', w/2, h/2 + 52);
      g.strokeStyle = '#d4c49a'; g.lineWidth = 3; g.beginPath(); g.moveTo(w/2 - 70, h/2 + 82); g.lineTo(w/2 + 70, h/2 + 82); g.stroke();
      g.beginPath(); g.moveTo(w/2 - 24, h/2 - 124); g.lineTo(w/2 - 14, h/2 - 148); g.lineTo(w/2, h/2 - 130); g.lineTo(w/2 + 14, h/2 - 148); g.lineTo(w/2 + 24, h/2 - 124); g.closePath(); g.stroke();
    });
    const root = new T.Group(), sleeve = new T.Group(), tray = new T.Group();
    const top = new T.Mesh(new T.BoxGeometry(SW, .05, SD), [slate, slate, M(0xffffff, .9, 0, {map: logo}), slate, slate, slate]); top.position.y = SH/2 - .025; sleeve.add(top);
    const bot = new T.Mesh(new T.BoxGeometry(SW, .05, SD), slateD); bot.position.y = -SH/2 + .025; sleeve.add(bot);
    [-1, 1].forEach(s => { const w = new T.Mesh(new T.BoxGeometry(.05, SH, SD), slate); w.position.x = s*(SW/2 - .025); sleeve.add(w); });
    root.add(sleeve);
    const fl = new T.Mesh(new T.BoxGeometry(TW, .06, TD), slateD); fl.position.y = -TH/2 + .03; tray.add(fl);
    [-1, 1].forEach(s => { const w = new T.Mesh(new T.BoxGeometry(.05, TH, TD), slate); w.position.x = s*(TW/2 - .025); tray.add(w); });
    const bw = new T.Mesh(new T.BoxGeometry(TW, TH, .05), slate); bw.position.z = -(TD/2 - .025); tray.add(bw);
    const fw = new T.Mesh(new T.BoxGeometry(TW, TH, .05), slate); fw.position.z = TD/2 - .025; tray.add(fw);
    const vel = new T.Mesh(new T.BoxGeometry(TW - .1, .02, TD - .1), M(0x0d0d11, 1, 0)); vel.position.y = -TH/2 + .07; tray.add(vel);
    const tab = new T.Mesh(new T.BoxGeometry(.17, .24, .035), M(0x1f3fd8, .45, 0, {emissive: 0x0a1a66, emissiveIntensity: .35})); tab.position.set(0, -TH/2 + .2, TD/2 + .012); tray.add(tab);
    /* reflejos: un cielo de estudio con luces suaves que hace brillar el metal y destellar las piedras */
    const env = (() => {
      const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
      const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#dfe6f0'); gr.addColorStop(.45, '#8fa0b4'); gr.addColorStop(.52, '#6a7078'); gr.addColorStop(1, '#14100e'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
      g.fillStyle = '#fff'; [[40, 30, 90, 26], [170, 60, 60, 40], [300, 20, 120, 24], [430, 70, 50, 50], [250, 100, 40, 14], [90, 110, 70, 12], [380, 118, 70, 10]].forEach(r => g.fillRect(...r));
      g.fillStyle = '#ffd9a0'; g.fillRect(210, 40, 30, 60); g.fillRect(470, 20, 30, 30);
      const t = new T.CanvasTexture(c); t.mapping = T.EquirectangularReflectionMapping;
      try{ const pm = new T.PMREMGenerator(renderer); const r = pm.fromEquirectangular(t).texture; pm.dispose(); return r; }catch(e){ return null; }
    })();
    const MM = (c, r, m, k, extra) => { const mt = M(c, r, m, Object.assign({}, extra || {})); if(env){ mt.envMap = env; mt.envMapIntensity = k; } return mt; };
    const y0 = -TH/2 + .08;
    const gold = MM(0xe0b04e, .3, .85, .9), champ = MM(0xdcd3c2, .3, .85, 1.0), silver = MM(0xe6eaf0, .25, .9, 1.0);
    const glow = [];
    const clear = () => { const m = MM(0xd5deee, .02, 0, .55, {transparent: true, opacity: .8, flatShading: true, emissive: 0x6f7ca5, emissiveIntensity: .1}); m.userData.b = .1; glow.push(m); return m; };
    const colorGem = c => { const m = MM(c, .04, .1, 1.3, {flatShading: true, emissive: c, emissiveIntensity: .3}); m.userData.b = .3; glow.push(m); return m; };
    const jew = new T.Group(); jew.position.y = y0; tray.add(jew);
    const neck = new T.Group(); jew.add(neck);      // el collar es un grupo aparte para poder levantarlo al tocarlo
    /* collar: cadena fina de plata (eslabones planos) y dije de corazón de cristal con flecha */
    const curve = new T.CatmullRomCurve3([[-.8, -.62], [-.56, -.4], [-.32, -.2], [-.12, -.09], [0, -.075], [.12, -.09], [.32, -.2], [.56, -.4], [.8, -.62]].map(p => new T.Vector3(p[0], .012, p[1])));
    const lgeo = new T.TorusGeometry(.02, .006, 5, 10);
    { const N = 91, inst = new T.InstancedMesh(lgeo, champ, N), d = new T.Object3D();      // una sola pieza instanciada: un solo dibujo en vez de 91
      for(let i = 0; i < N; i++){ const u = i/(N - 1), p = curve.getPoint(u), tg = curve.getTangent(u); d.position.copy(p); d.rotation.set(0, 0, 0); d.scale.set(1.4, 1, .7); d.lookAt(p.clone().add(tg)); d.rotateY(Math.PI/2); if(i%2) d.rotateX(Math.PI/2); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); }
      inst.instanceMatrix.needsUpdate = true; neck.add(inst); }
    const pend = new T.Group(); pend.position.set(0, 0, .13); neck.add(pend);
    const hs = new T.Shape(); hs.moveTo(0, -.14); hs.bezierCurveTo(-.2, -.01, -.16, .17, 0, .09); hs.bezierCurveTo(.16, .17, .2, -.01, 0, -.14);
    const heart = new T.Mesh(new T.ExtrudeGeometry(hs, {depth: .03, bevelEnabled: true, bevelThickness: .035, bevelSize: .02, bevelSegments: 1}), clear()); heart.rotation.x = -Math.PI/2; heart.position.y = .025; pend.add(heart);
    const table = new T.Mesh(new T.ExtrudeGeometry(hs, {depth: .01, bevelEnabled: true, bevelThickness: .015, bevelSize: .01, bevelSegments: 1}), clear()); table.scale.setScalar(.62); table.rotation.x = -Math.PI/2; table.position.set(0, .088, -.012); pend.add(table);
    const rim = new T.Mesh(new T.ExtrudeGeometry(hs, {depth: .02, bevelEnabled: false}), silver); rim.scale.set(1.22, 1.22, 1); rim.rotation.x = -Math.PI/2; rim.position.y = .004; pend.add(rim);
    [[-.15, .0], [.15, .0], [0, -.16], [-.07, .15], [.07, .15]].forEach(([x, z]) => { const pr = new T.Mesh(new T.SphereGeometry(.014, 6, 5), silver); pr.position.set(x, .075, z); pend.add(pr); });
    const bail = new T.Mesh(new T.TorusGeometry(.042, .01, 6, 14), silver); bail.rotation.x = Math.PI/2; bail.scale.set(.65, 1.3, 1); bail.position.set(0, .035, -.2); pend.add(bail);
    const arrow = new T.Group(); arrow.position.set(0, .105, 0); arrow.rotation.y = .62; pend.add(arrow);
    arrow.add(new T.Mesh(new T.CylinderGeometry(.007, .007, .5, 6), silver)); arrow.children[0].rotation.z = Math.PI/2;
    const head = new T.Mesh(new T.ConeGeometry(.034, .1, 4), silver); head.rotation.z = Math.PI/2; head.position.x = -.3; arrow.add(head);
    [-1, 1].forEach(sd => [.22, .29].forEach(x => { const f = new T.Mesh(new T.BoxGeometry(.1, .006, .028), silver); f.position.set(x, 0, sd*.02); f.rotation.y = sd*.55; arrow.add(f); }));
    /* pulsera dorada: ramillete de piedras (margaritas blancas, verde, morada, roja, amarilla, rosa), corazón blanco y eslabones de florecitas */
    const br = new T.Group(); br.position.set(-.6, 0, .4); jew.add(br);
    const daisy = (mat, r) => { const d = new T.Group(); for(let i = 0; i < 8; i++){ const a = i*Math.PI/4, pt = new T.Mesh(new T.SphereGeometry(r*.42, 6, 5), mat); pt.position.set(Math.cos(a)*r*.62, 0, Math.sin(a)*r*.62); pt.scale.y = .6; d.add(pt); } const ct = new T.Mesh(new T.SphereGeometry(r*.42, 8, 6), mat); ct.scale.y = .7; d.add(ct); return d; };
    const wh = clear(), cl = [[wh, 0, 0, .1, true], [wh, .1, .07, .085, true], [colorGem(0x7fc23f), .0, .13, .07, false], [colorGem(0x8a4fd2), -.08, .1, .06, false], [colorGem(0xe33232), .1, -.06, .065, false], [colorGem(0xffd23a), -.1, -.04, .085, true], [colorGem(0xff8fb8), .0, -.12, .06, true], [wh, -.12, .16, .07, true]];
    cl.forEach(([m, x, z, r, dz]) => { const base = new T.Mesh(new T.CylinderGeometry(r*1.15, r*1.15, .018, 14), gold); base.position.set(x, .012, z); br.add(base); const g = dz ? daisy(m, r) : new T.Mesh(new T.IcosahedronGeometry(r*.62, 1), m); g.position.set(x, .04, z); if(!dz) g.scale.y = .7; br.add(g); });
    const bh = new T.Mesh(new T.ExtrudeGeometry(hs, {depth: .02, bevelEnabled: true, bevelThickness: .015, bevelSize: .01, bevelSegments: 1}), clear()); bh.scale.setScalar(.34); bh.rotation.x = -Math.PI/2; bh.rotation.z = Math.PI/2; bh.position.set(.24, .025, 0); br.add(bh);
    const flower = (x, z) => { const f = new T.Group(); for(let i = 0; i < 5; i++){ const a = i*Math.PI*2/5, pt = new T.Mesh(new T.SphereGeometry(1, 8, 6), gold); pt.scale.set(.034, .012, .02); pt.position.set(Math.cos(a)*.032, 0, Math.sin(a)*.032); pt.rotation.y = -a; f.add(pt); } const c0 = new T.Mesh(new T.TorusGeometry(.012, .006, 5, 8), gold); c0.rotation.x = Math.PI/2; f.add(c0); f.position.set(x, .02, z); return f; };
    for(let i = 0; i < 8; i++){
      const x = .36 + i*.07, z = Math.sin(i*.35)*.035;
      br.add(flower(x, z));
      const bar = new T.Mesh(new T.BoxGeometry(.05, .012, .01), gold); bar.position.set(x + .05, .02, z); br.add(bar);
      if(i % 2) [-1, 1].forEach(sd => { const l = new T.Mesh(new T.SphereGeometry(1, 8, 6), gold); l.scale.set(.034, .01, .016); l.position.set(x + .05, .02, z + sd*.02); l.rotation.y = sd*.7; br.add(l); });
    }
    const cp = new T.Mesh(new T.TorusGeometry(.03, .008, 6, 14), gold); cp.rotation.x = Math.PI/2; cp.position.set(.96, .02, .02); br.add(cp);
    /* anillo de plata: piedra rectangular de corte esmeralda (escalonada) en una canasta de cuatro garras, banda con piedritas */
    const ring = new T.Group(); ring.position.set(0, .05, -.78); ring.rotation.set(0, -Math.PI/2, Math.PI/2); ring.scale.set(1.05, .76, 1.05); jew.add(ring);      // tumbado, con la piedra metida bajo la tapa: solo se asoma un poco
    const band = new T.Mesh(new T.TorusGeometry(.2, .024, 10, 40), silver); band.rotation.y = Math.PI/2; ring.add(band);
    const oct = (a, b, c) => { const e = new T.Shape(); e.moveTo(-a + c, -b); e.lineTo(a - c, -b); e.lineTo(a, -b + c); e.lineTo(a, b - c); e.lineTo(a - c, b); e.lineTo(-a + c, b); e.lineTo(-a, b - c); e.lineTo(-a, -b + c); e.closePath(); return e; };
    const stm = clear();
    [[.135, .1, .04, .05, .235], [.11, .078, .034, .04, .285], [.082, .052, .028, .035, .325]].forEach(([a, b, c, d, y]) => { const st = new T.Mesh(new T.ExtrudeGeometry(oct(a, b, c), {depth: d, bevelEnabled: true, bevelThickness: .008, bevelSize: .006, bevelSegments: 1}), stm); st.rotation.x = -Math.PI/2; st.rotation.z = Math.PI/2; st.position.y = y; ring.add(st); });
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => { const pr = new T.Mesh(new T.CylinderGeometry(.008, .013, .14, 6), silver); pr.position.set(sx*.11, .27, sz*.085); pr.rotation.z = -sx*.1; pr.rotation.x = sz*.1; ring.add(pr); const tp = new T.Mesh(new T.SphereGeometry(.014, 6, 5), silver); tp.position.set(sx*.1, .335, sz*.075); ring.add(tp); });
    const gal = new T.Mesh(new T.BoxGeometry(.26, .02, .02), silver); gal.position.set(0, .215, 0); ring.add(gal);
    { const pvm = clear(), inst = new T.InstancedMesh(new T.SphereGeometry(.0105, 6, 5), pvm, 30), d = new T.Object3D(); let k = 0;
      for(let i = 0; i < 15; i++) [-1, 1].forEach(sd => { const t = (i - 7)/7*1.1; d.position.set(sd*.022, Math.cos(t)*.2, Math.sin(t)*.2); d.updateMatrix(); inst.setMatrixAt(k++, d.matrix); });
      inst.instanceMatrix.needsUpdate = true; ring.add(inst); }
    ring.children.forEach(ch => { if(ch !== band && !ch.isInstancedMesh) ch.visible = false; });      // la piedra y las garras apuntan hacia la pared de atrás: no se dibujan para que nada sobresalga de la caja
    /* zonas invisibles para tocar el collar, la pulsera y el anillo */
    const proxies = [], proxy = (name, geo, x, y, z) => { const m = new T.Mesh(geo, new T.MeshBasicMaterial({visible: false})); m.position.set(x, y, z); m.userData.item = name; jew.add(m); proxies.push(m); };
    proxy('collar', new T.BoxGeometry(1.9, .5, 1.0), 0, 0, -.25); proxy('pulsera', new T.BoxGeometry(1.3, .4, .45), -.1, 0, .42); proxy("anillo", new T.SphereGeometry(.38, 8, 6), 0, .05, -.75);
    root.userData.neck = neck; root.userData.br = br; root.userData.ring = ring; root.userData.proxies = proxies; root.userData.jew = jew; root.userData.lifts = {collar: {v: 0, t: 0}, pulsera: {v: 0, t: 0}};
    root.add(tray);
    const OPEN = 1.75; root.userData.setOpen = (u, tilt) => { tray.position.z = OPEN*u; root.position.z = -OPEN*u*.5; };
    root.userData.tick = now => glow.forEach((m, i) => { m.emissiveIntensity = (m.userData.b || .35)*(.75 + .5*Math.sin(now/260 + i*1.3)); });
    root.userData.rx0 = .32; root.userData.rx1 = .95; root.userData.openable = true;
    const pivot = new T.Group(); pivot.add(root); const wrap = new T.Group(); wrap.add(pivot); wrap.userData.root = root;
    return wrap;
  }

  const makers = [makeTermo, makeCobija, makeWafflera, makeCaja];
  const models = [];
  let closing = false, closeT0 = 0, resClose = null, shakeT = -9999, bandB = 9999, fN = 0, rotX = 0, opened = false, opening = false, openT0 = 0, os0 = 0, resOpen = null, frz = null, exitY = 0, clipOn = false, cur = null, state = 'idle', t0 = 0, from = null, to = null, spin = 0, dragX = 0, dragV = 0, drag = false, lastX = 0, alpha = 1, clipY = 0;
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
  let tx0 = 0, ty0 = 0, tt0 = 0, tmv = 0;
  host.addEventListener('pointerdown', e => { tx0 = e.clientX; ty0 = e.clientY; tt0 = performance.now(); tmv = 0; });
  host.addEventListener('pointermove', e => { tmv = Math.max(tmv, Math.hypot(e.clientX - tx0, e.clientY - ty0)); });
  host.addEventListener('pointerup', e => {                         // un toque sobre el regalo pasa al siguiente
    if(state !== 'shown' || tmv > 10 || performance.now() - tt0 > 600 || !API.onTap) return;
    try{ const k = cv.width/W, d = cx.getImageData(Math.max(0, e.clientX*k - 14), Math.max(0, e.clientY*k - 14), 28, 28).data; let hit = false; for(let i = 3; i < d.length; i += 4) if(d[i] > 30){ hit = true; break; } if(!hit) return; }catch(_){}
    const f = API.onTap; API.onTap = null; f();
  });
  const up = () => { drag = false; }; host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);

  function frame(now){
    requestAnimationFrame(frame);
    if(state === 'idle' || !cur) return;
    if(state === 'shown' && (fN++ & 1)) return;      // con el regalo ya a la vista se dibuja a 30 cuadros: menos calor y más fluidez
    const t = now - t0;
    if(state === 'rising'){
      const k = Math.min(1, t/2400), b = cur.userData.base;
      if(k < .42){                                                  // sube dentro de la bolsa, recortado por su boca
        const u = ease(k/.42); cur.position.set(from.x, from.y + (exitY - from.y)*u, 0); cur.scale.setScalar(.5*b); clipOn = true;
        spin += .02; cur.rotation.y = spin; cur.rotation.z = 0; cur.rotation.x = rotX;
      } else {                                                      // ya afuera: se va al centro y crece
        const u = ease((k - .42)/.58), v = back(Math.min(1, (k - .42)/.58*1.02)); clipOn = false;
        cur.position.set(from.x + (to.x - from.x)*u, exitY + (to.y - exitY)*v, 0); cur.scale.setScalar((.5 + .5*u)*b);
        spin += .02*(1 - u); cur.rotation.y = spin + (1 - u)*1.2; cur.rotation.z = Math.sin(k*5)*.1*(1 - k); cur.rotation.x = rotX;
      }
      if(k >= 1){ state = 'shown'; clipOn = false; API._res && API._res(); }
    } else if(state === 'shown'){
      const ud = cur.userData, root = ud.root;
      if(root && root.userData.tick) root.userData.tick(now);
      if(closing){                                                  // la caja se cierra: el cajón entra y vuelve a girar
        const k = Math.min(1, (now - closeT0)/1500), e = ease(k); root.userData.setOpen(1 - e); rotX = root.userData.rx1 + (root.userData.rx0 - root.userData.rx1)*e; cur.scale.setScalar(ud.base*(1 - .14*(1 - e)));
        if(k >= 1){ closing = false; opened = false; frz = null; resClose && resClose(); }
      } else if(opening){                                                  // la caja se endereza hacia ti y el cajón se desliza
        const k = Math.min(1, (now - openT0)/2000), e1 = ease(Math.min(1, k/.5)), e2 = ease(Math.max(0, (k - .3)/.7));
        spin = os0*(1 - e1); rotX = root.userData.rx0 + (root.userData.rx1 - root.userData.rx0)*e1; root.userData.setOpen(e2);
        cur.scale.setScalar(ud.base*(1 - .14*e2));
        if(k >= 1){ opening = false; opened = true; resOpen && resOpen(); }
      } else if(opened){ if(!drag){ dragV *= .94; } spin += dragV; }
      else if(frz !== null) spin = frz; else if(!drag){ dragV *= .94; spin += .008 + dragV; }
      if(root && root.userData.lifts){                              // el collar y la pulsera se levantan al tocarlos; el anillo se sacude
        const J = root.userData, L = J.lifts; L.collar.v += (L.collar.t - L.collar.v)*.16; L.pulsera.v += (L.pulsera.t - L.pulsera.v)*.16;
        J.neck.position.y = L.collar.v*.45; J.neck.scale.setScalar(1 + .1*L.collar.v);
        J.br.position.set(-.6, L.pulsera.v*.7, .4 + L.pulsera.v*.45); J.br.rotation.x = -L.pulsera.v*.75; J.br.scale.setScalar(1 + .22*L.pulsera.v);
        const sk = Math.max(0, 1 - (now - shakeT)/650); J.ring.position.x = Math.sin((now - shakeT)/38)*.06*sk;
      }
      cur.rotation.x = rotX; cur.rotation.y = spin + (opened ? Math.sin(now/1500)*.06 : 0); cur.rotation.z = Math.sin(now/900)*.03; cur.position.y = to.y + Math.sin(now/700)*.06; cur.position.x = to.x;
    } else if(state === 'sinking'){                                  // la caja vuelve a la bolsa: baja al centro de la boca y se mete recortada
      const k = Math.min(1, t/1700), b = cur.userData.base;
      if(k < .55){ const u = ease(k/.55); cur.position.set(to.x + (from.x - to.x)*u, to.y + (exitY - to.y)*u, 0); cur.scale.setScalar((1 - .5*u)*b); clipOn = false; }
      else { const u = ease((k - .55)/.45); cur.position.set(from.x, exitY + (from.y - exitY)*u, 0); cur.scale.setScalar(.5*b); clipOn = true; }
      spin += .025; cur.rotation.y = spin; cur.rotation.x = rotX; cur.rotation.z = 0;
      if(k >= 1){ scene.remove(cur); cur = null; clipOn = false; state = 'idle'; host.classList.remove('on'); API._res && API._res(); }
    } else if(state === 'leaving'){
      const k = Math.min(1, t/900), e = k*k; cur.position.y = to.y + e*3.4; spin += .05; cur.rotation.y = spin; cur.scale.setScalar(cur.userData.base*(1 + .3*e)); alpha = 1 - k;
      if(k >= 1){ scene.remove(cur); cur = null; clipOn = false; state = 'idle'; host.classList.remove('on'); API._res && API._res(); }
    }
    renderer.render(scene, camera);
    cx.clearRect(0, 0, cv.width, cv.height); cx.globalAlpha = Math.max(0, alpha);
    const pr = renderer.getPixelRatio(), sh = Math.max(1, Math.min(cv.height, Math.round((clipOn && clipY ? Math.min(clipY, bandB) : bandB)*pr)));      // solo se copia la franja donde está el regalo
    cx.drawImage(gl, 0, 0, cv.width, sh, 0, 0, cv.width, sh);
  }
  requestAnimationFrame(frame);

  API.ok = true;
  /* sale de la bolsa: mouth = {x, y} en píxeles (la boca de la bolsa); target = {x, y} dónde se queda */
  function getModel(i){
    if(!models[i]){
      const m = makers[i](), bb = new T.Box3().setFromObject(m), c = bb.getCenter(new T.Vector3()), sz = bb.getSize(new T.Vector3());
      m.children[0].position.sub(c); m.userData.h = sz.y; m.userData.w = Math.max(sz.x, sz.z); models[i] = m;      // el centro del regalo queda en el origen
    }
    return models[i];
  }
  /* precalienta un regalo cuando no se ve: se arma y se sube a la tarjeta gráfica antes de que salga de la bolsa (así no hay tirón al aparecer) */
  API.prep = i => { try{ if(state !== 'idle') return; resize(); const m = getModel(i); m.scale.setScalar(.01); m.position.set(0, 0, 0); scene.add(m); renderer.render(scene, camera); scene.remove(m); }catch(e){} };
  API.emerge = (i, mouth, target, px) => new Promise(res => {
    resize(); getModel(i);
    cur = models[i]; const h = cur.userData.h;
    cur.userData.base = Math.min(1.1, ((px || H*.34)/(H/6.3))/h, (W*.62/(H/6.3))/cur.userData.w);          // alto del regalo en pantalla
    scene.add(cur); host.classList.add('on'); alpha = 1; spin = -.5; dragV = 0; opened = opening = false; rotX = cur.userData.root ? cur.userData.root.userData.rx0 : 0;
    const mw = toWorld(mouth.x, mouth.y), half = cur.userData.h*cur.userData.base*.5/2;
    from = mw.clone(); from.y = mw.y - half - .15; exitY = mw.y + half + .2; to = toWorld(target.x, target.y); to.x = from.x + (to.x - from.x);
    clipY = mouth.y; clipOn = true; bandB = Math.min(H, target.y + (px || H*.34)*1.15);
    state = 'rising'; t0 = performance.now(); API._res = res;
  });
  API.leave = () => new Promise(res => { if(!cur){ res(); return; } state = 'leaving'; t0 = performance.now(); API._res = res; });
  API.open = () => new Promise(res => { if(!cur || !cur.userData.root || opening || opened){ res(); return; } os0 = ((spin + Math.PI)%(Math.PI*2) + Math.PI*2)%(Math.PI*2) - Math.PI; opening = true; openT0 = performance.now(); resOpen = res; });
  /* toques sobre el collar, la pulsera y el anillo de la caja abierta */
  const rc = new T.Raycaster();
  API.pick = (px, py) => { if(!cur || !cur.userData.root || !cur.userData.root.userData.proxies) return null; rc.setFromCamera(new T.Vector2(px/W*2 - 1, -(py/H)*2 + 1), camera); cur.updateMatrixWorld(true); const h = rc.intersectObjects(cur.userData.root.userData.proxies, false); return h.length ? h[0].object.userData.item : null; };
  API.lift = (name, on, now) => { const L = cur && cur.userData.root && cur.userData.root.userData.lifts; if(L && L[name]){ L[name].t = on ? 1 : 0; if(now) L[name].v = L[name].t; } };
  API.shake = () => { shakeT = performance.now(); };
  API.itemScreen = name => { if(!cur || !cur.userData.root) return null; const m = cur.userData.root.userData.proxies.find(p => p.userData.item === name); if(!m) return null; cur.updateMatrixWorld(true); const v = m.getWorldPosition(new T.Vector3()); v.y += .35; v.project(camera); return {x: (v.x + 1)/2*W, y: (1 - v.y)/2*H}; };
  host.addEventListener('pointerup', e => { if(!API.onItem || state !== 'shown' || !opened || tmv > 10 || performance.now() - tt0 > 700) return; const n = API.pick(e.clientX, e.clientY); if(n) API.onItem(n); });
  API.back = () => new Promise(res => { if(!cur){ res(); return; } state = 'sinking'; t0 = performance.now(); API._res = res; });
  API.close = () => new Promise(res => { if(!cur || !cur.userData.root || !opened || closing){ res(); return; } closing = true; closeT0 = performance.now(); resClose = res; });
  API.state = () => state; API.freeze = v => { frz = v; };
  API.dbg = () => cur ? [state, cur.position.x.toFixed(2), cur.position.y.toFixed(2), cur.scale.x.toFixed(2), to.y.toFixed(2), from.y.toFixed(2), cur.userData.h.toFixed(2)].join(' ') : state;
})();
