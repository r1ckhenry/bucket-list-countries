'use strict';

(function() {

  var app = {
    countries: null
  }

  app.getUserCountries = function(callback) {
      var trans = db.transaction("countries", "readonly");
      var store = trans.objectStore("countries");
      var items = [];

      trans.oncomplete = function(evt) {
          callback(items);
      };

      var cursorRequest = store.openCursor();

      cursorRequest.onerror = function(error) {
          console.log(error);
      };

      cursorRequest.onsuccess = function(evt) {
          var cursor = evt.target.result;
          if (cursor) {
              items.push(cursor.value);
              cursor.continue();
          }
      };
  }

  app.displayCountry = function( c ) {
    modal.className = "modal-wrapper hide";
    var bucketList = document.getElementById( 'bucketList' );
    var li = document.createElement( 'li' );
    li.innerHTML = "<span class='country-list-index'>"+c.alpha2Code+"</span>"
    li.innerHTML += "<span class='country-list-name'>"+c.name+"</span>"
    li.innerHTML += "<span class='country-list-capital'>"+c.capital+"</span>"
    bucketList.appendChild( li );
  };

  app.getCountries = function() {
    var url = "https://restcountries.eu/rest/v1/all"
    var request = new XMLHttpRequest();
    request.open( "GET", url );
    request.onload = function() {
      if( request.status === 200 ) {
        var response = JSON.parse( request.responseText )
        app.countries = response;
        app.populateCountriesList();
      }
    }
    request.send(null);
  }

  app.populateCountriesList = function() {
    this.countries.forEach( function( c, i ) {
      var option = document.createElement( 'option' );
      option.value = i;
      option.innerText = c.name;
      select.appendChild( option )
    })
  }

  var dbName = "discovery";
  var dbVersion = 3;
  var db;

  var request = indexedDB.open( dbName, dbVersion );
  request.onsuccess = function(e) {
    db = e.target.result;

    app.getUserCountries(function (countries) {

      countries.forEach( function( country, index ) {
        app.displayCountry( country )
      })

    });
  }

  request.onupgradeneeded = function(event) {
    console.log( 'triggered' );
    db = event.target.result;
    db.deleteObjectStore("customers");
    var objectStore = db.createObjectStore("countries", { keyPath: "alpha3Code" });

    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("capital", "capital", { unique: true });
  };

  var select = document.getElementById( 'countrySelect' );
  select.onchange = function(e) {
    var country = app.countries[ e.target.value ];
    var countryObjectStore = db.transaction("countries", "readwrite").objectStore( 'countries' )
    countryObjectStore.add( country );
    app.displayCountry( country );
  }

  var searchBtn = document.getElementById( 'search' );
  searchBtn.onclick = function() {
    var modal = document.getElementById( 'modal' );
    modal.className = "modal-wrapper";
  }

  var close = document.getElementById( 'close' );
  var modal = document.getElementById( 'modal' );
  close.onclick = function() {
    modal.className = "modal-wrapper hide";
  }

  app.getCountries();

  if ( 'serviceWorker' in navigator ) {
    navigator.serviceWorker
      .register( '/service-worker.js' )
      .then( function() { console.log( 'Service worker registered' ) } )
  }

})();
