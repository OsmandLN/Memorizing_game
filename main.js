const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardMatched: "CardMatched",
  GameFinished: "GameFinished",
}



const Symbols = [
  'https://cdn-icons-png.flaticon.com/512/1055/1055885.png', //黑桃
  'https://cdn-icons-png.flaticon.com/512/1055/1055883.png', //梅花
  'https://cdn-icons-png.flaticon.com/512/1055/1055882.png', //紅心
  'https://cdn-icons-png.flaticon.com/512/1055/1055884.png'  //菱形
]

const utility = {

  getRandomNumberArray(count) {

    const number = Array.from(Array(count).keys())

    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const view = {

  getCardContent(index) {

    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]

    return `
      <p>${number}</p>
      <img src="${symbol}" alt="">
      <p>${number}</p>`
  },

  getCardElement(index) {

    return `
    <div class="card back" data-index=${index}></div>`
  },

  flipCards(...cards) {

    cards.map(card => {

      // 如果是背面狀態則翻回正面
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }

      // 如果是正面狀態則翻回背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  transformNumber(number) {

    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'

      //不須轉換的正常例，直接回傳數字
      default:
        return number
    }
  },

  displayCards(indexes) {

    const rootElement = document.querySelector("#cards")

    rootElement.innerHTML = indexes.map(index =>
      this.getCardElement(index)).join("")
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add("paired")
    })
  },

  renderScore(score) {
    document.querySelector(".score").innerHTML = `Score: ${score}`
  },

  renderTimesTried(times) {
    document.querySelector(".timesTried").innerHTML = `You've tried: ${times} times.`
  },

  appendWrongAnimation(...card) {
    card.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event =>
        event.target.classList.remove('wrong'), { once: true })
    })
  },

  showGameFinished() {

    const div = document.createElement("div")

    div.classList.add("completed")
    div.innerHTML = `
    <p>Complete!</p>
    <p>Score: ${model.score}</p>
<p>You've tried: ${model.timesTried} times.</p>
    `
    const header = document.querySelector("#header")
    header.before(div)
  }
}

const model = {

  revealedCards: [],

  //提取 revealedCards 陣列中暫存的兩個值，並用 === 比對是否相等，若相等就回傳 true，反之則為 false。
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
  },

  score: 0,
  timesTried: 0
}

const controller = {

  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {

    // 如果已經不是背面狀態的話，點擊就應該不能有反應
    if (!card.classList.contains("back")) {
      return
    }

    switch (this.currentState) {

      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        //第一張牌翻完後，當前狀態變成等待翻第二張牌
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTimesTried(++model.timesTried)
        view.flipCards(card)
        model.revealedCards.push(card)

        // 判斷配對是否成功

        // 配對成功
        if (model.isRevealedCardsMatched() === true) {

          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []

          if (model.score === 260) {
            console.log("showGameFinished")
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits

          // 配對失敗        
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log("this.currentState", this.currentState)
    console.log("revealedCards", model.revealedCards.map(card => card.dataset.index))
  },

  resetCards() {

    view.flipCards(...model.revealedCards)

    //清空裝翻開的牌的容器
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },


}

controller.generateCards()

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", function onCardClick(event) {
    controller.dispatchCardAction(card)
  })
})
