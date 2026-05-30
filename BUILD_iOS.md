# 📱 Запуск «Резерв+» на iPhone через Xcode

Цей документ — повний step-by-step для встановлення додатку на ваш iPhone напряму через Xcode. Жодних додаткових налаштувань після цих кроків не потрібно.

---

## ✅ Що вже зроблено в проєкті

- Назва додатку: **Резерв+** (відображатиметься на головному екрані iPhone)
- Логотип встановлено: помаранчевий "+" біля слова "Резерв" на бежевому тлі (`assets/images/icon.png` → 1024×1024)
- Bundle Identifier: `com.reserveplus.app`
- Splash screen: той самий логотип на бежевому фоні `#E1DECB`
- Дозвіл на доступ до галереї iOS: "Оберіть фото для Резерв ID"
- Згенеровано нативний iOS-проєкт: `frontend/ios/Rezerv.xcworkspace`

---

## 🍎 Що потрібно на Mac

1. **macOS** (Sonoma 14+ рекомендовано)
2. **Xcode 15+** з App Store (один раз)
3. **CocoaPods**: `sudo gem install cocoapods` (один раз)
4. **Node.js 20+** та **Yarn 1.x**
5. **Apple ID** (безкоштовний — для встановлення на свій iPhone достатньо)
6. iPhone з кабелем

---

## 🚀 Покрокова інструкція

### 1. Завантажити репозиторій на Mac

```bash
git clone <URL_ВАШОГО_РЕПО> reserve-plus
cd reserve-plus/frontend
```

### 2. Встановити JS-залежності

```bash
yarn install
```

### 3. Встановити iOS-залежності (CocoaPods)

```bash
cd ios
pod install
cd ..
```

> ⏱ Перший `pod install` може зайняти 5–10 хвилин (підвантажує Hermes, Reanimated, тощо).

### 4. Відкрити проєкт у Xcode

```bash
open ios/Rezerv.xcworkspace
```

> ⚠️ Відкривайте саме `.xcworkspace`, **НЕ** `.xcodeproj`.

### 5. Налаштувати підпис (один раз)

1. У лівій панелі Xcode виберіть синю іконку проєкту **Rezerv** (зверху).
2. Вкладка **Signing & Capabilities** → таргет **Rezerv**.
3. ✅ Поставте галочку **"Automatically manage signing"**.
4. У полі **Team** виберіть ваш Apple ID (якщо немає — додайте через **Xcode → Settings → Accounts → +**).
5. Якщо Xcode скаржиться на bundle ID — поміняйте `com.reserveplus.app` на будь-який унікальний (наприклад, `com.ВАШЕ_ПРІЗВИЩЕ.reserveplus`). Це треба зробити в **Signing & Capabilities → Bundle Identifier**.

### 6. Підключити iPhone

1. Підключіть iPhone кабелем до Mac.
2. На iPhone з'явиться запит **"Довіряти цьому комп'ютеру?"** → **Довіряти**.
3. У Xcode вгорі ліворуч клацніть на список пристроїв і виберіть ваш iPhone (а не симулятор).

### 7. Запустити білд

Натисніть кнопку ▶️ (Play) у Xcode (або **⌘R**).

Перший білд — 5–15 хвилин. Наступні — 1–2 хв.

### 8. Дозволити встановлення на iPhone

При першому запуску iPhone заблокує запуск з повідомленням "Untrusted Developer".

1. На iPhone → **Налаштування → Загальні → VPN та керування пристроєм**.
2. Знайдіть ваш Apple ID → **Довіряти**.
3. Поверніться на головний екран — іконка **Резерв+** там 🎉.
4. Запустіть.

---

## 🆘 Якщо щось пішло не так

| Помилка | Що робити |
|---|---|
| `pod install` падає на M1/M2 | `sudo arch -x86_64 gem install ffi && arch -x86_64 pod install` |
| Xcode не бачить iPhone | Перевірте кабель; розблокуйте iPhone; **Window → Devices and Simulators** |
| "No account for team" | Xcode → Settings → Accounts → додати Apple ID |
| Bundle ID конфлікт | Поміняйте на `com.ваше_прізвище.reserveplus` у Signing |
| Білд зависає на Hermes | `cd ios && pod deintegrate && pod install` |
| Metro не запускається | Метро запускається автоматично разом з Xcode; якщо ні — `yarn start` в окремому терміналі |

---

## 🔄 Що робити після зміни JS-коду

JS-код підвантажується через Metro в dev-режимі — просто збережіть файл, додаток сам перезавантажиться на iPhone.

Якщо змінили **нативну конфігурацію** (app.json, plugins, нативні модулі) — потрібно перегенерувати iOS-проєкт:

```bash
cd frontend
npx expo prebuild --platform ios --clean
cd ios && pod install && cd ..
```

---

## 📦 Якщо потрібен release-білд (.ipa) для розповсюдження

У Xcode: **Product → Archive** → **Distribute App** → **Development** (для свого iPhone) або **App Store Connect** (для TestFlight).

Безкоштовний Apple ID дає 7 днів життя у білда на iPhone. Для довшого терміну потрібен платний Apple Developer Program ($99/рік).

---

*Документ актуальний станом на момент згенерованого нативного проєкту.*
