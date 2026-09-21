import { AuthProvider } from "@/components/auth/AuthProvider";
import { AdminContentProvider } from "@/components/admin/AdminContentProvider";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminContentProvider>
        <AdminShell>{children}</AdminShell>
      </AdminContentProvider>
    </AuthProvider>
  );
}
