import { type ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'cck-button--primary',
  secondary: 'cck-button--secondary',
  danger: 'cck-button--danger',
}

export function Button({ variant = 'primary', className = '', type, ...rest }: Props) {
  const variantClass = VARIANT_CLASS[variant]
  return (
    <button
      type={type ?? 'button'}
      className={`cck-button ${variantClass} ${className}`.trim()}
      {...rest}
    />
  )
}
