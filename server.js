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
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
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

  // Parse da URL
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(DIST_DIR, filePath.split('?')[0]); // Remove query string

  // Prevenir directory traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Verificar se o arquivo existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Se não encontrar, tentar index.html (SPA routing)
      if (req.url !== '/index.html') {
        const indexPath = path.join(DIST_DIR, 'index.html');
        fs.readFile(indexPath, (err, data) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
          }
          sendFile(res, indexPath, data);
        });
        return;
      }
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
  if (['.js', '.css', '.png', '.jpg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.ico'].includes(ext)) {
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

// Iniciar servidor
server.listen(PORT, HOST, () => {
  console.log('🚀 Servidor HTTP iniciado!');
  console.log(`🌐 Escutando em ${HOST}:${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
  console.log(`📁 Servindo arquivos de: ${DIST_DIR}`);
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

