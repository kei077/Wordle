import { testDictionary, realDictionary, validWordsForTesting } from './dictionary.js';

const dictionary = validWordsForTesting;

let message = document.getElementById("message");
let timerInterval = null;
let timeRemaining = 4 * 60; 

let timerDisplay = document.getElementById("timer-display");
let startButton = document.getElementById("start-timer");
let stopButton = document.getElementById("stop-timer");
let resetButton = document.getElementById("reset-timer");


function startTimer() {
  if (!timerInterval) {
      // Add visual feedback
      startButton.style.transform = 'scale(0.95)';
      setTimeout(() => startButton.style.transform = '', 150);
      
      timerInterval = setInterval(() => {
          timeRemaining--;
          updateTimerDisplay();

          // Add warning when time is running low
          if (timeRemaining <= 60 && timeRemaining > 0) {
              timerDisplay.style.color = '#dc3545';
              timerDisplay.classList.add('pulse');
          }

          if (timeRemaining <= 0) {
              clearInterval(timerInterval);
              timerInterval = null;
              message.innerHTML = "<h3 class=\"text-danger\"> Time's up! Game Over! </h3>";
              // Disable further input
              document.body.onkeydown = null;
          }
      }, 1000);
  }
}

function stopTimer() {
  if (timerInterval) {
      // Add visual feedback
      stopButton.style.transform = 'scale(0.95)';
      setTimeout(() => stopButton.style.transform = '', 150);
      
      clearInterval(timerInterval);
      timerInterval = null;
  }
}

function resetGame() {
  // Reset game state
  state.secret = dictionary[Math.floor(Math.random() * dictionary.length)];
  state.grid = Array(6).fill().map(() => Array(5).fill(''));
  state.currentRow = 0;
  state.currentCol = 0;
  
  // Clear all boxes and reset their styles
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      const box = document.getElementById(`box${i}${j}`);
      if (box) {
        box.textContent = '';
        box.className = 'box'; // Reset to default class
        box.style.animation = '';
      }
    }
  }
  
  // Reset keyboard colors
  resetKeyboard();
  
  // Clear messages
  message.innerHTML = '';
  
  // Remove timer card pulse effect if it exists
  const timerCard = document.querySelector('.timer-card');
  if (timerCard) {
    timerCard.classList.remove('pulse');
  }
}

function resetTimer() {
  // Add visual feedback
  resetButton.style.transform = 'scale(0.95)';
  setTimeout(() => resetButton.style.transform = '', 150);
  
  stopTimer(); 
  timeRemaining = 4 * 60; 
  updateTimerDisplay();
  
  // Reset timer display color and effects
  timerDisplay.style.color = '';
  timerDisplay.classList.remove('pulse');
  
  // Reset the entire game
  resetGame();
  
  // Re-enable input if it was disabled
  registerKeyboardEvents();
}

function updateTimerDisplay() {
  let minutes = Math.floor(timeRemaining / 60);
  let seconds = timeRemaining % 60;

  timerDisplay.innerText = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
1
startButton.addEventListener("click", startTimer);
stopButton.addEventListener("click", stopTimer);
resetButton.addEventListener("click", resetTimer);


const state = {
  secret: dictionary[Math.floor(Math.random() * dictionary.length)],
  grid: Array(6)
    .fill()
    .map(() => Array(5).fill('')),
  currentRow: 0,
  currentCol: 0,
};

function drawGrid(container) {
  const grid = document.createElement('div');
  grid.className = 'grid';

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      drawBox(grid, i, j);
    }
  }

  container.appendChild(grid);
}

function updateGrid() {
  for (let i = 0; i < state.grid.length; i++) {
    for (let j = 0; j < state.grid[i].length; j++) {
      const box = document.getElementById(`box${i}${j}`);
      box.textContent = state.grid[i][j];
    }
  }
}

function drawBox(container, row, col, letter = '') {
  const box = document.createElement('div');
  box.className = 'box';
  box.textContent = letter;
  box.id = `box${row}${col}`;

  container.appendChild(box);
  return box;
}

function registerKeyboardEvents() {
  document.body.onkeydown = (e) => {
    const key = e.key;
    if (key === 'Enter') {
      if (state.currentCol === 5) {
        const word = getCurrentWord();
        if (isWordValid(word)) {
          revealWord(word);
          state.currentRow++;
          state.currentCol = 0;
        } else {
          // Better visual feedback for invalid words
          message.innerHTML = "<div class=\"text-danger\">❌ Not a valid word! Try again. ❌</div>";
          setTimeout(() => {
            message.innerHTML = '';
          }, 2000);
          
          // Shake animation for current row
          for (let i = 0; i < 5; i++) {
            const box = document.getElementById(`box${state.currentRow}${i}`);
            box.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
              box.style.animation = '';
            }, 500);
          }
        }
      }
    }
    if (key === 'Backspace') {
      removeLetter();
    }
    if (isLetter(key)) {
      addLetter(key);
    }

    updateGrid();
  };
}

function getCurrentWord() {
  return state.grid[state.currentRow].reduce((prev, curr) => prev + curr);
}

function isWordValid(word) {
  return realDictionary.includes(word);
}

