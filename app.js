$(document).ready(function() {
  validate();
});

function validate() {
  $("#entries, #donator").keyup(function() {
    if ($(this).val() == "") {
      $(".enable").prop("disabled", true);
    } else {
      $(".enable").prop("disabled", false);
    }
  });
}

let raffleArray = [];
let flatArray = [];

const randomize = array => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const randomizeProgress = () => {
  let currentProgress = 0;
  const interval = setInterval(function() {
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

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const handleEntry = (name, entries) => {
  const newName = `${name},`;
  const repeatedName = newName.repeat(entries);
  const slicedName = repeatedName.slice(0, -1);
  const fullEntry = slicedName.split(",");
  raffleArray.push(fullEntry);
  $("#donator, #entries").val("");
};

const handleOdds = () => {
  const flatArray = raffleArray.flat(1);
  const randomizedArray = randomize(flatArray);
  const totalEntries = randomizedArray.reduce(function(obj, item) {
    obj[item] = (obj[item] || 0) + 1;
    return obj;
  }, {});
  let entryValues = Object.values(totalEntries);
  entryValues.forEach(entry => {
    let raffleOdds = ((entry / flatArray.length) * 100).toFixed(2) + "%";
    let spanDiv = $("<span>");
    spanDiv.addClass("percentage m-1 badge badge-light").text(`${raffleOdds}`);
    $("#chance").append(spanDiv);
  });
  return { totalEntries, flatArray };
};

const writeToPage = (totalEntries, flatArray) => {
  let final = JSON.stringify(totalEntries);
  const slicedFinal = final.slice(1, -1);
  const replacedFinal = slicedFinal.replace(/\"/g, " ");
  const trueFinal = replacedFinal.replace(/ :/g, ": ");
  $("#odds").html(
    `<div class="${className("white")}">Entries: ${trueFinal}</div>`
  );

  $("#donation-total").html(
    `<div class="${className("blue")}">Total Entries: ${flatArray.length}</div>`
  );
  $("#pick-winner").prop("disabled", false);
  $(".alert").alert("close");
};

const doSubmit = () => {
  $("#chance").empty();
  const name = $("#donator")
    .val()
    .trim();
  const entries = $("#entries")
    .val()
    .trim();
  if (entries > 0 && entries != "" && name != "") {
    randomizeProgress();
    handleEntry(name, entries);
    const { totalEntries, flatArray } = handleOdds();
    writeToPage(totalEntries, flatArray);
  } else {
    handleErrors();
  }
};

const handleErrors = () => {
  $("#entries, #donator").val("");
  let alertDiv = $("<div>");
  alertDiv
    .addClass("mt-2 alert alert-danger")
    .attr("role", "alert")
    .attr("data-dismiss", "alert")
    .text(`Please input a valid value. Click to dismiss.`);
  $(".form-group").append(alertDiv);
};

const className = color => {
  let classes = "badge badge-";
  classes +=
    color == "green"
      ? "success"
      : color == "red"
      ? "danger"
      : color == "white"
      ? "light"
      : color == "yellow"
      ? "warning"
      : color == "blue"
      ? "primary"
      : "dark";
  return classes;
};

const pickWinner = () => {
  const flatArray = raffleArray.flat(1);
  const random = randomize(flatArray);
  const winner = random[getRandomInt(0, random.length - 1)];
  let interval = window.setInterval(() => {
    const tickerRandom = random[getRandomInt(0, random.length - 1)];
    $("#winner").html(`<div class="${className("red")}">${tickerRandom}</div>`);
    window.setTimeout(() => {
      clearInterval(interval);
    }, 5000);
  }, 100);
  randomizeProgress();
  setTimeout(() => {
    $("#winner").html(
      `<div class="${className("green")}">The winner is ${winner}!</div>`
    );
  }, 5100);
};

$("#submit").on("click", event => {
  event.preventDefault();
  doSubmit();
});

$("#pick-winner").on("click", event => {
  event.preventDefault();
  pickWinner();
});

$("#clear").on("click", event => {
  raffleArray = [];
  flatArray = [];
  $("#donation-total, #odds, #chance, #winner").empty();
  $(".progress-bar")
    .css("width", "0%")
    .attr("aria-valuenow", 0)
    .text("");
});
