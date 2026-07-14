import {
  isValidPhoneDigits,
  normalizePhoneDigits,
  phoneValidationMessage,
} from "./phone";
import { PHONE_MAX_DIGITS, PHONE_MIN_DIGITS } from "./constants";

describe("phone normalization and validation", () => {
  it("preserves leading zeroes", () => {
    expect(normalizePhoneDigits("0551123456")).toBe("0551123456");
    expect(isValidPhoneDigits("0551123456")).toBe(true);
  });

  it("rejects Latin letters", () => {
    expect(isValidPhoneDigits("0551abc456")).toBe(false);
    expect(phoneValidationMessage("0551abc456")).toMatch(/أرقام فقط/);
  });

  it("rejects Arabic letters", () => {
    expect(isValidPhoneDigits("0551هاتف56")).toBe(false);
    expect(phoneValidationMessage("٠٥٥١تجربة")).toMatch(/أرقام فقط/);
  });

  it("rejects spaces", () => {
    expect(isValidPhoneDigits("0551 123 456")).toBe(false);
  });

  it("rejects plus sign", () => {
    expect(isValidPhoneDigits("+213551123456")).toBe(false);
  });

  it("rejects hyphen", () => {
    expect(isValidPhoneDigits("0551-123-456")).toBe(false);
  });

  it("rejects decimal point", () => {
    expect(isValidPhoneDigits("0551.123456")).toBe(false);
  });

  it("rejects empty value", () => {
    expect(isValidPhoneDigits("")).toBe(false);
    expect(phoneValidationMessage("")).toMatch(/مطلوب/);
  });

  it("rejects too-short value", () => {
    const short = "1".repeat(PHONE_MIN_DIGITS - 1);
    expect(isValidPhoneDigits(short)).toBe(false);
    expect(phoneValidationMessage(short)).toMatch(/طول رقم الهاتف/);
  });

  it("rejects too-long value", () => {
    const long = "1".repeat(PHONE_MAX_DIGITS + 1);
    expect(isValidPhoneDigits(long)).toBe(false);
  });

  it("accepts valid digits-only value", () => {
    expect(isValidPhoneDigits("05511234567")).toBe(true);
    expect(phoneValidationMessage("05511234567")).toBeNull();
    expect(normalizePhoneDigits("٠٥٥١١٢٣٤٥٦٧")).toBe("05511234567");
  });
});
