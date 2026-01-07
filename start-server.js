#!/usr/bin/env node

/**
 * Script para iniciar o servidor frontend em produção
 * Zona Azul Frontend
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 5173;

console.log('🚀 Iniciando Zona Azul Frontend...');

// Verificar se o diretório dist existe
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.log('⚠️  Diretório dist não encontrado. Executando build...');
  try {
    execSync('npm run build:prod', { stdio: 'inherit', cwd: __dirname });
  } catch (error) {
    console.error('❌ Erro ao executar build:', error.message);
    process.exit(1);
  }
}

// Verificar se serve está instalado
try {
  execSync('serve --version', { stdio: 'ignore' });
} catch (error) {
  console.log('⚠️  "serve" não encontrado. Instalando...');
  try {
    execSync('npm install -g serve', { stdio: 'inherit' });
  } catch (installError) {
    console.error('❌ Erro ao instalar serve:', installError.message);
    process.exit(1);
  }
}

console.log(`✅ Iniciando servidor na porta ${PORT}...`);
console.log(`📱 Acesse: http://localhost:${PORT}`);
console.log('');

// Verificar se serve.json existe (na raiz do projeto, não no dist)
const serveJsonPath = path.join(__dirname, 'serve.json');
// IMPORTANTE: O serve por padrão escuta em todas as interfaces (0.0.0.0) quando usado em containers
// Usamos apenas a porta, e o serve automaticamente escuta em 0.0.0.0
const serveArgs = ['-s', 'dist', '-l', PORT.toString()];

// O serve.json deve estar na raiz do projeto (não no dist)
// IMPORTANTE: Quando usamos -s dist, o serve muda o cwd para dist
// Por isso precisamos usar o caminho absoluto do serve.json
if (fs.existsSync(serveJsonPath)) {
  // Usar caminho absoluto para garantir que o serve encontre o arquivo
  serveArgs.push('-c', serveJsonPath);
  console.log('✅ Usando serve.json da raiz do projeto');
  console.log(`   Caminho: ${serveJsonPath}`);
} else {
  console.log('⚠️  serve.json não encontrado na raiz, usando configuração padrão do serve');
  console.log(`   Procurando em: ${serveJsonPath}`);
}

// O serve escuta em todas as interfaces por padrão em ambientes containerizados
console.log(`🌐 Servidor escutando na porta ${PORT} (acessível externamente)`);

// Iniciar servidor
const serveProcess = spawn('serve', serveArgs, {
  stdio: 'inherit',
  cwd: __dirname,
  shell: true,
});

serveProcess.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error.message);
  process.exit(1);
});

serveProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Servidor encerrado com código ${code}`);
    process.exit(code);
  }
});

// Tratamento de sinais para encerrar corretamente
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  serveProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Encerrando servidor...');
  serveProcess.kill('SIGTERM');
  process.exit(0);
});

