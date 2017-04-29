const uniqWith = require('lodash/uniqWith')
const d3 = require('d3-force')
const assign = require('object-assign')

var epsilon = 0.1

module.exports = function layoutMarkers (map, pointLayers) {
  var offsets = {}

  var linkForce = d3.forceLink()
    .distance(0.5)
    .strength(0.4)

  var collideForce = forceCollide()
    .strength(0.7)
    .iterations(2)
    .radius(function (d) {
      return getRadius(map, d.fLayer)
    })

  var simulation = d3.forceSimulation()
    // .velocityDecay(0.2)
    .force('link', linkForce)
    .force('collide', collideForce)
    .stop()

  map.on('move', updateNodes)

  updateNodes()

  function updateNodes () {
    var style = map.getStyle()
    var zoom = map.getZoom()
    var nodes = []
    var links = []
    var features = getFeatures(map, pointLayers)

    features.forEach(function (f, i) {
      var featureId = f.properties.id
      var point = f.point = map.project(f.geometry.coordinates)
      var anchor = {
        fx: point.x,
        fy: point.y
      }
      // Initialize the icon with offsets from previous iteration if available
      var icon = {
        fIndex: i,
        fLayer: f.layer.id,
        x: point.x + offsets[featureId] ? offsets[featureId][0] : 0,
        y: point.y + offsets[featureId] ? offsets[featureId][1] : 0,
      }
      links.push({
        source: nodes.push(anchor) - 1,
        target: nodes.push(icon) - 1
      })
    })

    simulation
      .nodes(nodes)
      .alpha(1)

    simulation.force('link')
      .links(links)

    for (var i = 0; i < 300; i++) simulation.tick()

    render()

    function render () {
      var offsets = {}

      nodes.forEach(function (node) {
        if (node.fx) return
        var feature = features[node.fIndex]
        var layerId = feature.layer.id
        var featureId = feature.properties.id
        var dx = node.x - feature.point.x
        var dy = node.y - feature.point.y
        offsets[featureId] = [dx, dy]

        if (Math.abs(dx) < epsilon && Math.abs(dy) < epsilon) return
        if (!offsets[layerId]) {
          offsets[layerId] = {
            type: 'categorical',
            property: 'id',
            stops: []
          }
        }
        offsets[layerId].stops.push([featureId, [dx, dy]])
      })

      pointLayers.forEach(function (layerId) {
        var offset = offsets[layerId]
        if (!offset) {
          map.setLayoutProperty(layerId, 'icon-offset', [0, 0])
          return
        }
        // icon-offset is a strange unit, pixels * icon-size
        map.setLayoutProperty(layerId, 'icon-offset', getIconOffset(map, layerId, offset))
        var textField = map.getLayoutProperty(layerId, 'text-field')
        // Also offset the text label
        if (textField) {
          // Text offset is in em units, not pixels, so we need to convert
          map.setLayoutProperty(layerId, 'text-offset', getTextOffset(map, layerId, offset))
        }
      })
    }
  }
}

// Return all features in the current map view that need layout
function getFeatures (map, pointLayers) {
  var features = map.queryRenderedFeatures({layers: pointLayers})
  // qRF can return duplicate features if points are near tile boundaries
  return uniqWith(features, cmpFeatures)

  function cmpFeatures (f1, f2) {
    return f1.properties.id === f2.properties.id
  }
}

// For a given feature, get a radius to be used for collision avoidance
// We use a circle with diameter of the max dimension of the rendered
// icon bounding rectangle as an approximation.
// NB: Square icons will overlap at the corners
function getRadius (map, layerId) {
  var layer = map.getLayer(layerId)
  var iconName = layer.getLayoutValue('icon-image', {zoom: map.getZoom()})
  var iconPos = map.style.sprite.getSpritePosition(iconName)
  var iconSize = layer.getLayoutValue('icon-size', {zoom: map.getZoom()})
  if (!iconPos || !iconSize) return 0
  var r = Math.max(iconPos.width, iconPos.height) * iconSize / 2 / (iconPos.pixelRatio || 1)
  return r
}

// Convert an offset in pixels to an offset in em units
function getTextOffset (map, layerId, offset) {
  var size = map.getLayer(layerId).getLayoutValue('text-size', {zoom: map.getZoom()})
  var textOffset = assign({}, offset, {
    stops: offset.stops.map(function (s) {
      return [s[0], [s[1][0] / size, s[1][1] / size]]
    })
  })
  return textOffset
}

// Convert an offset in pixels to an offset in em units
function getIconOffset (map, layerId, offset) {
  var size = map.getLayer(layerId).getLayoutValue('icon-size', {zoom: map.getZoom()})
  var iconOffset = assign({}, offset, {
    stops: offset.stops.map(function (s) {
      return [s[0], [s[1][0] / size, s[1][1] / size]]
    })
  })
  return iconOffset
}

// Force function to avoid collisions between icons
// but ignore their anchors
function forceCollide (radius) {
  var force = d3.forceCollide(radius)
  var initializeOrig = force.initialize
  force.initialize = function (_) {
    var iconNodes = _.filter(function (d) { return !d.fx })
    initializeOrig(iconNodes)
  }
  return force
}
