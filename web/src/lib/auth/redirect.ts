export function loginPath(nextPath: string) {
  return `/ingresar?next=${encodeURIComponent(nextPath)}`;
}
