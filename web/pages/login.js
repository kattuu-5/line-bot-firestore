// pages/login.js

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // ログイン後に遷移する仮ページ
    } catch (err) {
      setError("ログインに失敗しました。メールアドレスとパスワードを確認してください。");
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 20 }}>
      <h2>ログイン</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>メールアドレス：</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>パスワード：</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        {error && (
          <p style={{ color: "red", marginTop: 10 }}>{error}</p>
        )}
        <button type="submit" style={{ marginTop: 20, padding: 10, width: "100%" }}>
          ログイン
        </button>
      </form>

      <p style={{ marginTop: '1rem', color: '#ccc', fontSize: '14px' }}>
  アカウントをお持ちでない方は{' '}
  <Link href="/register" style={{ color: '#ff5252', textDecoration: 'underline' }}>
    こちらから登録
  </Link>
</p>

    </div>
  );
}
