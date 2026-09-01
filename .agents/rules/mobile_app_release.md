# Regla de Release Automático para Sneakers Spicy Mobile App

Cada vez que se realice una modificación en el código de la aplicación móvil (`/home/diego/Documents/Proyectos_Webs/sneakers_spicy_app`):

1. **PROCESO AUTOMÁTICO OBLIGATORIO**:
   Al finalizar cualquier cambio o fix en la app móvil, se debe ejecutar inmediatamente:
   ```bash
   node scripts/release_app.js "<descripción de los cambios para el changelog>"
   ```
   *(o `npm run release`)*.

2. **QUÉ HACE ESTE PROCESO DE FORMA AUTOMATIZADA**:
   - Incrementa automáticamente el `versionCode` (+1) y la versión semántica en `App.tsx` y `android/app/build.gradle`.
   - Compila el frontend (`npm run build`).
   - Sincroniza con Capacitor (`npx cap sync android`).
   - Compila el APK nativo (`./gradlew assembleDebug`).
   - Genera el APK con nombre único anti-caché (`sneakers-spicy-vX.Y.Z.apk`).
   - Actualiza `version.json` y el documento `ajustes/app_version` en Firestore con enlace directo de descarga.
   - Sube los cambios y el nuevo APK a GitHub (`origin app-mobile`).
   - Copia automáticamente a la USB si está conectada (`/media/diego/USB STICK`).

3. **RESULTADO GARANTIZADO**:
   El usuario abrirá la app en su teléfono y de forma 100% instantánea le aparecerá el Pop-Up con la nueva actualización lista para descargar e instalar con un solo toque.
