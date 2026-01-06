import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { getConfig, getAssetPath, SpecraConfig, initConfig } from "specra/lib"
import { ConfigProvider, TabProvider } from "specra/components"
import specraConfig from "../specra.config.json"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// Initialize Specra config
initConfig(specraConfig as unknown as Partial<SpecraConfig>)

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig()

  return {
    title: {
      default: config.site.title,
      template: `%s | ${config.site.title}`,
    },
    description: config.site.description || "Modern documentation platform",
    metadataBase: config.site.url ? new URL(config.site.url) : undefined,
    icons: {
      icon: config.site.favicon ? [{ url: getAssetPath(config.site.favicon) }] : [],
      apple: getAssetPath("/apple-icon.png"),
    },
    openGraph: {
      title: config.site.title,
      description: config.site.description,
      url: config.site.url,
      siteName: config.site.title,
      locale: config.site.language || "en",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.site.title,
      description: config.site.description,
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const config = getConfig()
  const defaultTab = config.navigation?.tabGroups?.[0]?.id ?? ""

  return (
    <html lang={config.site.language || "en"}>
      <body
        // className={`${geist.className} ${geist.style.fontFamily} font-sans antialiased`}
        className={`font-sans antialiased`}
      >
        <ConfigProvider config={config}>
          <TabProvider defaultTab={defaultTab}>
            {children}
          </TabProvider>
        </ConfigProvider>
      </body>
    </html>
  )
}
