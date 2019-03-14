$(document).ready(function () {
  validate();
});

//validate upon page load to handle errors
function validate() {
  $("#entries, #entrant-name").keyup(function () {
    if ($(this).val() == "") {
      $(".enable").prop("disabled", true);
    } else {
      $(".enable").prop("disabled", false);
    }
  });
}

//declare empty raffle array
let raffleArray = [];

//function to randomize array
const randomize = array => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

//function for progress bar animation
const animateProgressBar = () => {
  let currentProgress = 0;
  const interval = setInterval(function () {
    currentProgress += getRandomInt(25, 50);
    $("#dynamic")
      .css("width", currentProgress + "%")
      .attr("aria-valuenow", currentProgress)
      .text(`Randomizing Entries`)
      .addClass("progress-bar-animated");
    if (currentProgress >= 100) {
      clearInterval(interval);
      $("#dynamic")
        .text(`Entries Randomized`)
        .removeClass("progress-bar-animated");
    }
  }, 1000);
};

//function to get random number
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

//function to count, format and push entries into the raffleArray
const handleEntry = (name, entries) => {
  const newName = `${name},`;
  const repeatedName = newName.repeat(entries);
  const fullEntry = repeatedName.slice(0, -1).split(",");
  raffleArray.push(fullEntry);
  $("#entrant-name, #entries").val("");
};

//function for calculating the odds of winning for each entrant and writing it to the page.
const handleOdds = () => {
  //$("#chance").html(`Odds<hr>`);
  const flatArray = raffleArray.reduce((a, b) => a.concat(b), []);
  const randomizedArray = randomize(flatArray);
  const entrantTotal = randomizedArray.reduce((obj, item) => {
    obj[item] = (obj[item] || 0) + 1;
    return obj;
  }, {});
  const totalValues = Object.values(entrantTotal);
  totalValues.forEach(value => {
    const raffleOdds = ((value / flatArray.length) * 100).toFixed(2);
    if (raffleOdds > 50) {
      $("#chance")
        .append(
          `<div class="percentage m-1 ${className(
            "green"
          )}">${raffleOdds}%</div><hr>`
        )
        .addClass(`border-left border-right border-light`);
    } else if (raffleOdds < 10) {
      $("#chance")
        .append(
          `<div class="percentage m-1 ${className(
            "red"
          )}">${raffleOdds}%</div><hr>`
        )
        .addClass(`border-left border-right border-light`);
    } else {
      $("#chance")
        .append(
          `<div class="percentage m-1 ${className(
            "white"
          )}">${raffleOdds}%</div><hr>`
        )
        .addClass(`border-left border-right border-light`);
    }
  });
  return {
    entrantTotal,
    flatArray
  };
};

