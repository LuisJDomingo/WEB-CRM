# Política de Seguridad

La seguridad es una prioridad en este proyecto. A continuación se detallan las medidas implementadas y cómo reportar una vulnerabilidad.

## Medidas de Seguridad Implementadas

### Autenticación

*   **Tokens JWT**: El acceso al panel de administración está protegido mediante JSON Web Tokens (JWT). Cada petición a la API del backend debe incluir un `Bearer Token` válido en la cabecera `Authorization`.
*   **Hashing de Contraseñas**: Las contraseñas de los trabajadores se almacenan en la base de datos utilizando el algoritmo `bcrypt` para asegurar que no se guardan en texto plano.

### Autorización

*   **Roles de Usuario**: El sistema define roles (`admin`, `editor`) para los trabajadores. Aunque la lógica de autorización a nivel de ruta todavía está pendiente de una implementación más granular, la base está sentada para restringir el acceso a ciertas funcionalidades según el rol del usuario.

### Base de Datos (Supabase)

*   **Row Level Security (RLS)**: Se recomienda activar y configurar RLS en Supabase para asegurar que los usuarios solo puedan acceder a los datos que les corresponden. Por ejemplo, un cliente solo debería poder ver su propia galería.
*   **Credenciales Seguras**: Las claves de la API de Supabase se gestionan a través de variables de entorno (`.env`) y no deben ser expuestas en el código del frontend.

### Subida de Archivos

*   **Multer**: Se utiliza `multer` en el backend para gestionar la subida de imágenes, lo que permite un control sobre los tipos de archivo y los límites de tamaño.

### Variables de Entorno

*   Todas las claves sensibles (secretos de JWT, claves de API, credenciales de base de datos) se gestionan a través de un archivo `.env` que está excluido del control de versiones gracias al `.gitignore`.

## Reportar una Vulnerabilidad

Si descubres una vulnerabilidad de seguridad, por favor, reportala de forma privada enviando un email a `admin@example.com` (reemplazar con un email real).

Por favor, incluye una descripción detallada de la vulnerabilidad y los pasos para reproducirla. Agradecemos tu ayuda para mantener este proyecto seguro.