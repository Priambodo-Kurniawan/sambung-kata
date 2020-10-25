const router = require('express').Router()
const Kbbi = require('../controllers/kbbi')
const GameBoard = require('../helpers/gameBoard')
const randomImagesArr = require('../helpers/getBackground')

router.get('/search-word/:key', Kbbi.getWord)
router.get('/start-game', async (req, res) => {
  let gameOke = new GameBoard('mantab', 3, 30)
  gameOke.roomImage = await gameOke.getRoomImage()
  
  // Player join
  gameOke.addPlayer('iam')
  gameOke.addPlayer('arnold')
  gameOke.addPlayer('fauzan')
  
  // Prep init game after question sent to client
  await gameOke.addRandomAnswer('kursi')
  // await gameOke.addRandomAnswer('guling')
  // await gameOke.addRandomAnswer('bakso')
  
  // Start Game
  gameOke.startGame()
  
  // Submit Answer
  await gameOke.checkAnswer('sikat')
  await gameOke.checkAnswer('kata')
  await gameOke.checkAnswer('tambah')
  await gameOke.checkAnswer('bahlul') // wrong answer
  await gameOke.checkAnswer('bahari')
  await gameOke.checkAnswer('rima')
  await gameOke.checkAnswer('makan')
  await gameOke.checkAnswer('kantuk')
  
  // res status object
  res.status(200).json({
    gameboard: gameOke
  })
})

router.get('/random-image', async (req, res) => {
  let randomImages = await randomImagesArr()
  res.status(200).json({
    randomImages
  })
})

module.exports = router