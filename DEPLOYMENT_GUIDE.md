# 🚀 Guía de Despliegue: Narrativa de Bodas

Este manual explica cómo desplegar la aplicación completa (Frontend + Backend) en un entorno de producción.

## Entendiendo la Arquitectura

El proyecto tiene dos partes que deben ejecutarse simultáneamente:
1.  **Frontend (Vite + React)**: Es la parte visual que los usuarios y clientes ven. Después de compilarla, se convierte en un conjunto de archivos estáticos (HTML, CSS, JS).
2.  **Backend (Node.js + Express)**: Es la API que gestiona la lógica de negocio, la base de datos y la autenticación. Es un servidor que debe estar corriendo constantemente.

---

## ⚙️ Paso 0: Compilar el Proyecto

Antes de cualquier despliegue, necesitas compilar el frontend para producción.

1.  Abre una terminal en la raíz del proyecto.
2.  Ejecuta el comando:
    ```bash
    npm run build
    ```
3.  Esto creará una nueva carpeta `dist` en la raíz del proyecto. Esta carpeta contiene todos los archivos estáticos optimizados de tu frontend.

---

## Escenario 1: Despliegue en Servidor Propio (Windows Server)

Este método es ideal si tienes control total sobre un servidor con Windows. Usaremos **IIS** para el frontend y **PM2** para el backend.

### Prerrequisitos
*   Windows Server con acceso de administrador.
*   **Node.js** instalado en el servidor.
*   **IIS (Internet Information Services)** instalado y activado (desde "Activar o desactivar las características de Windows").
*   **URL Rewrite Module** para IIS instalado. Descárgalo aquí.

### Pasos

#### 1. Preparar el Servidor

1.  Copia la carpeta completa de tu proyecto al servidor (ej: `C:\inetpub\wwwroot\narrativa-bodas`).
2.  Abre una terminal en esa carpeta y ejecuta `npm install` para instalar las dependencias del backend.
3.  Crea el archivo `.env.local` en la raíz con las variables de entorno de producción (tu URL de Supabase real, un `JWT_SECRET` seguro, etc.).

#### 2. Configurar y Ejecutar el Backend con PM2

PM2 es un gestor de procesos que mantendrá tu API de Node.js corriendo 24/7.

```bash
# 1. Instalar PM2 globalmente
npm install pm2 -g

# 2. Iniciar tu servidor de backend
pm2 start server.ts --name "narrativa-bodas-api"

# 3. Guardar la lista de procesos para que se reinicie con el servidor
pm2 save

# 4. (Opcional) Configurar PM2 para que inicie al arrancar Windows
pm2 startup
```
Tu backend ahora está corriendo en `http://localhost:3001`.

#### 3. Configurar el Frontend con IIS

1.  Abre el "Administrador de Internet Information Services (IIS)".
2.  En el panel "Conexiones", haz clic derecho en "Sitios" y selecciona "Agregar sitio web".
3.  **Nombre del sitio:** `Narrativa Bodas`
4.  **Ruta de acceso física:** `C:\inetpub\wwwroot\narrativa-bodas\dist` (¡Apunta a la carpeta `dist`!)
5.  **Enlace:** Configura el puerto (ej: 80) y el nombre de host (ej: `www.tusitioweb.com`).
6.  Haz clic en "Aceptar".

#### 4. Configurar URL Rewrite para React

Como es una Single Page Application (SPA), todas las rutas (`/portfolio`, `/contacto`) deben redirigir a `index.html`.

