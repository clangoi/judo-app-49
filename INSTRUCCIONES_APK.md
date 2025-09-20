# 🚀 Instrucciones para Generar APK con Expo

## ✅ Estado de Migración Completo

La aplicación web MentalCheck ha sido **completamente migrada** a React Native/Expo con toda la funcionalidad original:

### 🎯 Funcionalidades Migradas:
- ✅ **Timer Tabata completo** con todas las configuraciones
- ✅ **Secuencias de Tabata** (múltiples tabatas consecutivos)
- ✅ **Sistema de sincronización** entre dispositivos usando códigos únicos
- ✅ **Timer regular** y **cronómetro**
- ✅ **Notificaciones nativas** usando Expo Notifications
- ✅ **Persistencia de datos** con AsyncStorage
- ✅ **UI nativa completa** usando React Native Paper
- ✅ **Navegación por pestañas** entre Entrenamiento y Configuración

## 📱 Pasos para Generar APK

### 1. Configuración Inicial
```bash
# 1. Instalar Expo CLI globalmente (si no lo tienes)
npm install -g @expo/cli eas-cli

# 2. Instalar dependencias del proyecto
npm install --save-package-lock-only # usando package-expo.json como referencia

# 3. Inicializar EAS (Expo Application Services)
eas login
eas build:configure
```

### 2. Configuración de Assets
Necesitas crear los siguientes archivos de imagen en la carpeta `expo-assets/`:

```
expo-assets/
├── icon.png          # 1024x1024px - Ícono principal de la app
├── adaptive-icon.png # 1024x1024px - Ícono adaptivo para Android
├── splash.png        # 1242x2436px - Splash screen
└── favicon.png       # 32x32px - Favicon
```

💡 **Tip**: Puedes usar iconos por defecto de Expo temporalmente eliminando las rutas de assets del `app.json`.

### 3. Generar APK
```bash
# Opción 1: Build en la nube de Expo (Recomendado)
eas build --platform android --profile preview

# Opción 2: Build local (requiere Android SDK)
eas build --platform android --profile preview --local
```

### 4. Descargar APK
Después del build exitoso:
1. EAS te dará un enlace para descargar el APK
2. También aparecerá en tu dashboard de Expo: https://expo.dev
3. Puedes instalar el APK directamente en dispositivos Android

## 📁 Estructura del Proyecto Migrado

```
📦 MentalCheck Expo
├── 📄 ExpoApp.tsx                 # Punto de entrada principal
├── 📄 app.json                    # Configuración de Expo
├── 📄 eas.json                    # Configuración de EAS Build
├── 📄 package-expo.json           # Dependencias React Native
├── 📁 src/
│   ├── 📁 hooks/
│   │   ├── useTimerContext.tsx    # Lógica completa del timer
│   │   └── useSyncManager.ts      # Sincronización entre dispositivos
│   ├── 📁 components/
│   │   └── TabataTimer.tsx        # UI principal del timer
│   └── 📁 screens/
│       ├── DeporteScreen.tsx      # Pantalla principal
│       └── ConfiguracionScreen.tsx # Configuración y sync
```

## 🎮 Funcionalidades de la App Móvil

### Timer Tabata Avanzado
- **Configuración completa**: Tiempo trabajo/descanso, ciclos, sets
- **Secuencias**: Crear múltiples tabatas consecutivos con nombres personalizados
- **Modo secuencia**: Ejecutar automáticamente una secuencia completa
- **Indicadores visuales**: Fase actual, progreso, tiempo restante

### Sistema de Sincronización
- **Códigos únicos**: Genera códigos de 6 caracteres para vincular dispositivos
- **Sincronización automática**: Configuraciones del timer se sincronizan en tiempo real
- **Persistencia**: Datos guardados localmente con AsyncStorage

### Notificaciones Nativas
- **Cambios de fase**: Notificaciones cuando cambia trabajo/descanso
- **Completado**: Alerta cuando termina el entrenamiento
- **Secuencias**: Notifica al avanzar al siguiente Tabata

## 🔧 Troubleshooting

### Error de Build
```bash
# Si falla el build, intentar limpiar cache
eas build:cancel  # cancelar builds pendientes
expo cache:clear  # limpiar cache
```

### Permisos Android
El APK solicitará estos permisos:
- **NOTIFICATIONS**: Para alertas del timer
- **WAKE_LOCK**: Para mantener pantalla activa durante timer
- **VIBRATE**: Para feedback háptico

## 📦 Instalación del APK

1. **Descargar** APK desde el enlace de EAS
2. **Habilitar** "Instalar apps desconocidas" en Android
3. **Instalar** el archivo APK descargado
4. **Abrir** MentalCheck y ¡empezar a entrenar!

## 🌟 Ventajas del APK vs PWA

- ✅ **Notificaciones nativas** más confiables
- ✅ **Rendimiento superior** con compilación nativa
- ✅ **Funciona offline** completamente
- ✅ **Icono en launcher** de Android
- ✅ **Permisos nativos** del sistema
- ✅ **Mejor integración** con el SO

---

**¡Tu aplicación MentalCheck está lista para generar APK!** 🚀

Todo el sistema de timer con secuencias Tabata y sincronización entre dispositivos está completamente funcional en React Native.