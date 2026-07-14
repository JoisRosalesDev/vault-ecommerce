# VAULT - Plataforma de Comercio Electrónico Premium

Este es el repositorio oficial de **VAULT**, una plataforma de comercio electrónico de alta gama desarrollada utilizando Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM y Supabase. El proyecto está estructurado siguiendo los principios de diseño de software limpio y la metodología de **Diseño Atómico**.

## Tecnologías Principales

- **Framework**: Next.js (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: PostgreSQL + Prisma ORM (v7.8)
- **Autenticación y Almacenamiento**: Supabase (Auth + Storage)
- **Pasarela de Pago**: Stripe SDK
- **Gestor de Estado**: Zustand
- **Animaciones**: GSAP (GreenSock)

---

## Estructura de Directorios (Diseño Atómico)

La organización de componentes del frontend sigue estrictamente el patrón de Atomic Design:

```text
/components
  /atoms         - Elementos indivisibles (p. ej., Skeleton, Button)
  /molecules     - Agrupaciones simples de átomos (p. ej., ProductCard)
  /organisms     - Secciones complejas de la interfaz (p. ej., CartDrawer, ProductGrid)
  /templates     - Estructuras de layout de página reutilizables (p. ej., CatalogView)
```

---

## Configuración y Variables de Entorno

1. Copie el archivo de plantilla `.env.example` para crear su archivo de configuración local:
   ```bash
   cp .env.example .env
   ```
2. Complete las variables de entorno necesarias:
   - `DATABASE_URL`: URL del pool de conexiones de su base de datos.
   - `DIRECT_DATABASE_URL`: URL de conexión directa para migraciones.
   - `STRIPE_SECRET_KEY`: Llave secreta del panel de desarrollador de Stripe.
   - `STRIPE_WEBHOOK_SECRET`: Secreto para verificar la firma de eventos webhook de Stripe.
   - `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Credenciales públicas de su proyecto Supabase.

---

## Base de Datos (Prisma v7)

Prisma v7 gestiona los datos de conexión desde `prisma.config.ts` en lugar de hacerlo directamente en `schema.prisma`. 

Para inicializar y aplicar el esquema a su base de datos, ejecute:

```bash
# Sincronizar el esquema con la base de datos
npx prisma db push

# Generar el cliente de base de datos de Prisma
npx prisma generate
```

---

## Ejecución del Proyecto

1. Instale las dependencias del proyecto:
   ```bash
   pnpm install
   ```
2. Ejecute el servidor de desarrollo:
   ```bash
   pnpm dev
   ```
3. Abra [http://localhost:3000](http://localhost:3000) en su navegador para ver la aplicación web.

---

## Compilación de Producción

Para compilar y validar la aplicación para entornos de producción:

```bash
pnpm run build
```
