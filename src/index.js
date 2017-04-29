const d3 = require('d3-request')
const css = require('sheetify')
const renderPopup = require('./popup')
const renderLanguageSelector = require('./language')
const layoutMarkers = require('./layout')
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
var markerRadius = 20
var popupOffsets = {
  'top': [0, markerRadius],
  'top-left': [0, markerRadius],
  'top-right': [0, markerRadius],
  'bottom': [0, -markerRadius],
  'bottom-left': [0, -markerRadius],
  'bottom-right': [0, -markerRadius],
  'left': [markerRadius, 0],
  'right': [-markerRadius, 0]
}

var yoOptions = {
  onBeforeElUpdated: function (fromEl) {
    if (fromEl.tagName.toUpperCase() === 'IMG') {
      console.log('update src')
      fromEl.src = ''
    }
  }
}

mapboxgl.accessToken = 'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

var data
var translations = {}
var dataIndex = {}
var pending = 2
var lang = 'esp'

var interactiveLayers = [
  'Caminos hover',
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
  'S - River Areas'
]

var pointLayers = [
  'New communities',
  'Comunidad antigua grande',
  'Comunidad antigua chica',
  'Casa Yage',
  'Campamento',
  'Old pots',
  'Nakomasira',
  'Saladeros',
  'Canoes'
]

var map = window.map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/gmaclennan/cj08hblae00102sn58nxqlx26?fresh=true', // stylesheet location
  center: [-75.3506, -0.4848], // starting position
  zoom: 10, // starting zoom
  hash: true,
  maxBounds: [-87, -9, -70, 6]
}).on('load', onLoad)

d3.json('airtable.json', function (err, _data) {
  if (err) return console.error(err)
  data = _data['Map Points']
  data.features.forEach(function (feature) {
    dataIndex[feature.properties.id] = feature
  })
  _data['Tipo Translations'].features.forEach(function (feature) {
    var props = feature.properties
    if (!props.tipo) return
    translations[props.tipo] = props
  })
  onLoad()
})

function onLoad () {
  if (--pending > 0) return
  var airtableRecord
  layoutMarkers(map, pointLayers)
  var langSelector = yo`<div class='${langStyle}'>${renderLanguageSelector(updateLang, lang)}</div>`
  document.body.appendChild(langSelector)

  var nav = new mapboxgl.NavigationControl()
  map.addControl(nav, 'top-left')

  var lakes = map.getLayer('S - Lakes')
  var lakeHighlight = {
    id: 'lakeHighlight',
    source: lakes.source,
    filter: lakes.filter,
    metadata: lakes.metadata,
    'source-layer': lakes.sourceLayer,
    type: 'line',
    layout: {
      'line-join': 'round'
    },
    paint: {
      'line-color': {
        stops: [
          [12, 'hsl(196, 53%, 40%)'],
          [22, 'hsl(196, 79%, 24%)']
        ]
      },
      'line-opacity': 0,
      'line-width': 3
    }
  }

  map.addLayer(lakeHighlight, 'S - River Areas')

  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: false
  })
  var popupNode = yo`<div>Popup</div>`
  popup.setDOMContent(popupNode)

  map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: interactiveLayers })

    var airtableRecord = features && features[0] && dataIndex[features[0].properties.id]
    if (airtableRecord) {
      map.getCanvas().style.cursor = 'pointer'
    } else {
      map.getCanvas().style.cursor = ''
    }

    if (features[0] && features[0].layer.id === 'S - Lakes') {
      var id = features[0].properties.id
      map.setPaintProperty('Caminos hover', 'line-opacity', 0)
      map.setPaintProperty('lakeHighlight', 'line-opacity', {
        type: 'categorical',
        property: 'id',
        default: 0,
        stops: [
          [id, 0.4]
        ]
      })
    } else if (features[0] && features[0].layer.id === 'Caminos hover') {
      var id = features[0].properties.id
      map.setPaintProperty('lakeHighlight', 'line-opacity', 0)
      map.setPaintProperty('Caminos hover', 'line-opacity', {
        type: 'categorical',
        property: 'id',
        default: 0,
        stops: [
          [id, 0.2]
        ]
      })
    } else {
      map.setPaintProperty('Caminos hover', 'line-opacity', 0)
      map.setPaintProperty('lakeHighlight', 'line-opacity', 0)
    }
  })

  map.on('click', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: interactiveLayers })
    airtableRecord = features && features[0] && dataIndex[features[0].properties.id]
    if (!airtableRecord) {
      popup.remove()
      return
    }
    var isPoint = features[0].geometry.type === 'Point'
    var loc = isPoint ? features[0].geometry.coordinates : e.lngLat

    popup.options.offset = isPoint ? popupOffsets : 0
    yo.update(popupNode, renderPopup(airtableRecord.properties, lang, translations), yoOptions)
    popup.setLngLat(loc).addTo(map)
  })

  function updateLang (_) {
    lang = _
    if (airtableRecord) {
      yo.update(popupNode, renderPopup(airtableRecord.properties, lang, translations))
    }
  }
}
