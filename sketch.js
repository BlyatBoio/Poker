function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(50);
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

class deck{
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
  static getHighCard(hand){
    highValue = 0;
    for(let card of hand.cards){
      if(card.rank > highValue){
        highValue = card.rank;
      }
    }
    return highValue;
  }
  static getNumberOfRanks(hand, rank){
    count = 0;
    for(let card of hand.cards){
      if(card.rank == rank){
        count++;
      }
    }
    return count;
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
  static getStraight(hand){
    score = 0;
    if(this.isStraight(hand)){
      for(card in hand.cards){
        score += card.rank;
      }
    }
    return score;
  }
  static getFlush(hand){
    score = 0;
    if(this.isFlush(hand)){
      for(card in hand.cards){
        score += card.rank;
      }
    }
    return score;
  }
  static isFlush(hand){
    firstSuit = hand.cards[0].suit;
    for(let card of hand.cards){
      if(card.suit != firstSuit){
        return false;
      }
    }
    return true;
  }
  static isStraight(hand){
    sortedRanks = hand.ranks.slice().sort((a, b) => a - b);
    for(let i = 0; i < sortedRanks.length - 1; i++){
      if(sortedRanks[i] + 1 != sortedRanks[i + 1]){
        return false;
      }
    }
    return true;
  }
}

class hand{
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