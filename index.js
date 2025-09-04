// index.js

const express = require('express');
const line = require('@line/bot-sdk');
const admin = require('firebase-admin');
require('dotenv').config();

// --- Firebase初期化 ---
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// --- LINE設定 ---
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};
const client = new line.Client(config);

// --- Express設定 ---
const app = express();
app.use(express.json());

app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events;
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const userId = event.source.userId;

        // Firestoreからfavoritesを照合（例）
        const snapshot = await db.collection('favorites')
          .where('userId', '==', userId)
          .get();

        const replyText = snapshot.empty
          ? 'お気に入りは登録されていません。'
          : 'こんにちは！お気に入りがあります。';

        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: replyText
        });
      }
    }
    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
