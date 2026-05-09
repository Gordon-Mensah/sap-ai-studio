import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SAP AI Orchestration Studio',
  description: 'Visual AI pipeline builder inspired by SAP AI Foundation Orchestration Service',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <body style={{ height: '100%', margin: 0, overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}