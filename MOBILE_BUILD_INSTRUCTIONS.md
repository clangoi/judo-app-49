
# Construir APK para Android

Esta aplicación está configurada con Capacitor para generar una APK de Android. Sigue estos pasos:

## Prerrequisitos

1. **Node.js** instalado (versión 16 o superior)
2. **Android Studio** instalado
3. **Java Development Kit (JDK)** 8 o superior

## Pasos para generar la APK

### 1. Preparar el proyecto

```bash
# Exportar el proyecto de Lovable a GitHub
# Clonar el repositorio localmente
git clone [URL_DE_TU_REPOSITORIO]
cd [NOMBRE_DEL_PROYECTO]

# Instalar dependencias
npm install
```

### 2. Inicializar Capacitor

```bash
# Inicializar Capacitor (solo la primera vez)
npx cap init

# Agregar plataforma Android
npx cap add android
```

### 3. Configurar permisos de Android

Edita el archivo `android/app/src/main/AndroidManifest.xml` y agrega los permisos del archivo `android-permissions.xml`.

### 4. Construir la aplicación

```bash
# Construir la aplicación web
npm run build

# Sincronizar con la plataforma nativa
npx cap sync android
```

### 5. Generar APK

**Opción A: Usando Android Studio (Recomendado)**
```bash
# Abrir en Android Studio
npx cap open android
```
En Android Studio:
- Build > Build Bundle(s) / APK(s) > Build APK(s)
- El APK se generará en `android/app/build/outputs/apk/debug/`

**Opción B: Línea de comandos**
```bash
# Generar APK de debug
cd android
./gradlew assembleDebug
```

### 6. Instalar en dispositivo

```bash
# Instalar directamente en dispositivo conectado
npx cap run android

# O instalar manualmente el APK generado
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Configuración para Producción

Para generar una APK firmada para Play Store:

1. Crear keystore:
```bash
keytool -genkey -v -keystore my-upload-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

2. Configurar en `android/app/build.gradle`
3. Generar APK de release:
```bash
cd android
./gradlew assembleRelease
```

## Características de la APK

✅ **Funcionalidades incluidas:**
- Todas las funciones de la aplicación web
- Acceso offline parcial
- Cámara para videos
- Almacenamiento local
- Notificaciones push (configurables)

✅ **Optimizaciones móviles:**
- Interfaz optimizada para touch
- Mejores controles de video
- Navegación móvil mejorada
- Splash screen personalizado

## Solución de problemas

**Error de permisos:**
- Verificar que los permisos estén en AndroidManifest.xml

**Error de compilación:**
- Limpiar y reconstruir: `cd android && ./gradlew clean`
- Verificar versión de JDK y Android Studio

**APK muy grande:**
- Revisar assets y optimizar imágenes
- Usar `assembleRelease` en lugar de `assembleDebug`

## Recursos adicionales

- [Documentación de Capacitor](https://capacitorjs.com/docs)
- [Guía de publicación en Play Store](https://developer.android.com/studio/publish)
- [Blog post sobre desarrollo móvil con Lovable](https://lovable.dev/blogs/TODO)
