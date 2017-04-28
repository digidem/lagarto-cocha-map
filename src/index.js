const d3 = require('d3-request')
const css = require('sheetify')
const renderPopup = require('./popup')
const renderLanguageSelector = require('./language')
const mapboxgl = require('mapbox-gl')
const yo = require('yo-yo')

css('mapbox-gl/dist/mapbox-gl.css')

var langStyle = css`
  :host {
    position: absolute;
    top: 20px;
    right: 20px;
  }
`

mapboxgl.accessToken = 'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

var data
var dataIndex = {}
var pending = 2
var lang = 'esp'

var interactiveLayers = [
  'Caminos',
  'New communities',
  'Comunidad antigua grande',
  'Comunidad antigua chica',
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
  var airtableRecord

  var langSelector = yo`<div class='${langStyle}'>${renderLanguageSelector(updateLang, lang)}</div>`
  document.body.appendChild(langSelector)

  var nav = new mapboxgl.NavigationControl()
  map.addControl(nav, 'top-left')

  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: false
  })
  var popupNode = yo`<div />`
  popup.setDOMContent(popupNode)

  map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: interactiveLayers })

    var airtableRecord = features && features[0] && dataIndex[features[0].properties.id]
    if (!airtableRecord) {
      map.getCanvas().style.cursor = ''
    } else {
      map.getCanvas().style.cursor = 'pointer'
    }
  })

  map.on('click', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: interactiveLayers })
    var test = map.queryRenderedFeatures(e.point)
    if (test && test.length) console.log(test)
    airtableRecord = features && features[0] && dataIndex[features[0].properties.id]
    if (!airtableRecord) {
      popup.remove()
      return
    }

    popup.setLngLat(e.lngLat).addTo(map)
    yo.update(popupNode, renderPopup(airtableRecord.properties, lang))
  })

  function updateLang (_) {
    lang = _
    if (airtableRecord) {
      yo.update(popupNode, renderPopup(airtableRecord.properties, lang))
    }
  }
}
