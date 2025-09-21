# 🏃‍♂️ MentalCheck Sports Training Platform

<div align="center">

**Sistema integral dual para entrenamiento deportivo y evaluación de bienestar mental**

[![React Native](https://img.shields.io/badge/React_Native-0.79-blue.svg)](https://reactnative.dev/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Expo SDK](https://img.shields.io/badge/Expo_SDK-53-000020.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)

</div>

## 📱 Aplicaciones

Este proyecto consta de **dos aplicaciones complementarias**:

### 🌐 Aplicación Web
Sistema completo de gestión de entrenamiento deportivo con roles de usuario y administración de clubes.

### 📱 Aplicación Móvil (MentalCheck APK)
App nativa para Android enfocada en timers de entrenamiento, evaluación mental y sincronización entre dispositivos.

---

## ✨ Características Principales

### 🏃‍♂️ Aplicación Web
- **👥 Sistema de Roles**: Deportistas, Entrenadores y Administradores
- **🏋️‍♂️ Gestión de Entrenamientos**: Planificación y seguimiento de sesiones
- **🎯 Biblioteca de Técnicas**: Documentación multimedia de técnicas deportivas
- **📊 Analytics Avanzados**: Visualización de progreso y rendimiento
- **🏆 Sistema de Logros**: Gamificación con badges y objetivos
- **🍎 Control Nutricional**: Seguimiento de alimentación y peso
- **🏢 Administración de Clubes**: Gestión multi-club con asignaciones

### 📱 Aplicación Móvil MentalCheck
- **⏱️ Timer Tabata Avanzado**: Configuraciones personalizables con secuencias
- **🧠 Evaluación Mental**: Check-ins rápidos y análisis psicológicos profundos
- **📊 Analytics Integrados**: Dashboard con navegación por tabs (Herramientas/Analytics)
- **🔄 Sincronización**: Códigos únicos para vincular múltiples dispositivos
- **🎵 Feedback Multimedia**: Audio (expo-av) y vibración (expo-haptics)
- **💾 Funcionamiento Offline**: Persistencia local con AsyncStorage
- **🔔 Notificaciones Nativas**: Alertas para entrenamientos y bienestar

---

## 🛠️ Stack Tecnológico

### Web Application
```
Frontend: React 18 + TypeScript + Vite
UI/UX: Shadcn/ui + Tailwind CSS + Radix UI
Backend: Node.js + Express.js + TypeScript
Database: PostgreSQL + Drizzle ORM
Auth: Supabase Auth + Role-based access
State: TanStack Query (React Query)
```

### Mobile Application
```
Framework: React Native 0.79 + Expo SDK 53
UI: React Native Paper + MaterialIcons
Navigation: React Navigation v6
Storage: AsyncStorage
Notifications: Expo Notifications
Audio: Expo AV
Build: EAS Build para APK generation
```

---

## 🚀 Instalación y Configuración

### 📋 Prerequisitos
- Node.js 20+
- PostgreSQL (o usar Neon Database)
- Cuenta en Supabase
- Para APK: Expo CLI + EAS CLI

### 🌐 Aplicación Web

```bash
# 1. Clonar repositorio
git clone https://github.com/clangoi/mentalcheck-platform.git
cd mentalcheck-platform

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Setup base de datos
npm run db:push

# 5. Ejecutar aplicación
npm run dev
```

### 📱 Aplicación Móvil (APK)

```bash
# 1. Navegar al proyecto móvil
cd expo-app

# 2. Instalar dependencias
npm install

# 3. Instalar herramientas Expo
npm install -g @expo/cli@latest eas-cli@latest

# 4. Configurar EAS Build
eas login
eas build:configure

# 5. Generar APK
eas build --platform android --profile preview
```

---

## 📁 Estructura del Proyecto

```
📦 MentalCheck Platform
├── 🌐 Web Application
│   ├── client/                 # Frontend React
│   ├── server/                 # Backend Express
│   ├── shared/                 # Schemas compartidos
│   └── migrations/             # Migraciones DB
│
├── 📱 Mobile Application
│   ├── expo-app/
│   │   ├── src/
│   │   │   ├── hooks/          # Custom hooks (Timer, Sync, CRUD)
│   │   │   ├── components/     # UI Components
│   │   │   └── screens/        # App Screens
│   │   ├── App.tsx            # Main App
│   │   ├── app.json           # Expo Config
│   │   └── eas.json           # Build Config
│
└── 📚 Documentation
    ├── README.md              # Este archivo
    ├── replit.md             # Documentación técnica completa
    ├── INSTRUCCIONES_APK.md  # Guía de generación APK
    └── PROYECTO_FINALIZADO.md # Resumen de migración
```

---

## 🎯 Funcionalidades Destacadas

### 💡 Web: Sistema de Roles Dinámico
- Detección automática de roles basada en base de datos
- Dashboards personalizados por rol
- Control de acceso granular

### 🎯 Móvil: Timer Tabata con Secuencias
- Múltiples Tabatas consecutivos con nombres personalizados
- Ejecución automática de secuencias completas
- Feedback multimedia sincronizado

### 🧠 Evaluación Mental Integrada
- Analytics directamente en MentalCheck (sin pantallas separadas)
- Visualización de progreso con métricas de bienestar
- Exportación de reportes completos

### 🔄 Sincronización Sin Servidor
- Códigos únicos de 6 caracteres
- Sync automático entre dispositivos
- Funcionamiento offline-first

---

## 🔮 Roadmap y Mejoras Futuras

### 🎯 Próximas Características
- [ ] **API REST Completa**: Sincronización Web ↔ Móvil
- [ ] **Modo Multideporte**: Configuraciones específicas por disciplina
- [ ] **Social Features**: Compartir entrenamientos y logros
- [ ] **IA Integration**: Recomendaciones personalizadas de entrenamiento
- [ ] **Wearables Support**: Integración con smartwatches
- [ ] **Dark Mode**: Tema oscuro para ambas aplicaciones

### 🛠️ Optimizaciones Técnicas
- [ ] **Web Performance**: Code splitting y lazy loading
- [ ] **Mobile Performance**: Optimización de renderizado nativo
- [ ] **PWA Features**: Service workers para web app
- [ ] **Backup Cloud**: Sincronización automática con la nube
- [ ] **Multi-idioma**: Soporte internacional
- [ ] **Accesibilidad**: Mejoras WCAG compliance

### 📈 Escalabilidad
- [ ] **Microservicios**: Separación de servicios backend
- [ ] **Redis Caching**: Cache distribuido para mejor performance
- [ ] **CDN Integration**: Distribución global de assets
- [ ] **Monitoring**: Logs centralizados y métricas de uso

---

## 🤝 Contribución

¿Quieres contribuir? ¡Genial! 

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### 📝 Convenciones
- **Commits**: Usar prefijos `Add:`, `Fix:`, `Update:`, `Remove:`
- **Branches**: `feature/`, `bugfix/`, `hotfix/`
- **Testing**: Incluir tests para nuevas funcionalidades

---

## 👨‍💻 Autor

**clangoi**
- GitHub: [@clangoi](https://github.com/clangoi)

---

## 🙏 Agradecimientos

- **Expo Team** por el excelente SDK y herramientas
- **React Native Community** por los recursos y componentes
- **Supabase** por la infraestructura de auth y storage
- **Neon** por la base de datos serverless

---

<div align="center">

**⭐ Si este proyecto te ayudó, dale una estrella ⭐**

</div>