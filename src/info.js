const yo = require('yo-yo')
const css = require('sheetify')

module.exports = Infobox

function Infobox (lang) {
  if (!(this instanceof Infobox)) return new Infobox(lang)
  this.el = yo`<div style="display: none;"></div>`
  this.updateLang(lang || 'es')
}

Infobox.prototype._getElement = function () {
  var self = this
  var content = {
    es: yo`<div>
      <p>Este mapa muestra el territorio ancestral de los Siekopai en la zona de Pë’këya, Lagarto Cocha, entre Ecuador y Perú. Los Siekopai fueron desplazados de su territorio en los años cuarentas durante el conflicto entre Perú y Ecuador. Los Siekopai han recibido título legal de tierras en ambos países, pero muy lejos de este importante territorio ancestral que ahora se encuentra dentro de parques nacionales a ambos lados de la frontera. La zona de Lagarto Cocha es importante para los Siekopai tanto por razones histórico-culturales, espirituales y por el acceso a  recursos que usan en sus vidas diarias y ceremoniales.</p>

<p>Este mapa fue realizado por los Siekopai para demostrar la importancia de su territorio y para reconectar a los jóvenes con sus ancestros.</p>

<p>Toda la información en este mapa es propiedad cultural e intelectual de los Siekopai y deben ser consultados antes de cualquier reproducción o publicación.</p>


      </div>
    `,
    en: yo`<div>
    <p>
    This map shows the ancestral territory of the Siekopai of Lagarto Cocha, in border region of Ecuador and Peru. The Siekopai were forcefully displaced from this territory in the 1940s during the conflict between Peru and Ecuador. Although they have received land titles in areas of both countries, they are far removed from this important area that is now inside national parks on both sides of the border. The Lagarto Cocha area is critically important for the Siekopai both for historical and spiritual reasons as well as for the collection of resources they use in their daily life.

    </p>
    <p>
    The map was made by the Siekopai to demonstrate the importance of this territory both past and present, and to reconnect the young and old in an effort to recover it.
    </p>

    <p>
    All the information on the map is the cultural and intellectual property of the Siekopai and should be consulted before any reproduction or publication of it.
    </p>
    `
  }
  var style = css`
    :host {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: space-around;
      width: 100%;
      height: 100%;
      z-index: 1;
      overflow: auto;
      .info-box {
        padding: 30px;
        background: white;
        width: 50%;
        max-width: 700px;
        flex-direction: column;
        display: flex;
        justify-content: center;
      }
    }
  `

  var el = yo`<div style="display: none;">
    <div class="map-overlay ${style}">
      <div class="info-box">
        ${content[self.lang] || content['es']}
        <button class="btn" onclick=${hide}>${self.lang === 'es' ? 'EXPLORAR' : 'EXPLORE'}</button>
      </div>
    </div>
  </div>`

  function hide () {
    self.el.style.display = 'none'
  }

  return el
}

Infobox.prototype.updateLang = function (lang) {
  this.lang = lang
  yo.update(this.el, this._getElement())
}
