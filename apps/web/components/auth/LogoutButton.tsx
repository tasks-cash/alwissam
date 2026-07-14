"use client";

import { useRouter } from "next/navigation";
import { apiPost } from "../../lib/api";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn-outline"
      onClick={async () => {
        await apiPost("/api/auth/logout", {});
        router.push("/staff/login");
        router.refresh();
      }}
    >
      تسجيل الخروج
    </button>
  );
}
