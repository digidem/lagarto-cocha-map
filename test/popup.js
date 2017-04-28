var popup = require('../src/popup')

var props = {
  'nota sey': "Tsoe we'Ã'a paipi karena akëpi we'yoko paa'a'koÃ'a wepi paai kato we'epi kareÃ'a",
  'tipo': 'Camino',
  'nombre sey': "Maa'a wepi kaa maa'a",
  'nombre esp': 'Un Camino',
  'foto': [{
    thumbnails: {
      large: {
        url: 'http://lorempixel.com/400/300/nature/'
      }
    }
  }]
}

var el = popup(props, 'esp')

document.body.appendChild(el)
