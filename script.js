const testWrapper = document.querySelector(".test-wrapper");
const testArea = document.querySelector("#test-area");
const originTextContent = document.querySelector("#origin-text-content");
const resetButtonDisplay = document.querySelector("#reset");
const timeDisplay = document.querySelector(".timer");
const errorDisplay = document.querySelector("#totalErrorDisplay");
const characterTypedDisplay = document.querySelector(
  "#totalCharacterCountDisplay"
);
const wpmDisply = document.querySelector("#wpmDisplay");
const accurateDisplay = document.querySelector("#accuracyDisplay");
const timerDropdown = document.querySelector("#timeSelection");
const textDropdown = document.querySelector("#textSelection");
const warningMessage = document.querySelector("#warning-message");

const originTextArray = [
  "Select your prompt",
  "This is test number one, this is test number one",
  "This is test number two",
  "This is test number three",
  "This is test number four",
  "This is test number five",
  "This is test number six",
  "If you want to be someone in life, please don't mess up in school. School is the place where you become someone; school is the place where anyone can become anyone.",
];

const nullMessage = [
  "",
  "*** Please click the 'Start Over' button and then select a TIME and PARAGRAPH ***",
  "*** Please click the 'Start Over' button and then select a TIME ***",
  "*** Please click the 'Start Over' button and then select a PARAGRAPH ***",
];

let interval;
let totalTime;
let minutes;
let seconds;
let hundreths;
let counter = 0;
let currentPrompt;
let errors;
let charactersTyped;
let userMinutes = 0;
let restart = false;
let promptId = 0;

//GENERATES RANDOM TEXT OR USER TO COPY
function setPrompt(temp) {
  originTextContent.textContent = null;
  promptId = temp.value;
  currentPrompt = originTextArray[promptId];

  // adding 'span' element to all characters in the prompt
  currentPrompt.split("").forEach((char) => {
    const charSpan = document.createElement("span");
    charSpan.innerText = char;
    originTextContent.appendChild(charSpan);
  });
}

// Match the text entered with the provided text on the page:
function matchedText(restart) {
  // when restart button is clicked
  if (restart == true) {
    charactersTyped = 0;
    errors = 0;

    errorDisplay.innerHTML = "Total Number of Errors: " + errors;
    characterTypedDisplay.innerHTML =
      "Total Characters Typed: " + charactersTyped;

    restart = false;
  } else {
    // getting user input in testArea and splitting each characters into an array
    let userTyped = testArea.value;
    let userTypedArray = userTyped.split("");

    charactersTyped = 0;
    errors = 0;

    // for loop to iterate through all the characters in the prompt, comparing it with user input
    let promptSpanArray = originTextContent.querySelectorAll("span");
    promptSpanArray.forEach((char, index) => {
      //user input, char = prompt character
      let typedChar = userTypedArray[index];

      if (typedChar == null) {
        char.classList.remove("correct_char");
        char.classList.remove("incorrect_char");
      } else if (typedChar == char.innerText) {
        char.classList.add("correct_char");
        char.classList.remove("incorrect_char");
        charactersTyped++;
      } else {
        char.classList.add("incorrect_char");
        char.classList.remove("correct_char");
        errors++;
        charactersTyped++;
      }
    });

    errorDisplay.innerHTML = "Total Number of Errors: " + errors;
    characterTypedDisplay.innerHTML =
      "Total Characters Typed: " + charactersTyped;
    //changes border color based on error or not
    if (errors > 0) {
      testWrapper.style.border = "10px solid red";
    } else {
      testWrapper.style.border = "10px solid blue";
    }

    //if user types exactly as prompt, stop timer change border, and calculate wpm
    if (userTyped == currentPrompt) {
      clearInterval(interval);
      wordsPerMinute();
      testWrapper.style.border = "10px solid green";
    }
  }
}

