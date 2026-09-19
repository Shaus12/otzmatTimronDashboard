import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="login-page">
      <div className="login-card">
        <div className="brand-icon">ע</div>
        <h1>עוצמת התמרון</h1>
        <p>התחברות למרכז הניהול</p>
        <Suspense fallback={<p>טוען…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
