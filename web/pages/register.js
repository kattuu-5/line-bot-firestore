// /pages/register.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeId, setStoreId] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Firebase Auth にユーザー登録
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // admins コレクションに追加
      await setDoc(doc(db, 'admins', uid), {
        uid,
        email,
        storeId,
        storeName,
        createdAt: serverTimestamp(),
        role: 'admin',
      });

      alert('アカウント作成に成功しました！ログインしてください。');
      router.push('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>店舗アカウント登録</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>メールアドレス：</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>パスワード：</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>店舗ID（英数字、例: ikebukuro_nadeshiko）：</label>
          <input
            type="text"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            required
          />
        </div>

        <div>
  <label>店舗名（例: 池袋なでしこ）：</label>
  <input
    type="text"
    value={storeName}
    onChange={(e) => setStoreName(e.target.value)}
    required
  />
</div>

        {error && <p style={{ color: 'red' }}>エラー: {error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? '登録中...' : '登録する'}
        </button>
      </form>
    </div>
  );
}
