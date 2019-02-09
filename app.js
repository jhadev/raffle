$(function() {
  $("#entries, #name").keyup(function() {
    if ($(this).val() == "") {
      $(".enable").prop("disabled", true);
    } else {
      $(".enable").prop("disabled", false);
    }
  });
});

const raffleArray = [];
const flatArray = [];

const randomize = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const randomizeTimer = () => {
  let current_progress = 0;
  let interval = setInterval(function() {
    current_progress += getRandomInt(20, 50);
    $("#dynamic")
      .css("width", current_progress + "%")
      .attr("aria-valuenow", current_progress)
      .text(`Randomizing Entries`)
      .addClass("progress-bar-animated");
    if (current_progress >= 100) {
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

$("#submit").on("click", event => {
  event.preventDefault();
  let name = $("#donator")
    .val()
    .trim();
  let entries = $("#entries")
    .val()
    .trim();
  let newName = `${name} `;
  let repeatedName = newName.repeat(entries);
  let trimmedName = repeatedName.trim();
  let fullEntry = trimmedName.split(" ");
  raffleArray.push(fullEntry);
  $("#donator").val("");
  $("#entries").val("");
  const flatArray = raffleArray.flat(1);
  let randomizedArray = randomize(flatArray);
  let totalEntries = randomizedArray.reduce(function(obj, item) {
    obj[item] = (obj[item] || 0) + 1;
    return obj;
  }, {});
  $("#odds").text(`Entries: ${JSON.stringify(totalEntries)}`);
  $("#donation-total").text(`Total Entries: ${flatArray.length}`);
  randomizeTimer();
  $("#pick-winner").prop("disabled", false);
});

$("#pick-winner").on("click", event => {
  event.preventDefault();
  let flatArray = raffleArray.flat(1);
  const random = randomize(flatArray);
  let winner = random[Math.floor(Math.random() * random.length)];
  $("#winner").text(`THE WINNER IS... ${winner}`);
});
