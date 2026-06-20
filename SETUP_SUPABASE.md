# Configuración de Supabase + Login con Google

Sigue estos pasos una sola vez. Al final, pásame el **Project URL** y la **anon key**
(o ponlos tú en `.env`) y la app queda lista.

## 1. Crear el proyecto

1. Entra a https://supabase.com → **New project**.
2. Elige nombre, contraseña de la base y región (cercana a Chile, ej. `South America (São Paulo)`).
3. Espera a que termine de aprovisionar (~1 min).

## 2. Crear la tabla

1. En el panel: **SQL Editor → New query**.
2. Pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y dale **Run**.
3. Debe crear la tabla `templates` con RLS activado.

## 3. Activar el login con Google

Necesitas un "OAuth Client" de Google.

### 3a. En Google Cloud Console (https://console.cloud.google.com)

1. Crea (o elige) un proyecto.
2. **APIs & Services → OAuth consent screen**: tipo **External**, completa nombre de la app,
   correo de soporte y guarda. (En "Test users" puedes agregar tu correo mientras está en
   modo prueba.)
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized redirect URIs**: agrega
     `https://<TU-REF>.supabase.co/auth/v1/callback`
     (el `<TU-REF>` lo ves en Supabase → Settings → API → Project URL).
   - Crea y copia el **Client ID** y el **Client secret**.

### 3b. En Supabase

1. **Authentication → Providers → Google**: actívalo.
2. Pega el **Client ID** y **Client secret** de Google. Guarda.
3. **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:5173` (luego cámbialo a tu dominio de producción).
   - **Redirect URLs**: agrega `http://localhost:5173` y, cuando despliegues, tu URL real.

## 4. Conectar la app

1. Copia `.env.example` a `.env`.
2. Rellena con **Settings → API**:
   ```
   VITE_SUPABASE_URL=https://<TU-REF>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon public key>
   ```
3. `npm run dev` → entra en `http://localhost:5173` → **Continuar con Google**.

La primera vez se crea automáticamente tu plantilla de ejemplo "Mi casa".
