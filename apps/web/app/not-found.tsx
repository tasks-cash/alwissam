import Link from "next/link";
import { defaultLocale } from "../lib/i18n/config";

export default function NotFound() {
  return (
    <main className="public-section" style={{ padding: "3rem 1.5rem" }}>
      <h1>404</h1>
      <p>Page not found / الصفحة غير موجودة / Page introuvable</p>
      <Link className="btn btn-primary" href={`/${defaultLocale}`}>
        Home
      </Link>
    </main>
  );
}
