const LOCAL_API_FALLBACK = 'http://localhost:3333';

function getFilesOrigin(): string {
  const configuredFilesUrl = process.env.NEXT_PUBLIC_FILES_URL?.trim();
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  const candidate = configuredFilesUrl || configuredApiUrl;
  const fallbackBase =
    typeof window !== 'undefined' ? window.location.origin : LOCAL_API_FALLBACK;

  if (!candidate) return fallbackBase;

  try {
    return new URL(candidate, fallbackBase).origin;
  } catch {
    return fallbackBase;
  }
}

/**
 * Converte a referência gravada no banco (/uploads/arquivo.ext) em uma URL
 * pública. A origem vem da configuração do ambiente e, por padrão, é derivada
 * da mesma NEXT_PUBLIC_API_URL usada pelo Axios. URLs absolutas antigas seguem
 * funcionando durante a migração.
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url?.trim()) return '';

  const value = url.trim();
  try {
    const absoluteUrl = new URL(value);
    if (absoluteUrl.protocol === 'http:' || absoluteUrl.protocol === 'https:') {
      // URLs antigas podem conter localhost ou o host de desenvolvimento.
      // Para arquivos locais, a origem atual do backend sempre prevalece.
      if (absoluteUrl.pathname.startsWith('/uploads/')) {
        return new URL(absoluteUrl.pathname, `${getFilesOrigin()}/`).toString();
      }
      return absoluteUrl.toString();
    }
  } catch {
    // Referência relativa: segue para a resolução abaixo.
  }

  const normalizedPath = value.startsWith('/') ? value : `/${value}`;
  return new URL(normalizedPath, `${getFilesOrigin()}/`).toString();
}
