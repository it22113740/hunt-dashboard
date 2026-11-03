export async function lookupCoordinates(address) {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('q', address)

  let response
  try {
    response = await fetch(url, { headers: { Accept: 'application/json' } })
  } catch {
    throw new Error('Coordinate lookup failed. Enter latitude and longitude.')
  }
  if (!response.ok) {
    throw new Error('Coordinate lookup failed. Enter latitude and longitude.')
  }
  const data = await response.json()
  const hit = Array.isArray(data) ? data[0] : null
  const lat = Number(hit?.lat)
  const lng = Number(hit?.lon)
  if (!hit || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error('No match for that address. Enter latitude and longitude.')
  }
  return { lat, lng, label: hit.display_name || address }
}
