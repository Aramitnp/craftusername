export const dynamic = "force-dynamic";

import { Metadata } from "next";
import AdminAuthProvider from "@/components/AdminAuthProvider";

export const metadata: Metadata = {
  title: "Admin | CraftUsername",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
