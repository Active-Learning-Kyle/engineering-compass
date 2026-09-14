'use client';

import { useEffect, useRef } from 'react';
import { astronautCollision, astronautImpact, astronautMotionStep, type AstronautBody } from '../lib/assessment/astronaut-motion';

const roles = ['problem-framer', 'project-navigator', 'team-connector', 'practical-builder', 'prototype-explorer', 'solution-storyteller'];
const driftDirections = [[12, 9], [-14, -7], [14, -9], [-11, -8], [10, -7], [-13, -10]];

/** Decorative layer: listen passively, never intercept page controls. */
export function HomeAstronauts({ baseUrl }: { baseUrl: string }) {
  const field = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = field.current;
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const bodies = Array.from(root.querySelectorAll<HTMLElement>('.home-astronaut-body')).map((element, index) => ({
      element, spin: element.firstElementChild as HTMLElement,
      state: { x: 0, y: 0, vx: 0, vy: 0, angle: 0, omega: 0, facing: index % 2 === 0 ? -1 : 1 } as AstronautBody,
      anchorX: 0, anchorY: 0, size: 0, lastHit: -1000, index, idleBlend: 1, displayAngle: 0,
    }));
    let frame = 0;
    let previous = 0;
    let elapsed = 0;
    let visible = true;
    const layout = () => {
      for (const body of bodies) {
        body.size = body.element.offsetWidth;
        body.anchorX = body.element.offsetLeft + body.size / 2;
        body.anchorY = body.element.offsetTop + body.size / 2;
        const speedScale = body.size / 140;
        body.state = { ...body.state, x: body.anchorX, y: body.anchorY, vx: 0, vy: 0, angle: 0, omega: 0,
          driftX: reduced.matches ? 0 : driftDirections[body.index][0] * speedScale,
          driftY: reduced.matches ? 0 : driftDirections[body.index][1] * speedScale };
        body.idleBlend = 1;
        body.displayAngle = 0;
        body.element.style.transform = '';
        body.spin.style.transform = '';
      }
    };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; };
    const nudge = (event: PointerEvent) => {
      if (reduced.matches || document.hidden || !visible) return;
      // Hover over a button still belongs to the button, not the decoration.
      if (event.target instanceof Element && event.target.closest('button,a,input,label,summary')) return;
      const now = performance.now();
      for (const body of bodies) {
        if (now - body.lastHit < 1000) continue;
        const bounds = body.element.getBoundingClientRect();
        const rootBounds = root.getBoundingClientRect();
        const impact = astronautImpact({
          ...body.state, angle: body.displayAngle,
          x: bounds.left + body.size / 2 - rootBounds.left,
          y: bounds.top + body.size / 2 - rootBounds.top,
        }, event.clientX - bounds.left - body.size / 2, event.clientY - bounds.top - body.size / 2, body.size);
        if (!impact) continue;
        body.lastHit = now;
        body.state = impact;
        body.idleBlend = 0;
      }
      start();
    };
    const tick = (now: number) => {
      frame = 0;
      if (reduced.matches || document.hidden || !visible) { previous = 0; return; }
      const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      elapsed += dt;
      for (const body of bodies) {
        body.state = astronautMotionStep(body.state, dt, { width: root.clientWidth, height: root.clientHeight, radius: body.size * Math.SQRT1_2 + 12 });
      }
      // A few separation passes handle three-way contacts without overlapping suits.
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < bodies.length; i++) {
          for (let j = i + 1; j < bodies.length; j++) {
            const a = bodies[i], b = bodies[j];
            const collision = astronautCollision(a.state, b.state, a.size * 0.34, b.size * 0.34);
            if (!collision) continue;
            [a.state, b.state] = collision;
            if (a.state.omega !== 0) { a.state.angle = a.displayAngle; a.idleBlend = 0; }
            if (b.state.omega !== 0) { b.state.angle = b.displayAngle; b.idleBlend = 0; }
          }
        }
        for (const body of bodies) {
          body.state = astronautMotionStep(body.state, 0, { width: root.clientWidth, height: root.clientHeight, radius: body.size * Math.SQRT1_2 + 12 });
        }
      }
      for (const body of bodies) {
        const phase = elapsed / (90 + body.index * 9) * Math.PI * 2 + body.index * 1.2;
        const active = Math.hypot(body.state.vx, body.state.vy) > 0 || body.state.omega !== 0;
        if (!active) body.idleBlend = Math.min(1, body.idleBlend + dt * 0.5);
        body.displayAngle = body.state.angle + Math.sin(phase) * 4 * body.idleBlend;
        body.element.style.transform = `translate(${(body.state.x - body.anchorX).toFixed(2)}px, ${(body.state.y - body.anchorY).toFixed(2)}px)`;
        body.spin.style.transform = `rotate(${body.displayAngle.toFixed(2)}deg)`;
      }
      frame = requestAnimationFrame(tick);
    };
    const start = () => { if (!frame && visible && !reduced.matches && !document.hidden) frame = requestAnimationFrame(tick); };
    const preferenceChanged = () => { stop(); layout(); start(); };
    const visibilityChanged = () => { if (document.hidden) stop(); else start(); };
    const resizeObserver = new ResizeObserver(() => { layout(); start(); });
    const intersectionObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); else stop(); });
    layout();
    resizeObserver.observe(root);
    intersectionObserver.observe(root);
    start();
    window.addEventListener('pointermove', nudge, { passive: true });
    window.addEventListener('pointerdown', nudge, { passive: true });
    reduced.addEventListener('change', preferenceChanged);
    document.addEventListener('visibilitychange', visibilityChanged);
    return () => {
      window.removeEventListener('pointermove', nudge);
      window.removeEventListener('pointerdown', nudge);
      reduced.removeEventListener('change', preferenceChanged);
      document.removeEventListener('visibilitychange', visibilityChanged);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      stop();
    };
  }, []);
  return <div ref={field} className="home-astronaut-field" aria-hidden="true">
    {roles.map((role, index) => <div key={role} className={`home-astronaut-body home-astronaut-position-${index + 1}`}>
      <div className="home-astronaut-spin">
      {/* oxlint-disable-next-line next/no-img-element -- Original transparent decorative character. */}
      <img className={`home-astronaut home-astronaut-${index + 1}`} style={{ transform: index % 2 === 0 ? 'scaleX(-1)' : undefined }} src={`${baseUrl}backgrounds/astronaut-${role}-compact.png`} alt="" decoding="async" draggable={false} />
      </div>
    </div>)}
  </div>;
}
