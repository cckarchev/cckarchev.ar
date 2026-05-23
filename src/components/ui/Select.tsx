import { type SelectHTMLAttributes } from 'react'

export function Select({ className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`cck-input ${className}`.trim()} {...rest} />
}
