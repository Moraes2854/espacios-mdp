# Espacios MDP — Full Stack Prisma/Nest/React

Proyecto base para el negocio de alquiler de espacios profesionales por hora en Mar del Plata.

Incluye:

- `backend/`: NestJS + TypeScript + Prisma + PostgreSQL.
- `frontend/`: React + TypeScript + Vite.
- `docker-compose.yml`: solo levanta PostgreSQL para desarrollo local.
- Modelos base del negocio: usuarios, perfiles profesionales, espacios, disponibilidad, reservas, pagos, leads, auditoría y módulos de precio (`PricingModule`).
- Vistas iniciales para:
  - Usuario no registrado.
  - Usuario registrado.
  - Admin.
- Botón `Sign in` arriba a la derecha y placeholder para Google OAuth futuro.
- Calendario reutilizable para visitante, usuario registrado y admin, con selección por hora y validación de módulos.

## Contacto configurado

- WhatsApp: `2235196273`
- Email: `moraessantiago@gmail.com`

## Levantar la base de datos

Desde la raíz:

```bash
npm run db:up
```

O directamente:

```bash
docker compose up -d
```

PostgreSQL queda en:

```txt
localhost:5432
usuario: postgres
password: postgres
base: espacios_mdp
```

## Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run start:dev
```

API:

```txt
http://localhost:3000/api
```

Endpoints principales:

```txt
GET    /api/health
GET    /api/spaces
GET    /api/spaces/:slug
GET    /api/availability/summary
GET    /api/availability/slots
GET    /api/pricing-modules
POST   /api/pricing-modules
GET    /api/availability-rules
GET    /api/availability-blocks
GET    /api/recurring-booking-rules
POST   /api/bookings
GET    /api/bookings
POST   /api/leads
GET    /api/leads
GET    /api/users
GET    /api/payments
GET    /api/audit-log
GET    /api/admin/dashboard
POST   /api/auth/dev-login
GET    /api/auth/google
```

## Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App:

```txt
http://localhost:5173
```


## Horarios y módulos configurados

Horarios de apertura iniciales cargados por seed:

```txt
Lunes a viernes: 08:00 a 19:00
Sábados: 09:00 a 13:00
Domingos: cerrado
```

Módulos cargados en base de datos:

```txt
1 hora: $7.500
2 horas corridas: $14.000 ($7.000/h)
3 horas corridas: $21.000 ($7.000/h)
4 horas corridas: $26.000 ($6.500/h)
5 horas corridas: $32.500 ($6.500/h)
6 horas corridas: $39.000 ($6.500/h)
7 horas corridas: $45.500 ($6.500/h)
8 horas por semana: $44.000 ($5.500/h)
```

El calendario consulta `/api/availability/slots` y cruza:

- reglas de apertura (`AvailabilityRule`),
- bloqueos (`AvailabilityBlock`),
- reservas activas (`Booking`),
- módulos de precio (`PricingModule`).

## Nota sobre autenticación

Todavía no está implementado el login real ni Google OAuth. El frontend tiene un modal de `Sign in` con:

- Continuar como usuario.
- Continuar como admin.
- Botón de Google OAuth deshabilitado/placeholder.

El backend incluye `/api/auth/dev-login` y `/api/auth/google` para dejar preparado el flujo.

## Nota sobre cerradura inteligente

En esta etapa no se implementa integración real con cerraduras. El modelo actual deja preparada la relación principal:

```txt
Booking → futuro AccessCredential → futuro LockDevice
```

En esta versión se modela la operación base del negocio. La integración con cerraduras debería agregarse luego como módulo separado (`locks` / `access`) para no mezclar lógica de reservas con lógica de dispositivos.


## Corrección en Windows / limpieza de archivos viejos

Si venís de una versión anterior del ZIP, pueden quedar archivos viejos de TypeORM o de una estructura previa. Ejecutá desde la raíz del proyecto:

```cmd
fix-project.cmd
```

O manualmente:

```cmd
powershell -ExecutionPolicy Bypass -File scripts\cleanup-stale-files.ps1
cd backend
npm install
cd ..\frontend
npm install
```

En CMD de Windows, para copiar `.env.example` usá `copy`, no `cp`:

```cmd
copy .env.example .env
```
