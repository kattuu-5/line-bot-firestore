FROM node:20

# 作業ディレクトリを /app に統一（より安全）
WORKDIR /app

# 依存関係ファイルをコピーしてインストール
COPY package*.json ./
RUN npm install

# 残りのファイルをすべてコピー（index.js含む）
COPY . .

# Cloud Run が期待するポート番号
ENV PORT 8080

# アプリケーションを起動
CMD ["node", "index.js"]
