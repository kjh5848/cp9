import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LoginForm } from "@/features/auth/ui/LoginForm";

export function LoginWidget() {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-8 backdrop-blur-xl shadow-2xl flex items-center justify-center h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
