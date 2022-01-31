import isSaveDate from '../../lib/is-save-data.js'

function init() {
  navigator.serviceWorker.register(new URL('/service.js', import.meta.url), {
    type: 'module'
  })
}

let forceOffline = location.search.includes('offline')

if (process.env.NODE_ENV === 'production') {
  if ((forceOffline || !isSaveDate()) && navigator.serviceWorker) {
    init()
  } else if (localStorage.appinstalled) {
    init()
  } else {
    window.addEventListener('appinstalled', () => {
      localStorage.appinstalled = true
      init()
    })
  }
}
