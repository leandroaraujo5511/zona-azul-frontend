# 🚀 Deploy no EasyPanel - Zona Azul Frontend

Guia completo para fazer deploy do frontend no EasyPanel.

---

## 📋 Configuração no EasyPanel

### 1. Criar Novo App

1. Acesse o EasyPanel
2. Clique em **"New App"**
3. Selecione **"Node.js"** como tipo de aplicação
4. Configure:
   - **Name**: `zona-azul-frontend`
   - **Repository**: URL do seu repositório Git
   - **Branch**: `main` ou `master`

### 2. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no EasyPanel:

```env
VITE_API_URL=https://api.seudominio.com/api/v1
PORT=5173
NODE_ENV=production
```

**Importante**: 
- Substitua `https://api.seudominio.com/api/v1` pela URL real da sua API backend
- Não inclua barra (/) no final da URL

### 3. Comando de Build

No EasyPanel, configure o **Build Command**:

```bash
cd /code && chmod +x ./deploy.sh && ./deploy.sh
```

### 4. Comando de Inicialização

Configure o **Start Command**:

```bash
cd /code && npm run start
```

Ou se preferir usar o supervisor diretamente:

```bash
cd /code && supervisorctl restart nodejs-server
```

**Nota**: O EasyPanel geralmente gerencia o processo automaticamente. O comando acima é apenas se você precisar reiniciar manualmente.

### 5. Porta

Configure a porta no EasyPanel:
- **Port**: `5173`

---

## 🔧 Configuração Alternativa (Usando Supervisor)

Se o EasyPanel usar supervisor para gerenciar o processo, você pode configurar:

### Comando de Inicialização Completo:

```bash
cd /code
chmod +x ./deploy.sh && ./deploy.sh
supervisorctl restart nodejs-server
```

### Ou separado:

**Build Command:**
```bash
cd /code && chmod +x ./deploy.sh && ./deploy.sh
```

**Start Command:**
```bash
cd /code && npm run start
```

---

## 📝 Estrutura de Arquivos Necessários

Certifique-se de que os seguintes arquivos estão no repositório:

- ✅ `deploy.sh` - Script de deploy
- ✅ `package.json` - Dependências e scripts
- ✅ `vite.config.ts` - Configuração do Vite
- ✅ `serve.json` - Configuração do servidor
- ✅ `start-server.js` - Script Node.js para iniciar servidor
- ✅ `tsconfig.json` - Configuração TypeScript
- ✅ `tailwind.config.ts` - Configuração Tailwind

---

## 🔍 Verificação Pós-Deploy

### 1. Verificar Logs

No EasyPanel, acesse os logs do aplicativo e verifique:

- ✅ Build executado com sucesso
- ✅ Diretório `dist/` criado
- ✅ Servidor iniciado na porta 5173
- ✅ Sem erros no console

### 2. Testar Aplicação

1. Acesse a URL fornecida pelo EasyPanel
2. Verifique se a aplicação carrega
3. Teste o login
4. Verifique se as requisições à API estão funcionando

### 3. Verificar Console do Navegador

- Abra o DevTools (F12)
- Verifique se não há erros
- Verifique se `VITE_API_URL` está correta nas requisições

---

## 🐛 Troubleshooting

### Erro: "deploy.sh: No such file or directory"

**Solução**: Certifique-se de que o arquivo `deploy.sh` está no repositório e foi commitado.

### Erro: "Cannot find module 'serve'"

**Solução**: O script `deploy.sh` instala o `serve` automaticamente. Se persistir, adicione no **Build Command**:

```bash
cd /code && npm install -g serve@14.2.0 && chmod +x ./deploy.sh && ./deploy.sh
```

### Erro: "Build failed"

**Solução**: 
1. Verifique se todas as dependências estão no `package.json`
2. Verifique se `VITE_API_URL` está configurada
3. Verifique os logs do build no EasyPanel

### Erro: "Port already in use"

**Solução**: 
1. Verifique se outra aplicação está usando a porta 5173
2. Altere a porta no EasyPanel e atualize a variável `PORT`

### Aplicação não carrega

**Solução**:
1. Verifique se o build foi bem-sucedido (pasta `dist/` existe)
2. Verifique se o servidor está rodando (logs do EasyPanel)
3. Verifique se a porta está correta
4. Verifique se há erros no console do navegador

---

## 🔄 Atualizar Aplicação

Para atualizar a aplicação no EasyPanel:

1. Faça push das alterações para o repositório
2. No EasyPanel, clique em **"Redeploy"** ou **"Rebuild"**
3. Aguarde o build e deploy completarem
4. Verifique os logs para confirmar sucesso

---

## 📊 Monitoramento

### Logs

Acesse os logs no EasyPanel para monitorar:
- Build process
- Server startup
- Runtime errors
- Request logs

### Health Check

O EasyPanel pode configurar health checks. O servidor responde em:
- `http://localhost:5173/` (ou porta configurada)

---

## 🔐 Segurança

### Variáveis de Ambiente

Nunca commite arquivos `.env` com credenciais. Use apenas variáveis de ambiente no EasyPanel.

### HTTPS

Configure HTTPS no EasyPanel ou use um proxy reverso (Nginx) com certificado SSL.

---

## 📞 Suporte

Em caso de problemas:

1. Verifique os logs no EasyPanel
2. Verifique o console do navegador
3. Verifique se todas as variáveis de ambiente estão configuradas
4. Verifique se o build foi bem-sucedido

---

**Última atualização**: Janeiro 2025


