const axios = require('axios')
const randomImageArr = require('./getBackground')
const randomstring = require("randomstring")

class GameBoard {
  constructor (name, limitPlayer, goalScore) {
    this.name = name
    this.limitPlayer = limitPlayer || 5
    this.goalScore = goalScore || 100
    this.players = []
    this.losePlayers = []
    this.arrPrevWords = []
    this.prevWord = ''
    this.currentQuest = ''
    this.prepRandomQuestions = [
      'Sebutkan 1 kata benda disekitarmu!',
      'Sebutkan 1 kata benda favoritmu!',
      'Sebutkan 1 kata sifat dari temanmu yang kamu benci!'
    ]
    this.prepRandomAnswers = []
    this.currentTurn = 0 // index current player
    this.gameOver = false
    this.winner = -1
    this.roomImage = ''
    this.status = true
    this.host = 'Arnold'
    this.id = randomstring.generate(5)
    this.detailQuest = {}
  }
  
  async getRoomImage () {
    let randomImage = await randomImageArr()
    return randomImage
  }
  
  addPlayer (playerName) {
    this.players.push({
      name: playerName,
      life: 5,
      score: 0
    })
  }
  
  addPrevWord (payload) {
    // payload is an object contain question ('kan') and word ('makan')
    if (this.arrPrevWords.length >= 5) {
      this.arrPrevWords.shift()
    }
    this.prevWord = payload.word
    this.currentQuest = payload.question
    this.arrPrevWords.push(payload)
    this.detailQuest = payload.detailQuest
  }
  
  async addRandomAnswer (answer) {
    let checkWord = await this.getWordFromKbbi(answer)
    if (checkWord.nextWord) {
      this.prepRandomAnswers.push({
        word: answer,
        question: checkWord.nextWord,
        detailQuest: checkWord
      })
      return {
        msg: 'Kata berhasil ditambahkan',
        success: true,
      }
    } else {
      return {
        msg: 'Maaf gunakan kata-kata baku sesuai KBBI',
        success: false
      }
    }
  }
  
  getRandomQuestionPrep () {
    let len = this.prepRandomQuestions.length
    let randomIndex = Math.floor(Math.random() * len)
    return this.prepRandomQuestions[randomIndex]
  }
  
  getRandomAnswerPrep () {
    let len = this.prepRandomAnswers.length
    let randomIndex = Math.floor(Math.random() * len)
    return this.prepRandomAnswers[randomIndex]
  }
  
  startGame () {
    let getRandom = this.getRandomAnswerPrep()
    this.addPrevWord(getRandom)
    this.currentTurn = Math.floor(Math.random() * this.players.length)
  }
  
  async getWordFromKbbi (keyword) {
    let mainResult = []
    let nextWord = ''
    
    try {
      let word = await axios({
        method: 'get',
        url: `https://kbbi.web.id/${keyword}/ajax_submitlzz9z`
      })
      
      if (word.data) {
        mainResult = word.data.filter(el => el.x <= 2)
        if (mainResult.length) {
          let arrTemp = mainResult[0].d.split('</b>')[0].split('&#183;')
          nextWord = arrTemp[arrTemp.length - 1]
          nextWord = nextWord.replace('<sup>1</sup>', '').trim().replace(/<\/?[^>]+(>|$)/g, "")
          if (nextWord.length >= 5) {
            nextWord = nextWord.substr(nextWord.length - 3)
          }
        }
      }
      
      return {
        key: keyword,
        mainResult,
        nextWord
      }
    } catch (err) {
      return {
        key: keyword,
        mainResult: [],
        nextWord: '',
        err
      }
    }
  }
  
  async checkAnswer (answer) {
    let checkWord = await this.getWordFromKbbi(answer)
    if (checkWord.nextWord && answer.startsWith(this.currentQuest)) {
      // add score
      this.players[this.currentTurn].score += 10
      if (this.players[this.currentTurn].score >= this.goalScore) {
        this.gameOver = true
        this.winner = this.currentTurn
      }
      
      // save to prevWord
      this.addPrevWord({
        question: checkWord.nextWord,
        word: answer,
        detailQuest: checkWord
      })
      
    } else {
      // reduce life
      this.players[this.currentTurn].life -= 1
      if (!this.players[this.currentTurn].life) {
        let losePlayer = this.players.splice(this.currentTurn, 1)
        
        this.losePlayers.push(losePlayer[0])
      }
      
      // currentQuest become prev question
      this.arrPrevWords.pop()
      let questionBefore = this.arrPrevWords.pop() || this.getRandomAnswerPrep()
      this.prevWord = questionBefore.word
      this.currentQuest = questionBefore.question
    }
    
    // change turn
    this.currentTurn = (this.currentTurn+=1)%(this.players.length)
    // if (!this.players[this.currentTurn].life) {
    //   this.currentTurn = (this.currentTurn+=1)%(this.players.length+1)
    // }
    return {
      msg: 'next turn'
    }
    
  }
  
}

module.exports = GameBoard