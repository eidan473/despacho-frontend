# Frontend Despachos — React + Vite

Interfaz web para la gestión de despachos de Innovatech Chile. Construida con React 18, Vite y TailwindCSS. Se comunica con el Backend a través de nginx como proxy inverso.

## Tecnologías
- React 18
- Vite 5
- TailwindCSS 3
- Axios
- Docker (multi-stage: Node build + Nginx serve)
- GitHub Actions + Amazon ECR + AWS SSM

## Funcionalidades
- Consultar órdenes de compra (ventas)
- Generar órdenes de despacho asociadas a una venta
- Revisar y cerrar órdenes de despacho

## Arquitectura de comunicación

El frontend no llama directamente al backend. Las peticiones a `/api/*` son interceptadas por nginx y proxeadas a la IP privada del backend en la subred privada de AWS:

```
Navegador → EC2 Frontend (nginx:80) → /api/ → EC2 Backend (Spring Boot:8081)
```

Esto garantiza que el backend nunca queda expuesto a internet.

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| VITE_API_URL | URL base del backend (solo desarrollo local) | http://localhost:8081 |

> En producción (EC2), nginx maneja el proxy. No se necesita VITE_API_URL.

## Levantar localmente

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# O con Docker
docker build -t despacho-frontend .
docker run -d -p 80:80 despacho-frontend
```

## Estructura del Dockerfile (multi-stage)

- **Stage 1 (builder):** usa `node:20-alpine` para ejecutar `npm run build` y generar `/dist`
- **Stage 2 (runtime):** usa `nginx:1.25-alpine` para servir los estáticos generados

## Configuración nginx

El archivo `nginx.conf` configura nginx para:
- Servir los archivos estáticos del build de Vite
- Redirigir rutas al `index.html` para React Router
- Proxear `/api/` al backend privado `10.0.2.137:8081`

## Pipeline CI/CD

El pipeline `.github/workflows/deploy-frontend.yml` se activa con push en la rama `deploy` y ejecuta:

1. **Build** — construye la imagen Docker multi-stage
2. **Push** — publica la imagen en Amazon ECR con tags `latest` y `sha`
3. **Deploy** — vía AWS SSM envía comando a la EC2 Frontend para hacer pull y reiniciar el contenedor

### Secrets requeridos en GitHub

| Secret | Descripción |
|--------|-------------|
| AWS_ACCESS_KEY_ID | Credencial AWS Academy |
| AWS_SECRET_ACCESS_KEY | Credencial AWS Academy |
| AWS_SESSION_TOKEN | Token de sesión AWS Academy |
| AWS_REGION | Región (us-east-1) |
| ECR_REGISTRY | URL base del registry ECR |
| ECR_REPO_URL_FRONTEND | URL completa del repo ECR frontend |
| EC2_FRONTEND_INSTANCE_ID | ID de la instancia EC2 frontend (i-xxxx) |
| BACKEND_PRIVATE_IP | IP privada de la EC2 Backend |

## Infraestructura AWS

| Recurso | Valor |
|---------|-------|
| EC2 Frontend | IP pública: 3.80.136.33 · Subred pública 10.0.1.0/24 |
| EC2 Backend | IP privada: 10.0.2.137 · Subred privada 10.0.2.0/24 |
| ECR Registry | 211125736105.dkr.ecr.us-east-1.amazonaws.com |
| Región | us-east-1 |
