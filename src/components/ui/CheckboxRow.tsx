import { useId, type ReactNode } from 'react'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
  id?: string
}

export function CheckboxRow({ checked, onChange, children, id }: Props) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <div className="cck-checkbox-row">
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor={inputId}>{children}</label>
    </div>
  )
}
