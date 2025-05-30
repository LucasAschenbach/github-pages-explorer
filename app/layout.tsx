import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Github Pages Explorer',
  description: 'Browse all your hosted GitHub Pages repositories',
  generator: 'github-pages-explorer',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
