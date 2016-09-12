console.log( 'sw hit' )
var cacheName = 'discovery1.5';
var filesToCache = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/css/styles.css',
  '/images/home.png'
];

this.addEventListener( 'install', function( e ) {
  console.log( 'SW install' );
  e.waitUntil(
    caches.open( cacheName ).then( function(cache) {
      console.log( 'caching app shell' );
      return cache.addAll( filesToCache );
    })
  )
});

this.addEventListener( 'fetch', function(e) {
    console.log( 'SW fetch', e.request.url );
    e.respondWith(
      caches.match( e.request ).then( function( response ) {
        return response || fetch( e.request );
      })
    )
});

this.addEventListener( 'activate', function( e ) {
  console.log( 'SW activate' );
  e.waitUntil(
    caches.keys().then( function( keyList ) {
      return Promise.all( keyList.map( function( key ) {
        if ( key !== cacheName ) {
          console.log( 'SW removing old cache', key );
          return caches.delete( key );
        }
      }))
    })
  )
})
