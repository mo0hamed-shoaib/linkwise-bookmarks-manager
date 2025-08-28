import Link from 'next/link'
import { Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 Linkwise. Made with{' '}
            <Link href="https://supabase.com" className="font-medium underline underline-offset-4">
              Supabase
            </Link>{' '}
            +{' '}
            <Link href="https://nextjs.org" className="font-medium underline underline-offset-4">
              Next.js
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
