const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCVAqfHuvTVBxz2njeWKj5Sri1ETURP14I",
  authDomain: "sneakers-spicy-db.firebaseapp.com",
  projectId: "sneakers-spicy-db",
  storageBucket: "sneakers-spicy-db.firebasestorage.app",
  messagingSenderId: "362351464666",
  appId: "1:362351464666:web:09df3f0104784a2764d5e3"
};

const ROOT_DIR = path.resolve(__dirname, '..');
const APP_TSX = path.join(ROOT_DIR, 'components/App.tsx');
const BUILD_GRADLE = path.join(ROOT_DIR, 'android/app/build.gradle');
const VERSION_JSON = path.join(ROOT_DIR, 'public/version.json');
const DIST_VERSION_JSON = path.join(ROOT_DIR, 'dist/version.json');

async function main() {
  const changelogArg = process.argv[2] || "Mejoras de rendimiento y correcciones de interfaz";
  console.log("🚀 Iniciando proceso automatizado de Release para Sneakers Spicy App...\n");

  // 1. Leer versión actual de App.tsx
  let appTsxContent = fs.readFileSync(APP_TSX, 'utf8');
  const verMatch = appTsxContent.match(/CURRENT_APP_VERSION\s*=\s*"([^"]+)"/);
  const codeMatch = appTsxContent.match(/CURRENT_VERSION_CODE\s*=\s*(\d+)/);

  if (!verMatch || !codeMatch) {
    throw new Error("No se pudo detectar CURRENT_APP_VERSION o CURRENT_VERSION_CODE en App.tsx");
  }

  const currentVersion = verMatch[1];
  const currentCode = parseInt(codeMatch[1], 10);
  const nextCode = currentCode + 1;

  // Incrementar patch version (ej: 2.2.1 -> 2.2.2)
  const parts = currentVersion.split('.');
  parts[parts.length - 1] = parseInt(parts[parts.length - 1], 10) + 1;
  const nextVersion = parts.join('.');

  console.log(`📦 Versión anterior: v${currentVersion} (código ${currentCode})`);
  console.log(`✨ Nueva versión:    v${nextVersion} (código ${nextCode})\n`);

  // 2. Actualizar App.tsx
  appTsxContent = appTsxContent
    .replace(/CURRENT_APP_VERSION\s*=\s*"[^"]+"/, `CURRENT_APP_VERSION = "${nextVersion}"`)
    .replace(/CURRENT_VERSION_CODE\s*=\s*\d+/, `CURRENT_VERSION_CODE = ${nextCode}`);
  fs.writeFileSync(APP_TSX, appTsxContent, 'utf8');
  console.log("✅ App.tsx actualizado.");

  // 3. Actualizar android/app/build.gradle
  let gradleContent = fs.readFileSync(BUILD_GRADLE, 'utf8');
  gradleContent = gradleContent
    .replace(/versionCode\s+\d+/, `versionCode ${nextCode}`)
    .replace(/versionName\s+"[^"]+"/, `versionName "${nextVersion}"`);
  fs.writeFileSync(BUILD_GRADLE, gradleContent, 'utf8');
  console.log("✅ build.gradle actualizado.");

  // 4. Compilar bundle web
  console.log("⚙️ Compilando web bundle (npm run build)...");
  execSync('npm run build', { cwd: ROOT_DIR, stdio: 'inherit' });

  // 5. Sincronizar con Capacitor Android
  console.log("⚙️ Sincronizando con Capacitor (npx cap sync android)...");
  execSync('npx cap sync android', { cwd: ROOT_DIR, stdio: 'inherit' });

  // 6. Compilar APK Android
  console.log("⚙️ Compilando APK con Gradle (./gradlew assembleDebug)...");
  execSync('./gradlew assembleDebug', { cwd: path.join(ROOT_DIR, 'android'), stdio: 'inherit' });

  const builtApk = path.join(ROOT_DIR, 'android/app/build/outputs/apk/debug/app-debug.apk');
  if (!fs.existsSync(builtApk)) {
    throw new Error("No se encontró el APK compilado en " + builtApk);
  }

  // 7. Generar nombres de APK únicos y copiar
  const apkFileName = `sneakers-spicy-v${nextVersion}.apk`;
  const publicApk = path.join(ROOT_DIR, 'public', apkFileName);
  const rootApk = path.join(ROOT_DIR, apkFileName);
  const standardPublicApk = path.join(ROOT_DIR, 'public/sneakers-spicy.apk');
  const standardRootApk = path.join(ROOT_DIR, 'sneakers-spicy.apk');
  const appV2Apk = path.join(ROOT_DIR, 'sneaker-spicy app_v2.apk');

  fs.copyFileSync(builtApk, publicApk);
  fs.copyFileSync(builtApk, rootApk);
  fs.copyFileSync(builtApk, standardPublicApk);
  fs.copyFileSync(builtApk, standardRootApk);
  fs.copyFileSync(builtApk, appV2Apk);

  // Copiar a USB si está conectada
  const usbDir = '/media/diego/USB STICK';
  if (fs.existsSync(usbDir)) {
    try {
      fs.copyFileSync(builtApk, path.join(usbDir, apkFileName));
      fs.copyFileSync(builtApk, path.join(usbDir, 'sneakers-spicy.apk'));
      fs.copyFileSync(builtApk, path.join(usbDir, 'sneaker-spicy app_v2.apk'));
      execSync('sync');
      console.log("💾 APK copiado a la memoria USB STICK con éxito.");
    } catch (e) {
      console.warn("⚠️ No se pudo copiar a la USB:", e.message);
    }
  }

  // 8. Actualizar version.json
  const downloadUrl = `https://raw.githubusercontent.com/sneakersspicy03-svg/sneakersspicy/app-mobile/${apkFileName}`;
  const versionInfo = {
    version: nextVersion,
    versionCode: nextCode,
    downloadUrl: downloadUrl,
    releaseDate: new Date().toISOString().split('T')[0],
    title: `Actualización Sneakers Spicy v${nextVersion}`,
    changelog: Array.isArray(changelogArg) ? changelogArg : [changelogArg],
    forceUpdate: false
  };

  fs.writeFileSync(VERSION_JSON, JSON.stringify(versionInfo, null, 2), 'utf8');
  if (fs.existsSync(path.dirname(DIST_VERSION_JSON))) {
    fs.writeFileSync(DIST_VERSION_JSON, JSON.stringify(versionInfo, null, 2), 'utf8');
  }
  console.log("✅ version.json actualizado con URL anti-caché:", downloadUrl);

  // 9. Actualizar Firestore en la nube
  console.log("☁️ Actualizando Firestore ajustes/app_version en tiempo real...");
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  await setDoc(doc(db, "ajustes", "app_version"), {
    ...versionInfo,
    updatedAt: Date.now()
  });
  console.log("✅ Firestore sincronizado.");

  // 10. Git add y push
  console.log("📤 Subiendo cambios y APK a GitHub (origin app-mobile)...");
  execSync(`git add -f "${apkFileName}" "public/${apkFileName}" public/sneakers-spicy.apk sneakers-spicy.apk "sneaker-spicy app_v2.apk"`, { cwd: ROOT_DIR, stdio: 'inherit' });
  execSync('git add .', { cwd: ROOT_DIR, stdio: 'inherit' });
  execSync(`git commit -m "release: v${nextVersion} (code ${nextCode}) auto-release"`, { cwd: ROOT_DIR, stdio: 'inherit' });
  execSync('git push origin app-mobile', { cwd: ROOT_DIR, stdio: 'inherit' });

  console.log(`\n🎉 ¡RELEASE COMPLETADO CON ÉXITO!`);
  console.log(`📱 En cuanto abras la app en tu teléfono, saltará el Pop-up ofreciendo la v${nextVersion}.\n`);
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Error en el proceso de release:", err);
  process.exit(1);
});
