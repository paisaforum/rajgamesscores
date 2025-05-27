export async function generateHash(name, score) {
  const secret = "Vj34s$9!kL1@Q2rXz8#H7fW0eTpGcYnA"; // Must match backend

  const encoder = new TextEncoder();
  const data = encoder.encode(name + score + secret);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
