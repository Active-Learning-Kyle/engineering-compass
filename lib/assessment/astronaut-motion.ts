export type AstronautBody = {
  x: number; y: number; vx: number; vy: number; angle: number; omega: number; facing: number;
  driftX?: number; driftY?: number;
};
export type FloatBounds = { width: number; height: number; radius: number };

/** Stylised zero-gravity response. Angles follow CSS: positive is clockwise. */
export function astronautImpact(body: AstronautBody, dx: number, dy: number, size: number): AstronautBody | null {
  const radians = body.angle * Math.PI / 180;
  const localX = (dx * Math.cos(radians) + dy * Math.sin(radians)) / size;
  const localY = (-dx * Math.sin(radians) + dy * Math.cos(radians)) / size;
  if ((localX / 0.39) ** 2 + (localY / 0.45) ** 2 > 1) return null;
  const facingX = body.facing * Math.cos(radians);
  const facingY = body.facing * Math.sin(radians);
  const sign = facingX < 0 ? -1 : 1;
  const headHit = localY < -0.08;
  const length = Math.max(Math.hypot(dx, dy), 1);
  // Head contact travels along the turning tangent; upright, left-facing means down + CCW.
  const vx = headHit ? -facingY * sign * 140 + facingX * 85 : -dx / length * 170;
  const vy = headHit ? facingX * sign * 140 : -dy / length * 170;
  return { ...body, vx, vy, omega: sign * 68 };
}

export function astronautMotionStep(body: AstronautBody, seconds: number, bounds: FloatBounds): AstronautBody {
  const dt = Math.max(0, Math.min(seconds, 0.05));
  let vx = body.vx * Math.exp(-0.14 * dt);
  let vy = body.vy * Math.exp(-0.14 * dt);
  let omega = body.omega * Math.exp(-0.13 * dt);
  let driftX = body.driftX ?? 0, driftY = body.driftY ?? 0;
  let x = body.x + (vx + driftX) * dt;
  let y = body.y + (vy + driftY) * dt;
  const radius = Math.min(bounds.radius, bounds.width / 2, bounds.height / 2);
  const minX = radius, maxX = bounds.width - radius;
  const minY = radius, maxY = bounds.height - radius;
  let bounced = false;
  if (x < minX) { x = minX; if (vx + driftX < 0) { vx = -vx * 0.82; driftX = -driftX; bounced = true; } }
  if (x > maxX) { x = maxX; if (vx + driftX > 0) { vx = -vx * 0.82; driftX = -driftX; bounced = true; } }
  if (y < minY) { y = minY; if (vy + driftY < 0) { vy = -vy * 0.82; driftY = -driftY; bounced = true; } }
  if (y > maxY) { y = maxY; if (vy + driftY > 0) { vy = -vy * 0.82; driftY = -driftY; bounced = true; } }
  if (bounced) omega = -omega * 0.78;
  if (Math.hypot(vx, vy) < 1.5) vx = vy = 0;
  if (Math.abs(omega) < 0.7) omega = 0;
  return { ...body, x, y, vx, vy, driftX, driftY, omega, angle: body.angle + omega * dt };
}

/** Circular hulls cover the visible suit, not the transparent image corners. */
export function astronautCollision(a: AstronautBody, b: AstronautBody, radiusA: number, radiusB: number): [AstronautBody, AstronautBody] | null {
  const dx = b.x - a.x, dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  if (distance >= radiusA + radiusB) return null;
  const nx = distance > 0.001 ? dx / distance : 1;
  const ny = distance > 0.001 ? dy / distance : 0;
  const inverseA = 1 / Math.max(radiusA ** 2, 1), inverseB = 1 / Math.max(radiusB ** 2, 1);
  const inverseSum = inverseA + inverseB;
  const overlap = radiusA + radiusB - distance + 0.01;
  const nextA = { ...a, x: a.x - nx * overlap * inverseA / inverseSum, y: a.y - ny * overlap * inverseA / inverseSum };
  const nextB = { ...b, x: b.x + nx * overlap * inverseB / inverseSum, y: b.y + ny * overlap * inverseB / inverseSum };
  const adx = a.driftX ?? 0, ady = a.driftY ?? 0, bdx = b.driftX ?? 0, bdy = b.driftY ?? 0;
  const relativeX = b.vx + bdx - a.vx - adx;
  const relativeY = b.vy + bdy - a.vy - ady;
  const closing = relativeX * nx + relativeY * ny;
  // Separate an overlap once, but do not repeatedly kick bodies already moving apart.
  if (closing >= 0) return [nextA, nextB];
  const impulse = -1.8 * closing / inverseSum;
  const driftClosing = (bdx - adx) * nx + (bdy - ady) * ny;
  const driftImpulse = driftClosing < 0 ? -2 * driftClosing / inverseSum : 0;
  nextA.driftX = adx - driftImpulse * inverseA * nx;
  nextA.driftY = ady - driftImpulse * inverseA * ny;
  nextB.driftX = bdx + driftImpulse * inverseB * nx;
  nextB.driftY = bdy + driftImpulse * inverseB * ny;
  nextA.vx = a.vx + adx - impulse * inverseA * nx - nextA.driftX;
  nextA.vy = a.vy + ady - impulse * inverseA * ny - nextA.driftY;
  nextB.vx = b.vx + bdx + impulse * inverseB * nx - nextB.driftX;
  nextB.vy = b.vy + bdy + impulse * inverseB * ny - nextB.driftY;
  const tangential = relativeY * nx - relativeX * ny;
  const turn = Math.sign(tangential) || a.facing;
  const spin = Math.min(32, -closing * 0.16 + Math.abs(tangential) * 0.12 + 3);
  nextA.omega += turn * spin;
  nextB.omega -= turn * spin;
  return [nextA, nextB];
}
