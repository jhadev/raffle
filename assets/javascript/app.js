$(document).ready(function() {
  validate();
  $('#total-entries')
    .text('Add some entries or your load your save to get started.')
    .addClass('text-light');
});

// validate upon page load to handle errors
function validate() {
  $('#entries, #entrant-name').keyup(function() {
    if ($(this).val() == '') {
      $('.enable').prop('disabled', true);
    } else {
      $('.enable').prop('disabled', false);
    }
  });
}

// declare empty raffle array
let raffleArray = [];

// function to randomize array
const randomize = array => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// function for progress bar animation.
const animateProgressBar = () => {
  let currentProgress = 0;
  const interval = setInterval(function() {
    currentProgress += getRandomInt(25, 50);
    $('#dynamic')
      .css('width', currentProgress + '%')
      .attr('aria-valuenow', currentProgress)
      .text(`Randomizing Entries`)
      .addClass('progress-bar-animated');
    if (currentProgress >= 100) {
      clearInterval(interval);
      $('#dynamic')
        .text(`Entries Randomized`)
        .removeClass('progress-bar-animated');
    }
  }, 1000);
};

// function to get random number.
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const capitalizeEveryWord = str =>
  str.replace(/\b[a-z]/g, char => char.toUpperCase());

// function to repeat, format and push entries into the raffleArray.
const handleEntry = (name, entries) => {
  name = capitalizeEveryWord(name);
  const newName = `${name},`;
  // adds a comma after the name
  const repeatedName = newName.repeat(entries);
  // repeats the name by the number of entries
  const fullEntry = repeatedName.slice(0, -1).split(',');
  // returns an array of each name repeated like this ["josh", "josh", "josh"]
  fullEntry.forEach(entry => {
    raffleArray.push(entry);
  });
  $('#entrant-name, #entries').val('');
};

// function for calculating the odds of winning for each entrant and writing it to the page.
const handleOdds = () => {
  const raffleClone = [...raffleArray];
  // This flattens it into one large array.
  const randomizedArray = randomize(raffleClone);
  const entrantTotal = randomizedArray.reduce((obj, item) => {
    obj[item] = (obj[item] || 0) + 1;
    return obj;
  }, {});
  // This counts every instance of a string in the randomizedArray.
  // Returns an object like this {josh: 2, kenny: 2}
  const totalValues = Object.values(entrantTotal);
  // grabs only the values for each entrant
  totalValues.forEach(value => {
    // loops over values to calculate odds and print them to page.
    const raffleOdds = ((value / raffleClone.length) * 100).toFixed(2);
    if (raffleOdds > 50) {
      $('#chance')
        .append(
          `<div class="percentage m-1 ${className(
            'green'
          )}">${raffleOdds}%</div><hr>`
        )
        .addClass(`border-left border-right border-light`);
    } else if (raffleOdds < 10) {
      $('#chance')
        .append(
          `<div class="percentage m-1 ${className(
            'red'
          )}">${raffleOdds}%</div><hr>`
        )
        .addClass(`border-left border-right border-light`);
    } else {
      $('#chance')
        .append(
          `<div class="percentage m-1 ${className(
            'white'
          )}">${raffleOdds}%</div><hr>`
        )
        .addClass(`border-left border-right border-light`);
    }
  });
  return {
    entrantTotal,
    raffleClone
  };
};