1.  Dentro de la carpeta `dist`, crea un archivo llamado `web.config`.
2.  Pega el siguiente contenido en él:

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <configuration>
      <system.webServer>
        <rewrite>
          <rules>
            <rule name="React Routes" stopProcessing="true">
              <match url=".*" />
              <conditions logicalGrouping="MatchAll">
                <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
              </conditions>
              <action type="Rewrite" url="/" />
            </rule>
          </rules>
        </rewrite>
      </system.webServer>
    </configuration>
    ```

¡Listo! Tu sitio debería estar online. Asegúrate de que el firewall de Windows permite el tráfico en los puertos 80, 443 y 3001.

---

## Escenario 2: Despliegue en Hosting (GoDaddy, etc.)

**¡Importante!** Los planes de hosting compartido más baratos (generalmente para WordPress/PHP) **NO** funcionan para aplicaciones Node.js. Necesitas un **VPS (Servidor Privado Virtual)** o un plan de hosting que explícitamente soporte Node.js (como los planes de cPanel más avanzados).

La opción más robusta y recomendada es un **VPS con Linux (Ubuntu)**.

### Prerrequisitos
*   Un VPS con acceso SSH.
*   Un nombre de dominio apuntando a la IP de tu VPS.

### Pasos (VPS con Linux + Nginx)

#### 1. Preparar el Servidor

1.  Conéctate a tu VPS por SSH.
2.  Instala las herramientas necesarias:
    ```bash
    sudo apt update
    sudo apt install -y nodejs npm git nginx
    ```
3.  Clona tu repositorio desde GitHub:
    ```bash
    git clone https://github.com/tu-usuario/tu-proyecto.git /var/www/narrativa-bodas
    ```
4.  Navega a la carpeta, instala dependencias y compila el proyecto:
    ```bash
    cd /var/www/narrativa-bodas
    npm install
    npm run build
    ```
5.  Crea el archivo `.env.local` con tus variables de producción.

#### 2. Configurar y Ejecutar el Backend con PM2

El proceso es idéntico al de Windows.

```bash
sudo npm install pm2 -g
pm2 start server.ts --name "narrativa-bodas-api"
pm2 save
sudo pm2 startup systemd
```

#### 3. Configurar el Frontend con Nginx

Nginx servirá los archivos estáticos del frontend y actuará como un "proxy inverso" para redirigir las peticiones a la API hacia tu backend de Node.js.

1.  Crea un nuevo archivo de configuración para tu sitio:
    ```bash
    sudo nano /etc/nginx/sites-available/narrativa-bodas
    ```
2.  Pega la siguiente configuración (reemplaza `www.tusitioweb.com` con tu dominio):

    ```nginx
    server {
        listen 80;
        server_name www.tusitioweb.com;

        # Ruta a los archivos del frontend compilado
        root /var/www/narrativa-bodas/dist;
        index index.html;

        # Configuración para la API (Proxy Inverso)
        # Todas las peticiones a /api/... se redirigen al backend
        location /api {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Configuración para la Single Page Application (SPA)
        # Si un archivo no se encuentra, devuelve index.html
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
    ```

3.  Activa la configuración y reinicia Nginx:
    ```bash
    # Crear un enlace simbólico para activar el sitio
    sudo ln -s /etc/nginx/sites-available/narrativa-bodas /etc/nginx/sites-enabled/

    # Probar la configuración de Nginx
    sudo nginx -t

    # Reiniciar Nginx para aplicar los cambios
    sudo systemctl restart nginx
    ```

### 4. (Recomendado) Configurar SSL con Let's Encrypt

Para tener HTTPS (el candado de seguridad):

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener e instalar el certificado para tu dominio
sudo certbot --nginx -d www.tusitioweb.com
```

Certbot modificará automáticamente tu archivo de Nginx para forzar HTTPS. ¡Tu sitio ya está desplegado de forma segura y profesional!

---

## Escenario 3: Despliegue Moderno con Vercel y Render (Recomendado)

Este es el método más recomendado por su simplicidad, velocidad y porque ambos servicios ofrecen planes gratuitos generosos. Separa el frontend y el backend en dos plataformas optimizadas para cada tarea.

### Prerrequisitos
*   Tu proyecto subido a un repositorio de GitHub.
*   Una cuenta en [Vercel](https://vercel.com).
*   Una cuenta en [Render](https://render.com).

### Parte 1: Desplegar el Backend en Render

1.  **Crear un Nuevo Servicio Web:**
    *   En tu dashboard de Render, haz clic en **"New +"** y selecciona **"Web Service"**.
    *   Conecta tu repositorio de GitHub y selecciona el de este proyecto.

2.  **Configurar el Servicio:**
    *   **Name:** Dale un nombre único (ej: `narrativa-bodas-api`).
    *   **Region:** Elige la más cercana (ej: Frankfurt).
    *   **Branch:** `main` (o la rama principal de tu repo).
    *   **Build Command:** `npm install`
    *   **Start Command:** `node server.js` (o `npm run server` si lo tienes en `package.json`).
    *   **Instance Type:** Elige el plan **Free**.

3.  **Añadir Variables de Entorno:**
    *   Ve a la pestaña **"Environment"**.
    *   Haz clic en **"Add Environment Variable"** para cada una de las claves de tu archivo `.env.local` (la sección `VITE_` no es necesaria aquí).
    *   Claves importantes: `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

4.  **Desplegar:**
    *   Haz clic en **"Create Web Service"**. Render instalará las dependencias y arrancará tu servidor.
    *   Una vez desplegado, Render te dará una URL pública para tu API, algo como `https://narrativa-bodas-api.onrender.com`. **Copia esta URL.**

### Parte 2: Desplegar el Frontend en Vercel

1.  **Importar Proyecto:**
    *   En tu dashboard de Vercel, haz clic en **"Add New..." -> "Project"**.
    *   Busca y selecciona tu repositorio de GitHub.

2.  **Configurar el Proyecto:**
    *   **Framework Preset:** Vercel debería detectar **"Vite"** automáticamente. Si no, selecciónalo.
    *   **Build and Output Settings:** Déjalos como están. Vercel sabe cómo compilar un proyecto Vite.

3.  **Añadir Variables de Entorno:**
    *   Expande la sección **"Environment Variables"**.
    *   Añade las variables que necesita tu frontend (las que empiezan con `VITE_` en tu `.env.local`).
    *   `VITE_SUPABASE_URL`: Tu URL de Supabase.
    *   `VITE_SUPABASE_ANON_KEY`: Tu clave anónima de Supabase.
    *   **`VITE_API_URL`**: **¡Esta es la más importante!** Pega aquí la URL de tu backend que copiaste de Render (ej: `https://narrativa-bodas-api.onrender.com`).

4.  **Desplegar:**
    *   Haz clic en el botón **"Deploy"**.

¡Y listo! En unos minutos, Vercel te dará la URL de tu sitio web completamente funcional. A partir de ahora, cada vez que hagas un `git push` a tu repositorio, Vercel y Render reconstruirán y desplegarán automáticamente las últimas versiones de tu frontend y backend.

Este método es el estándar de la industria para este tipo de aplicaciones.

---

## Apéndice: Obtención de Credenciales

Esta sección explica cómo obtener las claves necesarias para tu archivo `.env.local`.

### 1. Credenciales de Supabase

Necesitas tres claves de tu proyecto de Supabase.

1.  Ve a supabase.com y entra en tu proyecto.
2.  En el menú de la izquierda, haz clic en el icono de engranaje (**Project Settings**).
3.  Selecciona la sección **API**.
4.  Aquí encontrarás todo lo que necesitas:
    *   `VITE_SUPABASE_URL`: Cópiala del campo **Project URL**.
    *   `VITE_SUPABASE_ANON_KEY`: Cópiala del campo **Project API Keys** -> `anon` `public`.
    *   `SUPABASE_SERVICE_ROLE_KEY`: Cópiala del campo **Project API Keys** -> `service_role` `secret`. **¡IMPORTANTE!** Esta clave es secreta y solo debe usarse en el backend. Nunca la expongas en el código del cliente.

### 2. Secreto para JWT (`JWT_SECRET`)

Esta es una cadena de texto aleatoria que tú inventas para firmar los tokens de autenticación. Debe ser larga y difícil de adivinar.

*   **Cómo generarla:** Puedes usar un generador de contraseñas online (como el de 1Password o Bitwarden) y crear una cadena de más de 32 caracteres.
*   **Ejemplo:** `mi_secreto_ultra_largo_y_seguro_para_jwt_con_numeros_12345`

### 3. URL de la API (`VITE_API_URL`)

Esta variable le dice al frontend dónde está el backend.

*   **En desarrollo local:** Su valor es `http://localhost:3001`.
*   **En producción (con Nginx):** Su valor debe ser la URL pública de tu sitio web (ej: `https://www.tusitioweb.com`). Nginx se encargará de redirigir las llamadas que vayan a `/api` hacia el backend que corre en `http://localhost:3001` dentro del servidor.

### 4. Credenciales SMTP (Opcional)

Estas credenciales son necesarias si quieres que el formulario de contacto envíe notificaciones por email.

*   **Fuente:** Debes obtenerlas de un proveedor de correo transaccional.
    *   **Recomendados:** SendGrid, Mailgun, Postmark.
    *   **Alternativa:** Puedes usar una cuenta de Gmail generando una "Contraseña de aplicación" (no tu contraseña principal).
*   `SMTP_SERVER`: El servidor de tu proveedor (ej: `smtp.sendgrid.net`).
*   `SMTP_PORT`: El puerto (ej: `587` o `465`).
*   `SMTP_USER`: Tu nombre de usuario.
*   `SMTP_PASSWORD`: La contraseña o clave API que te proporcione el servicio.
*   `ADMIN_EMAILS`: La dirección de correo donde quieres recibir las notificaciones.

### 5. URL de Ollama (Opcional)

Esta variable solo es necesaria si implementas el chatbot con un modelo de lenguaje local.

*   **`OLLAMA_API_BASE`**: Es la dirección donde se está ejecutando el servidor de Ollama.
*   **Valor por defecto:** `http://localhost:11434`.
