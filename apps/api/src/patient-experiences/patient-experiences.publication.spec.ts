import { BadRequestException } from "@nestjs/common";
import { ErrorCodes } from "../common/errors/error-codes";
import { PatientExperiencesService } from "./patient-experiences.service";

describe("PatientExperiencesService publication rules", () => {
  const service = Object.create(
    PatientExperiencesService.prototype,
  ) as PatientExperiencesService;

  it("blocks publish without consent", () => {
    expect(() =>
      (
        service as unknown as {
          assertCanPublish: (d: Record<string, unknown>) => void;
        }
      ).assertCanPublish({
        consentConfirmed: false,
        isApproved: true,
        reviewAr: "تجربة جيدة جداً للعيادة",
      }),
    ).toThrow(BadRequestException);
  });

  it("blocks publish without approval", () => {
    try {
      (
        service as unknown as {
          assertCanPublish: (d: Record<string, unknown>) => void;
        }
      ).assertCanPublish({
        consentConfirmed: true,
        isApproved: false,
        reviewAr: "تجربة جيدة جداً للعيادة",
      });
      fail("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      const body = (e as BadRequestException).getResponse() as {
        code?: string;
      };
      expect(body.code).toBe(ErrorCodes.VALIDATION_ERROR);
    }
  });

  it("allows publish when consent, approval, and review exist", () => {
    expect(() =>
      (
        service as unknown as {
          assertCanPublish: (d: Record<string, unknown>) => void;
        }
      ).assertCanPublish({
        consentConfirmed: true,
        isApproved: true,
        reviewAr: "تجربة جيدة جداً للعيادة",
      }),
    ).not.toThrow();
  });
});
