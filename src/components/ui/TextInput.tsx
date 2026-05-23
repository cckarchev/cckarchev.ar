import { type InputHTMLAttributes } from 'react'

export function TextInput({
  className = '',
  type = 'text',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input type={type} className={`cck-input ${className}`.trim()} {...rest} />
}
