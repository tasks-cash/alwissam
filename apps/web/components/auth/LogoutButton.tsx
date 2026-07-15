"use client";

import { useRouter } from "next/navigation";
import { apiPost } from "../../lib/api";

type Props = {
  label?: string;
  loginPath?: string;
};

export function LogoutButton({
  label = "Log out",
  loginPath = "/staff/login",
}: Props) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn-outline"
      onClick={async () => {
        await apiPost("/api/auth/logout", {});
        router.push(loginPath);
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}
