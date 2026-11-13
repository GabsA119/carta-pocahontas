/* Pastel de cumpleaños en 3D: gira solo, se puede girar con el dedo y tiene velas, personajes y el collar de Pocahontas.
   Si el navegador no tiene WebGL, se queda el pastel dibujado (SVG). */
(function(){
  const host = document.getElementById('cake3d');
  if(!host || !window.THREE) return;
  const T = THREE;
  let renderer;
  try{ renderer = new T.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'high-performance'}); }catch(e){ return; }
  if(!renderer || !renderer.getContext()) return;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  const gl = renderer.domElement; gl.style.display = 'none'; host.appendChild(gl);     // el lienzo WebGL va oculto y se copia a uno 2D: se ve igual en todos los navegadores
  const cv = document.createElement('canvas');
  cv.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;cursor:grab';
  host.appendChild(cv);
  const cx2 = cv.getContext('2d');

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(30, 1, .1, 60);
  const world = new T.Group(); scene.add(world);

  /* ---- luces ---- */
  scene.add(new T.AmbientLight(0xffffff, .62));
  const sun = new T.DirectionalLight(0xfff1de, .85); sun.position.set(3, 7, 6); scene.add(sun);
  const fill = new T.DirectionalLight(0x7fe8f0, .45); fill.position.set(-5, 3, -4); scene.add(fill);
  const glow = new T.PointLight(0xffc27a, .9, 7); glow.position.set(0, 3.3, 0); scene.add(glow);

  /* ---- materiales ---- */
  const M = (c, r = .5, m = 0, extra) => new T.MeshStandardMaterial(Object.assign({color: c, roughness: r, metalness: m}, extra || {}));
  const choc = M(0x5a2f1a, .55), pink = M(0xffc2d8, .42), pinkL = M(0xffe1ec, .4), berryM = M(0xe0334f, .32), leafM = M(0x3a9d4a, .6),
        gold = M(0xe8c27a, .3, .65), plateM = M(0xf6e6bd, .35, .25), turq = M(0x1fb2c4, .25, .35, {emissive: 0x063a44}),
        blue = M(0x1b8fb3, .3, .3, {emissive: 0x04303f}), white = M(0xffffff, .5);

  /* ---- estructura del pastel ---- */
  const plate = new T.Mesh(new T.CylinderGeometry(2.0, 2.05, .1, 64), plateM); plate.position.y = .05; world.add(plate);
  const rim = new T.Mesh(new T.TorusGeometry(2.0, .035, 10, 80), gold); rim.rotation.x = Math.PI/2; rim.position.y = .1; world.add(rim);

  function tier(y, r, h){
    const g = new T.Group();
    const body = new T.Mesh(new T.CylinderGeometry(r, r, h, 64), choc); body.position.y = y + h/2; g.add(body);
    const cap = new T.Mesh(new T.CylinderGeometry(r + .035, r + .035, .1, 64), pink); cap.position.y = y + h; g.add(cap);
    const top = new T.Mesh(new T.CircleGeometry(r + .03, 56), pinkL); top.rotation.x = -Math.PI/2; top.position.y = y + h + .052; g.add(top);
    const n = Math.round(r*15);
    for(let i = 0; i < n; i++){                         // glaseado rosa que gotea
      const a = (i + Math.random()*.5)/n*Math.PI*2, L = .12 + Math.random()*.36, R = r + .03;
      const d = new T.Mesh(new T.CylinderGeometry(.055, .055, L, 10), pink); d.position.set(Math.sin(a)*R, y + h - L/2, Math.cos(a)*R); g.add(d);
      const e = new T.Mesh(new T.SphereGeometry(.055, 10, 8), pink); e.position.set(Math.sin(a)*R, y + h - L, Math.cos(a)*R); g.add(e);
    }
    const m = Math.round(r*19);
    for(let i = 0; i < m; i++){                         // festón rosa en la base
      const a = i/m*Math.PI*2, b = new T.Mesh(new T.SphereGeometry(.078, 12, 10), pink);
      b.position.set(Math.sin(a)*(r + .02), y + .06, Math.cos(a)*(r + .02)); g.add(b);
    }
    return g;
  }
  const Y1 = .1, H1 = .78, R1 = 1.5, Y2 = Y1 + H1, H2 = .7, R2 = 1.08, Y3 = Y2 + H2, H3 = .72, R3 = .68, TOP = Y3 + H3;
  world.add(tier(Y1, R1, H1)); world.add(tier(Y2, R2, H2)); world.add(tier(Y3, R3, H3));

  function berry(){
    const g = new T.Group();
    const b = new T.Mesh(new T.SphereGeometry(.11, 14, 12), berryM); b.scale.set(1, 1.2, 1); g.add(b);
    const l = new T.Mesh(new T.ConeGeometry(.075, .07, 6), leafM); l.position.y = .13; g.add(l);
    return g;
  }
  [[R1, Y1 + H1, 8], [R2, Y2 + H2, 6], [R3, Y3 + H3, 5]].forEach(([r, y, n]) => {
    for(let i = 0; i < n; i++){
      const a = (i + .5)/n*Math.PI*2, b = berry(); b.position.set(Math.sin(a)*(r - .14), y + .12, Math.cos(a)*(r - .14)); world.add(b);
    }
  });

  /* ---- velas ---- */
  const flames = [];
  const fcv = document.createElement('canvas'); fcv.width = fcv.height = 64;
  (() => { const c = fcv.getContext('2d'), g = c.createRadialGradient(32, 40, 2, 32, 36, 30);
    g.addColorStop(0, 'rgba(255,250,200,1)'); g.addColorStop(.35, 'rgba(255,190,70,.95)'); g.addColorStop(1, 'rgba(255,120,30,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(32, 36, 15, 28, 0, 0, 7); c.fill(); })();
  const ftex = new T.CanvasTexture(fcv);
  const candleCols = [0xffffff, 0xffb3cf, 0xfff0a0, 0x9ae6d8, 0xffd2a0];
  const cpos = [[0, 0, .5]]; for(let i = 0; i < 8; i++){ const a = i/8*Math.PI*2; cpos.push([Math.sin(a)*.38, Math.cos(a)*.38, .4]); }
  cpos.forEach(([x, z, h], i) => {
    const c = new T.Mesh(new T.CylinderGeometry(.036, .036, h, 14), M(candleCols[i % candleCols.length], .5)); c.position.set(x, TOP + .06 + h/2, z); world.add(c);
    const wk = new T.Mesh(new T.CylinderGeometry(.006, .006, .06, 5), M(0x222222)); wk.position.set(x, TOP + .06 + h + .03, z); world.add(wk);
    const f = new T.Sprite(new T.SpriteMaterial({map: ftex, transparent: true, blending: T.NormalBlending, depthWrite: false}));
    f.position.set(x, TOP + .06 + h + .17, z); f.scale.set(.3, .42, 1); f.userData = {x, z, h, ph: Math.random()*6.28}; world.add(f); flames.push(f);
  });

  /* ---- collar de Pocahontas (piso de arriba) ---- */
  const necklace = new T.Group(); world.add(necklace); necklace.rotation.y = .2 + Math.PI;     // el frente del collar (la pluma) queda del mismo lado que la corona
  const NB = 22, RN = R3 + .1, yN = TOP - .08;
  for(let i = 0; i < NB; i++){
    const th = i/NB*Math.PI*2, c = Math.cos(th), y = yN - .14*Math.pow(Math.max(0, c), 2);
    const b = new T.Group();
    const edge = new T.Mesh(new T.BoxGeometry(.19, .12, .04), gold); b.add(edge);
    const enamel = new T.Mesh(new T.BoxGeometry(.15, .085, .055), blue); enamel.position.z = .006; b.add(enamel);
    const stone = new T.Mesh(new T.SphereGeometry(.022, 8, 6), M(0xbdf6ff, .2, .1)); stone.position.z = .035; b.add(stone);
    b.position.set(Math.sin(th)*RN, y, c*RN); b.rotation.y = th; necklace.add(b);
  }
  (() => {                                              // colgante de pluma
    const sh = new T.Shape(); sh.moveTo(0, .45); sh.bezierCurveTo(.2, .32, .23, -.1, 0, -.52); sh.bezierCurveTo(-.23, -.1, -.2, .32, 0, .45);
    const opt = {depth: .05, bevelEnabled: true, bevelThickness: .015, bevelSize: .015, bevelSegments: 2, curveSegments: 18};
    const gp = new T.Mesh(new T.ExtrudeGeometry(sh, opt), gold); gp.scale.set(.5, .5, 1); gp.position.set(0, yN - .14 - .2, RN + .06); necklace.add(gp);
    const tp = new T.Mesh(new T.ExtrudeGeometry(sh, opt), turq); tp.scale.set(.41, .41, 1); tp.position.set(0, yN - .14 - .2, RN + .095); necklace.add(tp);
    const vein = new T.Mesh(new T.BoxGeometry(.012, .3, .01), gold); vein.position.set(0, yN - .14 - .2, RN + .16); necklace.add(vein);
    const gem = new T.Mesh(new T.SphereGeometry(.035, 12, 10), M(0xd8fffa, .15, .1, {emissive: 0x2a8f96})); gem.position.set(0, yN - .14 - .2 + .16, RN + .15); necklace.add(gem);
  })();

  /* ---- medallones con los personajes (curvos, pegados al piso de en medio) ---- */
  const loader = new T.TextureLoader();
  function medallion(file, phi){
    const img = new Image(); img.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
      x.fillStyle = '#e8c27a'; x.beginPath(); x.arc(128, 128, 126, 0, 7); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.arc(128, 128, 114, 0, 7); x.fill();
      x.save(); x.beginPath(); x.arc(128, 128, 112, 0, 7); x.clip();
      const s = Math.max(224/img.width, 224/img.height); x.drawImage(img, 128 - img.width*s/2, 128 - img.height*s/2, img.width*s, img.height*s); x.restore();
      x.strokeStyle = 'rgba(160,110,40,.8)'; x.lineWidth = 3; x.beginPath(); x.arc(128, 128, 114, 0, 7); x.stroke();
      const tex = new T.CanvasTexture(c); tex.anisotropy = 4;
      const w = .66, len = w/R2;
      const m = new T.Mesh(new T.CylinderGeometry(R2 + .012, R2 + .012, w, 28, 1, true, phi - len/2, len),
        new T.MeshStandardMaterial({map: tex, transparent: true, alphaTest: .35, roughness: .5, metalness: .05}));
      m.position.y = Y2 + H2/2; world.add(m);
    }; img.src = (window.CAKE_IMG && CAKE_IMG[file]) || 'media/cake/' + file;
  }
  ['med_barbie', 'med_kitty', 'med_pucca', 'med_mulan', 'med_bratz'].forEach((f, i) => medallion(f + '.jpg', i/5*Math.PI*2 + .3));

  /* ---- objetos de la película y las marcas alrededor del pastel (recortes con volumen) ---- */
  function prop(file, h, R, y, phi){
    loader.load((window.CAKE_IMG && CAKE_IMG[file + '.png']) || 'media/cake/' + file + '.png', tex => {
      tex.anisotropy = 4;
      const im = tex.image, w = h*im.width/im.height;
      const g = new T.Group();
      [[-.03, 0x6a6a6a], [-.015, 0x9a9a9a], [0, 0xffffff]].forEach(([z, col]) => {
        const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({map: tex, transparent: true, alphaTest: .12, side: T.DoubleSide, color: col}));
        m.position.z = z; g.add(m);
      });
      g.position.set(Math.sin(phi)*R, y + h/2, Math.cos(phi)*R); g.rotation.y = phi; world.add(g);
    });
  }
  const ring = (list, h, R, y, off = 0) => list.forEach((f, i) => prop(f, h, R, y, off + i/list.length*Math.PI*2));
  ring(['b_lips', 'z_logo', 'm_flower', 'p_fan', 'b_crown', 'z_bow', 'm_mushu', 'z_dice'], .62, 1.78, .1, .2);          // sobre el plato
  ring(['b_star', 'p_heartfig', 'z_dollar', 'm_fan', 'b_lipstick', 'p_flowers', 'z_lips'], .46, 1.3, Y1 + H1 + .05, .45);   // sobre el piso de abajo
  ring(['z_bowpink', 'm_comb', 'p_hug', 'b_logo', 'p_logo'], .36, .88, Y2 + H2 + .05, .75);                              // sobre el piso de en medio

  /* ---- cámara, giro con el dedo y bucle ---- */
  let yaw = 0, elev = .38, dist = 11.6, resumeAt = 0, last = 0, dragging = false;
  let tapOK = false, tx0 = 0, ty0 = 0, tt0 = 0;
  const pts = new Map(); let pd = 0, pdist = 11.6, lx = 0, ly = 0;
  function size(){
    const w = host.clientWidth || 300, h = host.clientHeight || 300;
    renderer.setSize(w, h, false); camera.aspect = w/h; camera.updateProjectionMatrix(); cv.width = gl.width; cv.height = gl.height;
  }
  addEventListener('resize', size); size();
  cv.addEventListener('pointerdown', e => {
    try{ cv.setPointerCapture(e.pointerId); }catch(_){}
    pts.set(e.pointerId, [e.clientX, e.clientY]); dragging = true; cv.style.cursor = 'grabbing'; lx = e.clientX; ly = e.clientY;
    if(pts.size === 1){ tapOK = true; tx0 = e.clientX; ty0 = e.clientY; tt0 = performance.now(); } else tapOK = false;
    if(pts.size === 2){ const [a, b] = [...pts.values()]; pd = Math.hypot(a[0] - b[0], a[1] - b[1]); pdist = dist; }
  });
  cv.addEventListener('pointermove', e => {
    if(!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    if(Math.hypot(e.clientX - tx0, e.clientY - ty0) > 10) tapOK = false;
    if(pts.size === 2){ const [a, b] = [...pts.values()]; dist = Math.max(8.5, Math.min(17, pdist*pd/Math.hypot(a[0] - b[0], a[1] - b[1]))); }
    else { yaw += (e.clientX - lx)*.011; elev = Math.max(.1, Math.min(.8, elev + (e.clientY - ly)*.004)); lx = e.clientX; ly = e.clientY; }
  });
  ['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, e => {
    if(ev === 'pointerup' && tapOK && pts.size === 1 && performance.now() - tt0 < 600){ tapOK = false; const f = window.CAKE3D && window.CAKE3D.onTap; if(f){ window.CAKE3D.onTap = null; f(); } }
    pts.delete(e.pointerId); if(!pts.size){ dragging = false; cv.style.cursor = 'grab'; }
    resumeAt = performance.now() + 2000;                // se queda quieto 2 s y sigue girando
    const r = [...pts.values()][0]; if(r){ lx = r[0]; ly = r[1]; }
  }));
  cv.addEventListener('wheel', e => { e.preventDefault(); dist = Math.max(8.5, Math.min(17, dist + e.deltaY*.005)); resumeAt = performance.now() + 2000; }, {passive: false});

  const cw = document.getElementById('cw');
  let frozen = false, settle = null, glowK = 1, hold = false;
  const FRONT = -(.2 + Math.PI), TAU = Math.PI*2;          // el frente del pastel: la corona y el centro del collar miran al frente
  const scv = document.createElement('canvas'); scv.width = scv.height = 48;
  (() => { const c = scv.getContext('2d'), g = c.createRadialGradient(24, 24, 1, 24, 24, 23);
    g.addColorStop(0, 'rgba(235,240,240,.9)'); g.addColorStop(1, 'rgba(235,240,240,0)'); c.fillStyle = g; c.fillRect(0, 0, 48, 48); })();
  const stex = new T.CanvasTexture(scv);
  const smoke = flames.map(() => { const sp = new T.Sprite(new T.SpriteMaterial({map: stex, transparent: true, depthWrite: false})); sp.visible = false; world.add(sp); return sp; });
  function puff(f){ const sm = smoke[flames.indexOf(f)]; sm.userData = {t0: performance.now(), x0: f.userData.x + .2, y0: f.position.y - .1, ph: Math.random()*6}; sm.visible = true; }
  function loop(now){
    requestAnimationFrame(loop);
    if(frozen || (cw && !cw.classList.contains('on'))) { last = now; return; }     // solo se dibuja cuando se ve
    if(host.clientWidth && (Math.abs(gl.width/renderer.getPixelRatio() - host.clientWidth) > 2)) size();   // por si el contenedor cambia de tamaño o estaba oculto
    const dt = Math.min(50, now - (last || now))/16.7; last = now;
    if(settle){                                                    // antes de partirlo, el pastel se acomoda de frente
      const ty = FRONT + Math.round((yaw - FRONT)/TAU)*TAU;
      yaw += (ty - yaw)*Math.min(1, .09*dt); elev += (.42 - elev)*Math.min(1, .09*dt); dist += (11.6 - dist)*Math.min(1, .09*dt);
      if(Math.abs(ty - yaw) < .004 && Math.abs(.42 - elev) < .004 && settle){ const r = settle; settle = null; yaw = ty; elev = .42; dist = 11.6; r(); }
    } else if(!dragging && !hold && now >= resumeAt) yaw += .0032*dt;
    world.rotation.y = yaw;
    camera.position.set(0, 1.25 + dist*Math.sin(elev), dist*Math.cos(elev)); camera.lookAt(0, 1.2, 0);
    const t = now/1000;
    flames.forEach((f, i) => {
      const k = 1 + .14*Math.sin(t*13 + f.userData.ph) + .07*Math.sin(t*23 + i);
      f.scale.set(.3*k, .42*(1 + .18*Math.sin(t*11 + f.userData.ph*2)), 1);
      f.position.x = f.userData.x + Math.sin(t*3 + f.userData.ph)*.012;
    });
    flames.forEach(f => {                                           // la brisa apaga las velas, una por una
      const o = f.userData.out; if(o === undefined) return;
      const u = (now - o)/650; if(u < 0) return;
      if(u >= 1){ if(f.visible){ f.visible = false; puff(f); } return; }
      f.position.x = f.userData.x + u*.2; f.material.opacity = 1 - u*u; f.scale.y *= 1 - u*.8; f.scale.x *= 1 + u*.5;
    });
    smoke.forEach(sm => {
      if(!sm.visible) return;
      const u = (now - sm.userData.t0)/2600; if(u >= 1){ sm.visible = false; return; }
      sm.position.y = sm.userData.y0 + u*.9; sm.position.x = sm.userData.x0 + u*.5 + Math.sin(u*6 + sm.userData.ph)*.05;
      sm.material.opacity = .5*(1 - u); sm.scale.setScalar(.14 + u*.5);
    });
    glow.intensity = (.85 + .12*Math.sin(t*9) + .06*Math.sin(t*17))*glowK; if(glowK < 1 && glowK > .2) glowK = Math.max(.2, glowK - .006*dt);
    renderer.render(scene, camera); cx2.clearRect(0, 0, cv.width, cv.height); cx2.drawImage(gl, 0, 0);
  }
  requestAnimationFrame(loop);

  /* ---- la brisa apaga las velas y el pastel se parte en 5 trozos ---- */
  const N = 5;
  function cutFaces(i){
    const g = new T.Group(), c = i*Math.PI*2/N;
    [[c - Math.PI/N, 1], [c + Math.PI/N, -1]].forEach(([th, side]) => {
      const vx = Math.cos(th)*side*.004, vz = -Math.sin(th)*side*.004;
      [[Y1, H1, R1], [Y2, H2, R2], [Y3, H3, R3]].forEach(([y, h, r]) => {
        [[0, .4, 0x6e3a22], [.4, .52, 0xffc2d8], [.52, .55, 0xd0173b], [.55, .9, 0x6e3a22], [.9, 1, 0xffe1ec]].forEach(([a, b, col]) => {
          const m = new T.Mesh(new T.PlaneGeometry(r, (b - a)*h), new T.MeshStandardMaterial({color: col, roughness: .6, side: T.DoubleSide}));
          m.rotation.y = th - Math.PI/2; m.position.set(Math.sin(th)*r/2 + vx, y + (a + b)/2*h, Math.cos(th)*r/2 + vz); g.add(m);
        });
      });
    });
    g.visible = false; world.add(g); return g;
  }
  const api = window.CAKE3D = {
    ok: true, N,
    face(){ return new Promise(res => { hold = true; resumeAt = 0; settle = res; }); },     // gira el pastel hasta ponerlo de frente
    blow(){ const now = performance.now(); flames.forEach((f, i) => { f.userData.out = now + 120 + (i*137)%520; }); glowK = .99; },
    split(){
      return new Promise(res => {
        const go = () => {
          resumeAt = 0; dragging = false;
          const w = gl.width, h = gl.height, faces = [], pieces = [];
          for(let i = 0; i < N; i++) faces.push(cutFaces(i));
          world.rotation.y = FRONT; camera.position.set(0, 1.25 + dist*Math.sin(elev), dist*Math.cos(elev)); camera.lookAt(0, 1.2, 0);
          flames.forEach(f => f.visible = false); smoke.forEach(sm => sm.visible = false); glow.intensity = .35;
          for(let i = 0; i < N; i++){
            const c = i*Math.PI*2/N, a = c - Math.PI/N, b = c + Math.PI/N;
            const ra = a + FRONT, rb = b + FRONT;      // los planos de corte están en el espacio global; el pastel está girado FRONT
            renderer.clippingPlanes = [new T.Plane(new T.Vector3(Math.cos(ra), 0, -Math.sin(ra)), 0), new T.Plane(new T.Vector3(-Math.cos(rb), 0, Math.sin(rb)), 0)];
            faces.forEach((g, k) => g.visible = k === i);
            renderer.render(scene, camera);
            const q = document.createElement('canvas'); q.width = w; q.height = h; q.className = 'slice';
            q.getContext('2d').drawImage(gl, 0, 0);
            host.appendChild(q); pieces.push({el: q, c: c + FRONT, ctx: q.getContext('2d')});
          }
          renderer.clippingPlanes = [];
          frozen = true; cv.style.display = 'none';
          res({pieces, elev});
        };
        settle = go;
      });
    }
  };

  host.classList.add('on'); size();
  const svgCake = document.querySelector('.cake'); if(svgCake) svgCake.style.display = 'none';
})();
