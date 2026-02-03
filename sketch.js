let players = [];
let board;
let deck;
let playerCount = 4;
let playerStartingCash = 10000;
let entryBet = 10;

function setup() {
  createCanvas(windowWidth, windowHeight);
  for(let i = 0; i < playerCount; i++){
    new player();
  }
}

function draw() {
  background(50);
}

function setupGame(){
  deck = new Deck();
  board = new Board();
  players = [];
}

class ranks{
  static TWO=2;
  static THREE=3;
  static FOUR=4;
  static FIVE=5;
  static SIX=6;
  static SEVEN=7;
  static EIGHT=8;
  static NINE=9;
  static TEN=10;
  static JACK=11;
  static QUEEN=12;
  static KING=13;
  static ACE=14;
}

class suits{
  static HEARTS="Hearts";
  static DIAMONDS="Diamonds";
  static CLUBS="Clubs";
  static SPADES="Spades";
}

class action{
  constructor(type, value){
    this.type = type;
    this.value = value;
  }
}

class Game{
  constructor(){
    this.players = players
    this.round = new Round(this.players);
  }
  
  newRound(){
    this.round = new Round(this.players);
    this.round.startRound();
  }
  
  run(){
    this.round.runTurn();
    if(this.round.curTurn >= 3){
      this.newRound();
    }
  }
}

class Round{
  constructor(startPlayers){
    this.curPlayer = 0;
    this.totalBet = 0;
    this.hasRaised = false;
    this.curTurn = 1;
    this.startPlayers = startPlayers
    this.curPlayers = startPlayers;
    this.turnPlayers = this.curPlayers;
    this.havePlayed = [];
    this.raisedBet = 0;
  }

  startRound(){
    for(p of players){
      p.curBet = entryBet;
      this.totalBet += entryBet;
    }
  }

  runTurn(){
    // end turn when all players have played
    if(this.curPlayer >= this.turnPlayers.length) this.endTurn();

    // get the action performed by the player
    action = this.turnPlayers[this.curPlayer].askAction();

    // return if no action was performed
    if(action == false) return;
    else{
      this.havePlayed.push(players[this.curPlayer]); // the current player has now played
      // do nothing
      if(action.type == "pass"){
        // equivalent to folding
        if(this.hasRaised) {
          this.curPlayers.splice(this.curPlayers.indexOf(this.turnPlayers[this.curPlayer]), 1);
          this.havePlayed.splice(this.havePlayed.indexOf(this.turnPlayers[this.curPlayer]), 1);
          this.turnPlayers.splice(this.turnPlayers.indexOf(this.turnPlayers[this.curPlayer]), 1);
        }
        else this.curPlayer ++;
        return;
      }
      // raise the bet
      else if(action.type == "raise"){
        // raise current bet
        this.turnPlayers[this.curPlayer].curBet += action.value;
        this.totalBet += action.value;
        this.raisedBet = action.value;

        // re-add all who have played because they must raise or match to stay in
        for(p of this.havePlayed){
          this.turnPlayers.push(p);
        }
        // reset who has played because everyone needs to play again
        this.havePlayed = [this.turnPlayers[this.curPlayer]];
        this.curPlayer ++;
        this.hasRaised = true;
      }
      // match the raised bet
      else if(action.type == "match"){
        this.turnPlayers[this.curPlayer].curBet += this.raisedBet;
        this.totalBet += this.raisedBet;
        this.curPlayer ++;
      }
      // remove the player from all relevant arrays
      else if(action.type == "fold"){
        if(this.hasRaised) {
          this.curPlayers.splice(this.curPlayers.indexOf(this.turnPlayers[this.curPlayer]), 1);
          this.havePlayed.splice(this.havePlayed.indexOf(this.turnPlayers[this.curPlayer]), 1);
          this.turnPlayers.splice(this.turnPlayers.indexOf(this.turnPlayers[this.curPlayer]), 1);
        }  
      }
    }
  }

