
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Đang tải...
          </p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
