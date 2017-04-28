var languageSelector = require('../src/language')

function onClick (lang) {
  console.log('lang', lang)
}

var el = languageSelector(onClick, 'eng')

document.body.appendChild(el)
