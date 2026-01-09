# 🔌 Integração com Backend - Sprint 2.1

Este documento descreve a estrutura de integração com o backend implementada na Sprint 2.1.

---

## 📋 Visão Geral

A integração com o backend foi implementada usando **Axios** para requisições HTTP, com interceptors para autenticação e tratamento de erros global.

---

## 🏗️ Estrutura de Arquivos

```
frontend/src/
├── lib/
│   └── api.ts                 # Configuração do Axios e interceptors
├── types/
│   └── api.ts                 # Tipos TypeScript para respostas da API
├── services/
│   ├── auth.service.ts        # Serviços de autenticação
│   ├── zone.service.ts        # Serviços de zonas
│   └── parking.service.ts     # Serviços de estacionamentos
└── contexts/
    └── AuthContext.tsx        # Context atualizado para usar API real
```

---

## ⚙️ Configuração

### Variável de Ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

**Nota**: A URL padrão é `http://localhost:3000/api/v1` se a variável não estiver definida.

---

## 🔐 Autenticação

### Configuração do Axios (`src/lib/api.ts`)

- **Request Interceptor**: Adiciona automaticamente o token de autenticação no header `Authorization`
- **Response Interceptor**: 
  - Trata erros 401 (não autorizado) redirecionando para login
  - Extrai mensagens de erro da resposta da API
  - Formata erros de rede

### Fluxo de Autenticação

1. **Login**: 
   - Usuário faz login através de `authService.login()`
   - Tokens são armazenados no `localStorage`
   - User data é armazenado no `localStorage`

2. **Verificação de Sessão**:
   - Ao inicializar, verifica se existe token
   - Valida token fazendo chamada a `/users/me`
   - Se válido, restaura sessão; se inválido, limpa storage

3. **Logout**:
   - Chama endpoint de logout no backend
   - Remove tokens e dados do usuário do `localStorage`

---

## 📦 Services

### Auth Service (`src/services/auth.service.ts`)

```typescript
authService.login(credentials)        // Login
authService.getCurrentUser()          // Obter usuário atual
authService.refreshToken(token)       // Renovar token
authService.logout(refreshToken)      // Logout
```

### Zone Service (`src/services/zone.service.ts`)

```typescript
zoneService.getAllZones(params)       // Listar zonas
zoneService.getZoneById(id)           // Obter zona por ID
zoneService.createZone(data)          // Criar zona (Admin)
zoneService.updateZone(id, data)      // Atualizar zona (Admin)
zoneService.deleteZone(id)            // Deletar zona (Admin)
```

### Parking Service (`src/services/parking.service.ts`)

```typescript
parkingService.getParkingByPlate(plate)    // Consultar por placa
parkingService.getAllParkings(params)      // Listar histórico
parkingService.getDashboardMetrics()       // Métricas do dashboard
```

---

## 🎯 Tipos TypeScript

Todos os tipos da API estão definidos em `src/types/api.ts`:

- `User` - Dados do usuário
- `Zone` - Dados da zona
- `Parking` - Dados do estacionamento
- `LoginRequest`, `LoginResponse` - Tipos de autenticação
- `CreateZoneRequest`, `UpdateZoneRequest` - Tipos de criação/atualização
- `ZonesListResponse`, `ParkingsListResponse` - Respostas paginadas
- `DashboardMetrics` - Métricas do dashboard

---

## 🔄 Uso nos Componentes

### Exemplo: Usando AuthContext

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      // Login bem-sucedido
    } else {
      // Erro: result.error
    }
  };
}
```

### Exemplo: Usando Services

```typescript
import { zoneService } from '@/services/zone.service';
import { parkingService } from '@/services/parking.service';

// Listar zonas
const zones = await zoneService.getAllZones({ status: 'active' });

// Consultar por placa
const result = await parkingService.getParkingByPlate('ABC1234');

// Métricas do dashboard
const metrics = await parkingService.getDashboardMetrics();
```

---

## ⚠️ Tratamento de Erros

### Estrutura de Erro

```typescript
interface ApiError {
  message: string;      // Mensagem de erro
  code?: string;        // Código de erro
  status?: number;      // Status HTTP
}
```

### Comportamento Automático

- **401 (Unauthorized)**: 
  - Limpa tokens e dados do usuário
  - Redireciona para `/login` (se não estiver na página de login)

- **Outros Erros**:
  - Retorna erro formatado com mensagem da API
  - Pode ser capturado com try/catch

### Exemplo de Tratamento

```typescript
try {
  const zones = await zoneService.getAllZones();
} catch (error) {
  const apiError = error as ApiError;
  console.error(apiError.message); // Mensagem de erro
  console.error(apiError.code);    // Código de erro (se disponível)
}
```

---

## 🔒 Segurança

### Tokens

- **Access Token**: Armazenado em `localStorage` como `zonaazul_token`
- **Refresh Token**: Armazenado em `localStorage` como `zonaazul_refresh_token`
- Ambos são enviados automaticamente nas requisições via interceptor

### Validação de Sessão

- Sessão é validada ao inicializar a aplicação
- Se token inválido, sessão é limpa automaticamente
- Redirecionamento automático para login em caso de 401

---

## 📝 Próximos Passos

Na próxima sprint (2.2), vamos:

- Integrar serviços nas páginas existentes
- Substituir dados mockados por dados reais
- Implementar loading states
- Adicionar tratamento de erros específicos por página

---

**Última Atualização**: Dezembro 2024  
**Sprint**: 2.1 - Integração com Backend






