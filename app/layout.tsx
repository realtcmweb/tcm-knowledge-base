import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '中醫藥知識庫 | TCM Knowledge Base',
  description: '十三五中醫藥高等教育叢書智能問答系統',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
