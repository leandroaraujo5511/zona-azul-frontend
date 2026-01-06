# 🚀 Quick Start - Deploy em Produção

## ⚡ Deploy Rápido

### 1. Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite com a URL da API de produção
nano .env
```

Configure:
```env
VITE_API_URL=https://api.seudominio.com/api/v1
```

### 2. Build

```bash
npm run build:prod
```

### 3. Deploy com Docker

```bash
# Build da imagem
docker build --build-arg VITE_API_URL=https://api.seudominio.com/api/v1 -t zona-azul-frontend .

# Executar
docker run -d -p 5173:5173 --name zona-azul-frontend zona-azul-frontend
```

Ou com Docker Compose:

```bash
# Configure VITE_API_URL no arquivo .env
docker-compose up -d
```

### 4. Deploy Manual (Nginx)

```bash
# Build
npm run build:prod

# Copiar para servidor
sudo cp -r dist/* /var/www/zona-azul-frontend/

# Configurar Nginx (veja DEPLOY.md para detalhes)
```

---

## 📚 Documentação Completa

Para instruções detalhadas, consulte: [DEPLOY.md](./DEPLOY.md)

---

## ✅ Checklist

- [ ] Variável `VITE_API_URL` configurada
- [ ] Build executado sem erros
- [ ] Teste local com `npm run preview`
- [ ] Deploy realizado
- [ ] Testes de funcionalidade em produção

