import { type HTMLAttributes, type ReactNode } from 'react'

type PanelProps = HTMLAttributes<HTMLElement> & {
  sticky?: boolean
  as?: 'section' | 'div' | 'article'
}

export function Panel({
  sticky = false,
  as: Tag = 'section',
  className = '',
  ...rest
}: PanelProps) {
  const stickyClass = sticky ? 'cck-panel--sticky' : ''
  return <Tag className={`cck-panel ${stickyClass} ${className}`.trim()} {...rest} />
}

export function PanelHead({ children }: { children: ReactNode }) {
  return <h2 className="cck-panel-head">{children}</h2>
}

export function PanelBody({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`cck-panel-body ${className}`.trim()}>{children}</div>
}
