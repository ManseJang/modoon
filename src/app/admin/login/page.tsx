"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { Lock, User } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import Spinner from "@/components/ui/Spinner";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "아이디 또는 비밀번호가 올바르지 않습니다.";
      case "auth/too-many-requests":
        return "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.";
      default:
        return "로그인 중 오류가 발생했습니다. 다시 시도해 주세요.";
    }
  }
  return "로그인 중 오류가 발생했습니다. 다시 시도해 주세요.";
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setError("");

    if (id.trim() !== "admin") {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
      const idToken = await credential.user.getIdToken();

      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        await signOut(auth);
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "로그인에 실패했습니다.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error("admin login error:", err, "ADMIN_EMAIL=", ADMIN_EMAIL);
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-8 shadow-soft">
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-bold text-primary">모두ON</p>
          <h1 className="text-xl font-black text-foreground">관리자 로그인</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-id" className="text-sm font-semibold text-foreground">
              아이디
            </label>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="admin-id"
                type="text"
                autoComplete="username"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="admin"
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-password" className="text-sm font-semibold text-foreground">
              비밀번호
            </label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          {error && <p className="rounded-xl bg-danger-light px-4 py-3 text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-70"
          >
            {isLoading && <Spinner className="h-4 w-4" />}
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
