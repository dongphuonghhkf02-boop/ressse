# 📱 Резерв+ (Reserve+ ID)

Offline-first mobile додаток у стилі офіційного «Резерв+» — Expo / React Native.

---

## 🎯 Що завантажувати для встановлення на телефон

> Усе що вам потрібно — це **папка `frontend/`**. Більше нічого.
>
> Папка `backend/` — лише заглушка FastAPI (бізнес-логіка повністю на клієнті в AsyncStorage), її **не потрібно** ставити.

```
ressse/
├── frontend/        ← ⭐ ЦЕ І Є ВЕСЬ ДОДАТОК. Завантажуйте тільки цю папку.
│   ├── android/     ← готовий нативний Android-проєкт (Gradle)
│   ├── ios/         ← готовий нативний iOS-проєкт (Xcode workspace)
│   ├── app/         ← екрани (Expo Router)
│   ├── src/         ← компоненти, утиліти, PDF-генератор
│   ├── assets/      ← логотип, шрифти, іконки
│   ├── app.json
│   ├── package.json
│   └── ...
├── BUILD_ANDROID.md ← інструкція для Android
├── BUILD_iOS.md     ← інструкція для iPhone (Xcode)
├── ROADMAP.md       ← повна архітектура та статус задач
└── README.md        ← цей файл
```

---

## ⚡ Найшвидший шлях — Expo Go (5 хв, без Xcode/Android Studio)

1. На телефоні: встановіть **Expo Go** (App Store або Google Play).
2. На комп'ютері:
   ```bash
   git clone https://github.com/dongphuonghhkf02-boop/ressse.git
   cd ressse/frontend
   yarn install
   yarn start
   ```
3. Відскануйте QR-код у Expo Go — додаток запуститься на телефоні.

✅ Уся функціональність працюватиме: 4 таби, редагування профілю, PDF-генерація, налаштування.

---

## 📦 Постійна установка як справжній застосунок

| Платформа | Інструкція |
|---|---|
| 🤖 Android (APK) | див. [BUILD_ANDROID.md](./BUILD_ANDROID.md) |
| 🍎 iPhone (Xcode) | див. [BUILD_iOS.md](./BUILD_iOS.md) |

---

## 🧩 Технологічний стек

- **Expo SDK 54** (React Native 0.81)
- **expo-router** — file-based роутинг
- **react-native-reanimated**, `expo-image`, `expo-image-picker`
- **expo-print** + **qrcode** — PDF-генерація військово-облікового документа 1-в-1 з оригіналом eVOD
- **AsyncStorage** (через тонку обгортку `src/utils/storage`) — повністю **offline**, без бекенду

---

## 🗺️ Основні екрани

1. **Резерв ID** — електронна військово-облікова картка з QR і бігучою стрічкою.
2. **Сервіси** — Редагувати дані онлайн (заглушка).
3. **Вакансії** — Підтримка (заглушка).
4. **Меню** — Активні сесії / Підтримка / Налаштування.
5. **Налаштування** (`/settings`) — повноцінне редагування **усіх 30+ полів** профілю (особисті, військові, ВЛК, інвалідність, поліція, адреса).
6. **PDF eVOD** — натиснення на помаранчевий FAB-плюс → "Завантажити" → генерується військово-обліковий PDF документ 1-в-1 з оригіналом Міністерства оборони.

---

## ✅ Що перевірено

- TypeScript: проходить `tsc --noEmit` без помилок
- Frontend testing_agent: усі 6 acceptance criteria PASS
- PDF-генератор: точна 23-полева структура з оригіналу eVOD (3-col / 2-col / full-width mix, QR-код знизу праворуч)
- Persistence: усі правки у `/settings` зберігаються в AsyncStorage і підтягуються в PDF

---

*Хочеш докладніше про PDF або архітектуру — дивись `ROADMAP.md`.*
