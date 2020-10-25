const axios = require('axios')

async function getBackground () {
  let url = 'https://www.pinterest.ca/resource/BoardFeedResource/get/?source_url=/ayuwahyuningsih/wallpaper-for-your-phone/&data={"options":{"isPrefetch":false,"board_id":"341992234142603977","board_url":"/ayuwahyuningsih/wallpaper-for-your-phone/","field_set_key":"react_grid_pin","filter_section_pins":true,"sort":"default","layout":"default","page_size":50,"redux_normalize_feed":true,"no_fetch_context_on_resource":false},"context":{}}&_=1603411609608'
  try {
    let images = await axios({
      url,
      method: 'get'
    })
    let arrData = images.data.resource_response.data
    let randomIndex = Math.floor(Math.random() * arrData.length)
    return arrData[randomIndex].images['474x'].url
  } catch (err) {
    return err
  }
}

module.exports = getBackground