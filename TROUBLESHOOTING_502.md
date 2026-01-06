# 🔧 Troubleshooting - Erro 502 Bad Gateway

## 🚨 Problema

Erro `502 Bad Gateway` ao acessar a aplicação no EasyPanel.

## 🔍 Causas Comuns

### 1. Servidor não está rodando

**Verificar:**
```bash
# No servidor, verifique se o processo está rodando
ps aux | grep node
ps aux | grep serve

# Verifique os logs do EasyPanel
# Ou no terminal do container:
cd /code
npm run start
```

**Solução:**
- Verifique se o comando `npm run start` está funcionando
- Verifique os logs do EasyPanel para erros

### 2. Porta incorreta

**Verificar:**
- No EasyPanel, verifique qual porta está configurada
- O servidor deve estar escutando na mesma porta

**Solução:**
- Configure a porta no EasyPanel (geralmente 5173)
- Certifique-se de que a variável `PORT` está configurada corretamente
- O `start-server.js` usa `PORT` ou padrão 5173

### 3. Servidor não está escutando na interface correta

**Problema:**
O `serve` pode estar escutando apenas em `localhost` ao invés de `0.0.0.0`.

**Solução:**
Atualize o `start-server.js` para garantir que escute em todas as interfaces.

### 4. Diretório dist não existe ou está vazio

**Verificar:**
```bash
cd /code
ls -la dist/
```

**Solução:**
Execute o build:
```bash
npm run build:prod
```

### 5. Processo morreu/crashou

**Verificar:**
- Logs do EasyPanel
- Logs do supervisor (se usado)

**Solução:**
- Reinicie o aplicativo no EasyPanel
- Verifique os logs para erros

---

## ✅ Checklist de Verificação

- [ ] Build foi executado com sucesso (`dist/` existe e tem arquivos)
- [ ] `serve.json` existe na raiz do projeto
- [ ] `npm run start` funciona quando executado manualmente
- [ ] Porta configurada no EasyPanel corresponde à porta do servidor
- [ ] Variável `PORT` está configurada (se necessário)
- [ ] Servidor está escutando em `0.0.0.0` ou `::` (não apenas `localhost`)
- [ ] Processo está rodando (verificar com `ps aux | grep serve`)

---

## 🔧 Soluções

### Solução 1: Verificar se o servidor está rodando

```bash
# No servidor/container
cd /code
npm run start
```

Se funcionar manualmente, o problema é com o gerenciamento de processo do EasyPanel.

### Solução 2: Atualizar start-server.js para escutar em todas as interfaces

O `serve` por padrão escuta em `localhost`. Precisamos garantir que escute em `0.0.0.0`.

### Solução 3: Verificar configuração do EasyPanel

1. **Porta**: Deve ser `5173` (ou a porta configurada)
2. **Start Command**: `cd /code && npm run start`
3. **Build Command**: `cd /code && chmod +x ./deploy.sh && ./deploy.sh`

### Solução 4: Verificar logs

No EasyPanel, acesse os logs do aplicativo e verifique:
- Erros de inicialização
- Mensagens do `start-server.js`
- Erros do `serve`

---

## 🚀 Teste Rápido

Execute no servidor:

```bash
cd /code

# 1. Verificar se dist existe
ls -la dist/

# 2. Verificar se serve.json existe
ls -la serve.json

# 3. Testar servidor manualmente
PORT=5173 npm run start
```

Se funcionar manualmente, o problema está na configuração do EasyPanel.

---

## 📝 Próximos Passos

1. Verifique os logs do EasyPanel
2. Teste o servidor manualmente
3. Verifique a configuração de porta
4. Se necessário, atualize o `start-server.js` para garantir que escute em `0.0.0.0`

