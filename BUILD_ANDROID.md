# 🤖 Запуск «Резерв+» на Android

Цей документ — повний step-by-step для встановлення додатку на Android-телефон.

---

## ✅ Що вже зроблено в проєкті

- Назва додатку: **Резерв+** (на головному екрані Android)
- Application ID: `com.reserveplus.app`
- Логотип і splash із бежевим тлом `#E1DECB`
- Згенерований нативний Android-проєкт: `frontend/android/` (Gradle)

---

## 💻 Що потрібно (один раз)

1. **Node.js 20+** та **Yarn 1.x** (https://nodejs.org)
2. **Java JDK 17** (https://adoptium.net)
3. **Android Studio** (https://developer.android.com/studio) — потрібен лише SDK + платформа Android 14 (API 34)
4. Кабель USB
5. Android-телефон з увімкненим **USB-Debugging**

### Як увімкнути USB-Debugging на телефоні

1. **Налаштування → Про телефон → Номер збірки** — тапніть 7 разів (з'явиться режим розробника).
2. **Налаштування → Для розробників → USB-зневадження** — увімкнути.
3. Підключіть телефон кабелем, дозвольте підключення на екрані телефону.

---

## 🚀 Найшвидший шлях — Expo Go (без Android Studio)

Якщо не хочете ставити Android Studio — найшвидший варіант:

1. Встановіть **Expo Go** з Google Play.
2. На комп'ютері в папці `frontend` запустіть: `yarn install && yarn start`.
3. Відскануйте QR-код у Expo Go → додаток запуститься. **Готово.**

> Цей варіант **не дає вам APK-файл**, але дозволяє повноцінно тестувати додаток на телефоні з усією логікою (редагування профілю, PDF, всі екрани).

---

## 📦 Збірка APK (повна установка як справжній застосунок)

### 1. Клонувати репозиторій

```bash
git clone https://github.com/dongphuonghhkf02-boop/ressse.git reserve-plus
cd reserve-plus/frontend
```

### 2. Встановити JS-залежності

```bash
yarn install
```

### 3. Зібрати debug APK (для свого пристрою)

```bash
cd android
./gradlew assembleDebug
```

> Перший раз Gradle підвантажує ~1 ГБ залежностей — 5–15 хв.

Готовий APK знаходиться тут:
```
frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

### 4. Встановити APK на телефон

**Варіант A — через кабель (USB):**

```bash
# В корені frontend
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Варіант B — без кабелю:**

Скиньте `app-debug.apk` на телефон (через Telegram, Google Drive, Bluetooth). Відкрийте файл на телефоні → дозвольте установку з невідомих джерел → готово.

### 5. Запуск через Android Studio (альтернатива)

```bash
cd frontend
# Запустіть Metro окремим терміналом:
yarn start
# В іншому терміналі — відкрийте проєкт у Android Studio:
studio android/
```

В Android Studio: вгорі виберіть пристрій → натисніть ▶ Run.

---

## 🆘 Якщо щось пішло не так

| Помилка | Що робити |
|---|---|
| `JAVA_HOME is not set` | `export JAVA_HOME=$(/usr/libexec/java_home -v 17)` (macOS) або встановіть JDK 17 |
| `SDK location not found` | Створіть `frontend/android/local.properties` з рядком `sdk.dir=/Users/USER/Library/Android/sdk` |
| `Could not find tools.jar` | Поставте JDK 17 і прописати JAVA_HOME |
| `adb: device unauthorized` | Перепідключіть кабель, дозвольте debug на екрані телефону |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | `adb uninstall com.reserveplus.app` перед новою установкою |
| Gradle падає на `:app:bundleReleaseJsAndAssets` | Запускайте лише `assembleDebug`, не `Release` (release потребує підпису) |

---

## 🔄 Що робити після зміни JS-коду

В debug-режимі JS-код підвантажується через Metro. Просто збережіть файл — додаток сам перезавантажиться.

Якщо змінили `app.json`, plugins або нативні модулі:

```bash
cd frontend
npx expo prebuild --platform android --clean
cd android && ./gradlew clean
./gradlew assembleDebug
```

---

*Документ актуальний станом на згенерований нативний проєкт.*
