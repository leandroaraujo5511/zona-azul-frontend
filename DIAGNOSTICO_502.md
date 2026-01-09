# 🔍 Diagnóstico - Erro 502 Bad Gateway

## 🚨 Problema

Ainda recebendo erro 502 Bad Gateway após deploy bem-sucedido.

## ✅ Checklist de Verificação

### 1. Verificar se o servidor está rodando

No servidor, execute:

```bash
cd /code

# Verificar se o processo está rodando
ps aux | grep node
ps aux | grep server.js

# Verificar se a porta está em uso
netstat -tuln | grep 5173
# ou
lsof -i :5173
```

### 2. Verificar logs do EasyPanel

No EasyPanel:
1. Acesse os **Logs** do aplicativo
2. Verifique se há mensagens de erro
3. Procure por:
   - `🚀 Servidor HTTP iniciado!`
   - `🌐 Escutando em 0.0.0.0:5173`
   - Erros de inicialização

### 3. Testar servidor manualmente

```bash
cd /code

# Executar diagnóstico
npm run check

# Ou testar manualmente
node server.js
```

### 4. Verificar configuração do EasyPanel

**Porta:**
- Deve estar configurada como `5173` (ou a porta que você definiu)
- Verifique se não há conflito com outras aplicações

**Start Command:**
```bash
cd /code && npm run start
```

**Build Command:**
```bash
cd /code && chmod +x ./deploy.sh && ./deploy.sh
```

### 5. Verificar se dist/ existe e tem arquivos

```bash
cd /code
ls -la dist/
ls -la dist/index.html
```

### 6. Verificar variáveis de ambiente

No EasyPanel, verifique se está configurado:
```env
PORT=5173
NODE_ENV=production
```

---

## 🔧 Soluções Comuns

### Solução 1: Servidor não está iniciando

**Sintomas:**
- Logs mostram que o build foi bem-sucedido
- Mas não há mensagem de "Servidor HTTP iniciado"

**Solução:**
1. Verifique os logs completos do EasyPanel
2. Execute manualmente: `cd /code && npm run start`
3. Verifique se há erros no console

### Solução 2: Porta incorreta

**Sintomas:**
- Servidor está rodando
- Mas em porta diferente da configurada no EasyPanel

**Solução:**
1. Verifique qual porta o servidor está usando (logs)
2. Configure a mesma porta no EasyPanel
3. Ou configure `PORT` como variável de ambiente

### Solução 3: Processo morreu

**Sintomas:**
- Servidor inicia mas depois para
- Logs mostram "Servidor encerrado"

**Solução:**
1. Verifique os logs para erros
2. Verifique se há problemas de memória
3. Verifique se o processo está sendo morto pelo sistema

### Solução 4: Proxy não consegue conectar

**Sintomas:**
- Servidor está rodando
- Porta está correta
- Mas ainda recebe 502

**Solução:**
1. Verifique se o servidor está escutando em `0.0.0.0` (não `localhost`)
2. Verifique firewall/regras de rede
3. Verifique configuração do proxy no EasyPanel

---

## 🧪 Teste Completo

Execute este script de diagnóstico:

```bash
cd /code
npm run check
```

Ou manualmente:

```bash
cd /code

# 1. Verificar dist
ls -la dist/

# 2. Verificar porta
netstat -tuln | grep 5173

# 3. Testar servidor
node server.js
# (Deixe rodando e teste em outro terminal)
curl http://localhost:5173
```

---

## 📝 Logs Esperados

Quando o servidor inicia corretamente, você deve ver:

```
🚀 Servidor HTTP iniciado!
🌐 Escutando em 0.0.0.0:5173
📱 Acesse: http://localhost:5173
📁 Servindo arquivos de: /code/dist
```

---

## 🔄 Próximos Passos

1. Execute o diagnóstico: `npm run check`
2. Verifique os logs do EasyPanel
3. Teste o servidor manualmente
4. Verifique a configuração de porta
5. Se necessário, reinicie o aplicativo no EasyPanel

---

## 💡 Dica

Se o servidor funcionar manualmente mas não no EasyPanel:
- Verifique se o **Start Command** está correto
- Verifique se o EasyPanel está gerenciando o processo corretamente
- Considere usar um processo manager como PM2 (se necessário)


