import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileToc } from "@/components/layout/MobileToc";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AdminContentProvider } from "@/components/admin/AdminContentProvider";

export default function StudyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <AdminContentProvider>
        <div className="flex min-h-full flex-col">
          <Header />
          <div className="mx-auto flex w-full max-w-7xl flex-1">
            <Sidebar />
            <main className="min-w-0 flex-1 px-4 py-8 md:px-6 md:py-10 lg:px-10">
              <MobileToc />
              {children}
            </main>
          </div>
        </div>
      </AdminContentProvider>
    </AuthProvider>
  );
}
