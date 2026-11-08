export function momentTransitionName(id: string): string {
  return `moment-title-${[...id].map(char => char.codePointAt(0)!.toString(16)).join('-')}`;
}

export function momentUrl(id: string): string {
  return `/moments/${id.split('/').map(encodeURIComponent).join('/')}/`;
}
