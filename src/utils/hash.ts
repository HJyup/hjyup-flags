/**
 * A simple hash function that generates a deterministic numeric value for a given string.
 * This is a replacement for crypto-based hashing, using a basic but consistent algorithm.
 *
 * @param input - String to hash
 * @returns A number between 0 and 99
 */
function hash(input: string): number {
  let hash = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash) % 100;
}

export { hash };
