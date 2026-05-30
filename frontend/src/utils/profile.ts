// Єдиний джерело правди для профілю користувача "Резерв ID".
// Зберігається локально в AsyncStorage за ключем PROFILE_KEY.

import { storage } from "@/src/utils/storage";

export const PROFILE_KEY = "rezerv_profile_v1";

export type UserProfile = {
  // --- Картка Резерв ID ---
  surname: string;
  name: string;
  patronymic: string;
  birthDate: string; // ДД.ММ.РРРР
  deferralUntil: string;
  customTicker: string;
  photoBase64: string | null;
  noPhoto?: boolean;

  // --- PDF: Особиста інформація ---
  validUntil: string; // Дійсний до*
  rnokpp: string; // РНОКПП
  status: string; // Статус

  // --- PDF: Військова інформація ---
  category: string; // Категорія обліку
  removalBasis: string; // Підстава зняття виключення
  tck: string; // ТЦК та СП
  rank: string; // Звання
  registryNumber: string; // Номер в реєстрі Оберіг
  vos: string; // ВОС / BOC
  note: string; // Примітка (заголовок-блок без значення)
  deferralType: string; // Тип відстрочки

  // --- PDF: Поліція ---
  policeReason: string; // Причина звернення до Нацполіції
  policeDate: string; // Дата звернення

  // --- PDF: ВЛК / Інвалідність ---
  vlkDecision: string; // Постанова ВЛК
  vlkDate: string; // Дата ВЛК
  disabilityGroup: string; // Група інвалідності
  disabilityValidUntil: string; // Діє до
  disabilityReason: string; // Причина інвалідності

  // --- PDF: Адреса та контакти ---
  address: string;
  email: string;
  phone: string;
  dataUpdateDate: string;
};

export const DEFAULT_PROFILE: UserProfile = {
  surname: "ІВАНОВ",
  name: "ІВАН",
  patronymic: "Іванович",
  birthDate: "01.01.2000",
  deferralUntil: "завершення мобілізації",
  customTicker: "",
  photoBase64: null,

  validUntil: "01.01.2030",
  rnokpp: "0000000000",
  status: "Військовозобов'язаний",

  category: "Військовозобов'язаний",
  removalBasis: "-",
  tck: "Назва ТЦК та СП",
  rank: "Солдат",
  registryNumber: "000000000000000000000",
  vos: "000000",
  note: "Потребує проходження базової загальновійськової підготовки, Солдат резерву",
  deferralType: "п.0 ч.0 ст.00",

  policeReason: "-",
  policeDate: "-",

  vlkDecision: "-",
  vlkDate: "-",
  disabilityGroup: "-",
  disabilityValidUntil: "-",
  disabilityReason: "-",

  address: "Введіть вашу адресу",
  email: "example@example.com",
  phone: "+380000000000",
  dataUpdateDate: "01.01.2026",
};

export async function loadProfile(): Promise<UserProfile> {
  try {
    const raw = await storage.getItem<string>(PROFILE_KEY, "");
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    // merge з DEFAULT_PROFILE щоб гарантовано підтягнути нові поля
    // для старих профілів без розширених полів (ВЛК, поліція, інвалідність)
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export async function saveProfile(p: UserProfile): Promise<boolean> {
  return storage.setItem(PROFILE_KEY, JSON.stringify(p));
}
