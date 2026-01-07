# 🔧 Fix 502 Bad Gateway - EasyPanel

## 🚨 Problema

Erro 502 Bad Gateway persiste mesmo após deploy bem-sucedido.

## 🔍 Diagnóstico Rápido

Execute no servidor:

```bash
cd /code

# 1. Verificar se o servidor está rodando
ps aux | grep "node server.js"

# 2. Verificar se a porta está em uso
netstat -tuln | grep 5173

# 3. Testar servidor manualmente
node server.js
```

Se o servidor funcionar manualmente, o problema está na configuração do EasyPanel.

---

## ✅ Solução Passo a Passo

### Passo 1: Verificar Logs do EasyPanel

1. Acesse o EasyPanel
2. Vá em **Logs** do aplicativo
3. Procure por:
   - `🚀 Servidor HTTP iniciado!`
   - `🌐 Escutando em 0.0.0.0:5173`
   - Erros de inicialização

**Se não aparecer "Servidor HTTP iniciado":**
- O servidor não está iniciando
- Verifique o **Start Command** no EasyPanel

### Passo 2: Verificar Start Command

No EasyPanel, o **Start Command** deve ser:

```bash
cd /code && npm run start
```

**NÃO use:**
- `npm start` (sem cd /code)
- `node server.js` (sem cd /code)
- Qualquer comando que não navegue para /code primeiro

### Passo 3: Verificar Porta

1. No EasyPanel, verifique a **Porta** configurada
2. Deve ser `5173` (ou a porta que você definiu)
3. Verifique se a variável `PORT` está configurada nas variáveis de ambiente

### Passo 4: Verificar Build

Certifique-se de que o build foi executado:

```bash
cd /code
ls -la dist/
ls -la dist/index.html
```

Se `dist/` não existir ou estiver vazio, execute:

```bash
npm run build:prod
```

### Passo 5: Testar Manualmente

```bash
cd /code

# Executar servidor
node server.js
```

**Em outro terminal ou aba, teste:**

```bash
curl http://localhost:5173
```

Se funcionar, o problema está no EasyPanel não conseguindo se conectar.

---

## 🔧 Configuração Correta no EasyPanel

### Build Command:
```bash
cd /code && chmod +x ./deploy.sh && ./deploy.sh
```

### Start Command:
```bash
cd /code && npm run start
```

### Port:
```
5173
```

### Variáveis de Ambiente:
```env
PORT=5173
NODE_ENV=production
VITE_API_URL=https://api.seudominio.com/api/v1
```

---

## 🐛 Problemas Comuns

### 1. Processo não está rodando

**Verificar:**
```bash
ps aux | grep node
```

**Solução:**
- Reinicie o aplicativo no EasyPanel
- Verifique os logs para erros

### 2. Porta incorreta

**Verificar:**
```bash
netstat -tuln | grep 5173
```

**Solução:**
- Configure a porta correta no EasyPanel
- Configure `PORT` como variável de ambiente

### 3. Servidor escuta apenas em localhost

**Verificar logs:**
- Deve aparecer: `🌐 Escutando em 0.0.0.0:5173`

**Solução:**
- O `server.js` já está configurado para escutar em `0.0.0.0`
- Se ainda não funcionar, verifique firewall

### 4. EasyPanel não consegue conectar

**Sintomas:**
- Servidor funciona manualmente
- Mas EasyPanel retorna 502

**Solução:**
1. Verifique se o servidor está realmente rodando (ps aux)
2. Verifique se a porta está correta
3. Verifique configuração do proxy no EasyPanel
4. Tente reiniciar o aplicativo

---

## 🧪 Teste Completo

Execute este comando no servidor:

```bash
cd /code

# Executar diagnóstico
npm run check

# Ou manualmente
node check-server.js
```

---

## 📝 Checklist Final

- [ ] Build executado com sucesso (`dist/` existe e tem arquivos)
- [ ] `server.js` existe na raiz
- [ ] `npm run start` funciona quando executado manualmente
- [ ] Porta configurada corretamente no EasyPanel (5173)
- [ ] Variável `PORT` configurada (se necessário)
- [ ] Start Command correto: `cd /code && npm run start`
- [ ] Logs mostram "Servidor HTTP iniciado"
- [ ] Logs mostram "Escutando em 0.0.0.0:5173"
- [ ] Processo está rodando (verificar com `ps aux`)

---

## 💡 Se Nada Funcionar

1. **Reinicie o aplicativo** no EasyPanel
2. **Verifique os logs completos** do EasyPanel
3. **Teste manualmente** no servidor:
   ```bash
   cd /code
   node server.js
   ```
4. **Verifique se há outros processos** usando a porta:
   ```bash
   lsof -i :5173
   ```

---

## 🔄 Alternativa: Usar PM2

Se o EasyPanel não conseguir gerenciar o processo, você pode usar PM2:

```bash
# Instalar PM2
npm install -g pm2

# Start Command no EasyPanel:
cd /code && pm2 start server.js --name frontend && pm2 logs
```

Mas isso geralmente não é necessário - o EasyPanel deve gerenciar o processo automaticamente.

---

**Última atualização**: Janeiro 2025

