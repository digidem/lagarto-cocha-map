const qs = require('querystring')
const url = require('url')
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
  :host iframe {
    display: block;
  }

  :host h1 {
    font-size: 1.5em;
    line-height: 1.3;
    margin-bottom: 0.1em;
    margin-top: 0;
  }
  :host h2 {
    margin-top: 0;
    font-size: 1.25em;
    color: grey;
  }
  :host p {
    margin-bottom: 0.5em;
  }
`

module.exports = function popup (props, lang, t) {
  var fotoUrl = getFotoURL(props)
  var nameLoc = props['nombre ' + lang]
  var noteSey = props['nota sey']
  var noteLoc = props['nota ' + lang]
  var tipoSey = (t[props.tipo] && t[props.tipo].sey) || props.tipo
  var tipoLoc = (t[props.tipo] && t[props.tipo][lang]) || props.tipo
  var video = props.video && props.video.indexOf('embed') > -1 ? props.video : toEmbed(props.video)
  return yo`<div class='${popupStyle}'>
      ${video ? yo`
        <iframe width="100%" allowfullscreen="allowfullscreen" frameBorder="0" src="${video}"></iframe>
        ` : (fotoUrl && image(fotoUrl))
      }
    <div class='popup-inner'>
      <h1>${props['nombre sey']}</h1>
      ${nameLoc && yo`<h2>${nameLoc}</h2>`}
      ${noteSey && yo`<p>${noteSey}</p>`}
      ${noteLoc && yo`<p>${noteLoc}</p>`}
    </div>
  </div>`
}

function image (url) {
  if (!url) return ''
  return yo`<div class='embed-responsive embed-responsive-16by9'>
    <img class='embed-responsive-item' src=${url} />
  </div>`
}

function toEmbed (videoURL) {
  if (!videoURL) return
  var u = url.parse(videoURL)
  var query = qs.parse(u.query)
  if (query.v) return `https://youtube.com/embed/${query.v}`
  if (u.path.replace('/', '').length === 11) return `https://youtube.com/embed${u.path}`
  return null
}

function getFotoURL (props) {
  var foto = props.foto && props.foto[0]
  return (foto && foto.thumbnails && foto.thumbnails.large && foto.thumbnails.large.url) ||
    (props.tipo === 'lake' && 'lake-images/' + props.id + '.png') || ''
}
