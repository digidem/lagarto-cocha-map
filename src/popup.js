const yo = require('yo-yo')
const css = require('sheetify')

css('bootstrap/dist/css/bootstrap.min.css')

var popupStyle = css`
  body {
    background-color: #ccc;
  }
  :host {
    width: 300px;
    background-color: white;
  }
  :host img {
    object-fit: cover;
  }
  :host > .popup-inner {
    padding: 10px;
  }
  :host h1 {
    font-size: 1.55rem;
  }
  :host h2 {
    font-size: 1.25rem;
    color: grey;
  }
`

module.exports = function popup (props, lang) {
  console.log(props)
  var fotoUrl = props.foto && props.foto[0] && props.foto[0].thumbnails.large.url
  var nameLoc = props['nombre ' + lang]
  var noteSey = props['nombre ' + lang]
  var noteLoc = props['nota ' + lang]
  return yo`<div class='${popupStyle}'>
    ${fotoUrl && image(fotoUrl)}
    <div class='popup-inner'>
      <h1>${props['nombre sey']}</h1>
      ${nameLoc && yo`<h2>${nameLoc}</h2>`}
      ${noteSey && yo`<p><b>${props.tipo}:</b> ${noteSey}</p>`}
      ${noteLoc && yo`<p><b>${props.tipo}:</b> ${noteLoc}</p>`}
    </div>
  </div>`
}

function image (url) {
  return yo`<div class='embed-responsive embed-responsive-16by9'>
    <img class='embed-responsive-item' src=${url} />
  </div>`
}
