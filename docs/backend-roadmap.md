# Roadmap backend — Espacios MDP

## Principio de arquitectura

El backend debe ser la fuente de verdad del negocio. Google Calendar, Mercado Pago, facturación, WhatsApp y cerraduras deben ser integraciones alrededor del core.

Entidad central:

```txt
Space → Availability → Booking → Payment → Invoice / AccessCredential / Notification
```

## Implementado en esta base

Modelos Prisma:

- User
- ProfessionalProfile
- Space
- SpaceAmenity
- SpaceImage
- AvailabilityRule
- AvailabilityBlock
- Booking
- RecurringBookingRule
- Lead
- Payment
- AuditLog

Módulos NestJS:

- Auth placeholder
- Users
- Professional Profiles
- Spaces
- Availability
- Bookings
- Leads
- Payments
- Audit Log
- Admin Dashboard
- Prisma
- Health

## Futuro cercano

### Google Calendar

Agregar:

- CalendarConnection
- Calendar
- CalendarEventMapping

Flujo recomendado:

1. Reserva creada internamente.
2. Backend valida disponibilidad.
3. Backend crea evento en Google Calendar.
4. Backend guarda el `providerEventId`.
5. Si se cancela la reserva, se elimina/cancela el evento externo.

Google Calendar no debe ser la fuente principal; debe reflejar el estado del sistema.

### Cerradura inteligente

Agregar:

- LockDevice
- AccessCredential
- AccessLog

Flujo recomendado:

1. Reserva confirmada y pagada.
2. Backend genera credencial de acceso.
3. Backend envía la credencial a la cerradura o proveedor.
4. Código válido desde X minutos antes hasta X minutos después de la reserva.
5. Logs de apertura quedan asociados a la reserva.

No guardar códigos en texto plano. Usar cifrado y mostrar solo referencia parcial.

### Pagos

Primero registrar pagos manuales. Luego integrar Mercado Pago.

### Facturación

Agregar módulo separado. No mezclar factura con reserva. La factura debería depender del pago aprobado y del perfil fiscal.
