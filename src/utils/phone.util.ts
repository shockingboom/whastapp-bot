export class PhoneUtil {
  /**
   * Format phone number to Indonesian format
   * Converts 08xxx to 628xxx
   */
  public static formatPhoneNumber(number: string): string {
    let formatted = number.replace(/\D/g, "");

    if (formatted.startsWith("0")) {
      formatted = "62" + formatted.slice(1);
    }

    return formatted;
  }

  /**
   * Validate Indonesian phone number
   */
  public static isValidIndonesianNumber(number: string): boolean {
    const formatted = this.formatPhoneNumber(number);
    // Indonesian number should start with 62 and have 10-13 digits
    return /^62\d{9,12}$/.test(formatted);
  }
}