  endTurn(){
    this.curTurn ++;
    this.curPlayer = 0;
    this.hasRaised = false;
    this.turnPlayers = this.curPlayers;
    this.havePlayed = [];
    this.raisedBet = 0;
    if(this.curTurn == 3){
      this.endRound();
    }
  }

  endRound(){
    bestHand = 0;
    winner = undefined;
    for(p of this.startPlayers){
      p.curCash -= p.curBet;
      let hand = new totalHand(
        p.hand.cards[0], p.hand.cards[1], 
        board.flop[0], board.flop[1], board.flop[2],
        board.turn, board.river);

      if(handValueHelper.getHandValue(hand) > bestHand) winner = p;
    }

    winner.curCash += this.totalBet
    this.hasRaised = false;
    this.totalBet = 0;
    this.curPlayer = 0;
  }
}

class Board{
  constructor(){
    this.flop = []
    for(let i = 0; i < 3; i++){
      this.flop.push(deck.drawCard());
    } 
    this.turn = deck.drawCard();
    this.river = deck.drawCard();
  }
}

class player{
  constructor(){
    this.playerID = players.length;
    players.push(this);
    this.hand = new playerHand();
    this.getHand();
    this.curCash = playerStartingCash;
    this.selectedAction = false;
    this.curBet = 0;
  }
  getHand(){
    this.hand = new playerHand();
    this.hand.fillRandom();
  }
  getScore(){
    return handValueHelper.getHandValue(
      new totalHand()
    )
  }
  selectAction(value){
    this.selectAction = value;
  }
  askAction(){
    valueToReturn = false;
    if(this.selectAction != false) {
      valueToReturn = this.selectAction;
      this.selectAction = false
    }
    return false;
  }
}

class baseHandValues{
  static HIGH_CARD=1;
  static PAIR=10;
  static TWO_PAIR=100;
  static THREE_OF_A_KIND=1000;
  static STRAIGHT=10000;
  static FLUSH=100000;
  static FULL_HOUSE=1000000;
  static FOUR_OF_A_KIND=10000000;
  static STRAIGHT_FLUSH=100000000;
  static ROYAL_FLUSH=1000000000;
}

class Deck{
  constructor(){
    this.cards = [];
    this.cardsOut = [];
    this.createDeck()
  }
  createDeck(){
    for(let i = 0; i < 4; i++){
      let suit;
      switch(i){
        case 0:
          suit = new suits().HEARTS;
          break;
        case 1:
          suit = new suits().DIAMONDS;
          break;
        case 2:
          suit = new suits().CLUBS;
          break;
        case 3:
          suit = new suits().SPADES;
          break;
      }
      for(let j = 2; j <= 14; j++){
        this.cards.push(new card(suit, j));
      }
    }
  }
  resetDeck(){
    this.cards = [];
    this.cardsOut = [];
    this.createDeck();
  }
  drawCard(){
    cardDrawn = random(this.cards);
    this.cardsOut.push(cardDrawn);
    this.cards.splice(this.cards.indexOf(cardDrawn), 1);
    return cardDrawn;
  }
}

