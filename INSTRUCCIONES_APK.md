# 🚀 Instrucciones para Generar APK con Expo

## ✅ Estado de Migración Completo

La aplicación web MentalCheck ha sido **completamente migrada** a **Expo SDK 53** (React Native 0.79) con toda la funcionalidad original:

### 🎯 Funcionalidades Migradas:
- ✅ **Timer Tabata completo** con todas las configuraciones
- ✅ **Secuencias de Tabata** (múltiples tabatas consecutivos)
- ✅ **Sistema de sincronización** entre dispositivos usando códigos únicos
- ✅ **Timer regular** y **cronómetro**
- ✅ **Notificaciones nativas** usando Expo Notifications
- ✅ **Persistencia de datos** con AsyncStorage
- ✅ **UI nativa completa** usando React Native Paper
- ✅ **Navegación por pestañas** entre Inicio, Deporte y Configuración
- ✅ **Sistema de evaluación mental** con MentalCheck integrado
- ✅ **Analytics integrados** con navegación por tabs (Herramientas/Analytics)
- ✅ **Check-ins rápidos** y evaluaciones profundas de bienestar
- ✅ **Técnicas de bienestar** y manejo de crisis
- ✅ **Dashboard de analytics** con visualización de progreso mental

## 📱 Pasos para Generar APK

### 1. Configuración Inicial
```bash
# 1. Instalar Expo CLI globalmente (mínimo versión 12.0.0)
npm install -g @expo/cli@latest eas-cli@latest

# 2. Verificar que tienes Node.js 20+ (requerido para SDK 53)
node --version  # Debe ser >= 20.0.0

# 3. Instalar dependencias del proyecto
npm install --save-package-lock-only # usando package-expo.json como referencia

# 4. Inicializar EAS (Expo Application Services)
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
├── 📄 App.tsx                     # Punto de entrada principal con navegación
├── 📄 app.json                    # Configuración de Expo
├── 📄 eas.json                    # Configuración de EAS Build
├── 📄 package.json                # Dependencias React Native
├── 📁 src/
│   ├── 📁 hooks/
│   │   ├── useTimerContext.tsx    # Lógica completa del timer
│   │   ├── useSyncManager.ts      # Sincronización entre dispositivos
│   │   ├── useCustomTemplates.ts  # Gestión de plantillas personalizadas
│   │   └── useCrudStorage.ts      # Operaciones CRUD con AsyncStorage
│   ├── 📁 components/
│   │   └── TabataTimer.tsx        # UI principal del timer
│   └── 📁 screens/
│       ├── InicioScreen.tsx       # 🏠 Pantalla de inicio con tarjetas
│       ├── DeporteScreen.tsx      # 🎯 Timer y entrenamientos deportivos
│       ├── MentalCheckScreen.tsx  # 🧠 Evaluación mental con analytics integrados
│       ├── ConfiguracionScreen.tsx # ⚙️ Configuración y sincronización
│       ├── CheckinRapidoScreen.tsx # Evaluaciones rápidas de bienestar
│       ├── BienestarScreen.tsx    # Técnicas de mindfulness y bienestar
│       ├── ManejoCrisisScreen.tsx # Herramientas de manejo de crisis
│       └── EvaluacionProfundaScreen.tsx # Análisis psicológico profundo
```

## 🎮 Funcionalidades de la App Móvil

### 🏠 Pantalla de Inicio
- **Navegación por tarjetas**: Acceso directo a Deporte, MentalCheck y Gráficos/Analytics
- **Saludo personalizado**: Mensaje dinámico según la hora del día
- **Diseño adaptativo**: UI optimizada para dispositivos móviles
- **Iconos MaterialIcons**: fitness-center, self-improvement, insert-chart-outlined

### 🎯 Timer Tabata Avanzado
- **Configuración completa**: Tiempo trabajo/descanso, ciclos, sets
- **Secuencias**: Crear múltiples tabatas consecutivos con nombres personalizados
- **Modo secuencia**: Ejecutar automáticamente una secuencia completa
- **Indicadores visuales**: Fase actual, progreso, tiempo restante
- **Feedback de audio**: Beep en los últimos 3 segundos con expo-av
- **Feedback háptico**: Vibraciones usando expo-haptics

### 🧠 MentalCheck - Evaluación de Bienestar
- **Navegación por tabs**: SegmentedButtons entre Herramientas y Analytics
- **Check-in rápido**: Evaluación express de estado emocional (30 segundos)
- **Evaluación profunda**: Análisis completo con 15+ preguntas psicológicas
- **Técnicas de bienestar**: Ejercicios de respiración y mindfulness
- **Manejo de crisis**: Herramientas para situaciones de alta ansiedad
- **Analytics integrados**: Dashboard con visualización de progreso mental
- **Exportación de datos**: Reportes completos de bienestar mental

### 📊 Sistema de Analytics Integrado
- **Vista unificada**: Analytics directamente en MentalCheck (sin pantalla separada)
- **Estadísticas de bienestar**: Resumen semanal de check-ins y sesiones
- **Métricas de progreso**: Nivel de ánimo promedio y técnicas más usadas
- **Persistencia local**: Todos los datos guardados en AsyncStorage
- **Exportación**: Generación de reportes completos en formato texto

### 🔄 Sistema de Sincronización
- **Códigos únicos**: Genera códigos de 6 caracteres para vincular dispositivos
- **Sincronización automática**: Configuraciones del timer se sincronizan en tiempo real
- **Persistencia**: Datos guardados localmente con AsyncStorage
- **Offline-first**: Funciona sin conexión, sincroniza cuando hay conectividad

### 📲 Notificaciones Nativas
- **Cambios de fase**: Notificaciones cuando cambia trabajo/descanso
- **Completado**: Alerta cuando termina el entrenamiento
- **Secuencias**: Notifica al avanzar al siguiente Tabata
- **Bienestar mental**: Recordatorios para check-ins y evaluaciones

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
4. **Abrir** MentalCheck y explorar:
   - **Deporte**: Timers Tabata y entrenamientos
   - **MentalCheck**: Evaluaciones de bienestar con analytics
   - **Configuración**: Sincronización entre dispositivos

## 🌟 Ventajas del APK vs PWA

- ✅ **Notificaciones nativas** más confiables
- ✅ **Rendimiento superior** con compilación nativa
- ✅ **Funciona offline** completamente
- ✅ **Icono en launcher** de Android
- ✅ **Permisos nativos** del sistema
- ✅ **Mejor integración** con el SO

---

**¡Tu aplicación MentalCheck está lista para generar APK!** 🚀

### ✨ Lo que tienes ahora:
- **Timer Tabata completo** con secuencias y feedback multimedia
- **Sistema MentalCheck** con evaluaciones de bienestar integradas
- **Analytics dashboard** unificado con navegación por tabs
- **Sincronización entre dispositivos** sin necesidad de servidor
- **Navegación optimizada** con acceso directo desde pantalla de inicio

Todo el ecosistema de entrenamiento físico y mental está completamente funcional en React Native nativo. 📱💪🧠