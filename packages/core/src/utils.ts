/**
 * Generates a deterministic pseudo-random number between 0 and 1
 * based on a seed string. Useful for preventing React hydration mismatches.
 */
export function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const x = Math.sin(hash++) * 10000;
  return x - Math.floor(x);
}