// function to handle the total count for each entrant and write it to page along with the total entries
const handleCount = (entrantTotal, raffleClone) => {
  $('#count').empty();
  const entryCount = JSON.stringify(entrantTotal);
  // returns a stringified object from the handleOdds function.
  // the keys are the names and the values are the count. ex. {"josh":5}
  const formattedEntryCount = entryCount
    .slice(1, -1)
    .replace(/\"/g, ' ')
    .replace(/ :/g, ': ')
    .split(',');
  // returns an array of the entryCounts as strings formatted like this: [" josh: 5", " kenny: 6"]
  formattedEntryCount.forEach(count => {
    count = count.trim();
    // removes whitespace from beginning of each formattedEntryCount
    const id = count.substring(0, count.indexOf(':'));
    // returns the name as a string like "josh" by trimming the colon and anything after it.
    // used to match id of count to delete button and filter the array accordingly.
    if (raffleClone.length > 0) {
      $('#count')
        .append(
          `<span id="${id}" class="delete-entry m-1 ml-3 float-left btn btn-sm btn-outline-light" value="${id}">X</span><div class="names m-1 ${className(
            'white'
          )}">${count}</div><hr>`
        )
        .addClass(`border-left border-right border-light`);
    }
  });
  $('#total-entries').html(
    `<div class="${className('white')}">Total Entries: ${
      raffleClone.length
    }</div>`
  );
  $('#pick-winner').prop('disabled', false);
  $('.alert').alert('close');
};

// writes if error is found on submission.
const handleErrors = () => {
  $('#entries, #entrant-name').val('');
  const alertDiv = $('<div>');
  alertDiv
    .addClass('mt-2 alert alert-danger')
    .attr('role', 'alert')
    .attr('data-dismiss', 'alert')
    .text(`Please input a valid value. Click to dismiss.`);
  $('.form-group').append(alertDiv);
};

// function that bundles the other functions and validates the user's submission before executing.
const doSubmit = () => {
  const name = $('#entrant-name')
    .val()
    .trim();
  const entries = $('#entries')
    .val()
    .trim();
  if (entries > 0 && entries !== '' && name !== '') {
    $('#chance').empty();
    animateProgressBar();
    handleEntry(name, entries);
    const { entrantTotal, raffleClone } = handleOdds();
    handleCount(entrantTotal, raffleClone);
  } else {
    handleErrors();
  }
};

// function to pick a winner and create a ticker "animation" on the page before displaying the winner.
const pickWinner = () => {
  $('#pick-winner').prop('disabled', true);
  const raffleClone = [...raffleArray];
  const random = randomize(raffleClone);
  const winner = random[getRandomInt(0, random.length - 1)];
  const interval = window.setInterval(() => {
    const tickerRandom = random[getRandomInt(0, random.length - 1)];
    $('#winner').html(
      `<div class="${className('white')}">${tickerRandom}</div>`
    );
    window.setTimeout(() => {
      clearInterval(interval);
    }, 5000);
  }, 100);
  animateProgressBar();
  setTimeout(() => {
    $('#winner').html(
      `<div class="${className('green')}">The winner is ${winner}!</div>`
    );
    $('#pick-winner').prop('disabled', false);
  }, 5100);
};

// function to reset entries
const resetEntries = () => {
  raffleArray = [];
  $('#total-entries, #count, #chance, #winner').empty();
  $('#total-entries')
    .text('Add some entries or your load your save to get started.')
    .addClass('text-light');
  $('.progress-bar')
    .css('width', '0%')
    .attr('aria-valuenow', 0)
    .text('');
  $('#pick-winner').prop('disabled', true);
};

// function for quickly writing bootstrap badge color classes
const className = color => {
  let classes = 'badge badge-';
  classes +=
    color === 'green'
      ? 'success'
      : color === 'red'
      ? 'danger'
      : color === 'white'
      ? 'light'
      : color === 'yellow'
      ? 'warning'
      : color === 'blue'
      ? 'primary'
      : 'dark';
  return classes;
};

// click functions
$('#submit').on('click', event => {
  event.preventDefault();
  $('#winner').empty();
  doSubmit();
});

$('#pick-winner').on('click', event => {
  event.preventDefault();
  if (raffleArray.length > 0) {
    pickWinner();
  }
});

// resets everything, all current entries and clears local storage.
// button exists on main page.
$('#reset').on('click', event => {
  $('.reset-modal').modal();
  resetEntries();
  localStorage.clear();
});

// clears local storage and gives message to user.
// button exists inside save modal.
$('.delete').on('click', event => {
  const savedRaffle = localStorage.getItem('raffle');
  if (savedRaffle) {
    $('.save-msg').html(`<p><b>Saved data has been deleted.</b></p>`);
    localStorage.clear();
  } else {
    $('.save-msg').html(
      `<p><b>It's fun to click buttons, but there is nothing to delete.</b></p>`
    );
  }
});

// launches save modal. button exists on main page.
$('.save-btn').on('click', event => {
  $('.save-modal').modal();
  $('.save-msg').empty();
});

// load button launches modal, empties message div, and removes refresh button. button exists on main page.
$('.load-btn').on('click', event => {
  $('#no-save').empty();
  $('.refresh').remove();
  $('.load-modal').modal();
});

// displays inside modal. save button click launches save modal,
// initializes raffleClone and saves to local storage if the array isn't empty.

$('.save').on('click', event => {
  // $(".save-modal").modal("hide")
  const raffleClone = [...raffleArray];
  if (raffleClone.length > 0) {
    localStorage.setItem('raffle', JSON.stringify(raffleClone));
    const date = moment().format('LLL');
    localStorage.setItem('date', JSON.stringify(date));
    $('.save-msg').html(
      `<p><b>Success! Raffle has been saved on ${date}</b></p>`
    );
  } else {
    $('.save-msg').html(`<p><b>No entries found. Add entries first.</b></p>`);
  }
});

// load button inside modal.
// if raffle array is empty and local storage has saved data it will parse the data,
// push it it into the raffle array,
// run the functions for odds and count,
// and display to the user that saved data has been loaded.
// If local storage is empty it will display a message to the user that no save data was found.
// If the raffle array has items in it
// and local storage has saved data a message will display to the user that they need to refresh the page
// to load their save and add a button to refresh page.

$('.load-data').on('click', event => {
  const savedRaffle = localStorage.getItem('raffle');
  let savedDate = localStorage.getItem('date');
  savedDate = JSON.parse(savedDate);
  if (raffleArray.length === 0 && savedRaffle) {
    const namesList = JSON.parse(savedRaffle);
    namesList.forEach(name => {
      raffleArray.push(name);
    });
    const { entrantTotal, raffleClone } = handleOdds();
    handleCount(entrantTotal, raffleClone);
    $('.load-msg').html(
      `<p id="no-save"><b>Saved raffle from ${savedDate} has been loaded.</b></p>`
    );
  } else if (!savedRaffle) {
    $('.load-msg').html(`<p id="no-save"><b>No save data found.</b></p>`);
  } else if (raffleArray.length !== 0 && savedRaffle) {
    $('.load-msg').html(
      `<p id="no-save"><b>Saved data from ${savedDate} has been found. Refresh the page before loading the saved raffle.</b></p>`
    );
    $('.refresh').remove();
    $('.load-footer').append(
      `<button class="btn btn-primary refresh">Refresh Page</button>`
    );
  }
});

// displays next to entry counts, matches id with name in array,
// filters out the name, sets the main array to the filtered array, and runs the odds and count functions.
$(document).on('click', '.delete-entry', event => {
  $('#count, #chance, #winner').empty();
  const { id, value } = event.target;
  const array = [...raffleArray];
  raffleArray = array.filter(name => name !== id);
  const { entrantTotal, raffleClone } = handleOdds();
  handleCount(entrantTotal, raffleClone);
  const spanId = `#${id}`;
  $(spanId).hide();
  $('.progress-bar')
    .css('width', '0%')
    .attr('aria-valuenow', 0)
    .text('');
});

// will refresh the page.
// only displayed if saved data is found but the raffleArray is not empty and in the form.
$(document).on('click', '.refresh', event => {
  window.location.reload();
});
