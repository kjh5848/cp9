import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CP9에 오신 것을 환영합니다
          </h1>
          <p className="text-gray-600">
            쿠팡 파트너스 자동 블로그 SaaS
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
} 