import React from "react";
import { RegisterPage } from "./RegisterPage";

export const App: React.FC = () => {
  return (
    <div style={{ maxWidth: 520, margin: "40px auto", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>Регистрация</h1>
      <RegisterPage />
    </div>
  );
};
