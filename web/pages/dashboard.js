// pages/dashboard.js
import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';

import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  deleteDoc,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Dashboard() {
  const [castName, setCastName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [storeId, setStoreId] = useState('');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); 

  // 🔐 ログインユーザーの storeId を取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        const adminRef = doc(db, 'admins', uid);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
          const data = adminSnap.data();
          setStoreId(data.storeId);
          setStoreName(data.storeName); 
        } else {
          alert('管理者情報が見つかりません');
        }
      } else {
        window.location.href = '/login';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // バリデーションロジック
  const validateSchedule = () => {
  if (!castName || !date || !startTime || !endTime) {
    alert('すべての項目を入力してください');
    return false;
  }

  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  if (start >= end) {
    alert('開始時間は終了時間より前にしてください');
    return false;
  }

  const today = new Date().toISOString().split('T')[0];
if (date < today) {
  alert('過去の日付は選択できません');
  return false;
}

  return true;
};

  // 📤 スケジュール登録
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateSchedule()) return;
    if (!storeId) return;

    try {
      await addDoc(collection(db, 'schedules'), {
        castName,
        date,
        startTime,
        endTime,
        storeId,
        createdAt: new Date()
      });

            // 🔽 cast_list にもキャスト登録（重複防止のため storeId__castName をドキュメントIDにする）
      await setDoc(doc(db, 'cast_list', `${storeId}__${castName}`), {
        castName,
        name: castName,
        storeId,
      });

      alert('出勤スケジュールを登録しました');
      setCastName('');
      setDate('');
      setStartTime('');
      setEndTime('');
      fetchSchedules(storeId);
    } catch (err) {
      console.error('登録エラー:', err);
      alert('登録に失敗しました');
    }
  };

  // 🗑 スケジュール削除処理
  const handleDelete = async (id) => {
    const confirm = window.confirm('本当に削除しますか？');
  if (!confirm) return;

  try {
    await deleteDoc(doc(db, 'schedules', id));
    alert('削除しました');
    fetchSchedules(storeId); // 再取得
  } catch (err) {
    console.error('削除エラー:', err);
    alert('削除に失敗しました');
  }
  };

  // 編集開始用の関数
  const handleEdit = (item) => {
  setCastName(item.castName);
  setDate(item.date);
  setStartTime(item.startTime);
  setEndTime(item.endTime);
  setEditingId(item.id);
};

// 更新用の関数
const handleUpdate = async (e) => {
  e.preventDefault();
  if (!validateSchedule()) return;
  if (!editingId || !storeId) return;

  try {
    const scheduleRef = doc(db, 'schedules', editingId);
    await updateDoc(scheduleRef, {
      castName,
      date,
      startTime,
      endTime
    });
    alert('スケジュールを更新しました');
    setEditingId(null);
    setCastName('');
    setDate('');
    setStartTime('');
    setEndTime('');
    fetchSchedules(storeId);
  } catch (err) {
    console.error('更新エラー:', err);
    alert('更新に失敗しました');
  }
};

  // 📥 storeId に基づくスケジュール取得
  const fetchSchedules = async (sid) => {
    if (!sid) return;

    const q = query(
      collection(db, 'schedules'),
      where('storeId', '==', sid)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setSchedules(docs);
  };

  // 🔄 storeIdが取得できたら表示データを取得
  useEffect(() => {
    if (storeId) {
      fetchSchedules(storeId);
    }
  }, [storeId]);

  // 🚪 ログアウト処理
  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  // 🔃 ロード中表示
  if (loading) return <p style={{ color: 'white' }}>読み込み中...</p>;

  return (
    <div style={{ padding: '2rem', color: 'white', backgroundColor: '#000', minHeight: '100vh', position: 'relative', maxWidth: '100%', boxSizing: 'border-box'}}>
      <header style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 1.5rem',
  backgroundColor: '#1a1a1a',
  color: '#fff',
  borderBottom: '3px solid #c62828',
  flexWrap: 'wrap'
}}>
  <h1 style={{
    fontSize: '20px',
    margin: 0,
    fontFamily: 'Noto Serif JP, sans-serif'
  }}>
    Lustworks
  </h1>
  <button onClick={handleLogout} style={{
    padding: '8px 16px',
    backgroundColor: '#c62828',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background-color 0.3s'
  }}
  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#ff5252')}
  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#c62828')}
  >
    ログアウト
  </button>
</header>


      <h2 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#ccc' }}>
        店舗名：{storeName}
      </h2>


      <h2>出勤スケジュール登録</h2>

      {/* 登録フォーム */}
      <div style={{ marginTop: '1rem' }}>
      <form onSubmit={editingId ? handleUpdate : handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px', width: '100%', boxSizing: 'border-box'}}>
        <label>名前：</label>
        <input value={castName} onChange={(e) => setCastName(e.target.value)} required style={{ marginBottom: '10px' }}/>

        <label>出勤日：</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ marginBottom: '10px' }}/>

        <label>出勤時間（開始）：</label>
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required style={{ marginBottom: '10px' }}/>

        <label>出勤時間（終了）：</label>
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required style={{ marginBottom: '10px' }}/>

        <button type="submit" style={{ marginTop: '1rem', padding: '10px 16px', fontSize: '16px', borderRadius: '6px', backgroundColor: '#c62828', color: '#fff', border: 'none', cursor: 'pointer', transition: 'background-color 0.3s'}}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#424242')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#616161')}
        >
          {editingId ? '更新する' : '登録'}
        </button>
      </form>
      </div>

      {/* 一覧表示 */}
      <h2 style={{ marginTop: '2rem' }}>登録済みスケジュール一覧</h2>
      <div style={{ overflowX: 'auto', width: '100%' }}>
      <table border="1" cellPadding="0" style={{ marginTop: '1rem', backgroundColor: '#111', color: 'white', width: '100%', borderCollapse: 'collapse', fontSize: '16px', tableLayout: 'fixed'}}>
        <thead>
          <tr style={{ backgroundColor: '#4a494a', color: '#fffeffff'}}>
            <th style={{ width: '25%', padding: '8px 4px', textAlign: 'center' }}>名前</th>
            <th style={{ width: '35%', padding: '8px 4px', textAlign: 'center' }}>出勤日</th>
            <th style={{ width: '20%', padding: '8px 4px', textAlign: 'center' }}>開始</th>
            <th style={{ width: '20%', padding: '8px 4px', textAlign: 'center' }}>終了</th>
            <th style={{ width: '20%', padding: '8px 4px', textAlign: 'center' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: '8px 4px', textAlign: 'center' }}>{item.castName}</td>
              <td style={{ padding: '8px 4px', textAlign: 'center' }}>{item.date}</td>
              <td style={{ padding: '8px 4px', textAlign: 'center' }}>{item.startTime}</td>
              <td style={{ padding: '8px 4px', textAlign: 'center' }}>{item.endTime}</td>
              <td style={{ padding: '8px 4px', textAlign: 'center' }}>
        <div style={{
    display: 'flex',
    flexDirection: 'row',  // ← 横並び（狭い画面では wrap される）
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '6px'  // ← これが「間の余白」を作る
  }}>
        <button
          onClick={() => handleEdit(item)}
          style={{
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#42a5f5')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#1976d2')}
      >
        編集
        </button>
        <button
          onClick={() => handleDelete(item.id)}
          style={{
            backgroundColor: '#e53935',
            color: '#fff',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#ff6f61')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#e53935')}
        >
          削除
        </button>
        </div>
      </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
