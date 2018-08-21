
//Credit to BC Ko for his Udacity post on the Memory Game project; which helped walk a JS beginner through the formulation of this project.

let Timer;
/* declare global variable timer that will later be called in ScorePanel.increaseTime() that
* starts when user clicks start and the interval function will be stopped when press restart*/

/* represents the ScorePanel which displays the move count, the timer, and the remaining stars that depend on the move count.
* there are 3 subfunctions: reset, increase time, and increase moves.
*/
const ScorePanel = {
     NumMoves : 0,
     TimeCount : 0,
     NumStars : 3,
     reset : () => {  //reset the scorepanel
         ScorePanel.NumMoves = 0;
         ScorePanel.NumStars = 3;
         ScorePanel.TimeCount = 0;
         VController.updateMoves(0);
         VController.updateStars(3);
         VController.updateTime(0);
     },
     increaseTime : () => { // increase the time on the scorepanel
         ScorePanel.TimeCount += 1;
         VController.updateTime(ScorePanel.TimeCount);
     },
     increaseMoves : () => { //increase number of moves made on the scorepanel, and adjust number of stars accordingly.
         ScorePanel.NumMoves += 1;
         VController.updateMoves(ScorePanel.NumMoves);
          if (ScorePanel.NumMoves === 35){
            ScorePanel.NumStars = 2;
            VController.updateStars(2);
          } else if (ScorePanel.NumMoves === 50) {
            ScorePanel.NumStars = 1;
            VController.updateStars(1);
          } else { // 3 stars
          }
     }
}
 Object.seal(ScorePanel) //this is necessary to set the panel without external interference

 const Deck = {
  //   cards : [Symbol.ANCHOR, Symbol.ANCHOR, Symbol.BICYCLE, Symbol.BICYCLE, Symbol.BOLT, Symbol.BOLT, Symbol.BOMB, Symbol.BOMB, Symbol.CUBE, Symbol.CUBE, Symbol.DIAMOND, Symbol.DIAMOND, Symbol.LEAF, Symbol.LEAF, Symbol.PLANE, Symbol.PLANE],
     cards : ['fa fa-anchor','fa fa-anchor','fa fa-bicycle','fa fa-bicycle','fa fa-bolt','fa fa-bolt','fa fa-bomb','fa fa-bomb','fa fa-cube','fa fa-cube','fa fa-diamond','fa fa-diamond','fa fa-leaf','fa fa-leaf','fa fa-paper-plane-o','fa fa-paper-plane-o',],
     opened : [],
     matched : [],
     shuffle : (array) =>{  //shuffle deck
         array = shuffle(array);
         CardController.setCardsSymbols(array);
     },
     reset : () => {      //reset the deck of cards
         Deck.opened.length = 0; //all cards back to closed
         Deck.matched.length = 0; //all cards back to closed
         for (let i = 0; i < Deck.cards.length; i++) { //set all cards to closed
             CardController.closeCard(i);
         }
         Deck.shuffle(Deck.cards);  //shuffle deck
     },
     clickToOpen : ({index, symbol}) => {
         Deck.opened.push({index,symbol}) //push the index and symbol of card to be opened
         CardController.openCard(index); //open the card based on the index
         if (Deck.opened.length === 2) { //if 2 cards are already open
           window.setTimeout(Deck.checkMatch, 200); //open both cards and check if match within 200ms.
           //If too slow, the user may click more than 3 cards during the checking, which causes the game to fail.
         }
     },
     checkMatch : () => { //check if there is a matched pair
         const c0 = Deck.opened[0]; //take first card opened
         const c1 = Deck.opened[1]; //take second card opened

         if (c0.symbol !== c1.symbol ) { //if first and second symbols dont match
             CardController.closeCard(c0.index); //close both cards
             CardController.closeCard(c1.index);
             Deck.opened.length = 0; //set the opened cards array length to zero

         } else {  //else keep both cards open and set to matched pair
             CardController.matchCard(c0.index);
             CardController.matchCard(c1.index);
             Deck.matched.push(c0, c1);
             Deck.opened.length = 0; //set the opened cards array length to zero
         }

         if (Deck.matched.length === Deck.cards.length) { //if all cards matched,  hence win!
             console.log("Congratulations! You win!");
             clearInterval(Timer);
             VController.hideModal(false);
         }

     },
 }
 Object.seal(Deck);//this is necessary to set the deck without external interference


 /* VController handles all activities with regards to the gameboard.
 * Functions include: displaying the updated number of stars, moves, and time. also to hide or show the "win" modal.
  */
 class VController {
     static updateStars(scorepanelStars) {
         const d = document.getElementsByClassName("stars")[0]; // set number of stars
         const starString = '<li><i class="fa fa-star"></i></li>';
         d.innerHTML = starString.repeat(scorepanelStars);
     }
     static updateMoves(scorepanelMoves) {
         const d = document.getElementsByClassName("moves")[0]; //set number of moves
         d.innerHTML = scorepanelMoves;
     }
     static updateTime(scorepanelTime) {
         const d = document.getElementsByClassName("timer")[0]; // set time
         d.innerHTML = scorepanelTime;
     }
     static hideModal(bool) {
         const d = document.getElementsByClassName("modal")[0];
         if (bool === true) {
             d.className = "modal hide";
         } else {
             d.innerHTML = `Congratulations! <br><br> Total Time Taken: ${ScorePanel.TimeCount} seconds <br> Star Rating: ${ScorePanel.NumStars} stars <br> Total Moves: ${ScorePanel.NumMoves} moves <br><br> Click to Restart`;
             d.className = "modal show";
             d.addEventListener("click", EventHandler.clickStart);
         }
     }
}
/*controller that handles all card activities: i.e. opening a card, closing a card, matching a card or setting a new arrangement of cards.
*/
class CardController{
     static openCard(cardIndex) {
         const d = document.getElementsByClassName("card");
         d[cardIndex].setAttribute("class", 'card open show'); //show card as open
     }

