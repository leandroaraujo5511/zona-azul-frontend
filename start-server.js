#!/usr/bin/env node

/**
 * Script para iniciar o servidor frontend em produção
 * Zona Azul Frontend
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Verificar se serve.json existe
const serveJsonPath = path.join(__dirname, 'serve.json');
const serveArgs = ['-s', 'dist', '-l', PORT.toString()];
if (fs.existsSync(serveJsonPath)) {
  serveArgs.push('-c', 'serve.json');
}

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

