import { useEffect, useRef } from "react";

// Metaball "lava lamp": soft blobs drift up and down, merge and split.
// The pointer acts as an extra blob that pulls nearby blobs toward it,
// and a click/tap sends a shockwave that pushes them apart.
const SCALE = 3; // render at 1/3 size, CSS upscales it smooth
const SIZES = [0.2, 0.14, 0.17, 0.11, 0.15, 0.09];

export default function LavaBlobs() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, m = 0, img, raf, t = 0;
    const mouse = { x: 0, y: 0, on: false };
    const cur = { x: 0, y: 0, r: 0 };
    const balls = SIZES.map((rf, i) => ({
      rf, r: 0, r2: 0, x: 0, y: 0, vx: 0, vy: 0,
      sp: 0.6 + Math.random() * 0.8, ph: Math.random() * 6.28, seed: i,
    }));

    const resize = () => {
      w = Math.max(1, Math.ceil(host.clientWidth / SCALE));
      h = Math.max(1, Math.ceil(host.clientHeight / SCALE));
      m = Math.min(w, h);
      canvas.width = w;
      canvas.height = h;
      img = ctx.createImageData(w, h);
      balls.forEach((b) => {
        b.r = b.rf * m;
        b.r2 = b.r * b.r;
        if (!b.x) { b.x = w * (0.15 + Math.random() * 0.7); b.y = h * (0.15 + Math.random() * 0.7); }
      });
    };

    const step = () => {
      t += 1;
      cur.x += (mouse.x - cur.x) * 0.14;
      cur.y += (mouse.y - cur.y) * 0.14;
      cur.r += ((mouse.on ? 0.085 * m : 0) - cur.r) * 0.08;

      for (const b of balls) {
        // slow buoyancy cycle: rise, cool, sink
        b.vy += Math.sin(t * 0.006 * b.sp + b.ph) * 0.004;
        b.vx += Math.cos(t * 0.004 * b.sp + b.ph * 2) * 0.002;

        if (mouse.on) {
          const dx = cur.x - b.x, dy = cur.y - b.y;
          const d = Math.hypot(dx, dy) || 1;
          const range = m * 0.75;
          if (d < range) {
            const f = (1 - d / range) * 0.016;
            b.vx += (dx / d) * f;
            b.vy += (dy / d) * f;
          }
        }

        const pad = b.r * 0.5;
        if (b.x < pad) b.vx += 0.04;
        if (b.x > w - pad) b.vx -= 0.04;
        if (b.y < pad) b.vy += 0.04;
        if (b.y > h - pad) b.vy -= 0.04;

        b.vx *= 0.985; b.vy *= 0.985;
        b.x += b.vx; b.y += b.vy;
      }
    };

    const draw = () => {
      const P = balls.slice();
      if (cur.r > 0.5) P.push({ x: cur.x, y: cur.y, r2: cur.r * cur.r });
      const n = P.length;
      const d = img.data;
      let i = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let f = 0;
          for (let k = 0; k < n; k++) {
            const b = P[k];
            const dx = x - b.x, dy = y - b.y;
            f += b.r2 / (dx * dx + dy * dy + 1);
          }
          // lit rim at the edge of the blob, dark core, faint halo outside
          const u = (f - 1.05) / (f > 1.05 ? 0.32 : 0.2);
          const u2 = u * u;
          const a = 1 / (1 + u2 * u2); // one continuous curve: no hard edge, no stair-steps
          const tt = Math.min(1, Math.max(0, (x / w) * 0.6 + (y / h) * 0.4 + Math.sin(f * 2) * 0.05));
          const hot = a * a;
          d[i] = (255 - 156 * tt) * a + 60 * hot;
          d[i + 1] = (122 - 20 * tt) * a + 40 * hot;
          d[i + 2] = (61 + 180 * tt) * a + 10 * hot;
          d[i + 3] = 255;
          i += 4;
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    const loop = () => { step(); draw(); raf = requestAnimationFrame(loop); };

    const local = (e) => {
      const r = host.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / SCALE;
      mouse.y = (e.clientY - r.top) / SCALE;
    };
    const onMove = (e) => { local(e); if (!mouse.on) { cur.x = mouse.x; cur.y = mouse.y; } mouse.on = true; };
    const onLeave = () => { mouse.on = false; };
    const onDown = (e) => {
      local(e);
      for (const b of balls) {
        const dx = b.x - mouse.x, dy = b.y - mouse.y;
        const d = Math.hypot(dx, dy) || 1;
        const push = Math.max(0, 1 - d / m) * 3;
        b.vx += (dx / d) * push;
        b.vy += (dy / d) * push;
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);

    if (still) { draw(); } else { raf = requestAnimationFrame(loop); }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return <canvas ref={ref} className="lava" aria-hidden="true" />;
}