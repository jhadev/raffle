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

const raffleArray = [];
const flatArray = [];

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
    currentProgress += getRandomInt(20, 50);
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
    const newName = `${name},`;
    const repeatedName = newName.repeat(entries);
    const slicedName = repeatedName.slice(0, -1);
    const fullEntry = slicedName.split(",");
    raffleArray.push(fullEntry);
    $("#donator, #entries").val("");
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
      spanDiv.addClass("percentage").text(`${raffleOdds}, `);
      $("#chance").append(spanDiv);
    });
    const final = JSON.stringify(totalEntries);
    $("#odds").text(`Entries: ${final}`);
    $("#donation-total").text(`Total Entries: ${flatArray.length}`);
    $("#pick-winner").prop("disabled", false);
    $(".alert").alert("close");
  } else {
    handleErrors();
  }
};

const pickWinner = () => {
  const flatArray = raffleArray.flat(1);
  const random = randomize(flatArray);
  const winner = random[Math.floor(Math.random() * random.length)];
  $("#winner").text(`THE WINNER IS... ${winner}`);
};

$("#submit").on("click", event => {
  event.preventDefault();
  doSubmit();
});

$("#pick-winner").on("click", event => {
  event.preventDefault();
  pickWinner();
});

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