function getNumOfOccurrencesInWord(word, letter) {
  let result = 0;
  for (let i = 0; i < word.length; i++) {
    if (word[i] === letter) {
      result++;
    }
  }
  return result;
}

function getPositionOfOccurrence(word, letter, position) {
  let result = 0;
  for (let i = 0; i <= position; i++) {
    if (word[i] === letter) {
      result++;
    }
  }
  return result;
}

function revealWord(guess) {
  const row = state.currentRow;
  const animation_duration = 500; // ms

  for (let i = 0; i < 5; i++) {
    const box = document.getElementById(`box${row}${i}`);
    const letter = box.textContent;
    const numOfOccurrencesSecret = getNumOfOccurrencesInWord(
      state.secret,
      letter
    );
    const numOfOccurrencesGuess = getNumOfOccurrencesInWord(guess, letter);
    const letterPosition = getPositionOfOccurrence(guess, letter, i);

    setTimeout(() => {
      let keyboardStatus = '';
      
      if (
        numOfOccurrencesGuess > numOfOccurrencesSecret &&
        letterPosition > numOfOccurrencesSecret
      ) {
        box.classList.add('empty');
        keyboardStatus = 'not-in-word';
      } else {
        if (letter === state.secret[i]) {
          box.classList.add('right');
          keyboardStatus = 'correct';
        } else if (state.secret.includes(letter)) {
          box.classList.add('wrong');
          keyboardStatus = 'wrong-position';
        } else {
          box.classList.add('empty');
          keyboardStatus = 'not-in-word';
        }
      }
      
      // Update keyboard key color (only if it's not already correct)
      const currentKey = document.querySelector(`[data-key="${letter.toLowerCase()}"]`);
      if (currentKey && !currentKey.classList.contains('correct')) {
        updateKeyboardKey(letter, keyboardStatus);
      }
    }, ((i + 1) * animation_duration) / 2);

    box.classList.add('animated');
    box.style.animationDelay = `${(i * animation_duration) / 2}ms`;
  }

  const isWinner = state.secret === guess;
  const isGameOver = state.currentRow === 5;

  setTimeout(() => {
    if (isWinner) {
      message.innerHTML = "<h3 class=\"text-success\"> Congratulations! You guessed the word correctly! </h3>"
      // Add celebration effect
      document.querySelector('.timer-card').classList.add('pulse');
      setTimeout(() => {
        document.querySelector('.timer-card').classList.remove('pulse');
      }, 3000);
    } else if (isGameOver) {
      message.innerHTML = `<h3 class="text-danger"> Better luck next time! The word was "${state.secret.toUpperCase()}". ⏰</h3>`
    }
  }, 3 * animation_duration);
}

function isLetter(key) {
  return key.length === 1 && key.match(/[a-z]/i);
}

function addLetter(letter) {
  if (state.currentCol === 5) return;
  state.grid[state.currentRow][state.currentCol] = letter;
  state.currentCol++;
}

function removeLetter() {
  if (state.currentCol === 0) return;
  state.grid[state.currentRow][state.currentCol - 1] = '';
  state.currentCol--;
}

function updateKeyboardKey(letter, status) {
  const key = document.querySelector(`[data-key="${letter.toLowerCase()}"]`);
  if (key) {
    // Remove existing status classes
    key.classList.remove('correct', 'wrong-position', 'not-in-word');
    
    // Add new status class
    if (status === 'correct') {
      key.classList.add('correct');
    } else if (status === 'wrong-position') {
      key.classList.add('wrong-position');
    } else if (status === 'not-in-word') {
      key.classList.add('not-in-word');
    }
  }
}

function resetKeyboard() {
  const keys = document.querySelectorAll('.key');
  keys.forEach(key => {
    key.classList.remove('correct', 'wrong-position', 'not-in-word');
  });
}

function registerVirtualKeyboardEvents() {
  const keys = document.querySelectorAll('.key');
  keys.forEach(key => {
    key.addEventListener('click', () => {
      const keyValue = key.getAttribute('data-key');
      
      // Add visual feedback
      key.classList.add('used');
      setTimeout(() => key.classList.remove('used'), 100);
      
      // Handle the key press
      if (keyValue === 'Enter') {
        handleEnterKey();
      } else if (keyValue === 'Backspace') {
        removeLetter();
        updateGrid();
      } else if (isLetter(keyValue)) {
        addLetter(keyValue.toLowerCase());
        updateGrid();
      }
    });
  });
}

function handleEnterKey() {
  if (state.currentCol === 5) {
    const word = getCurrentWord();
    if (isWordValid(word)) {
      revealWord(word);
      state.currentRow++;
      state.currentCol = 0;
    } else {
      // Better visual feedback for invalid words
      message.innerHTML = "<div class=\"text-danger\">❌ Not a valid word! Try again. ❌</div>";
      setTimeout(() => {
        message.innerHTML = '';
      }, 2000);
      
      // Shake animation for current row
      for (let i = 0; i < 5; i++) {
        const box = document.getElementById(`box${state.currentRow}${i}`);
        box.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          box.style.animation = '';
        }, 500);
      }
    }
  }
}

function startup() {
  const game = document.getElementById('game');
  drawGrid(game);

  registerKeyboardEvents();
  registerVirtualKeyboardEvents();
}

startup();
updateTimerDisplay();
