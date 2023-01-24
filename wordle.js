const ANSWER_LENGTH = 5;
const ROUNDS = 6;
const letters = document.querySelectorAll(".box-letter");
const loadingDiv = document.querySelector(".info-bar");

// I like to do an init function so I can use "await"
async function init() {
  // the state for the app
  let currentRow = 0;
  let currentGuess = "";
  let isLoading = true;

  // res is a response from the API jeje, es a commun abbreviation
  const res = await fetch('https://words.dev-apis.com/word-of-the-day')

  // nota: aprender desestructuracion
  const restObj = await res.json();
  const word = restObj.word.toUpperCase();
  const wordParts = word.split('');
  let done = false
  // wordParts is a word from the API 
  setLoading(false)
  isLoading = false

  // user adds a letter to the current guess
  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      // add letter to the end
      currentGuess += letter;
    } else {
      // replace the last letter
      currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
    }

    letters[currentRow * ANSWER_LENGTH + currentGuess.length - 1].innerText =
      letter;
    console.log(letter)
  }


  async function commit() {

    if (currentGuess.length != ANSWER_LENGTH) {
      // do nothing
      return
    }

    // validate the word 
    isLoading = true
    setLoading(true)
    const res = await fetch("https://words.dev-apis.com/validate-word", {

      method: 'POST',
      body: JSON.stringify({ word: currentGuess })
    })

    const resObj = await res.json();
    const validWord = resObj.validWord;
    // const {validWord}=resObj;  otra forma de escribir lo de arriba

    isLoading = false
    setLoading(false)

    if (!validWord) {
      markInvalidWord();
      return;
    }

    // do all the marking as green(correct), yellow(close) or gray(wrong)
    const guessParts = currentGuess.split('')
    const map = makeMap(wordParts);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      // mark as correct 
      if (guessParts[i] === wordParts[i]) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add('correct')
        map[guessParts[i]]--;
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      // mark as correct 
      if (guessParts[i] === wordParts[i]) {
        // do nothing
      } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        // mark as close 
        letters[currentRow * ANSWER_LENGTH + i].classList.add('close')
        map[guessParts[i]]--
      } else {
        letters[currentRow * ANSWER_LENGTH + i].classList.add('wrong')
      }
    }

    // did they win or lose 
    currentRow++
    // win 
    if (currentGuess === word) {
      alert('you win :D')
      document.querySelector('.tittle').classList.add('winner');
      done = true
      return;
    }
    // lose  
    else if (currentRow === ROUNDS) {
      alert(`you lose, the word was ${word}`)
      done = true
    }
    currentGuess = ''
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);

    letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerText = '';

  }

  function markInvalidWord() {
    // alert('not a valid word')
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[currentRow * ANSWER_LENGTH + i].classList.remove('invalid')
      setTimeout(() => {
        letters[currentRow * ANSWER_LENGTH + i].classList.add('invalid')
      }, 10);
    }
  }

  // listening for event keys and routing to the right function
  // we listen on keydown so we can catch Enter and Backspace
  document.addEventListener("keydown", function handleKeyPress(event) {

    if (done || isLoading) {
      // do nothing
      return;
    }


    const action = event.key;

    if (action === "Enter") {
      commit();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    } else {
      // do nothing
    }
  });
}

// a little function to check to see if a character is alphabet letter
// this uses regex (the /[a-zA-Z]/ part) but don't worry about it
// you can learn that later and don't need it too frequently
function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle('show', isLoading)
}

function makeMap(array) {
  const obj = {}
  for (let i = 0; i < array.length; i++) {
    const letter = array[i]
    if (obj[letter]) {
      obj[letter]++
    } else {
      obj[letter] = 1
    }
  }
  return obj;
}


init();