// Calculating WPM
function wordsPerMinute() {
  let wpm = 0;
  let grossWpm = 0;
  let accuracyPercent = 0;
  totalTime = userMinutes;

  // Converts "falsey" value to 0, need for restart function
  accuracyPercent = ((charactersTyped - errors) / charactersTyped) * 100 || 0;

  // Converts seconds and hundreths to minutes
  let secondsMin = seconds / 60;
  // Finds difference between total minutes and time sum;
  let timeDifference = totalTime - (minutes + secondsMin) || 0;
  // Gross WPM = not considering errors. Any "word" is 5 characters
  grossWpm = charactersTyped / 5 / timeDifference || 0;
  let netWpm = errors / timeDifference || 0;
  wpm = Math.round(grossWpm - netWpm);

  wpmDisplay.innerHTML = "WPM: " + wpm + " wpm";
  accurateDisplay.innerHTML = "Accuracy: " + accuracyPercent + "%";
}

// Run a standard minute/second/hundredths timer:
function setTimer(userMin) {
  // check in order to set timer to 0
  if (userMin == 0) userMinutes = 0;
  else userMinutes = userMin.value;

  timeDisplay.innerHTML = "0" + userMinutes + ":00:00";
}

// starts timer, userMin = min * 60 * 100
function startTimer(userMin) {
  // converting min to miliseconds
  let timer = userMin;

  // creates interval in miliseconds
  interval = setInterval(function () {
    // timer is in miliseconds formatting
    hundreths = parseInt(timer % 100, 10);
    // converting timer into seconds
    seconds = parseInt(timer / 100, 10);
    // converting previous seconds value in minutes
    minutes = parseInt(seconds / 60, 10);
    // converting previous seconds value to seconds
    seconds = parseInt(seconds % 60, 10);

    // formating so that "0" gets added if values are less than 10
    let minutesPrint = minutes < 10 ? "0" + minutes : minutes;
    let secondsPrint = seconds < 10 ? "0" + seconds : seconds;
    let hundrethsPrint = hundreths < 10 ? "0" + hundreths : hundreths;

    timeDisplay.innerHTML =
      minutesPrint + ":" + secondsPrint + ":" + hundrethsPrint;

    // prevents timer from going below 0
    if (timer-- < 0) {
      timer = userMin;
    }

    // if timer reaches "0" stop timer
    if (minutes == 0 && seconds == 0 && hundreths == 0) {
      clearInterval(interval);
      wordsPerMinute();
    }
  }, 10);
}

// to restart timer after user already typed
function startDefaultTimer() {
  testArea.addEventListener(
    "input",
    () => {
      if (promptId != 0 && userMinutes != 0) {
        // Converting minutes to milliseconds
        startTimer(userMinutes * 60 * 100);
      }
    },
    { once: true }
  );
}

// Reset everything:
function resetButton() {
  // resets dropdown menu
  promptId = 0;
  userMinutes = 0;

  //stops timer
  clearInterval(interval);
  setTimer(0);

  timerDropdown.selectedIndex = 0;
  textDropdown.selectedIndex = 0;

  matchedText(true);
  wordsPerMinute();

  originTextContent.innerHTML = "Please Select Your Prompt";
  testArea.value = "";
  // allows users to type after textArea is disabled
  testArea.disabled = false;

  startDefaultTimer();

  testWrapper.style.border = "10px solid grey";
  if (warningMessage.firstChild)
    warningMessage.removeChild(warningMessage.firstChild);
}

// Empty Textarea check
function nullCheck(paragraph, time) {
  // if user doesn't select paragarph and time
  if (paragraph == 0 && time == 0) {
    warningMessage.innerHTML = nullMessage[1];
    testArea.disabled = true;
    // if user doesn't select the time
  } else if (time == 0 && paragraph != 0) {
    warningMessage.innerHTML = nullMessage[2];
    testArea.disabled = true;
    // if user doesn't select the paragraph
  } else if (time != 0 && paragraph == 0) {
    warningMessage.innerHTML = nullMessage[3];
    testArea.disabled = true;
  }
}

testArea.addEventListener(
  "input",
  () => {
    if (promptId != 0 && userMinutes != 0) {
      // Converting minutes to milliseconds
      startTimer(userMinutes * 60 * 100);
    }
  },
  { once: true }
);

testArea.addEventListener("input", () => {
  nullCheck(promptId, userMinutes);
  matchedText(false);
});

// when user clicks restart button
resetButtonDisplay.addEventListener("click", () => {
  resetButton();
});
