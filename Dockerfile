# Node.js の公式イメージを使用
FROM node:20

# 作業ディレクトリを設定
WORKDIR /app

# 依存ファイルを先にコピーして npm install
COPY package.json package-lock.json* ./
RUN npm install

# 残りすべてのソースをコピー
COPY . .

# ポートを指定（Cloud Run がこのPORTを使う）
ENV PORT 8080

# アプリを起動
CMD ["node", "index.js"]
