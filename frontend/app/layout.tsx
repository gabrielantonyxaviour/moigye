import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { MoigyeNavbar } from '@/components/layout/moigye-navbar'
import { Web3Provider } from '@/providers/web3-provider'
import { ConfigurationProvider } from '@/components/config/configuration-provider'
import { TranslationProvider } from '@/lib/i18n'

const notoSansKr = Noto_Sans_KR({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '모이계 - Moigye',
  description: '신뢰 기반 한국식 ROSCA, 블록체인으로 더 투명하게',
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={notoSansKr.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TranslationProvider>
            <ConfigurationProvider>
              <Web3Provider>
                <MoigyeNavbar />
                {children}
                <Toaster />
              </Web3Provider>
            </ConfigurationProvider>
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}