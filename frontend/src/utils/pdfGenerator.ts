import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import QRCode from "qrcode";
import { Platform, Alert } from "react-native";

import type { UserProfile } from "@/src/utils/profile";

const pad2 = (n: number) => String(n).padStart(2, "0");

function formatNow(): string {
  const n = new Date();
  return `${pad2(n.getDate())}.${pad2(n.getMonth() + 1)}.${n.getFullYear()}, ${pad2(n.getHours())}:${pad2(n.getMinutes())}`;
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const dash = (v: string | null | undefined) =>
  v && String(v).trim() !== "" ? String(v) : "-";

async function generateQrDataUrl(payload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 600,
      color: { dark: "#000000", light: "#FFFFFF" },
    });
  } catch (e) {
    console.warn("QR generation failed", e);
    return "";
  }
}

/**
 * HTML "Військово-обліковий документ" — 1:1 копія eVOD_*.pdf.
 *
 * Layout (зверху-вниз):
 *   Header:  [Резерв+ logo + title + Сформовано]   [Тризуб + Міністерство]
 *   Sub-header: "Військовозобов'язаний" (маленьким)
 *   ПІБ — у 2 рядки великим жирним uppercase, ліворуч
 *   3 col: Дата народження | Дійсний до * | РНОКПП
 *   2 col: Категорія обліку | Підстава зняття\виключення
 *   full:  ТЦК та СП
 *   3 col: Звання | Номер в реєстрі Оберіг | BOC
 *   full:  "Потребує проходження базової загальновійськової підготовки, Солдат резерву"
 *   2 col: Тип відстрочки: | Відстрочка до
 *   2 col: Причина звернення до Нацполіції | Дата звернення:
 *   2 col: Постанова ВЛК | Дата ВЛК
 *   2 col: Група інвалідності | Діє до
 *   full:  Причина інвалідності
 *   2 col: Адреса проживання | Телефон
 *   full(L): Email
 *   2 col: Дата уточнення даних | [QR-CODE великий, знизу праворуч]
 *   Footer: дисклеймер
 *
 * Фото у документі НЕ виводиться.
 */
