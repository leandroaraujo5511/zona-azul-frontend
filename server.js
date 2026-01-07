#!/usr/bin/env node

/**
 * Servidor HTTP simples para servir arquivos estáticos
 * Escuta em 0.0.0.0 para ser acessível externamente (Docker/proxy)
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 5173;
const HOST = '0.0.0.0'; // Escutar em todas as interfaces
const DIST_DIR = path.join(__dirname, 'dist');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

// Headers de segurança
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

const server = http.createServer((req, res) => {
  // Log da requisição
  console.log(`${req.method} ${req.url}`);

  // Parse da URL - remover query string e hash
  let urlPath = req.url.split('?')[0].split('#')[0];
  
  // Normalizar caminho
  if (urlPath === '/') {
    urlPath = '/index.html';
  }
  
  // Remover barra inicial para usar com path.join
  const relativePath = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;
  let filePath = path.join(DIST_DIR, relativePath);

  // Normalizar caminho (resolve .. e .)
  filePath = path.normalize(filePath);

  // Prevenir directory traversal - garantir que está dentro de DIST_DIR
  if (!filePath.startsWith(path.resolve(DIST_DIR))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Verificar se o arquivo existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Se não encontrar, tentar index.html (SPA routing)
      // Mas apenas para rotas que não são arquivos estáticos
      const isStaticAsset = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|json)$/i.test(urlPath);
      
      if (!isStaticAsset && urlPath !== '/index.html') {
        // SPA routing - servir index.html para todas as rotas não-estáticas
        const indexPath = path.join(DIST_DIR, 'index.html');
        fs.readFile(indexPath, (err, data) => {
          if (err) {
            console.error(`❌ Erro ao ler index.html: ${err.message}`);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
          }
          sendFile(res, indexPath, data);
        });
        return;
      }
      
      // Arquivo estático não encontrado
      console.error(`❌ Arquivo não encontrado: ${filePath} (URL: ${req.url})`);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    // Ler e enviar o arquivo
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      sendFile(res, filePath, data);
    });
  });
});

function sendFile(res, filePath, data) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  // Headers
  const headers = {
    'Content-Type': contentType,
    ...securityHeaders,
  };

  // Cache para assets estáticos
  if (['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.woff', '.woff2', '.ttf', '.eot', '.ico'].includes(ext)) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else {
    headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
  }

  res.writeHead(200, headers);
  res.end(data);
}

// Verificar se dist existe
if (!fs.existsSync(DIST_DIR)) {
  console.error(`❌ Diretório dist não encontrado: ${DIST_DIR}`);
  console.error('   Execute: npm run build:prod');
  process.exit(1);
}

// Verificar se index.html existe
const indexPath = path.join(DIST_DIR, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error(`❌ index.html não encontrado em: ${DIST_DIR}`);
  console.error('   Execute: npm run build:prod');
  process.exit(1);
}

// Iniciar servidor
server.listen(PORT, HOST, () => {
  console.log('🚀 Servidor HTTP iniciado!');
  console.log(`🌐 Escutando em ${HOST}:${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
  console.log(`📁 Servindo arquivos de: ${DIST_DIR}`);
  console.log(`✅ Servidor pronto para receber requisições`);
  console.log(`🔗 URL externa: http://${HOST}:${PORT}`);
  
  // Log adicional para debug
  const address = server.address();
  if (address) {
    console.log(`📍 Endereço do servidor:`, address);
  }
});

// Tratamento de erros
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${PORT} já está em uso`);
  } else {
    console.error('❌ Erro no servidor:', err.message);
  }
  process.exit(1);
});

// Tratamento de sinais
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

