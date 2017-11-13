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
      <p>Este mapa muestra el territorio ancestral de los Siekopai en la zona de Lagarto Cocha, en Ecuador y Perú. Los Siekopai fueron traslados de su territorio en los años 1940 durante el conflicto entre Perú y Ecuador. Han recibido título legal a áreas en ambos países, pero a una distancia larga de esta zona importante que ahora queda dentro de parques nacionales por ambos lados de la frontera. La zona de Lagarto Cocha es importante para los Siekopai tanto por razones históricos y espirituales y por la recolección de recursos que usan en sus vidas diarias y ceremoniales.</p>

      <p>El mapa fue hecha por los Siekopai para demostrar la importancia de su territorio y reconectar los jóvenes y antiguos.</p>

      <p>Toda la información en el mapa es la propiedad cultural e intelectual de los Siekopai y deben ser consultados antes de cualquier reproducción o publicación de ello.</p>
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
        ${content[self.lang]}
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