//function to handle the total count for each entrant and write it to page along with the total entries
const handleCount = (entrantTotal, flatArray) => {
  $("#count").empty();
  //.html(`Entries<hr>`);
  const entryCount = JSON.stringify(entrantTotal);
  const formattedEntryCount = entryCount
    .slice(1, -1)
    .replace(/\"/g, " ")
    .replace(/ :/g, ": ")
    .split(",");
  formattedEntryCount.forEach(count => {
    $("#count")
      .append(`<div class="names m-1 ${className("white")}">${count}</div><hr>`)
      .addClass(`border-left border-right border-light`);
  });

  $("#total-entries").html(
    `<div class="${className("blue")}">Total Entries: ${flatArray.length}</div>`
  );
  $("#pick-winner").prop("disabled", false);
  $(".alert").alert("close");
};

//writes if error is found on submission.
const handleErrors = () => {
  $("#entries, #entrant-name").val("");
  const alertDiv = $("<div>");
  alertDiv
    .addClass("mt-2 alert alert-danger")
    .attr("role", "alert")
    .attr("data-dismiss", "alert")
    .text(`Please input a valid value. Click to dismiss.`);
  $(".form-group").append(alertDiv);
};

//function that bundles the other functions and validates the user's submission before executing.
const doSubmit = () => {
  const name = $("#entrant-name")
    .val()
    .trim();
  const entries = $("#entries")
    .val()
    .trim();
  if (entries > 0 && entries != "" && name != "") {
    $("#chance").empty();
    animateProgressBar();
    handleEntry(name, entries);
    const {
      entrantTotal,
      flatArray
    } = handleOdds();
    handleCount(entrantTotal, flatArray);
  } else {
    handleErrors();
  }
};

//function to pick a winner and create a ticker "animation" on the page before displaying the winner.
const pickWinner = () => {
  const flatArray = raffleArray.reduce((a, b) => a.concat(b), []);
  const random = randomize(flatArray);
  const winner = random[getRandomInt(0, random.length - 1)];
  const interval = window.setInterval(() => {
    const tickerRandom = random[getRandomInt(0, random.length - 1)];
    $("#winner").html(`<div class="${className("red")}">${tickerRandom}</div>`);
    window.setTimeout(() => {
      clearInterval(interval);
    }, 5000);
  }, 100);
  animateProgressBar();
  setTimeout(() => {
    $("#winner").html(
      `<div class="${className("green")}">The winner is ${winner}!</div>`
    );
  }, 5100);
};

//function to reset entries
const resetEntries = () => {
  raffleArray = [];
  flatArray = [];
  $("#total-entries, #count, #chance, #winner").empty();
  $(".progress-bar")
    .css("width", "0%")
    .attr("aria-valuenow", 0)
    .text("");
  $("#pick-winner").prop("disabled", true);
};

//function for quickly writing bootstrap badge color classes
const className = color => {
  let classes = "badge badge-";
  classes +=
    color == "green" ?
    "success" :
    color == "red" ?
    "danger" :
    color == "white" ?
    "light" :
    color == "yellow" ?
    "warning" :
    color == "blue" ?
    "primary" :
    "dark";
  return classes;
};

//click functions
$("#submit").on("click", event => {
  event.preventDefault();
  doSubmit();
});

$("#pick-winner").on("click", event => {
  event.preventDefault();
  //unused error handling. disabling the button instead.
  if (raffleArray.length === 0) {
    $(".modal").modal();
  } else {
    pickWinner();
  }
});

//resets everything. all current entries and clears local storage. button exists on main page.
$("#reset").on("click", event => {
  event.preventDefault();
  $(".reset-modal").modal()
  resetEntries();
  localStorage.clear()
});

//clears local storage and gives message to user. button exists inside save modal
$(".delete").on("click", event => {
  event.preventDefault();
  $(".save-msg").html(`<p><b>Saved data has been deleted.</b></p>`)
  localStorage.clear()
});

//launches save modal. button exists on main page.
$(".save-btn").on("click", event => {
  event.preventDefault();
  $(".save-modal").modal()
  $(".save-msg").empty()
})

//load button launches modal, empties message div, and removes refresh button. button exists on main page.
$(".load-btn").on("click", event => {
  event.preventDefault();
  $("#no-save").empty()
  $(".refresh").remove()
  $(".load-modal").modal()
})

//displays inside modal. save button click launches save modal, initializes flatArray and saves to local storage if the array isn't empty.

$(".save").on("click", event => {
  // $(".save-modal").modal("hide")
  event.preventDefault();
  const flatArray = raffleArray.reduce((a, b) => a.concat(b), []);
  if (flatArray.length > 1) {
    localStorage.setItem("raffle", JSON.stringify(flatArray))
    $(".save-msg").html(`<p><b>Success! Raffle has been saved.</b></p>`)
  } else {
    $(".save-msg").html(`<p><b>No entries found. Add entries first.</b></p>`)
  }
});

//load button inside modal. if raffle array is empty and local storage has saved data it will parse the data, push it it into the raffle array, run the functions for odds and count, and display to the user that saved data has been loaded. If local storage is empty it will display a message to the user that no save data was found. If the raffle array has items in it and local storage has saved data a message will display to the user that they need to refresh the page to load their save and add a button to refresh page. 

$(".load-data").on("click", event => {
  event.preventDefault();
  const savedRaffle = localStorage.getItem("raffle");
  if (raffleArray.length === 0 && savedRaffle !== null) {
    let namesList = JSON.parse(savedRaffle)
    raffleArray.push(namesList)
    const {
      entrantTotal,
      flatArray
    } = handleOdds();
    handleCount(entrantTotal, flatArray);
    $(".load-msg").html(`<p id="no-save"><b>Saved raffle has been loaded.</b></p>`)
  } else if (savedRaffle === null) {
    $(".load-msg").html(`<p id="no-save"><b>No save data found.</b></p>`)
  } else if (raffleArray.length !== 0 && savedRaffle !== null) {
    $(".load-msg").html(`<p id="no-save"><b>Saved data found. Refresh the page before loading the saved raffle.</b></p>`)
    $(".refresh").remove()
    $(".modal-footer").append(`<button class="btn btn-primary refresh">Refresh Page</button>`)
  }
});

//will refresh the page. only displayed if saved data is found but the raffleArray is not empty.
$(document).on("click", ".refresh",
  event => {
    event.preventDefault();
    window.location.reload()
  })