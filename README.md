# TCM Knowledge Base - 中醫藥知識庫

> 十三五中醫藥高等教育叢書向量資料庫 + RAG 智能問答

## 功能

- 🔍 中醫藥知識向量搜尋（RAG）
- 📚 科目導航（眼科/婦科/兒科/內科/針灸/方劑...）
- 📖 傷寒論/金匱/內經 經典條文檢索
- 💊 方劑/中藥查詢
- 🔬 TCM-Sage 風格 Self-Critique 答案驗證

## 架構

```
前端 (Next.js on Vercel)
    │
    └── /api/search → coinss server (後端 API)
              │
              └── ChromaDB (向量資料庫)
```

## 開發

```bash
npm install
npm run dev
```

## 環境變數

```env
NEXT_PUBLIC_API_URL=https://your-server.com
```
