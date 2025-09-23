# 🚀 GitHub Pages Deployment Guide

Este sistema automatiza el despliegue de la aplicación MentalCheck Sports Training a GitHub Pages.

## 📋 Requisitos Previos

1. **Repositorio en GitHub** con acceso para crear GitHub Pages
2. **Node.js 18+** instalado localmente
3. **Git** configurado con permisos de push al repositorio

## 🛠️ Configuración Inicial

### 1. Configurar GitHub Pages en el Repositorio

1. Ve a **Settings** → **Pages** en tu repositorio de GitHub
2. Selecciona **Source**: `GitHub Actions`
3. Guarda la configuración

### 2. Configurar Variables de Entorno (Opcional)

Para dominio personalizado:
```bash
export CUSTOM_DOMAIN="tu-dominio.com"
```

## 🚀 Métodos de Despliegue

### Método 1: GitHub Actions (Recomendado)

**Automático en cada push a main/master:**

1. Haz push de tus cambios:
   ```bash
   git add .
   git commit -m "feat: new updates"
   git push origin main
   ```

2. GitHub Actions automáticamente:
   - ✅ Instala dependencias
   - ✅ Construye la aplicación
   - ✅ Despliega a GitHub Pages

### Método 2: Despliegue Local con Script

```bash
# Ejecutar script de despliegue
./deploy.sh

# O usando make
make deploy
```

### Método 3: Despliegue Manual con Comandos

```bash
# 1. Instalar dependencias
npm ci

# 2. Construir para GitHub Pages
GITHUB_PAGES=true NODE_ENV=production npx vite build --config vite.config.pages.ts

# 3. Desplegar
./deploy.sh
```

## 📁 Estructura de Archivos de Despliegue

```
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── scripts/
│   └── gh-pages-router.js      # Router fix para SPA
├── client/public/
│   ├── 404.html               # Página 404 para GitHub Pages
│   └── _redirects             # Redirects para SPA
├── vite.config.pages.ts       # Configuración Vite para GitHub Pages
├── deploy.sh                  # Script de despliegue local
├── Makefile                   # Comandos make para despliegue
└── DEPLOYMENT.md              # Esta documentación
```

## 🔧 Personalización

### Cambiar el Nombre del Repositorio

Edita `vite.config.pages.ts`:
```typescript
base: '/tu-nuevo-repositorio/',
```

Y `deploy.sh`:
```bash
REPO_NAME="tu-nuevo-repositorio"
```

### Dominio Personalizado

1. Configura la variable de entorno:
   ```bash
   export CUSTOM_DOMAIN="tu-dominio.com"
   ```

2. O edita `deploy.sh` para agregar tu dominio:
   ```bash
   echo "tu-dominio.com" > "$TEMP_DIR/CNAME"
   ```

### Diferentes Frameworks

Para usar con otros frameworks, actualiza:

1. **Next.js**: Cambia el comando build en `deploy.yml` a `npm run build && npm run export`
2. **Vue**: Cambia a `vue-cli-service build`
3. **Angular**: Cambia a `ng build --prod`

## 🌐 URLs de Acceso

Después del despliegue exitoso:

- **URL Principal**: `https://tu-usuario.github.io/tu-repositorio/`
- **Dominio Personalizado**: `https://tu-dominio.com` (si está configurado)

## 🐛 Solución de Problemas

### Error: "Build failed"
```bash
# Verifica que las dependencias estén instaladas
npm ci

# Verifica la configuración de build
npx vite build --config vite.config.pages.ts
```

### Error: "Permission denied"
```bash
# Da permisos al script
chmod +x deploy.sh
```

### Error: "No remote origin found"
```bash
# Configura el remote origin
git remote add origin https://github.com/usuario/repositorio.git
```

### Rutas SPA no funcionan
- ✅ El archivo `404.html` maneja las rutas automáticamente
- ✅ El script `gh-pages-router.js` está incluido

## 📝 Comandos Disponibles

```bash
# Usando make
make help           # Mostrar ayuda
make install        # Instalar dependencias
make build-pages    # Construir para GitHub Pages
make deploy         # Desplegar completo
make clean          # Limpiar archivos build

# Usando npm (requiere agregar scripts al package.json)
npm run build:pages # Construir para GitHub Pages
npm run deploy      # Desplegar

# Usando scripts directos
./deploy.sh         # Despliegue directo
```

## ✅ Verificación del Despliegue

1. **GitHub Actions**: Ve a la pestaña "Actions" en GitHub
2. **Estado del Workflow**: Debe aparecer en verde ✅
3. **URL del Sitio**: Disponible en Settings → Pages
4. **Tiempo**: Puede tomar 5-10 minutos en aparecer

## 🔒 Seguridad

- ✅ No se incluyen archivos `.env` o secretos
- ✅ Solo se despliega contenido estático del frontend
- ✅ Backend no se expone en GitHub Pages
- ✅ Variables sensibles se manejan por variables de entorno

---

**¡Listo!** Tu aplicación se desplegará automáticamente en cada push y estará disponible en GitHub Pages.