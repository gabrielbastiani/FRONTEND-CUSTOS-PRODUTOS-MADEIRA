const LOCAL_API_FALLBACK = 'http://localhost:3333';

function getFilesOrigin(): string {
  const configuredFilesUrl = process.env.NEXT_PUBLIC_FILES_URL?.trim();
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const candidate = configuredFilesUrl || configuredApiUrl;

  // O endereço do frontend (window.location.origin) nunca deve ser usado como
  // fallback: em produção ele aponta para a porta do Next.js, não para a API.
  if (!candidate) {
    if (process.env.NODE_ENV === 'development') {
      return LOCAL_API_FALLBACK;
    }

    throw new Error(
      'Origem dos arquivos não configurada. Defina NEXT_PUBLIC_API_URL e, opcionalmente, NEXT_PUBLIC_FILES_URL antes do build.'
    );
  }

  try {
    return new URL(candidate).origin;
  } catch {
    throw new Error(`URL de API/arquivos inválida: ${candidate}`);
  }
}

/**
 * Converte a referência gravada no banco (/uploads/arquivo.ext) em uma URL
 * pública. A origem vem da configuração do ambiente; em desenvolvimento,
 * usa localhost:3333 somente como conveniência local. Não usa a origem do
 * frontend como fallback em produção.
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url?.trim()) return '';

  const value = url.trim();
  try {
    const absoluteUrl = new URL(value);
    if (absoluteUrl.protocol === 'http:' || absoluteUrl.protocol === 'https:') {
      // URLs antigas podem conter localhost ou o host do frontend.
      // Para arquivos /uploads, a origem configurada do backend prevalece.
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
