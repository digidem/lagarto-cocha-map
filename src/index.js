const d3 = require('d3-request')
const elements = require('alianza-elements')
const css = require('sheetify')
const ToggleControl = require('mapbox-gl-toggle-control')
const Infobox = require('./info')
const mapboxgl = require('mapbox-gl')

var renderPopup = require('./popup')
var layoutMarkers = require('./layout')

css('mapbox-gl/dist/mapbox-gl.css')
css('alianza-elements/style.css')

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

mapboxgl.accessToken = 'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

var data
var translations = {}
var dataIndex = {}
var pending = 2
var lang = 'es'

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
  var langSelector = elements.language(updateLang, lang)
  document.body.appendChild(langSelector)

  var nav = new mapboxgl.NavigationControl()
  map.addControl(nav, 'top-left')

  var infoBox = Infobox(lang)
  document.body.appendChild(infoBox.el)
  var infoCtrl = new ToggleControl(infoBox.el)
  map.addControl(infoCtrl, 'top-left')
  infoCtrl._toggleButton.setAttribute('aria-label', 'Toggle Information')
  infoCtrl.show()

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
  var popup = elements.popup(map)

  function defaultZoom () {
    if (map.getZoom() < 10.75) map.easeTo({center: [-75.3106, -0.4793], zoom: 11.92})
  }

  var backButton = elements.backButton(lang, defaultZoom)
  document.body.appendChild(backButton)

  map.on('zoom', function () {
    if (map.getZoom() > 11.75) backButton.style.display = ''
    else backButton.style.display = 'none'
  })

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
    var areaClicked = map.queryRenderedFeatures(e.point, {layers: ['centr-point-77z6mi copy']})
    if (areaClicked) defaultZoom()
    airtableRecord = features && features[0] && dataIndex[features[0].properties.id]

    if (!airtableRecord) {
      popup.remove()
      return
    }
    var isPoint = features[0].geometry.type === 'Point'
    var loc = isPoint ? features[0].geometry.coordinates : e.lngLat

    var popupDOM = renderPopup(airtableRecord.properties, lang, translations)
    popup.popup.options.offset = isPoint ? popupOffsets : 0
    popup.update(popupDOM)
    popup.setLngLat(loc)
  })

  function updateLang (_) {
    lang = _
    if (airtableRecord) {
      popup.update(renderPopup(airtableRecord.properties, lang, translations))
    }
    infoBox.updateLang(lang)
  }
}
