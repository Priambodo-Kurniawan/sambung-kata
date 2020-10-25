const axios = require("axios")

class Kbbi {
  static getWord (req, res) {
    let keyword = req.params.key
    axios({
      method: 'get',
      url: `https://kbbi.web.id/${keyword}/ajax_submitlzz9z`
    })
      .then(({data}) => {
        let mainResult = []
        let nextWord = ''
        if (data) {
          mainResult = data.filter(el => el.x <= 2)
          if (mainResult.length) {
            let arrTemp = mainResult[0].d.split('</b>')[0].split('&#183;')
            nextWord = arrTemp[arrTemp.length - 1]
            nextWord = nextWord.replace('<sup>1</sup>', '').trim().replace(/<\/?[^>]+(>|$)/g, "")
          }

        }
        res.status(200).json({
          key: keyword,
          mainResult,
          nextWord
        })
      })
      .catch(err => res.status(500).json({err}))
  }
}

module.exports = Kbbi