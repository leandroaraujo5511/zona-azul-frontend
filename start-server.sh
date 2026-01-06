#!/bin/bash

# Script para iniciar o servidor frontend em produção
# Zona Azul Frontend

set -e

echo "🚀 Iniciando Zona Azul Frontend..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se o diretório dist existe
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}⚠️  Diretório dist não encontrado. Executando build...${NC}"
    npm run build:prod
fi

# Verificar se serve está instalado
if ! command -v serve &> /dev/null; then
    echo -e "${YELLOW}⚠️  'serve' não encontrado. Instalando...${NC}"
    npm install -g serve
fi

# Porta (padrão 5173, pode ser alterada via variável de ambiente)
PORT=${PORT:-5173}

echo -e "${GREEN}✅ Iniciando servidor na porta ${PORT}...${NC}"
echo -e "${GREEN}📱 Acesse: http://localhost:${PORT}${NC}"
echo ""

# Iniciar servidor com configuração
serve -s dist -l $PORT -c serve.json





