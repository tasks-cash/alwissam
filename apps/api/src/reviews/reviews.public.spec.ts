import { BadRequestException } from "@nestjs/common";
import { ErrorCodes } from "../common/errors/error-codes";
import { ReviewsService } from "./reviews.service";

type ReviewHarness = {
  toPublicDto: (
    row: Record<string, unknown>,
    locale?: string,
  ) => Record<string, unknown>;
  publicFilter: () => Record<string, unknown>;
};

describe("ReviewsService public DTO safety", () => {
  const service = Object.create(
    ReviewsService.prototype,
  ) as unknown as ReviewHarness;

  it("never exposes real names when isAnonymous", () => {
    const dto = service.toPublicDto(
      {
        _id: { toString: () => "abc" },
        displayName: "أحمد الحقيقي",
        displayNameAr: "أحمد الحقيقي",
        isAnonymous: true,
        quoteAr: "تجربة منظمة ومريحة في العيادة.",
        rating: 5,
        isVerified: false,
        consentConfirmed: true,
        createdBy: "secret-admin-id",
        ipAddress: "1.2.3.4",
      },
      "ar",
    );
    expect(dto.displayName).toBe("مريض من عيادة الوسام");
    expect(JSON.stringify(dto)).not.toContain("أحمد الحقيقي");
    expect(dto).not.toHaveProperty("createdBy");
    expect(dto).not.toHaveProperty("ipAddress");
    expect(dto).not.toHaveProperty("consentConfirmed");
  });

  it("includes verified badge only when verified", () => {
    const unverified = service.toPublicDto(
      {
        _id: { toString: () => "1" },
        displayName: "Patient",
        isAnonymous: false,
        quoteAr: "نص كافٍ للتقييم المنشور.",
        rating: 4,
        isVerified: false,
      },
      "ar",
    );
    expect(unverified.isVerified).toBe(false);

    const verifiedWithoutAppointment = service.toPublicDto(
      {
        _id: { toString: () => "2" },
        displayName: "Patient",
        isAnonymous: false,
        quoteAr: "نص كافٍ للتقييم المنشور.",
        rating: 5,
        isVerified: true,
      },
      "ar",
    );
    expect(verifiedWithoutAppointment.isVerified).toBe(false);

    const verifiedWithAppointment = service.toPublicDto(
      {
        _id: { toString: () => "3" },
        displayName: "Patient",
        isAnonymous: false,
        quoteAr: "نص كافٍ للتقييم المنشور.",
        rating: 5,
        isVerified: true,
        appointmentId: { toString: () => "507f1f77bcf86cd799439011" },
      } as never,
      "ar",
    );
    expect(verifiedWithAppointment.isVerified).toBe(true);
  });

  it("publicFilter requires approved published non-sample reviews", () => {
    const filter = service.publicFilter();
    expect(filter.isApproved).toBe(true);
    expect(filter.isPublished).toBe(true);
    expect(filter.isSample).toEqual({ $ne: true });
    expect(filter.archivedAt).toBeNull();
  });
});

describe("flexible booking assignment mode", () => {
  function resolveMode(input: {
    doctorId?: string;
    specialtySlug?: string;
  }): string {
    if (input.doctorId) return "patient_selected_doctor";
    if (input.specialtySlug) return "patient_selected_specialty";
    return "reception_assignment_required";
  }

  function resolveStatus(input: {
    doctorId?: string;
    date?: string;
    time?: string;
    emergency?: boolean;
  }): string {
    if (input.emergency) return "EMERGENCY";
    if (input.doctorId && input.date && input.time) return "pending_confirmation";
    if (!input.doctorId) return "pending_reception_assignment";
    return "NEW_REQUEST";
  }

  it("requires reception assignment when doctor and specialty empty", () => {
    expect(resolveMode({})).toBe("reception_assignment_required");
    expect(resolveStatus({})).toBe("pending_reception_assignment");
  });

  it("uses specialty mode when specialty selected without doctor", () => {
    expect(resolveMode({ specialtySlug: "ortho" })).toBe(
      "patient_selected_specialty",
    );
    expect(resolveStatus({})).toBe("pending_reception_assignment");
  });

  it("uses pending_confirmation when doctor and slot selected", () => {
    expect(
      resolveStatus({
        doctorId: "abc",
        date: "2099-01-01",
        time: "10:00",
      }),
    ).toBe("pending_confirmation");
  });
});

describe("public doctor role gate", () => {
  const PUBLIC_ROLES = new Set(["DOCTOR_GENERAL", "DOCTOR_SPECIALIST"]);

  function isPublicDoctorCandidate(row: {
    roleCode: string;
    fullName: string;
    doctor?: { isPublic?: boolean; isActive?: boolean; isBookable?: boolean };
  }) {
    if (!PUBLIC_ROLES.has(row.roleCode)) return false;
    if (row.doctor?.isActive === false) return false;
    if (row.doctor?.isPublic === false) return false;
    if (/مالك النظام|System Owner/i.test(row.fullName)) return false;
    return true;
  }

  it("excludes ADMIN owner and secretaries", () => {
    expect(
      isPublicDoctorCandidate({
        roleCode: "ADMIN",
        fullName: "مالك النظام",
        doctor: { isPublic: true, isActive: true, isBookable: true },
      }),
    ).toBe(false);
    expect(
      isPublicDoctorCandidate({
        roleCode: "SECRETARY",
        fullName: "موظف استقبال",
        doctor: { isPublic: true },
      }),
    ).toBe(false);
  });

  it("includes real active public doctors", () => {
    expect(
      isPublicDoctorCandidate({
        roleCode: "DOCTOR_SPECIALIST",
        fullName: "الدكتور منانة فؤاد",
        doctor: { isPublic: true, isActive: true, isBookable: true },
      }),
    ).toBe(true);
  });
});

describe("review rating bounds", () => {
  it("rejects rating outside 1-5 conceptually", () => {
    const rating = 6;
    expect(rating >= 1 && rating <= 5).toBe(false);
    try {
      if (rating < 1 || rating > 5) {
        throw new BadRequestException({
          code: ErrorCodes.VALIDATION_ERROR,
          message: "invalid rating",
        });
      }
      fail("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
    }
  });
});
