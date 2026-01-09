# 🚀 Guia de Deploy - Frontend Zona Azul

Este guia descreve como fazer o deploy do frontend em produção.

---

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Docker (opcional, para deploy via container)
- Acesso ao servidor de produção
- URL da API backend configurada

---

## 🔧 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com as configurações de produção:

```env
VITE_API_URL=https://api.seudominio.com/api/v1
```

**Importante**: 
- A variável `VITE_API_URL` deve apontar para a URL da API backend em produção
- Não inclua barra (/) no final da URL
- Use HTTPS em produção

---

## 🏗️ Build Local

### Build de Produção

```bash
npm run build:prod
```

Isso criará uma pasta `dist/` com os arquivos otimizados para produção.

### Preview Local

Para testar o build localmente antes do deploy:

```bash
npm run preview
```

---

## 🐳 Deploy com Docker

### 1. Build da Imagem

```bash
docker build \
  --build-arg VITE_API_URL=https://api.seudominio.com/api/v1 \
  -t zona-azul-frontend:latest \
  .
```

### 2. Executar Container

```bash
docker run -d \
  --name zona-azul-frontend \
  -p 5173:5173 \
  zona-azul-frontend:latest
```

### 3. Com Docker Compose

Crie um arquivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      args:
        VITE_API_URL: https://api.seudominio.com/api/v1
    ports:
      - "5173:5173"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5173', (r) => {if (r.statusCode === 200) process.exit(0); process.exit(1);})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

Execute:

```bash
docker-compose up -d
```

---

## 🌐 Deploy em Servidor (Nginx)

### 1. Build do Projeto

```bash
npm run build:prod
```

### 2. Configurar Nginx

Crie um arquivo de configuração `/etc/nginx/sites-available/zona-azul-frontend`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    # Certificados SSL (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Diretório raiz
    root /var/www/zona-azul-frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA - redirecionar todas as rotas para index.html
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Headers de segurança
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logs
    access_log /var/log/nginx/zona-azul-frontend-access.log;
    error_log /var/log/nginx/zona-azul-frontend-error.log;
}
```

### 3. Habilitar Site

```bash
sudo ln -s /etc/nginx/sites-available/zona-azul-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Copiar Arquivos

```bash
sudo mkdir -p /var/www/zona-azul-frontend
sudo cp -r dist/* /var/www/zona-azul-frontend/
sudo chown -R www-data:www-data /var/www/zona-azul-frontend
```

---

## ☁️ Deploy em Plataformas Cloud

### Vercel

1. Instale a CLI: `npm i -g vercel`
2. Configure variáveis de ambiente no dashboard
3. Execute: `vercel --prod`

### Netlify

1. Instale a CLI: `npm i -g netlify-cli`
2. Configure `netlify.toml`:

```toml
[build]
  command = "npm run build:prod"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

3. Execute: `netlify deploy --prod`

### AWS S3 + CloudFront

1. Build: `npm run build:prod`
2. Upload para S3: `aws s3 sync dist/ s3://seu-bucket/`
3. Configure CloudFront com SPA routing

### Azure Static Web Apps

1. Build: `npm run build:prod`
2. Configure `azure-static-web-apps.json`
3. Deploy via GitHub Actions ou Azure CLI

---

## 🔍 Verificação Pós-Deploy

### 1. Verificar Build

- Acesse a URL de produção
- Verifique se a aplicação carrega corretamente
- Teste o login
- Verifique se as requisições à API estão funcionando

### 2. Verificar Console do Navegador

- Abra o DevTools (F12)
- Verifique se não há erros no console
- Verifique se as requisições à API estão sendo feitas para a URL correta

### 3. Verificar Performance

- Use Lighthouse para verificar performance
- Verifique se os assets estão sendo servidos com cache
- Verifique se o gzip está funcionando

---

## 🔄 Atualizações

### Atualizar Deploy

1. Faça pull das alterações
2. Instale dependências: `npm ci`
3. Build: `npm run build:prod`
4. Copie arquivos para o servidor ou reconstrua a imagem Docker

### Script de Deploy Automatizado

Crie um script `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Iniciando deploy..."

# Build
npm run build:prod

# Copiar para servidor (ajuste conforme necessário)
rsync -avz --delete dist/ usuario@servidor:/var/www/zona-azul-frontend/

echo "✅ Deploy concluído!"
```

---

## 🐛 Troubleshooting

### Problema: API não conecta

**Solução**: Verifique se a variável `VITE_API_URL` está configurada corretamente no `.env` e se foi incluída no build.

### Problema: Rotas não funcionam (404)

**Solução**: Configure o servidor web para redirecionar todas as rotas para `index.html` (SPA routing).

### Problema: Assets não carregam

**Solução**: Verifique se o caminho base está correto no `vite.config.ts` e se os arquivos foram copiados corretamente.

### Problema: Build muito lento

**Solução**: 
- Use cache do npm: `npm ci --prefer-offline`
- Use Docker build cache
- Considere usar CI/CD para builds

---

## 📝 Checklist de Deploy

- [ ] Variável `VITE_API_URL` configurada
- [ ] Build de produção executado sem erros
- [ ] Arquivos na pasta `dist/` gerados
- [ ] Servidor web configurado (Nginx/Apache)
- [ ] SSL/HTTPS configurado
- [ ] Headers de segurança configurados
- [ ] Cache de assets configurado
- [ ] SPA routing configurado
- [ ] Testes de funcionalidade realizados
- [ ] Logs configurados e monitorados

---

## 🔐 Segurança

### Headers de Segurança

O arquivo `serve.json` já inclui headers de segurança básicos. Para produção com Nginx, adicione:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` (configure conforme necessário)

### HTTPS

**Sempre use HTTPS em produção!** Use Let's Encrypt para certificados SSL gratuitos.

---

## 📞 Suporte

Em caso de problemas, verifique:
1. Logs do servidor web
2. Console do navegador
3. Network tab do DevTools
4. Logs do Docker (se usando)

---

**Última atualização**: Janeiro 2025


