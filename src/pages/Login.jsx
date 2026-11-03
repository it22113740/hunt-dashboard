import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { Banner } from '../components/Banner'
import { Field } from '../components/Field'
import { describedBy } from '../lib/form'
import { login } from '../lib/api'
import { useToast } from '../toast'

export function Login() {
  const { session, signIn } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = 'Sign in · Hunt superadmin'
  }, [])

  if (session) return <Navigate to="/" replace />

  async function onSubmit(event) {
    event.preventDefault()
    const next = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter your email.'
    if (!password) next.password = 'Enter your password.'
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return

    setBusy(true)
    try {
      const result = await login(email.trim(), password)
      if (result.user?.role !== 'SUPERADMIN') {
        setFormError('This desk is only for the Hunt superadmin.')
        return
      }
      toast('Signed in')
      signIn(result)
    } catch (error) {
      setFormError(error.message || 'Sign in failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <section className="login__brand">
        <div>
          <h1>Hunt</h1>
          <hr className="login__rule" />
          <p>The desk for stores, posts, and bans.</p>
        </div>
        <p className="login__mark">Superadmin</p>
      </section>
      <form className="login__form" onSubmit={onSubmit} noValidate>
        <h2>Sign in</h2>
        {formError ? <Banner tone="error">{formError}</Banner> : null}
        <Field id="email" label="Email" error={errors.email}>
          <input
            id="email"
            className="control"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy('email', { error: errors.email })}
          />
        </Field>
        <Field id="password" label="Password" error={errors.password}>
          <input
            id="password"
            className="control"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={describedBy('password', { error: errors.password })}
          />
        </Field>
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? 'Signing in' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
