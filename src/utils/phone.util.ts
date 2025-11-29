// File: src/utils/phone.util.ts
// Deskripsi: Utility untuk memformat dan memvalidasi nomor telepon Indonesia.
export class PhoneUtil {
  /**
   * Format nomor telepon ke format internasional Indonesia.
   * Contoh: 081234567890 -> 6281234567890
   */
  public static formatPhoneNumber(number: string): string {
    let formatted = number.replace(/\D/g, "");

    if (formatted.startsWith("0")) {
      formatted = "62" + formatted.slice(1);
    }

    return formatted;
  }

  /**
   * Validasi nomor telepon Indonesia setelah diformat.
   * Pola: mulai dengan 62 dan memiliki total 11-14 digit (62 + 9-12)
   */
  public static isValidIndonesianNumber(number: string): boolean {
    const formatted = this.formatPhoneNumber(number);
    // Indonesian number should start with 62 and have 10-13 digits
    return /^62\d{9,12}$/.test(formatted);
  }
}
