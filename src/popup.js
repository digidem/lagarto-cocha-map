const yo = require('yo-yo')
const css = require('sheetify')

css('bootstrap/dist/css/bootstrap.min.css')

var popupStyle = css`
  html .mapboxgl-popup-content {
    padding: 0;
  }

  html .mapboxgl-popup-close-button {
    color: white;
    z-index: 99;
    right: -8.5px;
    top: -13.5px;
    width: 20px;
    height: 20px;
    margin-left: 0px;
    font-size: 18px;
  }
  html .mapboxgl-popup-close-button:hover {
    background-color: transparent;
    color: #eee;
    border-color: #eee;
  }
  html .mapboxgl-popup-close-button:hover:before {
    background-color: rgba(0,0,0,0.9);
  }
  html .mapboxgl-popup-close-button:before {
    content: '';
    position: absolute;
    background-color: rgba(0,0,0,0.8);
    border-radius: 10px;
    border: 2px solid white;
    width: 100%;
    height: 100%;
    left: 1.5px;
    top: 3px;
    z-index: -1;
  }
  :host {
    width: 300px;
    background-color: white;
  }
  :host .embed-responsive-16by9:before {
    padding-top: 66.67%;
  }
  :host img {
    object-fit: cover;
  }
  :host > .popup-inner {
    padding: 10px;
  }
  :host h1 {
    font-size: 1.5em;
    line-height: 1.3;
    margin-bottom: 0.2em;
  }
  :host h2 {
    font-size: 1.25em;
    color: grey;
  }
  :host p {
    margin-bottom: 0.5em;
  }
`

module.exports = function popup (props, lang, t) {
  var fotoUrl = (props.foto && props.foto[0] && props.foto[0].thumbnails.large.url) ||
  (props.tipo === 'lake' && 'lake-images/' + props.id + '.png') ||
  'http://lorempixel.com/400/300/nature/'
  var nameLoc = props['nombre ' + lang] || 'Name in ' + lang
  var noteSey = props['nombre ' + lang] || 'Description in Siekopai'
  var noteLoc = props['nota ' + lang] || 'Description in ' + lang
  var tipoSey = (t[props.tipo] && t[props.tipo].sey) || props.tipo
  var tipoLoc = (t[props.tipo] && t[props.tipo][lang]) || props.tipo
  return yo`<div class='${popupStyle}'>
    ${fotoUrl && image(fotoUrl)}
    <div class='popup-inner'>
      <h1>${props['nombre sey']}</h1>
      ${nameLoc && yo`<h2>${nameLoc}</h2>`}
      <p><b>${tipoSey}</b>${noteSey && ': ' + noteSey}</p>
      <p><b>${tipoLoc}</b>${noteLoc && ': ' + noteLoc}</p>
    </div>
  </div>`
}

function image (url) {
  return yo`<div class='embed-responsive embed-responsive-16by9'>
    <img class='embed-responsive-item' src=${url} />
  </div>`
}
