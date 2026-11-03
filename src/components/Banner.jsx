export function Banner({ tone = 'info', children }) {
  return (
    <p className={`banner banner--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}
