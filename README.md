# Wood Pricing Frontend

Interface em Next.js, TypeScript e Tailwind CSS para o sistema de precificação de produtos artesanais de madeira.

## Configuração por ambiente

O projeto separa as URLs do backend por ambiente. Não reutilize a URL do frontend para servir imagens: neste ambiente, o Next.js roda na porta `7002` e a API Node.js atende API e `/uploads` na porta `7001`.

### Desenvolvimento local

Crie o arquivo de ambiente local a partir do modelo:

```bash
cp -n .env.development.example .env.development.local
```

Confira a porta em que sua API Node.js está rodando localmente. O exemplo usa `3333`; altere as duas URLs se sua API local usar outra porta.

```env
NEXT_PUBLIC_API_URL=http://localhost:3333/api/v1
NEXT_PUBLIC_FILES_URL=http://localhost:3333
```

Inicie o frontend:

```bash
npm run dev
```

### Produção no aaPanel

Na raiz do frontend, crie o arquivo de produção:

```bash
cp -n .env.production.example .env.production.local
```

O modelo contém a configuração confirmada deste servidor:

```env
NEXT_PUBLIC_API_URL=http://192.168.0.208:7001/api/v1
NEXT_PUBLIC_FILES_URL=http://192.168.0.208:7001
FRONTEND_PORT=7002
```

O `cp -n` preserva um `.env.production.local` que já exista. Se o arquivo já existir, edite-o sem sobrescrever. Ajuste o IP/porta caso o endereço publicado da API mude. `NEXT_PUBLIC_FILES_URL` deve ser apenas a origem do backend, sem `/api/v1` e sem `/uploads`.

Gere o build e reinicie o processo Next.js:

```bash
npm run build
```

O comando `build` executa primeiro `scripts/validate-production-env.mjs`. A compilação será interrompida com uma mensagem explicativa quando:

- `NEXT_PUBLIC_API_URL` estiver ausente ou inválida;
- a API estiver apontando para `localhost`/loopback;
- a API estiver apontando para a porta do frontend (por padrão `7002`);
- `NEXT_PUBLIC_FILES_URL` apontar para uma origem diferente da API;
- `NEXT_PUBLIC_FILES_URL` contiver caminhos como `/api/v1` ou `/uploads`.

Se a porta do frontend mudar, atualize `FRONTEND_PORT` no `.env.production.local`.

## Como as URLs são utilizadas

- `NEXT_PUBLIC_API_URL`: endereço completo da API, incluindo `/api/v1`.
- `NEXT_PUBLIC_FILES_URL`: origem do mesmo backend que serve `/uploads`. Pode ser omitida; nesse caso, a origem é derivada de `NEXT_PUBLIC_API_URL`.
- O navegador acessa imagens em `NEXT_PUBLIC_FILES_URL + /uploads/...`.

O frontend não usa mais `window.location.origin` como alternativa para encontrar imagens. Isso evita enviar requisições `/uploads` à porta do próprio Next.js quando uma variável estiver ausente.

## Importante sobre builds do Next.js

Variáveis `NEXT_PUBLIC_*` são incorporadas aos arquivos JavaScript durante `next build`. Alterar `.env.production.local` depois de gerar o build não altera os arquivos já compilados. Sempre que mudar a URL da API ou dos arquivos, gere um novo build e reinicie o frontend.

Os arquivos `.env.development.local` e `.env.production.local` são locais e não devem ser enviados ao Git. Os modelos `.example` podem ser versionados; nunca coloque senhas, tokens ou outras credenciais neles.