     static closeCard(cardIndex) {
         const d = document.getElementsByClassName("card");
         d[cardIndex].setAttribute("class", 'card'); //show card as closed
     }

     static matchCard(cardIndex) {
         const d = document.getElementsByClassName("card");
         d[cardIndex].setAttribute("class", 'card open match'); //show card as matched
     }

     static setCardsSymbols(cards) {
         const d = document.getElementsByClassName("card");
         for (let i = 0; i < cards.length; i++) {
             d[i].firstChild.setAttribute("class", cards[i]); //set the new array of cards in the closed order
         }
     }
 }


// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

//Listens for the event, which then transfers to EventHandler
class EventListener {
    static startRestartListener() {           //listening for click Restart button
        const d = document.getElementsByClassName('restart')[0]; //get the restart button class
        d.addEventListener("click", EventHandler.clickRestart); //add an event listener that calls EventHandler.clickRestart upon clicking
    }
    static startCardListener() {          // listening for click on each Cards
        const d = document.getElementsByClassName("deck")[0]; //get the class Deck which holds all cards
        d.addEventListener("click", (e) =>  {//add eventlistener that awaits event "e"
            const state = e.target.className; //logs the target classname
            if (state === 'card') { //if the card is closed,
                EventHandler.clickCard(e); //then call EventHandler.clickCard()
            }
        });
    }
}

/* has a event handler methods for clicking on the modal, reset button, or clicking on the card
 */
class EventHandler {
    static clickStart(e) {  //upon clicking Modal button, the Event listener will perform the following functions.
      Deck.reset(); // resets the deck of cards
      ScorePanel.reset(); //resets the scorepane
      Timer = setInterval(ScorePanel.increaseTime, 1000); //Necessary step, as modal will close and timer will need restarting.
      VController.hideModal(true); //hide start button on VController
    }
    static clickRestart(e) {  //upon clicking restart button, the Event listener will perform the following functions.
        Deck.reset(); // resets the deck of cards
        ScorePanel.reset(); //resets the scorepanel
        VController.hideModal(true); //hide start button on VController
    }
    static clickCard(e) {
        const index = e.target.id;   //gets the selected card's id
        const symbol = e.target.firstChild.className; //gets the selected card's firstchild classname, which identifies the card
        ScorePanel.increaseMoves(); //increase number of moves
        Deck.clickToOpen({index, symbol}); //calls the function to try opening the index with the card and show the right symbol.
    }
}

function main() {  //runs this as the main game
    console.log("Welcome to the Memory Game!");
    Deck.reset(); // resets the deck of cards
    ScorePanel.reset(); //resets the scorepanel
    Timer = setInterval(ScorePanel.increaseTime, 1000); //starts timer count, 1 second at a time. only performed once per refresh!
    VController.hideModal(true); //hide start button on VController
    EventListener.startRestartListener(); //listen for click restart button on main page
    EventListener.startCardListener(); //listen for cards being clicked

}

main(); //play the game