function buildHtml(profile: UserProfile, qrDataUrl: string): string {
  const now = formatNow();

  // ПІБ — два рядки: 1) ПРІЗВИЩЕ ІМ'Я   2) ПО БАТЬКОВІ (uppercase, як у оригіналі)
  const fioLine1 = `${profile.surname} ${profile.name}`.trim().toUpperCase();
  const fioLine2 = (profile.patronymic || "").toUpperCase();

  const qrBlock = qrDataUrl
    ? `<img class="qr-img" src="${qrDataUrl}" alt="qr"/>`
    : `<div class="qr-img placeholder"></div>`;

  // Поле "label + value" (без роздільної лінії, як в оригіналі)
  const field = (label: string, value: string | null | undefined) => `
    <div class="field">
      <div class="lbl">${escapeHtml(label)}</div>
      <div class="val">${escapeHtml(dash(value))}</div>
    </div>`;

  // Заголовок-блок без значення (повна ширина) — як рядок "Потребує проходження..."
  const blockLine = (text: string) => `
    <div class="block-line">${escapeHtml(text)}</div>`;

  return `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="utf-8"/>
<title>Військово-обліковий документ</title>
<style>
  * { box-sizing: border-box; }
  @page { size: A4; margin: 0; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, "Helvetica Neue", "Roboto", "Segoe UI", Arial, sans-serif;
    color: #1a1a1a;
    background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page { padding: 26px 32px 26px; font-size: 10.5px; line-height: 1.4; }

  /* HEADER */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 14px;
  }
  .header-left { display: flex; align-items: flex-start; gap: 8px; }
  .brand-wrap { display: flex; align-items: baseline; gap: 2px; }
  .brand-name { font-size: 18px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.3px; }
  .brand-plus { font-size: 18px; font-weight: 800; color: #FF8100; }
  .brand-meta { margin-left: 12px; padding-top: 2px; }
  .doc-title { font-size: 11.5px; font-weight: 700; color: #1a1a1a; line-height: 1.2; }
  .doc-created { font-size: 9.5px; color: #5a5a5a; margin-top: 2px; }
  .ministry {
    text-align: right;
    font-size: 9.5px;
    line-height: 1.25;
    font-weight: 600;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .shield {
    width: 28px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .shield svg { width: 100%; height: 100%; }

  /* STATUS LABEL під хедером */
  .status-line {
    margin-top: 10px;
    margin-bottom: 12px;
    font-size: 11px;
    font-weight: 600;
    color: #1a1a1a;
  }

  /* ПІБ великий */
  .fio {
    font-size: 26px;
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: 0.3px;
    color: #1a1a1a;
    margin-bottom: 22px;
    text-transform: uppercase;
  }
  .fio-line { display: block; }

  /* FIELDS — універсальний контейнер */
  .field { padding: 2px 0 12px; }
  .lbl {
    font-size: 9.5px;
    color: #6e6d66;
    font-weight: 500;
    margin-bottom: 3px;
  }
  .val {
    font-size: 11px;
    color: #1a1a1a;
    font-weight: 600;
    word-break: break-word;
    line-height: 1.35;
  }

  /* Grid колонок */
  .row-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 18px;
  }
  .row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  .row-2-qr {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 18px;
    align-items: flex-start;
    margin-top: 8px;
  }

  /* Блок-рядок (повна ширина, без значення) */
  .block-line {
    padding: 6px 0 12px;
    font-size: 11px;
    font-weight: 700;
    color: #1a1a1a;
    line-height: 1.3;
  }

  /* QR */
  .qr-img {
    width: 170px; height: 170px;
    border: 1px solid #e3e3df;
    border-radius: 4px;
    padding: 6px;
    background: #fff;
  }
  .qr-img.placeholder { background: #eee; }

  /* FOOTER */
  .footer {
    margin-top: 18px;
    padding-top: 12px;
    border-top: 1px solid #d8d7d2;
    font-size: 9px;
    color: #4a4a4a;
    line-height: 1.55;
    text-align: justify;
  }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="header-left">
      <div class="brand-wrap">
        <span class="brand-name">Резерв</span><span class="brand-plus">+</span>
      </div>
      <div class="brand-meta">
        <div class="doc-title">Військово-обліковий документ</div>
        <div class="doc-created">Сформовано: ${escapeHtml(now)}</div>
      </div>
    </div>
    <div class="ministry">
      <div class="shield">
        <svg viewBox="0 0 32 38" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 1 L31 6 L31 20 C31 28 24 34 16 37 C8 34 1 28 1 20 L1 6 Z" fill="none" stroke="#1a1a1a" stroke-width="1.8"/>
          <path d="M16 9 L16 26 M11 12 L11 23 L13 25 M21 12 L21 23 L19 25 M16 22 L11 23 M16 22 L21 23" stroke="#1a1a1a" stroke-width="1.6" stroke-linecap="round" fill="none"/>
        </svg>
      </div>
      <div>Міністерство<br/>оборони України</div>
    </div>
  </div>

  <!-- STATUS LABEL -->
  <div class="status-line">${escapeHtml(profile.status || "Військовозобов'язаний")}</div>

  <!-- ПІБ -->
  <div class="fio">
    <span class="fio-line">${escapeHtml(fioLine1)}</span>
    ${fioLine2 ? `<span class="fio-line">${escapeHtml(fioLine2)}</span>` : ""}
  </div>

  <!-- 3-col: ДН | Дійсний до * | РНОКПП -->
  <div class="row-3">
    ${field("Дата народження", profile.birthDate)}
    ${field("Дійсний до *", profile.validUntil)}
    ${field("РНОКПП", profile.rnokpp)}
  </div>

  <!-- 2-col: Категорія | Підстава зняття -->
  <div class="row-2">
    ${field("Категорія обліку", profile.category)}
    ${field("Підстава зняття\\виключення", profile.removalBasis)}
  </div>

  <!-- Full: ТЦК та СП -->
  ${field("ТЦК та СП", profile.tck)}

  <!-- 3-col: Звання | Номер в реєстрі Оберіг | BOC -->
  <div class="row-3">
    ${field("Звання", profile.rank)}
    ${field("Номер в реєстрі Оберіг", profile.registryNumber)}
    ${field("BOC", profile.vos)}
  </div>

  <!-- Full block line: "Потребує..." -->
  ${blockLine(profile.note || "Потребує проходження базової загальновійськової підготовки, Солдат резерву")}

  <!-- 2-col: Тип відстрочки | Відстрочка до -->
  <div class="row-2">
    ${field("Тип відстрочки:", profile.deferralType)}
    ${field("Відстрочка до", profile.deferralUntil)}
  </div>

  <!-- 2-col: Причина звернення до Нацполіції | Дата звернення -->
  <div class="row-2">
    ${field("Причина звернення до Нацполіції", profile.policeReason)}
    ${field("Дата звернення:", profile.policeDate)}
  </div>

  <!-- 2-col: Постанова ВЛК | Дата ВЛК -->
  <div class="row-2">
    ${field("Постанова ВЛК", profile.vlkDecision)}
    ${field("Дата ВЛК", profile.vlkDate)}
  </div>

  <!-- 2-col: Група інвалідності | Діє до -->
  <div class="row-2">
    ${field("Група інвалідності", profile.disabilityGroup)}
    ${field("Діє до", profile.disabilityValidUntil)}
  </div>

  <!-- Full: Причина інвалідності -->
  ${field("Причина інвалідності", profile.disabilityReason)}

  <!-- 2-col: Адреса проживання | Телефон -->
  <div class="row-2">
    ${field("Адреса проживання", profile.address)}
    ${field("Телефон", profile.phone)}
  </div>

  <!-- Full: Email -->
  ${field("Email", profile.email)}

  <!-- 2-col bottom: Дата уточнення даних | QR -->
  <div class="row-2-qr">
    ${field("Дата уточнення даних", profile.dataUpdateDate)}
    <div class="qr-box">${qrBlock}</div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    * Документ дійсний до зазначеної на ньому дати. Якщо вказані в ньому дані змінюються в Єдиному державному реєстрі
    призовників, військовозобов&#96;язаних і резервістів «Оберіг», документ втрачає чинність. Завантажуйте мобільний застосунок
    Резерв+ та користуйтеся завжди актуальним електронним документом.
  </div>

</div>
</body>
</html>`;
}

