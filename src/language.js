var yo = require('yo-yo')
const css = require('sheetify')

css('bootstrap/dist/css/bootstrap.min.css')

var style = css`
  :host > .btn:not(.active):not(:hover) {
    background-color: #fff;
  }
  :host > .btn:hover {
    cursor: pointer;
  }
`
module.exports = function (onClick, lang) {
  function handleClick (e) {
    e.stopPropagation()
    var checked = el.querySelector('input[type=radio]:checked')
    var unChecked = el.querySelector('input[type=radio]:not(:checked)')
    checked.parentNode.classList.add('active')
    unChecked.parentNode.classList.remove('active')
    onClick(checked.id)
  }

  var el = yo`
    <div class="btn-group ${style}" data-toggle="buttons">
      <label class="btn btn-outline-primary ${lang === 'esp' ? 'active' : ''}">
        <input type="radio" onclick=${handleClick} ${lang === 'esp' ? 'checked' : ''} name="language" id="esp" autocomplete="off"> Español
      </label>
      <label class="btn btn-outline-primary ${lang === 'eng' ? 'active' : ''}">
        <input type="radio" onclick=${handleClick} ${lang === 'eng' ? 'checked' : ''} name="language" id="eng" autocomplete="off"> English
      </label>
    </div>`

  return el
}
