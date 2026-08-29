# Sneakers Spicy | App Móvil (Android) 👟🔥

Aplicación móvil oficial de **Sneakers Spicy** desarrollada con React, TypeScript, Tailwind CSS y Capacitor para Android.

---

## 📲 Descarga Directa del APK

Puedes descargar la última versión de la aplicación directamente sin necesidad de usar memorias USB:

[![Descargar APK](https://img.shields.io/badge/Descargar-APK%20Directo-red?style=for-the-badge&logo=android)](https://raw.githubusercontent.com/sneakersspicy03-svg/sneakers-spicy-releases/main/sneakers-spicy.apk)

- **Enlace Directo de Descarga:** [https://raw.githubusercontent.com/sneakersspicy03-svg/sneakers-spicy-releases/main/sneakers-spicy.apk](https://raw.githubusercontent.com/sneakersspicy03-svg/sneakers-spicy-releases/main/sneakers-spicy.apk)
- **Repositorio Público de Lanzamientos:** [sneakers-spicy-releases](https://github.com/sneakersspicy03-svg/sneakers-spicy-releases)
- **Versión Actual:** `v2.0.0` (Build 2)
- **Tamaño:** ~11.4 MB

---

## 🚀 Sistema de Actualización Automática In-App

La aplicación incluye un sistema de detección y actualización automática:
1. Al abrir la app, escanea el endpoint remoto [`version.json`](https://sneakers-spicy-db.web.app/version.json).
2. Si detecta una nueva versión compilada, despliega un **Pop-up emergente de Actualización** con el resumen de novedades.
3. Al presionar **"Descargar e Instalar"**, el instalador nativo de Android actualiza la app de manera transparente sin perder tu sesión ni configuraciones.

---

## 🛠️ Comandos de Desarrollo y Compilación

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Compilar proyecto Web & Sincronizar Capacitor
npm run build
npx cap sync

# Compilar APK Android
cd android
./gradlew assembleDebug
```

---

## 🌐 Tienda Web
- **Sitio Web Oficial:** [https://sneakers-spicy-db.web.app](https://sneakers-spicy-db.web.app)
