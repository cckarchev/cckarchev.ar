import { type LabelHTMLAttributes } from 'react'

export function FormLabel({ className = '', ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  // Association with a control happens at the call site via the `htmlFor` prop;
  // jsx-a11y can't see through the wrapper, so we disable the rule here.
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  return <label className={`cck-label ${className}`.trim()} {...rest} />
}
