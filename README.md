# Wood Pricing Frontend

Interface em Next.js, TypeScript e Tailwind CSS para o sistema de precificação de produtos artesanais de madeira.

## Instalação e desenvolvimento

Execute os comandos a partir desta pasta (a que contém o `package.json`):

```bash
npm install
cp .env.example .env.local
npm run dev
```

## URLs da API e dos arquivos

Configure `NEXT_PUBLIC_API_URL` com o endereço completo do backend, incluindo `/api/v1`. `NEXT_PUBLIC_FILES_URL` deve apontar para a origem pública do **mesmo backend**, sem `/api/v1` e sem `/uploads`. Exemplo local:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333/api/v1
NEXT_PUBLIC_FILES_URL=http://localhost:3333
```

`NEXT_PUBLIC_FILES_URL` é opcional: quando omitida, o helper de imagens deriva a origem de `NEXT_PUBLIC_API_URL`. Isso evita que a aplicação dependa de `localhost` ou de uma porta fixa quando muda de ambiente.

Exemplo para uma API acessível na rede local (substitua pelo endereço e porta realmente publicados no servidor):

```env
NEXT_PUBLIC_API_URL=http://192.168.0.208:3333/api/v1
NEXT_PUBLIC_FILES_URL=http://192.168.0.208:3333
```

Não use `localhost` nas variáveis do frontend em produção para apontar ao servidor: no navegador, `localhost` significa a máquina do usuário. Use o IP/DNS que o navegador do usuário consegue acessar.

As variáveis `NEXT_PUBLIC_*` são incorporadas ao bundle durante o build. Sempre que alterar as URLs em produção, gere novamente o frontend e reinicie o processo Next.js:

```bash
npm run build
npm start
```
