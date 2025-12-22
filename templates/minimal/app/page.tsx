import Link from "next/link"
import { ArrowRight, BookOpen, Zap, Code, Github, Twitter, Linkedin } from "lucide-react"
import { getConfig, getAssetPath } from "specra/lib"
import { Button, SiteBanner } from "specra/components"

export default function HomePage() {
  // Server component - can use getConfig directly
  const config = getConfig()

  const activeVersion = config.site.activeVersion || "v4.0.0"
  const docsUrl = `/docs/${activeVersion}/about`

  return (
    <div className="min-h-screen bg-background">
      <SiteBanner config={config} />
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between px-6 mx-auto">
          <Link href="/" className="flex items-center gap-2">
            {config.site.logo ? (
              <img src={getAssetPath(config.site.logo ?? "")} alt={config.site.title} className="h-8 w-auto" />
            ) : (
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
            )}
            <span className="font-semibold text-lg text-foreground">Specra</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href={docsUrl} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
            {
              config?.social?.github ? (
                <Link href={config.social.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="h-5 w-5" />
                </Link>
              ) : null
            }
            <Button asChild>
              <Link href={docsUrl}>Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-6 mx-auto">
        {/* Hero Section */}
        <div className="mx-auto text-center space-y-6 py-20 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            Beautiful documentation made <span className="text-primary">simple</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            The modern documentation framework that grows with your project
          </p>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Built for developers who want powerful, flexible documentation without the complexity.
            Write in MDX, configure with ease, and ship beautiful docs in minutes.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button asChild size="lg">
              <Link href={docsUrl}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {
              config?.social?.github ? (
                <Button asChild size="lg" variant="outline">
                  <Link href={config.social.github} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    View on GitHub
                  </Link>
                </Button>
              ) : null
            }
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-6 py-16 max-w-6xl mx-auto">
          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">MDX-Powered</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Write your docs in MDX with support for custom components, code blocks with syntax highlighting, and rich interactive content.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Built on Next.js for optimal performance. Static generation, instant page loads, and seamless navigation out of the box.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Developer First</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Version control friendly, Git-based workflow, and full TypeScript support. Your docs live alongside your code.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 max-w-4xl mx-auto">
          <div className="rounded-xl border border-border bg-card p-8 md:p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ready to Get Started?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create beautiful, versioned documentation for your project in minutes. <br />
              Specra gives you everything you need to write, organize, and publish great docs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button asChild size="lg" variant="default">
                <Link href={docsUrl}>
                  Read the Docs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {
                config?.social?.github ? (
                  <Button asChild size="lg" variant="outline">
                    <Link href={config.social.github} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      Star on GitHub
                    </Link>
                  </Button>
                ) : null
              }
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="py-16 max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Join the Community</h2>
          <p className="text-muted-foreground">
            Specra is open source and community-driven. Connect with developers and stay updated.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            {
              config?.social?.github ? (
                <Button asChild variant="outline" size="lg">
                  <Link href={config.social.github} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-5 w-5" />
                    GitHub
                  </Link>
                </Button>
              ) : null
            }
            {
              config?.social?.twitter ? (
                <Button asChild variant="outline" size="lg">
                  <Link href={config.social.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="mr-2 h-5 w-5" />
                    Twitter
                  </Link>
                </Button>
              ) : null
            }
            {
              config?.social?.linkedin ? (
                <Button asChild variant="outline" size="lg">
                  <Link href={config.social.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-5 w-5" />
                    LinkedIn
                  </Link>
                </Button>
              ) : null
            }
          </div>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  )
}
