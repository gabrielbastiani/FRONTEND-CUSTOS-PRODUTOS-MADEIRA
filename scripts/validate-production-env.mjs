import { loadEnvConfig } from '@next/env';

// Carrega exatamente as variáveis do ambiente de produção antes do next build.
// Ordem de prioridade do Next.js: process.env, .env.production.local,
// .env.local, .env.production e .env.
loadEnvConfig(process.cwd(), false);

const errors = [];
const apiValue = process.env.NEXT_PUBLIC_API_URL?.trim();
const filesValue = process.env.NEXT_PUBLIC_FILES_URL?.trim();
const frontendPort = process.env.FRONTEND_PORT?.trim() || '7002';

if (!apiValue) {
  errors.push('NEXT_PUBLIC_API_URL não está definida. Configure .env.production.local.');
}

let apiUrl;
let filesUrl;

if (apiValue) {
  try {
    apiUrl = new URL(apiValue);
  } catch {
    errors.push(`NEXT_PUBLIC_API_URL não é uma URL válida: ${apiValue}`);
  }
}

if (apiUrl) {
  if (!['http:', 'https:'].includes(apiUrl.protocol)) {
    errors.push('NEXT_PUBLIC_API_URL deve usar http:// ou https://.');
  }

  if (apiUrl.username || apiUrl.password || apiUrl.search || apiUrl.hash) {
    errors.push('NEXT_PUBLIC_API_URL não deve conter credenciais, query string ou fragmento.');
  }

  const apiPath = apiUrl.pathname.replace(/\/+$/, '');
  if (apiPath !== '/api/v1') {
    errors.push(`NEXT_PUBLIC_API_URL deve terminar em /api/v1. Caminho encontrado: ${apiUrl.pathname}`);
  }

  const host = apiUrl.hostname.toLowerCase();
  if (['localhost', '127.0.0.1', '::1', '[::1]'].includes(host)) {
    errors.push('NEXT_PUBLIC_API_URL aponta para localhost/loopback. Em produção, use o IP ou DNS acessível pelos navegadores.');
  }

  if (apiUrl.port && apiUrl.port === frontendPort) {
    errors.push(`NEXT_PUBLIC_API_URL aponta para a porta do frontend (${frontendPort}), não para a API.`);
  }
}

if (filesValue) {
  try {
    filesUrl = new URL(filesValue);
  } catch {
    errors.push(`NEXT_PUBLIC_FILES_URL não é uma URL válida: ${filesValue}`);
  }

  if (filesUrl) {
    if (!['http:', 'https:'].includes(filesUrl.protocol)) {
      errors.push('NEXT_PUBLIC_FILES_URL deve usar http:// ou https://.');
    }

    if (filesUrl.username || filesUrl.password || filesUrl.search || filesUrl.hash) {
      errors.push('NEXT_PUBLIC_FILES_URL não deve conter credenciais, query string ou fragmento.');
    }

    if (filesUrl.pathname !== '/' && filesUrl.pathname !== '') {
      errors.push('NEXT_PUBLIC_FILES_URL deve conter somente a origem, sem /api/v1 ou /uploads.');
    }

    const filesHost = filesUrl.hostname.toLowerCase();
    if (['localhost', '127.0.0.1', '::1', '[::1]'].includes(filesHost)) {
      errors.push('NEXT_PUBLIC_FILES_URL aponta para localhost/loopback. Em produção, use o IP ou DNS acessível pelos navegadores.');
    }

    if (filesUrl.port && filesUrl.port === frontendPort) {
      errors.push(`NEXT_PUBLIC_FILES_URL aponta para a porta do frontend (${frontendPort}), não para a API.`);
    }
  }
}

if (apiUrl && filesUrl && apiUrl.origin !== filesUrl.origin) {
  errors.push(
    `API e arquivos apontam para origens diferentes: API=${apiUrl.origin}; arquivos=${filesUrl.origin}. ` +
    'Neste projeto, /uploads é servido pelo mesmo backend da API.'
  );
}

if (errors.length > 0) {
  console.error('\n[CONFIGURAÇÃO DE PRODUÇÃO INVÁLIDA] O build foi interrompido.\n');
  for (const error of errors) console.error(`- ${error}`);
  console.error('\nCorrija as variáveis em .env.production.local e execute npm run build novamente.\n');
  process.exit(1);
}

const filesOrigin = filesUrl?.origin || apiUrl.origin;
console.log('\n[CONFIGURAÇÃO DE PRODUÇÃO VALIDADA]');
console.log(`- API: ${apiUrl.origin}/api/v1`);
console.log(`- Arquivos: ${filesOrigin}/uploads/...`);
console.log(`- Porta do frontend reservada: ${frontendPort}`);
console.log('As URLs não apontam para localhost nem para a porta do frontend.\n');
