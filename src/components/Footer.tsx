import { Link } from 'react-router-dom'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3" />
      <line x1="16.5" y1="7.5" x2="16.5" y2="7.501" />
    </svg>
  )
}

export default function Footer({ className = '' }: { className?: string }) {
  return (
    <footer
      className={`flex flex-col items-center gap-3 text-xs text-muted border-t border-accent/15 py-6 ${className}`}
    >
      <a
        href="https://www.instagram.com/cckarchev/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="text-muted hover:text-accent transition-colors"
      >
        <InstagramIcon className="w-5 h-5" />
      </a>
      <div className="flex gap-4">
        <Link to="/privacy" className="hover:text-accent transition-colors no-underline">
          Política de privacidad
        </Link>
        <Link to="/terms" className="hover:text-accent transition-colors no-underline">
          Términos de uso
        </Link>
      </div>
      <p className="m-0">Centro Cultural Karchev</p>
    </footer>
  )
}
