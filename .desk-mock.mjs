import http from 'node:http'

const admin = { id: 'admin_1', email: 'ada@hunt.test', role: 'SUPERADMIN', bannedAt: null }

const stores = [
  {
    id: 'store_1',
    name: 'Kala Cafe',
    address: '12 Galle Road, Colombo',
    category: 'Cafe',
    description: null,
    lat: 6.9271,
    lng: 79.8612,
    radiusMeters: 100,
    pointsPerPhoto: 10,
    pointsPerVideo: 20,
    imageUrl: null,
    createdAt: '2026-10-02T08:00:00.000Z',
    owner: { id: 'user_owner', email: 'owner@kala.test', bannedAt: null },
    media: {
      approvedPhotos: 128,
      rejectedPhotos: 9,
      pendingPhotos: 4,
      approvedVideos: 41,
      rejectedVideos: 3,
      pendingVideos: 1,
    },
  },
  {
    id: 'store_2',
    name: 'Night Market Bar',
    address: '88 Park Street, Colombo',
    category: 'Bar',
    description: null,
    lat: 6.91,
    lng: 79.85,
    radiusMeters: 80,
    pointsPerPhoto: 10,
    pointsPerVideo: 20,
    imageUrl: null,
    createdAt: '2026-09-14T08:00:00.000Z',
    owner: { id: 'user_guest_owner', email: 'mina@night.test', bannedAt: null },
    media: {
      approvedPhotos: 22,
      rejectedPhotos: 17,
      pendingPhotos: 0,
      approvedVideos: 6,
      rejectedVideos: 11,
      pendingVideos: 2,
    },
  },
]

const people = [
  {
    id: 'user_owner',
    email: 'owner@kala.test',
    username: null,
    imageUrl: null,
    role: 'OWNER',
    createdAt: '2026-10-02T08:00:00.000Z',
    bannedAt: null,
    banReason: null,
  },
  {
    id: 'user_guest',
    email: 'nimal@guest.test',
    username: 'nimal',
    imageUrl: null,
    role: 'USER',
    createdAt: '2026-10-18T08:00:00.000Z',
    bannedAt: null,
    banReason: null,
  },
]

function totals() {
  return stores.reduce(
    (sum, store) => {
      for (const key of Object.keys(sum)) sum[key] += store.media[key]
      return sum
    },
    {
      approvedPhotos: 0,
      rejectedPhotos: 0,
      pendingPhotos: 0,
      approvedVideos: 0,
      rejectedVideos: 0,
      pendingVideos: 0,
    },
  )
}

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString()
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch {
        resolve({})
      }
    })
  })
}

function page(items, url) {
  const limit = Number(url.searchParams.get('limit') ?? 25)
  const offset = Number(url.searchParams.get('offset') ?? 0)
  return { items: items.slice(offset, offset + limit), total: items.length, limit, offset }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const auth = req.headers.authorization
  const open = req.method === 'POST' && url.pathname === '/admin/login'
  if (!open && auth !== 'Bearer desk-token') {
    return send(res, 401, { message: 'Unauthorized' })
  }

  if (req.method === 'POST' && url.pathname === '/admin/login') {
    const body = await readBody(req)
    if (!body.password || body.password === 'wrong') {
      return send(res, 401, { message: 'Invalid email or password' })
    }
    return send(res, 201, { user: admin, accessToken: 'desk-token' })
  }

  if (req.method === 'GET' && url.pathname === '/auth/me') return send(res, 200, admin)

  if (req.method === 'GET' && url.pathname === '/admin/overview') {
    return send(res, 200, {
      stores: stores.length,
      people: people.length,
      banned: people.filter((person) => person.bannedAt).length,
      media: totals(),
      recentStores: stores.slice(0, 5),
    })
  }

  if (req.method === 'GET' && url.pathname === '/admin/stores') {
    const q = (url.searchParams.get('q') ?? '').toLowerCase()
    let items = stores.filter((store) => {
      if (!q) return true
      return [store.name, store.address, store.owner.email].join(' ').toLowerCase().includes(q)
    })
    if (url.searchParams.get('sort') === 'rejected') {
      items = [...items].sort(
        (a, b) =>
          b.media.rejectedPhotos +
          b.media.rejectedVideos -
          (a.media.rejectedPhotos + a.media.rejectedVideos),
      )
    }
    return send(res, 200, page(items, url))
  }

  if (req.method === 'POST' && url.pathname === '/admin/stores') {
    const body = await readBody(req)
    const store = {
      id: `store_${stores.length + 1}`,
      name: body.name,
      address: body.address,
      category: body.category,
      description: body.description ?? null,
      lat: body.lat,
      lng: body.lng,
      radiusMeters: body.radiusMeters,
      pointsPerPhoto: body.pointsPerPhoto,
      pointsPerVideo: body.pointsPerVideo,
      imageUrl: null,
      createdAt: new Date().toISOString(),
      owner: { id: `owner_${people.length + 1}`, email: body.ownerEmail, bannedAt: null },
      media: {
        approvedPhotos: 0,
        rejectedPhotos: 0,
        pendingPhotos: 0,
        approvedVideos: 0,
        rejectedVideos: 0,
        pendingVideos: 0,
      },
    }
    stores = [store, ...stores]
    people.push({
      id: store.owner.id,
      email: body.ownerEmail,
      username: null,
      imageUrl: null,
      role: 'OWNER',
      createdAt: store.createdAt,
      bannedAt: null,
      banReason: null,
    })
    return send(res, 201, {
      store,
      ownerCreated: true,
      message: 'Store onboarded. The owner can sign in to the Hunt app with this email and password.',
    })
  }

  if (req.method === 'GET' && url.pathname === '/admin/users') {
    const q = (url.searchParams.get('q') ?? '').toLowerCase()
    const status = url.searchParams.get('status') ?? 'all'
    const items = people.filter((person) => {
      if (status === 'banned' && !person.bannedAt) return false
      if (status === 'active' && person.bannedAt) return false
      if (!q) return true
      return `${person.email} ${person.username ?? ''}`.toLowerCase().includes(q)
    })
    return send(res, 200, page(items, url))
  }

  const ban = url.pathname.match(/^\/admin\/users\/([^/]+)\/(ban|unban)$/)
  if (req.method === 'POST' && ban) {
    const person = people.find((item) => item.id === decodeURIComponent(ban[1]))
    if (!person) return send(res, 404, { message: 'User not found' })
    if (ban[2] === 'ban') {
      const body = await readBody(req)
      person.bannedAt = new Date().toISOString()
      person.banReason = body.reason
      const owned = stores.find((store) => store.owner.id === person.id)
      if (owned) owned.owner.bannedAt = person.bannedAt
    } else {
      person.bannedAt = null
      person.banReason = null
      const owned = stores.find((store) => store.owner.id === person.id)
      if (owned) owned.owner.bannedAt = null
    }
    return send(res, 201, person)
  }

  send(res, 404, { message: 'Not found' })
})

server.listen(3000, () => {
  console.log('mock desk api on 3000')
})
