# Configuración de Producción - Frontend Cumple

## Variables de Entorno

Para producción, crea un archivo `.env.production` con:

```env
NEXT_PUBLIC_API_URL=https://cumpleback.vmoop.com
```

## Deploy en HostGator

1. Crear subdominio `cumple.vmoop.com` apuntando a la carpeta donde subirás el build
2. Crear el archivo `.env.production` con la URL del backend
3. Instalar dependencias y hacer build:
   ```bash
   npm install
   npm run build
   ```
4. Subir la carpeta `.next`, `public`, `node_modules`, `package.json` y archivos de configuración
5. En el servidor, instalar Node.js y ejecutar:
   ```bash
   npm install --production
   npm run start
   ```

## Desarrollo Local

Para desarrollo local, crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## URLs

- **Frontend Producción**: https://cumple.vmoop.com
- **Backend Producción**: https://cumpleback.vmoop.com
- **Frontend Local**: http://localhost:3000
- **Backend Local**: http://localhost:8000
