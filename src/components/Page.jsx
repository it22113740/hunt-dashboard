import { useEffect } from 'react'

export function Page({ title, lede, action, children }) {
  useEffect(() => {
    document.title = `${title} · Hunt superadmin`
  }, [title])

  return (
    <section className="page">
      <header className="page__head">
        <div>
          <h1>{title}</h1>
          {lede ? <p className="lede">{lede}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}
