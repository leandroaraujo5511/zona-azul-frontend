# ⚙️ Configuração Rápida - EasyPanel

## 📝 Comandos para Configurar no EasyPanel

### Build Command

```bash
cd /code && chmod +x ./deploy.sh && ./deploy.sh
```

### Start Command

```bash
cd /code && npm run start
```

**OU** se o EasyPanel usar supervisor:

```bash
cd /code && npm run start
```

(O supervisor vai gerenciar o processo automaticamente)

---

## 🔧 Variáveis de Ambiente

Configure estas variáveis no EasyPanel:

```env
VITE_API_URL=https://api.seudominio.com/api/v1
PORT=5173
NODE_ENV=production
```

---

## ⚠️ Importante

1. **Não use** `supervisorctl restart nodejs-server` no Start Command
   - O EasyPanel gerencia o processo automaticamente
   - Use apenas `npm run start`

2. **O deploy.sh** já faz tudo necessário:
   - Instala dependências
   - Faz o build
   - Verifica se tudo está OK

3. **Se o erro persistir**, verifique:
   - O arquivo `deploy.sh` está no repositório?
   - O arquivo tem permissão de execução? (o script já faz isso)
   - As variáveis de ambiente estão configuradas?

---

## 🚀 Teste Rápido

Após configurar, o EasyPanel vai:

1. ✅ Executar `deploy.sh` (build)
2. ✅ Executar `npm run start` (iniciar servidor)
3. ✅ Servidor rodando na porta 5173

---

## 📞 Se ainda houver problemas

Verifique os logs no EasyPanel e compare com o guia completo em `EASYPANEL.md`

