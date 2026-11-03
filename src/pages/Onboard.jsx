import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Banner } from '../components/Banner'
import { Field } from '../components/Field'
import { describedBy } from '../lib/form'
import { Page } from '../components/Page'
import { onboardStore } from '../lib/api'
import { temporaryPassword } from '../lib/format'
import { lookupCoordinates } from '../lib/geo'

const categories = ['Restaurant', 'Bar', 'Cafe', 'Pub', 'Lounge', 'Other']

const initial = {
  ownerEmail: '',
  password: '',
  name: '',
  category: 'Restaurant',
  address: '',
  lat: '',
  lng: '',
  radiusMeters: '100',
  pointsPerPhoto: '10',
  pointsPerVideo: '20',
  description: '',
}

function whole(value, min, max) {
  if (String(value).trim() === '') return false
  const number = Number(value)
  return Number.isInteger(number) && number >= min && number <= max
}

function validate(form) {
  const errors = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail.trim())) {
    errors.ownerEmail = 'Enter the owner email.'
  }
  if (form.password.length < 8) errors.password = 'Use at least 8 characters.'
  if (form.name.trim().length < 2) errors.name = 'Use at least 2 characters.'
  if (!form.address.trim()) errors.address = 'Enter the store address.'
  if (form.lat.trim() === '' || Number(form.lat) < -90 || Number(form.lat) > 90) {
    errors.lat = 'Enter a latitude from -90 to 90.'
  }
  if (form.lng.trim() === '' || Number(form.lng) < -180 || Number(form.lng) > 180) {
    errors.lng = 'Enter a longitude from -180 to 180.'
  }
  if (!whole(form.radiusMeters, 10, 5000)) {
    errors.radiusMeters = 'Use a whole number of meters, from 10 to 5000.'
  }
  if (!whole(form.pointsPerPhoto, 0, 100000)) errors.pointsPerPhoto = 'Use a whole number, 0 or more.'
  if (!whole(form.pointsPerVideo, 0, 100000)) errors.pointsPerVideo = 'Use a whole number, 0 or more.'
  return errors
}

