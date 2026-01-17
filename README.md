# 🏦 Debt Manager

Sistema de gestión de deudas entre amigos construido con **NestJS**, **React**, **PostgreSQL** y **Redis**.

## 🚀 Tecnologías

**Backend:** NestJS + TypeORM + PostgreSQL + Redis + JWT  
**Frontend:** React + TypeScript + Material-UI + React Hook Form  
**DevOps:** Docker + Docker Compose

## ⚡ Despliegue Local (Recomendado - Docker)

### Prerrequisitos
- Docker
- Docker Compose
- Node.js (v16+)

### Pasos de Instalación

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/jkarenas/debtTest.git
   cd debtTest
2. **configurar .env**
   cd backend
   cp .env.example .env

3. **Levantar servicios (PstgresSql + Redis)**
docker-compose up -d

4. **Ejecutar backend**
// En carpeta backend
npm install
npm run start:dev

5. **Ejecutar frontend**
// En una nueva terminal , carpeta frontend/
npm install
npm start


## ACESO:
Frontend: http://localhost:3001
API: http://localhost:3000
Base de datos: PostgreSQL en puerto 5432


## INSTALACION MANUAL:
-Instalar dependencias
    -PostgreSQL (crear base de datos debts_db)
    -Redis
    -Node.js
-Configurar .env con tus credenciales locales
-Ejecutar backend y frontend con los mismos comandos npm

## Decisiones Técnicas

Backend
NestJS: Arquitectura modular y escalable
TypeORM: Manejo elegante de entidades y migraciones
Redis: Cache para optimización de consultas
JWT: Autenticación stateless

Frontend
Material-UI: Componentes consistentes y accesibles
Context API: Gestión de estado simple para esta escala
React Hook Form: Mejor performance en formularios





-----------------------------------------

## API
### Endpoints Principales
POST /auth/register         # Registro
POST /auth/login            # Login
GET  /debts                 # Listar deudas
POST /debts                 # Crear deuda
GET  /debts/summary         # Métricas
PATCH /debts/:id/pay        # Marcar como pagada