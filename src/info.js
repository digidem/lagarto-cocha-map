const yo = require('yo-yo')
const css = require('sheetify')

module.exports = function info (lang) {
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
      }
    }
  `
  var el = yo`<div class=${style}>
    <div class="info-box">
      hello world
      <button onclick=${close}>close</button>
    </div>
  </div>`

  function close () {
    el.style.display = 'none'
  }
  return el
}
