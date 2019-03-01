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

//function to push entries into the raffleArray
const handleEntry = (name, entries) => {
  const newName = `${name},`;
  const repeatedName = newName.repeat(entries);
  const slicedName = repeatedName.slice(0, -1);
  const fullEntry = slicedName.split(",");
  raffleArray.push(fullEntry);
  $("#entrant-name, #entries").val("");
};

//function for calculating the odds of winning for each entrant.
const handleOdds = () => {
  const flatArray = raffleArray.reduce((a, b) => a.concat(b), []);
  const randomizedArray = randomize(flatArray);
  const entrantTotal = randomizedArray.reduce((obj, item) => {
    obj[item] = (obj[item] || 0) + 1;
    return obj;
  }, {});
  const totalValues = Object.values(entrantTotal);
  totalValues.forEach(value => {
    const raffleOdds = ((value / flatArray.length) * 100).toFixed(2) + "%";
    $("#chance").append(
      `<div class="percentage m-1 badge badge-light">${raffleOdds}</div><hr>`
    );
  });
  return {
    entrantTotal,
    flatArray
  };
};

//function for quickly writing bootstrap badge color classes,
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

//function to write the total entries, entries for each entrant, and odds to the page.
const writeToPage = (entrantTotal, flatArray) => {
  $("#odds").empty();
  const entryCount = JSON.stringify(entrantTotal);
  const slicedEntryCount = entryCount.slice(1, -1);
  const replacedEntryCount = slicedEntryCount.replace(/\"/g, " ");
  const formattedEntryCount = replacedEntryCount.replace(/ :/g, ": ");
  const splitEntryCount = formattedEntryCount.split(",");
  splitEntryCount.forEach(count => {
    $("#odds").append(
      `<div class="names m-1 ${className("white")}">${count}</div><hr>`
    );
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
    writeToPage(entrantTotal, flatArray);
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
  $("#total-entries, #odds, #chance, #winner").empty();
  $(".progress-bar")
    .css("width", "0%")
    .attr("aria-valuenow", 0)
    .text("");
  $("#pick-winner").prop("disabled", true);
};

//click functions
$("#submit").on("click", event => {
  event.preventDefault();
  doSubmit();
});

$("#pick-winner").on("click", event => {
  event.preventDefault();
  if (raffleArray.length == 0) {
    $(".modal").modal();
  } else {
    pickWinner();
  }
});

$("#reset").on("click", event => {
  event.preventDefault();
  resetEntries();
});