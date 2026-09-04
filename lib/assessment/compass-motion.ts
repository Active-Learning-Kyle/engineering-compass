export function shuffledCompassTargets(previous = -1, random = Math.random) {
  const targets = [0, 60, 120, 180, 240, 300];
  for (let index = targets.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [targets[index], targets[swapWith]] = [targets[swapWith], targets[index]];
  }
  if (targets[0] === previous)
    [targets[0], targets[1]] = [targets[1], targets[0]];
  return targets;
}

export const compassRetargetDelay = (random = Math.random) =>
  650 + random() * 250;

export function compassSpringStep(
  angle: number,
  velocity: number,
  target: number,
  time: number,
  dt: number,
) {
  const flutter = 7 * Math.sin(time / 48) + 3 * Math.sin(time / 23);
  const nextVelocity =
    velocity + (260 * (target + flutter - angle) - 5.8 * velocity) * dt;
  return { angle: angle + nextVelocity * dt, velocity: nextVelocity };
}
