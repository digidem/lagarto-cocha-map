const yo = require('yo-yo')
const css = require('sheetify')

var popupStyle = css`
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