export function Onboard() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)
  const [place, setPlace] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function onLookup() {
    setFormError('')
    setPlace('')
    if (!form.address.trim()) {
      setErrors((current) => ({ ...current, address: 'Enter the store address first.' }))
      return
    }
    setLookingUp(true)
    try {
      const hit = await lookupCoordinates(form.address.trim())
      set('lat', hit.lat.toFixed(6))
      set('lng', hit.lng.toFixed(6))
      setPlace(hit.label)
      setErrors((current) => ({ ...current, lat: undefined, lng: undefined, address: undefined }))
    } catch (error) {
      setFormError(error.message)
    } finally {
      setLookingUp(false)
    }
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(form.password)
      setCopied(true)
    } catch {
      setFormError('Select the password and copy it manually.')
    }
  }

  async function onSubmit(event) {
    event.preventDefault()
    const next = validate(form)
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return
    setBusy(true)
    try {
      const result = await onboardStore({
        ownerEmail: form.ownerEmail.trim(),
        password: form.password,
        name: form.name.trim(),
        address: form.address.trim(),
        lat: Number(form.lat),
        lng: Number(form.lng),
        radiusMeters: Number(form.radiusMeters),
        pointsPerPhoto: Number(form.pointsPerPhoto),
        pointsPerVideo: Number(form.pointsPerVideo),
        category: form.category,
        description: form.description.trim() || undefined,
      })
      navigate('/stores', { state: { notice: result.message } })
    } catch (error) {
      setFormError(error.message || 'The store was not onboarded.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page
      title="Onboard a store"
      lede="Creates the store and an owner login. The owner adds a photo, perks, and promotions in the Hunt app."
      action={
        <Link className="btn btn--quiet" to="/stores">
          Back to stores
        </Link>
      }
    >
      <form className="form" onSubmit={onSubmit} noValidate>
        {formError ? <Banner tone="error">{formError}</Banner> : null}
        <fieldset>
          <legend>Owner</legend>
          <Field id="owner-email" label="Email" error={errors.ownerEmail} hint="They sign in to the Hunt app with this.">
            <input
              id="owner-email"
              className="control"
              type="email"
              autoComplete="off"
              value={form.ownerEmail}
              onChange={(event) => set('ownerEmail', event.target.value)}
              aria-invalid={Boolean(errors.ownerEmail)}
              aria-describedby={describedBy('owner-email', {
                error: errors.ownerEmail,
                hint: true,
              })}
            />
          </Field>
          <Field
            id="owner-password"
            label="Password"
            error={errors.password}
            hint="Share this with the owner. It is kept only when the email is new."
          >
            <input
              id="owner-password"
              className="control"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => {
                setCopied(false)
                set('password', event.target.value)
              }}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={describedBy('owner-password', {
                error: errors.password,
                hint: true,
              })}
            />
          </Field>
          <div className="inline-actions">
            <button
              type="button"
              className="btn btn--quiet"
              onClick={() => {
                setCopied(false)
                setShowPassword(true)
                set('password', temporaryPassword())
              }}
            >
              Generate a password
            </button>
            <button type="button" className="btn btn--quiet" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
            <button type="button" className="btn btn--quiet" onClick={onCopy} disabled={!form.password}>
              {copied ? 'Copied' : 'Copy password'}
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Store</legend>
          <Field id="store-name" label="Name" error={errors.name}>
            <input
              id="store-name"
              className="control"
              value={form.name}
              onChange={(event) => set('name', event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describedBy('store-name', { error: errors.name })}
            />
          </Field>
          <Field id="store-category" label="Category">
            <select
              id="store-category"
              className="control"
              value={form.category}
              onChange={(event) => set('category', event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'Cafe' ? 'Café' : category === 'Other' ? 'Something else' : category}
                </option>
              ))}
            </select>
          </Field>
          <Field id="store-address" label="Address" error={errors.address}>
            <input
              id="store-address"
              className="control"
              value={form.address}
              onChange={(event) => set('address', event.target.value)}
              aria-invalid={Boolean(errors.address)}
              aria-describedby={describedBy('store-address', { error: errors.address })}
            />
          </Field>
          <div className="inline-actions">
            <button type="button" className="btn btn--quiet" onClick={onLookup} disabled={lookingUp}>
              {lookingUp ? 'Looking up' : 'Look up coordinates'}
            </button>
          </div>
          {place ? <p className="field__hint place-match">Matched {place}</p> : null}
          <div className="fields-2">
            <Field id="store-lat" label="Latitude" error={errors.lat}>
              <input
                id="store-lat"
                className="control"
                inputMode="decimal"
                value={form.lat}
                onChange={(event) => set('lat', event.target.value)}
                aria-invalid={Boolean(errors.lat)}
                aria-describedby={describedBy('store-lat', { error: errors.lat })}
              />
            </Field>
            <Field id="store-lng" label="Longitude" error={errors.lng}>
              <input
                id="store-lng"
                className="control"
                inputMode="decimal"
                value={form.lng}
                onChange={(event) => set('lng', event.target.value)}
                aria-invalid={Boolean(errors.lng)}
                aria-describedby={describedBy('store-lng', { error: errors.lng })}
              />
            </Field>
          </div>
          <Field
            id="store-radius"
            label="Geofence radius (meters)"
            error={errors.radiusMeters}
            hint="Guests can post when they are inside this radius."
          >
            <input
              id="store-radius"
              className="control"
              inputMode="numeric"
              value={form.radiusMeters}
              onChange={(event) => set('radiusMeters', event.target.value)}
              aria-invalid={Boolean(errors.radiusMeters)}
              aria-describedby={describedBy('store-radius', {
                error: errors.radiusMeters,
                hint: true,
              })}
            />
          </Field>
          <div className="fields-2">
            <Field id="store-photo-points" label="Points per photo" error={errors.pointsPerPhoto}>
              <input
                id="store-photo-points"
                className="control"
                inputMode="numeric"
                value={form.pointsPerPhoto}
                onChange={(event) => set('pointsPerPhoto', event.target.value)}
                aria-invalid={Boolean(errors.pointsPerPhoto)}
                aria-describedby={describedBy('store-photo-points', { error: errors.pointsPerPhoto })}
              />
            </Field>
            <Field id="store-video-points" label="Points per video" error={errors.pointsPerVideo}>
            <input
              id="store-video-points"
              className="control"
              inputMode="numeric"
              value={form.pointsPerVideo}
              onChange={(event) => set('pointsPerVideo', event.target.value)}
              aria-invalid={Boolean(errors.pointsPerVideo)}
              aria-describedby={describedBy('store-video-points', { error: errors.pointsPerVideo })}
            />
            </Field>
          </div>
          <Field id="store-description" label="Description" hint="Optional.">
            <textarea
              id="store-description"
              className="control"
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={(event) => set('description', event.target.value)}
              aria-describedby={describedBy('store-description', { hint: true })}
            />
          </Field>
        </fieldset>
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? 'Onboarding' : 'Onboard store'}
        </button>
      </form>
    </Page>
  )
}
