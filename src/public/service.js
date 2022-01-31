const CACHE_VERSION = '1'

async function fromCache(e) {
  let cache = await caches.open(CACHE_VERSION)
  let match = await cache.match(e.request, { ignoreSearch: true })
  if (match) {
    if (e.request.url.endsWith('/')) {
      e.waitUntil(
        fetch(
          new Request(e.request, {
            referrer: e.request.referrer,
            method: 'HEAD'
          })
        )
      )
    }
    return match
  } else {
    return fetch(e.request)
  }
}

async function cleanCache(cache, files) {
  let keys = await cache.keys()
  await Promise.all(
    keys.map(async key => {
      let { pathname } = new URL(key.url)
      if (!files.includes(pathname)) {
        await cache.delete(key)
      }
    })
  )
}

async function precache() {
  let cache = await caches.open(CACHE_VERSION)
  let files = FILES
  let requests = files.map(url => new Request(url))
  await Promise.all([cleanCache(cache, files), cache.addAll(requests)])
}

self.addEventListener('install', e => {
  e.waitUntil(precache())
})

self.addEventListener('fetch', e => {
  let { hostname } = new URL(e.request.url)
  if (self.location.hostname === hostname) {
    e.respondWith(fromCache(e))
  }
})
