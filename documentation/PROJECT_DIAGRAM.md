# Diagrama de Estructura de Archivos

Aquí tienes una representación visual de la estructura de carpetas y archivos más importantes del proyecto.

```
.
├── .env.local
├── server.ts
├── server/
│   └── routes/
│       └── workers.ts
└── src/
    ├── App.tsx
    ├── Layout.tsx
    ├── index.css
    ├── components/
    │   ├── AdminPageLayout.tsx
    │   ├── BookingAgent.tsx
    │   ├── ErrorBoundary.tsx
    │   ├── Footer.tsx
    │   ├── GalleryDashboard.tsx
    │   ├── GalleryManager.tsx
    │   ├── Navigation.tsx
    │   └── ui/
    │       └── ... (componentes de ShadCN/UI)
    ├── contexts/
    │   └── AuthContext.tsx
    └── pages/
        ├── Home.tsx
        ├── Portfolio.tsx
        ├── Services.tsx
        ├── Contact.tsx
        ├── PrivateGallery.tsx
        ├── NotFound.tsx
        ├── AdminDashboard.tsx
        ├── AdminAgenda.tsx
        ├── AdminCrm.tsx
        ├── AdminCrmHub.tsx
        ├── AdminGallery.tsx
        ├── AdminPipeline.tsx
        ├── AdminTasks.tsx
        ├── AdminTaskRules.tsx
        └── AdminUsers.tsx
```

## Leyenda

-   **`server.ts`**: Backend principal con Express.
-   **/server/routes/**: Define los endpoints de la API.
-   **/src/**: Contiene todo el código del frontend (React).
-   **/src/components/**: Componentes reutilizables de la interfaz.
-   **/src/contexts/**: Proveedores de estado global (ej. autenticación).
-   **/src/pages/**: Cada archivo representa una página o vista principal de la aplicación.
