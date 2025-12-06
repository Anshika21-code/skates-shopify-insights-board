"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to sign in");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* LEFT - FORM */}
        <div className="auth-left">
          <div className="auth-logo">Skates Insights</div>

          <h2 className="auth-title">Agent Login</h2>

          <p className="auth-subtitle">
            Hey, enter your details to sign in to your account.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">

            <label className="auth-label">
              Email
              <input
                type="email"
                placeholder="you@company.com"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="auth-label">
              Password
              <input
                type="password"
                placeholder="••••••••"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <div className="auth-helper">
              Having trouble in sign in?
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="auth-or">— Or sign in with —</div>

            <div className="auth-social-row">
              <button type="button" className="auth-social-btn">Google</button>
              <button type="button" className="auth-social-btn">Apple ID</button>
              <button type="button" className="auth-social-btn">Facebook</button>
            </div>

            <div className="auth-footer-text">
              Don&apos;t have an account?{" "}
              <span className="auth-link">Request now</span>
            </div>

          </form>
        </div>

        {/* RIGHT - SKATEBOARD IMAGE  */}
        <div className="auth-right">
          <div className="auth-illustration">

            <Image
              src="/images/skateboard.png"
              alt="Skateboard"
              width={380}
              height={380}
              className="auth-skate-img"
            />

            <div className="auth-illustration-text">
              skates-8743
              <span>Shopify Insights Dashboard</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
