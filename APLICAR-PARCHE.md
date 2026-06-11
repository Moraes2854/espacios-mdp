# Parche: seed de servicios incluidos

Este parche modifica únicamente:

```text
backend/prisma/seed.ts
```

## Qué agrega

- Catálogo global de servicios incluidos (`Amenity`).
- Asignación de servicios a cada espacio mediante `SpaceAmenity`.
- Reutilización del mismo servicio en más de un espacio.
- Íconos como nombres de Material Symbols.
- Servicios destacados para mostrar en cards públicas/admin.

## Servicios incluidos cargados

- WiFi
- Climatización
- Limpieza incluida
- Ambiente privado
- Escritorio
- Sillones / sillas
- Luz natural
- Café
- Acceso digital
- Cerradura inteligente
- Seguridad en ingreso
- Cámara en ingreso
- Baño
- Ascensor
- Monitor

## Después de aplicar

Si todavía no aplicaste la migración del catálogo de amenities:

```cmd
cd backend
npx prisma migrate dev --name amenities_catalog
```

Luego ejecutá:

```cmd
npm run db:seed
```

Si tu backend ya está corriendo en watch mode, reinicialo si no toma los cambios del seed.
