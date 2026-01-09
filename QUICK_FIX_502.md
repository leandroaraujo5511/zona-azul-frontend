# ⚡ Fix Rápido - 502 Bad Gateway

## 🔍 Diagnóstico em 3 Passos

### 1. No servidor, execute:

```bash
cd /code

# Verificar se o servidor está rodando
ps aux | grep "node server.js"

# Se não estiver rodando, inicie manualmente
node server.js
```

**Se funcionar manualmente**, o problema está no EasyPanel não iniciando o servidor.

### 2. Verifique os Logs do EasyPanel

Procure por:
- ✅ `🚀 Servidor HTTP iniciado!`
- ✅ `🌐 Escutando em 0.0.0.0:5173`

**Se NÃO aparecer**, o servidor não está iniciando.

### 3. Verifique Start Command no EasyPanel

Deve ser exatamente:
```bash
cd /code && npm run start
```

---

## ✅ Solução Rápida

### Opção 1: Reiniciar no EasyPanel

1. Pare o aplicativo
2. Inicie novamente
3. Verifique os logs

### Opção 2: Verificar se o processo está rodando

No servidor:
```bash
cd /code
ps aux | grep node
```

Se não houver processo rodando, o EasyPanel não está iniciando o servidor.

### Opção 3: Testar manualmente

```bash
cd /code
node server.js
```

Deixe rodando e teste em outro terminal:
```bash
curl http://localhost:5173
```

Se funcionar, o problema é o EasyPanel não gerenciando o processo.

---

## 🔧 Configuração Correta

**Start Command:**
```bash
cd /code && npm run start
```

**Port:**
```
5173
```

**Variáveis de Ambiente:**
```env
PORT=5173
NODE_ENV=production
```

---

## 💡 Dica Importante

O EasyPanel precisa que o processo **permaneça rodando**. O `server.js` já está configurado para isso.

Se o processo morrer imediatamente, verifique os logs para erros.