class handValueHelper{
  static getNumberOfRanks(hand, rank){
    count = 0;
    for(let card of hand.cards){
      if(card.rank == rank){
        count++;
      }
    }
    return count;
  }
  static getHighCard(hand){
    highValue = 0;
    for(let card of hand.cards){
      if(card.rank > highValue){
        highValue = card.rank;
      }
    }
    return highValue;
  }
  static getPair(hand){
    for(let rank = 14; rank >= 2; rank--){
      if(this.getNumberOfRanks(hand, rank) == 2){
        return rank;
      }
    }
    return 0;
  }
  static getTwoPair(hand){ 
    pairs = [];
    for(let rank = 14; rank >= 2; rank--){
      if(this.getNumberOfRanks(hand, rank) == 2){
        pairs.push(rank);
        if(pairs.length == 2){
          return pairs;
        }
      }
    }
  }
  static getThreeOfAKind(hand){
    for(let rank = 14; rank >= 2; rank--){
      if(this.getNumberOfRanks(hand, rank) == 3){
        return rank;
      }
    }
    return 0;
  }
  static getFourOfAKind(hand){
    for(let rank = 14; rank >= 2; rank--){
      if(this.getNumberOfRanks(hand, rank) == 4){
        return rank;
      }
    }
  }
  static getFullHouse(hand){
    threeOfAKind = this.getThreeOfAKind(hand);
    if(threeOfAKind != 0){
      for(let rank = 14; rank >= 2; rank--){
        if(rank != threeOfAKind && this.getNumberOfRanks(hand, rank) == 2){
          return [threeOfAKind, rank];
        }
      }
    }
    return [];
  }
  static getStraightFlush(hand){
    score = 0;
    firstSuit = hand.cards[0].suit;
    for(let i = 0; i < sortedRanks.length - 1; i++){
      if(hand.cards[i].suit != firstSuit || sortedRanks[i] + 1 != sortedRanks[i + 1]){
        return 0;
      }
    }
    return score;
  }
  static getRoyalFlush(hand){
    score = 0;
    firstSuit = hand.cards[0].suit;
    for(card in hand.cards){
      if(card.rank < 10 || card.suit != firstSuit) return 0;
      score += card.rank;
    }
    return score;
    
  }
  static getFlush(hand){
    score = 0;
    // wont work cause it checks first value even though there could be a flush after index 0
    firstSuit = hand.cards[0].suit;
    for(let card of hand.cards){
      if(card.suit != firstSuit){
        return false;
      }
      score += card.rank;
    }
    return true;
  }
  static getStraight(hand){
    score = 0;
    sortedRanks = hand.ranks.slice().sort((a, b) => a - b);
    for(let i = 0; i < sortedRanks.length - 1; i++){
      if(sortedRanks[i] + 1 != sortedRanks[i + 1]){
        return 0;
      }
      score += card.rank;
      if(i > 5) return score
    }
  }
  static getHandValue(hand){
    highCard = HIGH_CARD*handValueHelper.getHighCard(hand);
    pair = PAIR*handValueHelper.getPair(hand);
    twoPair = TWO_PAIR*handValueHelper.getTwoPair(hand);
    threeOfAKind = THREE_OF_A_KIND*handValueHelper.getThreeOfAKind(hand);
    fourOfAKind = FOUR_OF_A_KIND*handValueHelper.getFourOfAKind(hand);
    fullHouse = FULL_HOUSE*handValueHelper.getFullHouse(hand);
    straight = STRAIGHT*handValueHelper.getStraight(hand);
    straightFlush = STRAIGHT_FLUSH*handValueHelper.getStraightFlush(hand);
    scores = [highCard, pair, twoPair, threeOfAKind, fourOfAKind, fullHouse, straight, straightFlush];
    scores = scores.sort((a,b) => a-b);
    return scores[0];
  }
}

class playerHand{
  constructor(cards){
    this.cards = cards;
    this.ranks = [];
    this.suits = [];
    for(let card of cards){
      this.ranks.push(card.rank);
      this.suits.push(card.suit);
    }
  }

  fillRandom(){
    for(let i = 0; i < 2; i++){
      card = deck.drawCard();
      this.cards.push(card);
      this.ranks.push(card.rank);
      this.suits.push(card.suit);
    }
  }
}

class totalHand{
  constructor(cards){
    this.cards = cards;
    this.ranks = [];
    this.suits = [];
    for(let card of cards){
      this.ranks.push(card.rank);
      this.suits.push(card.suit);
    }
  }

  addCard(card){
    this.cards.push(card);
  }
}

class card{
  constructor(suit, rank){
    this.suit = suit;
    this.rank = rank;
  }
}