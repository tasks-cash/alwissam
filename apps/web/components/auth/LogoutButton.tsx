"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { apiPost } from "../../lib/api";

type Props = {
  label?: string;
  loginPath?: string;
  className?: string;
  icon?: ReactNode;
};

export function LogoutButton({
  label = "Log out",
  loginPath = "/staff/login",
  className = "btn btn-outline",
  icon,
}: Props) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await apiPost("/api/auth/logout", {});
        router.push(loginPath);
        router.refresh();
      }}
    >
      {icon}
      {label}
    </button>
  );
}
