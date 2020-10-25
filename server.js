// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require('express')
const app = express()
const routes = require('./routers')
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const PORT = process.env.PORT || 3000
const GameBoard = require('./helpers/gameBoard')


// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))

// https://expressjs.com/en/starter/basic-routing.html
app.get('/', (req, res) => {
  res.status(200).json({ msg: 'welcome to kkbi rest api!' })
});

app.use(routes)


let rooms = []
io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('crateRoom', async (data) => {
    let gameNew = new GameBoard(data.name, 10, data.score)
    gameNew.roomImage = await gameNew.getRoomImage()
    gameNew.host = data.host
    
    rooms.push(gameNew)
    io.emit('FETCH_ROOM', rooms)
  })
  
  socket.on('getRooms', () => {
    socket.emit('FETCH_ROOM', rooms)
  })
  
  socket.on('deleteRoom', (data) => {
    let index = rooms.findIndex(i => i.name === data.name && i.host === data.host)
    console.log(index)
    rooms.splice(index, 1)
    io.emit('FETCH_ROOM', rooms)
    // myArray.map(function(e) { return e.hello; }).indexOf('stevie');
  })
  
  socket.on('joinRoom', (data) => {
    let room = rooms.find(obj => obj.id === data.roomId)
    try {
      if (!room) throw { msg: 'room not found!', status: false }
      let alreadyJoin = room.players.find(obj => obj.name === data.username)
      let alreadyLose = room.losePlayers.find(obj => obj.name === data.username)
      if (room.players.length >= room.limitPlayer && !alreadyJoin) throw { msg: 'room is full!', status: false }
      if (room.players.gameOver) throw { msg: 'game is over!', status: false }
      if (!alreadyJoin && !alreadyLose) {
        room.addPlayer(data.username)
      }
      socket.join(data.roomId)
      io.emit('FETCH_ROOM', rooms)
      io.to(data.roomId).emit('UPDATE_ROOM', room)
    } catch (err) {
      console.log(err)
      socket.emit('ERROR_JOIN', err)
    }
  })
  
  socket.on('startGame', (roomId) => {
    let room = rooms.find(obj => obj.id === roomId)
    let question = room.getRandomQuestionPrep()
    io.to(roomId).emit('prepQuestion', question)
  })
  
  socket.on('submitPrepAnswer', async (data) => {
    let room = rooms.find(obj => obj.id === data.roomId)
    let resAnswer = await room.addRandomAnswer(data.answer)
    
    if (resAnswer.success) {
      if (room.prepRandomAnswers.length === room.players.length) {
        room.startGame()
        io.to(room.id).emit('START_GAME', room)
      } else {
        socket.emit('waitingToStart', resAnswer)
        io.to(room.id).emit('UPDATE_ROOM', room)
      }
    } else {
      let question = room.getRandomQuestionPrep()
      socket.emit('prepQuestion', question)
    }
  })
  
  socket.on('submitAnswer', async (data) => {
    let room = rooms.find(obj => obj.id === data.roomId)
    await room.checkAnswer(data.answer)
    
    io.to(room.id).emit('UPDATE_ROOM', room)
  })
})

// listen for requests :)
// const listener = app.listen(process.env.PORT, () => {
//   console.log("Your app is listening on port " + listener.address().port);
// });
http.listen(PORT, () => console.log('listen on port ' + PORT))