"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginValues = z.infer<typeof schema>;

/**
 * Email/password login form. After a successful sign-in we redirect the user
 * either to the explicit `redirectTo` target (set by the middleware) or to
 * the surface that matches their role (admin → /admin, employee → /employee).
 */
export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const supabase = createSupabaseBrowserClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const { data, error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setServerError(error.message);
      return;
    }
    const role = (data.user?.app_metadata?.role ?? null) as string | null;
    const fallback =
      role === "admin" ? "/admin" : role === "employee" ? "/employee" : "/";
    window.location.assign(redirectTo || fallback);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-800">
          Email
        </label>
        <input
          type="email"
          autoComplete="email"
          {...register("email")}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-800">
          Password
        </label>
        <input
          type="password"
          autoComplete="current-password"
          {...register("password")}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>
      {serverError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
