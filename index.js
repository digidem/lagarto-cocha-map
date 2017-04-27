/* global mapboxgl, d3 */

mapboxgl.accessToken = 'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

var data
var dataIndex = {}
var pending = 2

var interactiveLayers = [
  'Caminos',
  'New communities',
  'Comunidad antigua grande',
  'Casa Yage',
  'Campamento',
  'Old pots',
  'Nakomasira',
  'Saladeros',
  'Canoes',
  'S - Lakes',
  'S-River areas'
]

var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/gmaclennan/cj08hblae00102sn58nxqlx26', // stylesheet location
  center: [-75.3506, -0.4848], // starting position
  zoom: 10, // starting zoom
  hash: true,
  maxBounds: [-87, -9, -70, 6]
}).on('load', onLoad)

d3.json('airtable.json', function (err, _data) {
  if (err) return console.error(err)
  data = _data[Object.keys(_data)[0]]
  data.features.forEach(function (feature) {
    dataIndex[feature.properties.id] = feature
  })
  onLoad()
})

function onLoad () {
  if (--pending > 0) return
  var lastProps

  var nav = new mapboxgl.NavigationControl()
  map.addControl(nav, 'top-left')

  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: false
  })

  map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: interactiveLayers })

    var airtableRecord = features && features[0] && dataIndex[features[0].properties.id]
    if (!airtableRecord) {
      map.getCanvas().style.cursor = ''
      popup.remove()
      return
    }

    map.getCanvas().style.cursor = 'pointer'
    popup.setLngLat(e.lngLat).addTo(map)

    if (lastProps === airtableRecord.properties) return

    var popupNode = renderPopup(airtableRecord.properties)
    popup.setDOMContent(popupNode)
    lastProps = airtableRecord.properties
  })
}

function renderPopup (props) {
  var fotoUrl = props.Foto && props.Foto[0] && props.Foto[0].thumbnails.large.url
  var html = `<div class='popup-wrapper'>
    <img src=${fotoUrl || 'http://lorempixel.com/400/300/nature/'}>
    <div class='popup-inner'>
      <h1>${props['Nombre Siek'] || 'No Name'}</h1>
      <p><b>${props.Type}:</b> ${props['Nota Siekopai'] || 'Nota Siekopai'}</p>
      <p><b>${props.Type}:</b> ${props['Nota Español'] || 'Nota Español'}</p>
      <p><b>${props.Type}:</b> ${props['Nota Ingles'] || 'Nota Ingles'}</p>
    </div>
  </div>`
  var div = window.document.createElement('div')
  div.innerHTML = html
  return div
}

