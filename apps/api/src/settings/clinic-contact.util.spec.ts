import {
  buildWhatsAppUrl,
  formatClinicPhoneDisplay,
  toInternationalAlgeriaPhone,
  toWhatsAppNumber,
} from "./clinic-contact.util";

describe("clinic-contact.util", () => {
  it("formats local display phone", () => {
    expect(formatClinicPhoneDisplay("0663098208")).toBe("0663 09 82 08");
    expect(formatClinicPhoneDisplay("213663098208", "0663 09 82 08")).toBe(
      "0663 09 82 08",
    );
  });

  it("stores and normalizes phone as string forms", () => {
    const local = "0663098208";
    expect(typeof local).toBe("string");
    expect(toInternationalAlgeriaPhone(local)).toBe("+213663098208");
    expect(`tel:${toInternationalAlgeriaPhone(local)}`).toBe(
      "tel:+213663098208",
    );
  });

  it("normalizes WhatsApp without leading zero", () => {
    expect(toWhatsAppNumber("0663098208")).toBe("213663098208");
    expect(toWhatsAppNumber("+213663098208")).toBe("213663098208");
  });

  it("encodes Arabic WhatsApp message", () => {
    const msg =
      "مرحبًا، أريد الاستفسار عن خدمات عيادة الوسام لطب الأسنان وحجز موعد.";
    const url = buildWhatsAppUrl("213663098208", msg);
    expect(url.startsWith("https://wa.me/213663098208?text=")).toBe(true);
    expect(url).toContain(encodeURIComponent(msg));
    expect(url).not.toContain("مرحبًا");
  });

  it("encodes English WhatsApp message", () => {
    const msg =
      "Hello, I would like to ask about Al Wissam Dental Clinic services and book an appointment.";
    const url = buildWhatsAppUrl("213663098208", msg);
    expect(url).toContain(encodeURIComponent(msg));
  });

  it("encodes French WhatsApp message", () => {
    const msg =
      "Bonjour, je souhaite obtenir des informations sur les services de la Clinique Dentaire El Wissam et prendre rendez-vous.";
    const url = buildWhatsAppUrl("213663098208", msg);
    expect(url).toContain(encodeURIComponent(msg));
  });

  it("uses Facebook URL exactly", () => {
    expect("https://web.facebook.com/Clinic.ElWissam").toBe(
      "https://web.facebook.com/Clinic.ElWissam",
    );
  });

  it("email mailto form", () => {
    expect(`mailto:clinic.elwissam@gmail.com`).toBe(
      "mailto:clinic.elwissam@gmail.com",
    );
  });
});
