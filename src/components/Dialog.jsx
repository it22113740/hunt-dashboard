import { useEffect, useRef } from 'react'

export function Dialog({ open, title, children, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
    return undefined
  }, [open])

  return (
    <dialog
      ref={ref}
      className="dialog"
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
    >
      <h2>{title}</h2>
      {children}
    </dialog>
  )
}
