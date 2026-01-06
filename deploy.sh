#!/bin/bash

# Script de deploy para EasyPanel
# Zona Azul Frontend

set -e

echo "🚀 Iniciando deploy do Zona Azul Frontend..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretório de trabalho (EasyPanel usa /code)
cd /code 2>/dev/null || cd "$(dirname "$0")" || exit 1

echo -e "${GREEN}📦 Instalando dependências (incluindo devDependencies para build)...${NC}"
# Instalar todas as dependências (incluindo devDependencies necessárias para o build)
npm ci || npm install

echo -e "${GREEN}🔨 Executando build de produção...${NC}"

# Verificar se a variável de ambiente VITE_API_URL está definida
if [ -z "$VITE_API_URL" ]; then
  echo -e "${YELLOW}⚠️  VITE_API_URL não definida, usando padrão: http://localhost:3000/api/v1${NC}"
  export VITE_API_URL=${VITE_API_URL:-http://localhost:3000/api/v1}
fi

# Executar build
npm run build:prod

# Verificar se o build foi bem-sucedido
if [ ! -d "dist" ]; then
  echo -e "${RED}❌ Erro: Diretório dist não foi criado após o build${NC}"
  exit 1
fi

# Verificar se há arquivos no dist
if [ -z "$(ls -A dist)" ]; then
  echo -e "${RED}❌ Erro: Diretório dist está vazio${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
echo -e "${GREEN}📁 Arquivos gerados em: dist/${NC}"

# Verificar se serve.json existe na raiz (necessário para o servidor)
if [ ! -f "serve.json" ]; then
  echo -e "${YELLOW}⚠️  serve.json não encontrado na raiz do projeto${NC}"
  echo -e "${YELLOW}   O servidor funcionará com configuração padrão${NC}"
else
  echo -e "${GREEN}✅ serve.json encontrado${NC}"
fi

# Verificar se serve está instalado globalmente
if ! command -v serve &> /dev/null; then
  echo -e "${YELLOW}⚠️  'serve' não encontrado. Instalando...${NC}"
  npm install -g serve@14.2.0
fi

echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo -e "${GREEN}📱 O servidor será iniciado pelo supervisor${NC}"

exit 0