/**
 * Згенерувати та поділитися PDF "Військово-обліковий документ".
 * Приймає повний UserProfile (з AsyncStorage). Жодних дефолтних мокованих даних.
 */
export async function generateAndShareMilitaryPdf(profile: UserProfile): Promise<void> {
  try {
    const qrPayload = JSON.stringify({
      s: profile.surname,
      n: profile.name,
      p: profile.patronymic,
      b: profile.birthDate,
      r: profile.rnokpp,
      reg: profile.registryNumber,
      v: profile.validUntil,
      t: Date.now(),
    });
    const qrDataUrl = await generateQrDataUrl(qrPayload);
    const html = buildHtml(profile, qrDataUrl);

    if (Platform.OS === "web") {
      const w = window.open("", "_blank");
      if (!w) {
        Alert.alert("Не вдалося відкрити вікно", "Дозвольте спливаючі вікна та спробуйте ще раз.");
        return;
      }
      w.document.open();
      w.document.write(html);
      w.document.close();
      setTimeout(() => {
        try {
          w.focus();
          w.print();
        } catch {
          /* ignore */
        }
      }, 500);
      return;
    }

    const { uri } = await Print.printToFileAsync({ html, base64: false });

    const safeName =
      `${profile.surname}_${profile.name}`.replace(/[^A-Za-zА-Яа-яЁёЇїІіЄєҐґ0-9_-]/g, "") ||
      "rezerv_plus";
    const fileName = `eVOD_${safeName}.pdf`;

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Зберегти або поділитися документом",
        UTI: "com.adobe.pdf",
      });
    } else {
      Alert.alert("PDF створено", `Файл збережено: ${fileName}\nШлях: ${uri}`);
    }
  } catch (e) {
    console.error("PDF generation failed", e);
    Alert.alert("Помилка створення PDF", "Не вдалося згенерувати документ. Спробуйте ще раз.");
  }
}
