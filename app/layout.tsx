import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SAP AI Orchestration Studio',
  description: 'Visual AI pipeline builder inspired by SAP AI Foundation Orchestration Service. Drag, drop, and connect AI modules on a canvas.',
  openGraph: {
    title: 'SAP AI Orchestration Studio',
    description: 'Visual AI pipeline builder inspired by SAP AI Foundation Orchestration Service.',
    url: 'https://sap-ai-studio.vercel.app',
    siteName: 'SAP AI Orchestration Studio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAP AI Orchestration Studio',
    description: 'Visual AI pipeline builder inspired by SAP AI Foundation Orchestration Service.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}