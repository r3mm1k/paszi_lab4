import React, { useState } from "react";

type BackendDetailObj =
  | { code: "weak_password"; problems: string[] }
  | { code: "login_taken"; message: string };

type ApiError = BackendDetailObj | string;

export const RegisterPage: React.FC = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<ApiError | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE ?? "";

  function validateLogin(v: string): string | null {
    if (v.length < 3 || v.length > 32) return "login: длина 3–32";
    if (!/^[A-Za-z0-9._-]+$/.test(v)) return "login: латиница/цифры/._-";
    return null;
  }

  function validatePassword(v: string): string[] {
    const probs: string[] = [];
    if (v.length < 8) probs.push("минимум 8 символов");
    if (!/[A-Z]/.test(v)) probs.push("минимум 1 заглавная");
    if (!/[a-z]/.test(v)) probs.push("минимум 1 строчная");
    if (!/[0-9]/.test(v)) probs.push("минимум 1 цифра");
    if (!/[^A-Za-z0-9]/.test(v)) probs.push("минимум 1 спецсимвол");
    return probs;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setOk(null);

    const loginErr = validateLogin(login);
    const passErrs = validatePassword(password);
    if (loginErr || passErrs.length) {
      if (loginErr && passErrs.length) {
        setErr(`${loginErr}; password: ${passErrs.join(", ")}`);
      } else if (loginErr) {
        setErr(loginErr);
      } else {
        setErr({ code: "weak_password", problems: passErrs });
      }
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setOk("user создан");
        setLogin("");
        setPassword("");
      } else {
        if (data?.detail?.code) {
          setErr(data.detail as BackendDetailObj);
        }
        else if (Array.isArray(data?.detail)) {
          setErr(
            "Неверный ввод: " + data.detail.map((d: any) => d.msg).join(", ")
          );
        } else {
          setErr(JSON.stringify(data?.detail ?? data ?? "Неизвестная ошибка"));
        }
      }
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12, maxWidth: 360 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span>Логин</span>
        <input
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="yourname"
          autoComplete="username"
          style={inputStyle}
        />
        <small style={hintStyle}>латиница/цифры/._-, 3–32 символа</small>
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Пароль</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="минимум 8 символов, 1A, 1a, 1 цифра, 1 спецсимвол"
          autoComplete="new-password"
          style={inputStyle}
        />
        <small style={hintStyle}>
          ≥8, минимум: 1 заглавная, 1 строчная, 1 цифра, 1 спецсимвол
        </small>
      </label>

      <button disabled={loading} style={btnStyle}>
        {loading ? "Создаю..." : "Зарегистрироваться"}
      </button>

      {ok && <div style={{ color: "green" }}>{ok}</div>}

      {err && (
        <div style={{ color: "crimson", whiteSpace: "pre-wrap" }}>
          {typeof err === "string" ? (
            err
          ) : err.code === "weak_password" ? (
            <>
              <b>{err.code}</b>
              <ul style={{ margin: "6px 0 0 16px" }}>
                {err.problems.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <b>{err.code}</b>: {err.message}
            </>
          )}
        </div>
      )}
    </form>
  );
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: 8,
  fontSize: 14,
};

const hintStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#777",
};

const btnStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #333",
  background: "#111",
  color: "white",
  cursor: "pointer",
};
