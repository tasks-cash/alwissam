import { BadRequestException } from "@nestjs/common";
import { ErrorCodes } from "../common/errors/error-codes";
import { BeforeAfterService } from "./before-after.service";

describe("BeforeAfterService publication rules", () => {
  const service = Object.create(
    BeforeAfterService.prototype,
  ) as BeforeAfterService;

  const call = (d: Record<string, unknown>) =>
    (
      service as unknown as {
        assertCanPublish: (d: Record<string, unknown>) => void;
      }
    ).assertCanPublish(d);

  it("requires before and after images", () => {
    expect(() =>
      call({
        beforeImageUrl: "",
        afterImageUrl: "/uploads/a.jpg",
        consentConfirmed: true,
        isApproved: true,
        titleAr: "حالة",
      }),
    ).toThrow(BadRequestException);
  });

  it("requires consent", () => {
    try {
      call({
        beforeImageUrl: "/uploads/b.jpg",
        afterImageUrl: "/uploads/a.jpg",
        consentConfirmed: false,
        isApproved: true,
        titleAr: "حالة",
      });
      fail("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect((e as BadRequestException).getResponse()).toMatchObject({
        code: ErrorCodes.VALIDATION_ERROR,
      });
    }
  });

  it("requires approval", () => {
    expect(() =>
      call({
        beforeImageUrl: "/uploads/b.jpg",
        afterImageUrl: "/uploads/a.jpg",
        consentConfirmed: true,
        isApproved: false,
        titleAr: "حالة",
      }),
    ).toThrow(BadRequestException);
  });

  it("allows publish when all guards pass", () => {
    expect(() =>
      call({
        beforeImageUrl: "/uploads/b.jpg",
        afterImageUrl: "/uploads/a.jpg",
        consentConfirmed: true,
        isApproved: true,
        titleAr: "حالة تجميلية موثقة",
      }),
    ).not.toThrow();
  });
});
