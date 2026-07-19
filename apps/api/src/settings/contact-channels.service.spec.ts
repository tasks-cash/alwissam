import { BadRequestException } from "@nestjs/common";
import { ContactChannelsService } from "./contact-channels.service";

type Harness = {
  validateUrl: (type: string, value: string) => string;
};

describe("ContactChannelsService URL validation", () => {
  const service = Object.create(
    ContactChannelsService.prototype,
  ) as unknown as Harness;

  it("accepts the configured phone and WhatsApp links", () => {
    expect(service.validateUrl("phone", "tel:+213663098208")).toBe(
      "tel:+213663098208",
    );
    expect(
      service.validateUrl("whatsapp", "https://wa.me/213663098208"),
    ).toBe("https://wa.me/213663098208");
  });

  it("rejects executable and mismatched URLs", () => {
    expect(() =>
      service.validateUrl("custom", "javascript:alert(1)"),
    ).toThrow(BadRequestException);
    expect(() =>
      service.validateUrl("whatsapp", "https://example.com/213663098208"),
    ).toThrow(BadRequestException);
    expect(() => service.validateUrl("phone", "tel:0663098208")).toThrow(
      BadRequestException,
    );
  });

  it("requires HTTPS for public web channels", () => {
    expect(() =>
      service.validateUrl("instagram", "http://instagram.com/alwissam"),
    ).toThrow(BadRequestException);
    expect(
      service.validateUrl(
        "instagram",
        "https://instagram.com/alwissam",
      ),
    ).toBe("https://instagram.com/alwissam");
  });
});
