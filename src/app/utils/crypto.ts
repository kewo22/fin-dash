export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const data = new Uint8Array([...salt, ...new TextEncoder().encode(password)]);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const toHex = (b: Uint8Array) => Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
  return { hash: toHex(new Uint8Array(hashBuffer)), salt: toHex(salt) };
}