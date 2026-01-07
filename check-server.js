#!/usr/bin/env node

/**
 * Script de diagnóstico para verificar o servidor
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 5173;
const DIST_DIR = path.join(__dirname, 'dist');

console.log('🔍 Diagnóstico do Servidor\n');

// 1. Verificar se dist existe
console.log('1. Verificando diretório dist...');
if (fs.existsSync(DIST_DIR)) {
  console.log(`   ✅ Diretório dist existe: ${DIST_DIR}`);
  const files = fs.readdirSync(DIST_DIR);
  console.log(`   📁 Arquivos encontrados: ${files.length}`);
  if (files.includes('index.html')) {
    console.log('   ✅ index.html encontrado');
  } else {
    console.log('   ❌ index.html NÃO encontrado!');
  }
} else {
  console.log(`   ❌ Diretório dist NÃO existe: ${DIST_DIR}`);
  console.log('   💡 Execute: npm run build:prod');
}

console.log('');

// 2. Verificar porta
console.log(`2. Verificando porta ${PORT}...`);
const testServer = http.createServer();
testServer.listen(PORT, '0.0.0.0', () => {
  console.log(`   ✅ Porta ${PORT} está disponível`);
  testServer.close(() => {
    console.log('');
    testServer2.listen(PORT, '127.0.0.1', () => {
      console.log(`   ✅ Porta ${PORT} também funciona em localhost`);
      testServer2.close(() => {
        console.log('');
        runHealthCheck();
      });
    });
  });
});

const testServer2 = http.createServer();

testServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`   ⚠️  Porta ${PORT} já está em uso`);
    console.log('   💡 Verifique se outro processo está usando a porta');
  } else {
    console.log(`   ❌ Erro ao testar porta: ${err.message}`);
  }
  console.log('');
  runHealthCheck();
});

function runHealthCheck() {
  // 3. Testar se o servidor responde
  console.log('3. Testando resposta do servidor...');
  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/',
    method: 'GET',
    timeout: 2000,
  };

  const req = http.request(options, (res) => {
    console.log(`   ✅ Servidor respondeu com status: ${res.statusCode}`);
    console.log(`   📡 Headers:`, res.headers);
    process.exit(0);
  });

  req.on('error', (err) => {
    console.log(`   ❌ Servidor não está respondendo: ${err.message}`);
    console.log('   💡 Verifique se o servidor está rodando');
    console.log('   💡 Execute: npm run start');
    process.exit(1);
  });

  req.on('timeout', () => {
    console.log('   ⚠️  Timeout ao conectar ao servidor');
    req.destroy();
    process.exit(1);
  });

  req.end();
}

