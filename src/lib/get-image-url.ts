export function getImageUrl(url: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_FILES_URL || 'http://localhost:3333';
  return `${baseUrl}${url}`;
}