const cv = document.getElementById("c"),
  ctx = cv.getContext("2d"),
  W = 480,
  H = 720,
  F = '"Press Start 2P",monospace';
let diff = 1,
  sel = 0,
  S = "menu",
  P,
  B,
  E,
  EB,
  PU,
  FX,
  score,
  hi = 0,
  t = 0,
  sc = 0,
  stage,
  kills,
  boss,
  spawnT,
  banner,
  flash,
  shake,
  warn,
  keys = {};
const DEF = [
  { w: 30, h: 30, hp: 1, col: "#5b9a3c", acc: "#d63b2f", sc: 100, fire: 0.004 },
  { w: 38, h: 38, hp: 5, col: "#c3ccd6", acc: "#2c6fbb", sc: 300, fire: 0.011 },
  { w: 78, h: 66, hp: 18, col: "#6b7d3a", acc: "#e0b422", sc: 1000, fire: 0.02 },
];
const DIFF = [
  { lives: 5, f: 0.6, s: 1.3 },
  { lives: 3, f: 1, s: 1 },
  { lives: 2, f: 1.5, s: 0.8 },
];
function init() {
  P = { x: W / 2, y: H - 100, lives: DIFF[diff].lives, bombs: 3, pw: 1, dmg: 1, cd: 0, inv: 90 };
  B = [];
  E = [];
  EB = [];
  PU = [];
  FX = [];
  score = 0;
  stage = 1;
  kills = 0;
  boss = null;
  spawnT = 50;
  banner = 100;
  flash = 0;
  shake = 0;
  warn = 0;
}
init();
function R(x, y, w, h) {
  ctx.fillRect(x, y, w, h);
}
function body(x, y, s, col, acc, kind, flip) {
  const u = s / 10;
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(1, -1);
  ctx.fillStyle = col;
  if (kind == 0) {
    R(-5 * u, -u, 10 * u, 2.4 * u);
    R(-0.9 * u, -5 * u, 1.8 * u, 10 * u);
    R(-2.5 * u, 3.5 * u, 5 * u, 1.2 * u);
    ctx.fillStyle = acc;
    R(-0.7 * u, -5 * u, 1.4 * u, 1.3 * u);
    R(-4.2 * u, -0.4 * u, 1.2 * u, 1.2 * u);
    R(3 * u, -0.4 * u, 1.2 * u, 1.2 * u);
    ctx.fillStyle = "#16324f";
    R(-0.5 * u, -2.2 * u, u, 1.6 * u);
  } else if (kind == 1) {
    R(-3.4 * u, -4 * u, 1.3 * u, 9 * u);
    R(2.1 * u, -4 * u, 1.3 * u, 9 * u);
    R(-6 * u, -u, 12 * u, 2.2 * u);
    R(-u, -3 * u, 2 * u, 5 * u);
    R(-3.6 * u, 4 * u, 7.2 * u, 1.1 * u);
    ctx.fillStyle = acc;
    R(-3.4 * u, -4 * u, 1.3 * u, u);
    R(2.1 * u, -4 * u, 1.3 * u, u);
    R(-5.6 * u, -0.6 * u, 1.4 * u, 1.4 * u);
    R(4.2 * u, -0.6 * u, 1.4 * u, 1.4 * u);
    ctx.fillStyle = "#16324f";
    R(-0.6 * u, -2 * u, 1.2 * u, 1.5 * u);
  } else {
    R(-1.4 * u, -5 * u, 2.8 * u, 10 * u);
    R(-5 * u, -1.6 * u, 10 * u, 3 * u);
    R(-2.6 * u, 3.8 * u, 5.2 * u, 1.3 * u);
    ctx.fillStyle = acc;
    [-3.6, -1.9, 1.9, 3.6].forEach((k) => R(k * u - 0.5 * u, -2.6 * u, u, 2.6 * u));
    R(-0.8 * u, -5 * u, 1.6 * u, u);
    ctx.fillStyle = "#16324f";
    R(-0.7 * u, -3.6 * u, 1.4 * u, 1.6 * u);
  }
  ctx.restore();
}
function plane(x, y, s, col, acc, kind, flip) {
  body(x + s * 0.22, y + s * 0.3, s, "rgba(0,0,0,.2)", "rgba(0,0,0,.2)", kind, flip);
  body(x, y, s, col, acc, kind, flip);
}
function addE(type, x, y, o = {}) {
  const d = DEF[type],
    e = Object.assign(
      {
        type,
        x,
        y,
        x0: x,
        vx: 0,
        vy: 2,
        A: 0,
        ph: 0,
        age: 0,
        w: d.w,
        h: d.h,
        hp: d.hp,
        col: d.col,
        acc: d.acc,
        sc: d.sc,
        fire: d.fire,
      },
      o,
    );
  e.mhp = e.hp;
  E.push(e);
  return e;
}
function wave() {
  const r = Math.random(),
    c = stage;
  if (r < 0.28) {
    for (let i = -2; i <= 2; i++) addE(0, W / 2 + i * 46, -30 - Math.abs(i) * 36);
  } else if (r < 0.5) {
    for (let i = 0; i < 5; i++) addE(0, 50 + i * 95, -30 - i * 8, { A: 45, ph: i * 0.7, vy: 1.8 });
  } else if (r < 0.7) {
    const l = Math.random() < 0.5;
    for (let i = 0; i < 5; i++)
      addE(0, l ? 30 : W - 30, -30 - i * 40, { vx: l ? 1.1 : -1.1, vy: 2 });
  } else if (r < 0.87) {
    addE(1, 130, -40, { vy: 1.3 });
    addE(1, W - 130, -40, { vy: 1.3 });
    if (c > 1) addE(1, W / 2, -90, { vy: 1.3 });
  } else addE(2, 60 + Math.random() * (W - 120), -60, { vy: 0.7 });
}
function aim(e, n, sp, v) {
  const a = Math.atan2(P.y - e.y, P.x - e.x);
  for (let i = 0; i < n; i++) {
    const g = a + (i - (n - 1) / 2) * sp;
    EB.push({ x: e.x, y: e.y + e.h / 3, vx: Math.cos(g) * v, vy: Math.sin(g) * v });
  }
}
function fan(e, n, sp, v) {
  for (let i = 0; i < n; i++) {
    const g = Math.PI / 2 + (i - (n - 1) / 2) * sp;
    EB.push({
      x: e.x + (i - (n - 1) / 2) * 8,
      y: e.y + e.h / 3,
      vx: Math.cos(g) * v,
      vy: Math.sin(g) * v,
    });
  }
}
function fire() {
  const n0 = B.length,
    p = P.pw,
    xs = p == 1 ? [-8, 8] : p == 2 ? [-14, 0, 14] : [-20, -7, 7, 20];
  xs.forEach((d) => B.push({ x: P.x + d, y: P.y - 24, vx: 0, vy: -12 }));
  if (p >= 4)
    B.push(
      { x: P.x - 24, y: P.y - 8, vx: -2.5, vy: -11 },
      { x: P.x + 24, y: P.y - 8, vx: 2.5, vy: -11 },
    );
  if (p >= 5)
    B.push({ x: P.x - 30, y: P.y, vx: -4.5, vy: -10 }, { x: P.x + 30, y: P.y, vx: 4.5, vy: -10 });
  for (let i = n0; i < B.length; i++) B[i].d = P.dmg;
}
function boom(x, y, n, z = 1) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.28,
      v = Math.random() * 5 * z;
    FX.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      l: 20 + Math.random() * 20,
      s: 3 + Math.random() * 5 * z,
    });
  }
  FX.push({ x, y, ring: 1, l: 16, s: 6 });
}
function drop(x, y, type) {
  PU.push({ x, y, type });
}
function kill(e) {
  e.dead = 1;
  score += e.sc;
  boom(e.x, e.y, e.boss ? 60 : e.type ? 22 : 10, e.boss ? 2 : 1);
  if (e.boss) {
    boss = null;
    stage++;
    kills = 0;
    banner = 160;
    shake = 30;
    drop(e.x - 50, e.y, "P");
    drop(e.x, e.y, "D");
    drop(e.x + 50, e.y, "B");
  } else {
    kills++;
    if (e.type == 2) drop(e.x, e.y, ["P", "B", "D"][Math.floor(Math.random() * 3)]);
    else if (Math.random() < (e.type ? 0.2 : 0.05))
      drop(e.x, e.y, ["P", "P", "D", "B"][Math.floor(Math.random() * 4)]);
  }
}
function bomb() {
  if (S !== "play" || P.bombs <= 0) return;
  P.bombs--;
  flash = 22;
  EB = [];
  E.forEach((e) => (e.hp -= e.boss ? 25 : 20));
  P.inv = Math.max(P.inv, 70);
  shake = 14;
}
function update() {
  t++;
  sc = (sc + 1.6) % 1440;
  if (S !== "play") {
    FX.forEach((p) => {
      p.x += p.vx || 0;
      p.y += p.vy || 0;
      p.l--;
    });
    FX = FX.filter((p) => p.l > 0);
    return;
  }
  const v = 5.5;
  if (keys.arrowleft || keys.a) P.x -= v;
  if (keys.arrowright || keys.d) P.x += v;
  if (keys.arrowup || keys.w) P.y -= v;
  if (keys.arrowdown || keys.s) P.y += v;
  P.x = Math.max(22, Math.min(W - 22, P.x));
  P.y = Math.max(40, Math.min(H - 30, P.y));
  if (P.inv > 0) P.inv--;
  if (banner > 0) banner--;
  if (flash > 0) flash--;
  if (shake > 0) shake--;
  if (--P.cd <= 0) {
    fire();
    P.cd = P.pw >= 3 ? 7 : 9;
  }
  const need = 16 + stage * 6;
  if (!boss && !warn) {
    if (kills >= need) warn = 140;
    else if (--spawnT <= 0) {
      wave();
      spawnT = Math.max(38, 92 - stage * 7) * DIFF[diff].s;
    }
  }
  if (warn > 0 && --warn === 0) {
    boss = addE(2, W / 2, -120, {
      boss: 1,
      w: 180,
      h: 124,
      hp: 150 + stage * 80,
      col: "#566a2a",
      acc: "#d63b2f",
      sc: 10000,
    });
  }
  E.forEach((e) => {
    e.age++;
    if (e.boss) {
      if (e.y < 130) e.y += 1.2;
      else {
        e.x = W / 2 + Math.sin(e.age * 0.015) * 150;
        if (e.age % 46 == 0) fan(e, 7, 0.3, 3.2 + stage * 0.1);
        if (e.age % 120 == 0) aim(e, 3, 0.2, 4);
      }
    } else {
      e.x = e.x0 + e.vx * e.age + Math.sin(e.age * 0.05 + e.ph) * e.A;
      e.y += e.vy;
      if (Math.random() < e.fire * DIFF[diff].f * (1 + stage * 0.2) && e.y > 0 && e.y < H - 220)
        aim(e, e.type == 2 ? 3 : 1, 0.22, 2.6 + stage * 0.15);
    }
  });
  B.forEach((b) => {
    b.x += b.vx;
    b.y += b.vy;
    for (const e of E)
      if (!e.dead && Math.abs(b.x - e.x) < e.w / 2 && Math.abs(b.y - e.y) < e.h / 2) {
        e.hp -= b.d || 1;
        e.hit = 3;
        b.dead = 1;
        break;
      }
  });
  B = B.filter((b) => !b.dead && b.y > -20 && b.x > -20 && b.x < W + 20);
  E.forEach((e) => {
    if (e.hit > 0) e.hit--;
    if (e.hp <= 0 && !e.dead) kill(e);
  });
  E = E.filter((e) => !e.dead && e.y < H + 80 && e.x > -100 && e.x < W + 100);
  EB.forEach((b) => {
    b.x += b.vx;
    b.y += b.vy;
  });
  EB = EB.filter((b) => b.x > -10 && b.x < W + 10 && b.y > -10 && b.y < H + 10);
  PU.forEach((p) => {
    p.y += 1.6;
    if (Math.hypot(p.x - P.x, p.y - P.y) < 30) {
      p.got = 1;
      score += 500;
      if (p.type == "P") P.pw = Math.min(5, P.pw + 1);
      else if (p.type == "D") P.dmg = Math.min(3, P.dmg + 1);
      else P.bombs = Math.min(5, P.bombs + 1);
    }
  });
  PU = PU.filter((p) => !p.got && p.y < H + 20);
  if (
    !P.inv &&
    (E.some((e) => Math.abs(e.x - P.x) < e.w / 2.4 && Math.abs(e.y - P.y) < e.h / 2.4) ||
      EB.some((b) => Math.hypot(b.x - P.x, b.y - P.y) < 9))
  ) {
    P.lives--;
    P.pw = Math.max(1, P.pw - 1);
    P.dmg = Math.max(1, P.dmg - 1);
    P.inv = 150;
    EB = [];
    boom(P.x, P.y, 30, 1.5);
    shake = 16;
    if (P.lives <= 0) {
      S = "over";
      hi = Math.max(hi, score);
    }
  }
  FX.forEach((p) => {
    p.x += p.vx || 0;
    p.y += p.vy || 0;
    p.l--;
  });
  FX = FX.filter((p) => p.l > 0);
}
function txt(s, x, y, sz, col = "#ffe9a8") {
  ctx.font = sz + "px " + F;
  ctx.textAlign = "center";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#1a0f08";
  ctx.strokeText(s, x, y);
  ctx.fillStyle = col;
  ctx.fillText(s, x, y);
}
function bg() {
  ctx.fillStyle = "#1d5fb0";
  R(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,.14)";
  for (let i = 0; i < 40; i++) R((i * 97) % W, (i * 53 + sc * 1.0) % H, 16, 2);
  [
    [90, 0],
    [380, 1],
    [230, 2],
    [40, 3],
  ].forEach(([x, i]) => {
    const y = ((i * 380 + sc * 0.9) % (H + 360)) - 180;
    ctx.fillStyle = "#e8d594";
    ctx.beginPath();
    ctx.ellipse(x, y, 70 + i * 6, 42, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#3d8a47";
    ctx.beginPath();
    ctx.ellipse(x, y, 52 + i * 5, 30, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#276b34";
    for (let k = 0; k < 5; k++) R(x - 30 + k * 14, y - 8 + (k % 2) * 10, 10, 10);
  });
  ctx.fillStyle = "rgba(255,255,255,.55)";
  for (let i = 0; i < 4; i++) {
    const y = ((i * 260 + sc * 1.9) % (H + 160)) - 80,
      x = (i * 211 + 30) % W;
    R(x, y, 90, 12);
    R(x + 14, y - 10, 56, 12);
    R(x - 12, y + 8, 70, 10);
  }
}
function draw() {
  ctx.save();
  ctx.textAlign = "left";
  if (shake > 0)
    ctx.translate(((Math.random() - 0.5) * shake) / 2, ((Math.random() - 0.5) * shake) / 2);
  bg();
  PU.forEach((p) => {
    ctx.fillStyle = p.type == "P" ? "#f3c316" : p.type == "D" ? "#1fb5d9" : "#d63b2f";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 13, 0, 7);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    txt(p.type, p.x + 1, p.y + 4, 10, "#fff");
  });
  E.forEach((e) => {
    const col = e.hit ? "#fff" : e.col;
    if (e.boss) {
      plane(e.x, e.y, e.w, col, e.acc, 2, 1);
    } else plane(e.x, e.y, e.w * (e.type == 2 ? 1 : 1.05), col, e.acc, e.type == 2 ? 2 : e.type, 1);
  });
  B.forEach((b) => {
    const d = b.d || 1,
      w = 4 + d * 2,
      c = ["", "#ff9d1c", "#ff5a1f", "#3fd4ff"][d];
    ctx.fillStyle = c;
    R(b.x - w / 2, b.y - 9 - d * 2, w, 18 + d * 4);
    ctx.fillStyle = "#fff";
    R(b.x - w / 6, b.y - 9 - d * 2, w / 3, 18 + d * 4);
  });
  EB.forEach((b) => {
    ctx.fillStyle = "#ff4a2b";
    ctx.beginPath();
    ctx.arc(b.x, b.y, 5, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(b.x, b.y, 2, 0, 7);
    ctx.fill();
  });
  if (S !== "over" && !(P.inv && t % 8 < 4)) {
    plane(P.x, P.y, 46, "#dfe6ee", "#f3c316", 1, 0);
    if (P.pw >= 4) {
      plane(P.x - 38, P.y + 14, 22, "#9fb4c8", "#f3c316", 0, 0);
      plane(P.x + 38, P.y + 14, 22, "#9fb4c8", "#f3c316", 0, 0);
    }
  }
  FX.forEach((p) => {
    if (p.ring) {
      ctx.strokeStyle = "rgba(255,230,150," + p.l / 16 + ")";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (16 - p.l) * 4, 0, 7);
      ctx.stroke();
    } else {
      ctx.fillStyle = p.l > 22 ? "#fff3a0" : p.l > 12 ? "#ff9d1c" : "#7a2b1a";
      R(p.x, p.y, p.s, p.s);
    }
  });
  if (flash > 0) {
    ctx.fillStyle = "rgba(255,255,255," + flash / 30 + ")";
    R(0, 0, W, H);
  }
  ctx.restore();
  if (S === "play" || S === "over") {
    ctx.textAlign = "left";
    ctx.font = "10px " + F;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#1a0f08";
    const s = "SCORE " + String(score).padStart(7, "0");
    ctx.strokeText(s, 10, 22);
    ctx.fillStyle = "#ffe9a8";
    ctx.fillText(s, 10, 22);
    for (let i = 0; i < P.lives; i++) body(26 + i * 26, 46, 22, "#dfe6ee", "#f3c316", 1, 0);
    txt("BOMB x" + P.bombs, W - 70, 22, 9, "#ff8a73");
    txt("POWER " + P.pw, W - 70, 40, 9, "#f3c316");
    txt("DAMAGE " + P.dmg, W - 70, 58, 9, "#3fd4ff");
    txt("STAGE " + stage, W / 2 + 30, 22, 9);
    if (boss) {
      ctx.fillStyle = "#1a0f08";
      R(60, 58, W - 120, 10);
      ctx.fillStyle = "#d63b2f";
      R(62, 60, ((W - 124) * Math.max(0, boss.hp)) / boss.mhp, 6);
    }
  }
  if (warn > 0 && t % 30 < 20) txt("WARNING!", W / 2, H / 2 - 40, 26, "#ff4a2b");
  else if (banner > 0 && S === "play")
    txt(
      stage > 1 && banner > 0 && score > 0 ? "STAGE " + stage : "GET READY",
      W / 2,
      H / 2 - 60,
      22,
    );
  if (S === "menu") {
    ctx.fillStyle = "rgba(8,20,48,.55)";
    R(0, 0, W, H);
    txt("AIR FORCE", W / 2, 150, 38, "#ffd23f");
    txt("1945", W / 2, 210, 52, "#ff6a3d");
    plane(W / 2, 310, 90, "#dfe6ee", "#f3c316", 1, 0);
    ["START MISSION", "DIFFICULTY: " + ["EASY", "NORMAL", "HARD"][diff], "HOW TO PLAY"].forEach(
      (m, i) => {
        const y = 460 + i * 55;
        if (i == sel) {
          ctx.fillStyle = "rgba(255,210,63,.2)";
          R(50, y - 26, W - 100, 40);
          ctx.strokeStyle = "#ffd23f";
          ctx.lineWidth = 2;
          ctx.strokeRect(50, y - 26, W - 100, 40);
        }
        txt(m, W / 2, y, 13, i == sel ? "#ffd23f" : "#ffe9a8");
      },
    );
    txt("BEST " + hi, W / 2, 650, 10, "#9fd2ff");
  }
  if (S === "help") {
    ctx.fillStyle = "rgba(8,20,48,.82)";
    R(0, 0, W, H);
    txt("HOW TO PLAY", W / 2, 110, 20, "#ffd23f");
    [
      ["MOVE: ARROWS / WASD / DRAG", "#ffe9a8"],
      ["FIRE: AUTOMATIC", "#ffe9a8"],
      ["BOMB: SPACE OR BUTTON", "#ffe9a8"],
      ["", 0],
      ["P = MORE GUNS", "#f3c316"],
      ["D = STRONGER SHOTS", "#3fd4ff"],
      ["B = EXTRA BOMB", "#ff8a73"],
      ["", 0],
      ["DODGE ORANGE BULLETS", "#ffe9a8"],
      ["DEFEAT THE BOSS TO ADVANCE", "#ffe9a8"],
    ].forEach(([m, c], i) => {
      if (m) txt(m, W / 2, 190 + i * 40, 11, c);
    });
    txt("TAP TO GO BACK", W / 2, 640, 10);
  }
  if (S === "over") {
    ctx.fillStyle = "rgba(8,20,48,.7)";
    R(0, 0, W, H);
    txt("MISSION FAILED", W / 2, H / 2 - 30, 24, "#ff6a3d");
    txt("SCORE " + score, W / 2, H / 2 + 10, 12);
    txt("BEST " + hi, W / 2, H / 2 + 36, 12, "#9fd2ff");
    txt("TAP OR SPACE FOR MENU", W / 2, H / 2 + 84, 10);
  }
}
function start() {
  init();
  S = "play";
}
function act() {
  if (sel == 0) start();
  else if (sel == 1) diff = (diff + 1) % 3;
  else S = "help";
}
onkeydown = (e) => {
  const k = e.key.toLowerCase();
  keys[k] = 1;
  if (k == " " || k.startsWith("arrow")) e.preventDefault();
  if (S === "play") {
    if (k == " ") bomb();
    return;
  }
  if (S === "menu") {
    if (k == "arrowup" || k == "w") sel = (sel + 2) % 3;
    else if (k == "arrowdown" || k == "s") sel = (sel + 1) % 3;
    else if ((k == "arrowleft" || k == "arrowright") && sel == 1)
      diff = (diff + (k == "arrowright" ? 1 : 2)) % 3;
    else if (k == "enter" || k == " ") act();
  } else if (k == "enter" || k == " " || k == "escape") S = "menu";
};
onkeyup = (e) => (keys[e.key.toLowerCase()] = 0);
let drag = null;
const pp = (e) => {
  const r = cv.getBoundingClientRect();
  return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
};
cv.addEventListener("pointerdown", (e) => {
  if (S === "menu") {
    const y = pp(e).y,
      i = Math.round((y - 454) / 55);
    if (i >= 0 && i < 3 && Math.abs(y - (454 + i * 55)) < 24) {
      sel = i;
      act();
    }
    return;
  }
  if (S !== "play") {
    S = "menu";
    return;
  }
  drag = pp(e);
});
cv.addEventListener("pointermove", (e) => {
  if (drag && S === "play") {
    const p = pp(e);
    P.x += p.x - drag.x;
    P.y += p.y - drag.y;
    drag = p;
  }
});
addEventListener("pointerup", () => (drag = null));
document.getElementById("bb").onclick = bomb;
(function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
})();
