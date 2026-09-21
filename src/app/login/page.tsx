import { Suspense } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LoginForm } from "@/components/admin/LoginForm";

export default function LoginPage() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex min-h-full items-center justify-center text-sm text-neutral-500">
            로딩…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthProvider>
  );
}
