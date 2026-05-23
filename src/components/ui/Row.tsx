import { type HTMLAttributes } from 'react'

export function Row({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`cck-row-2 ${className}`.trim()} {...rest} />
}
