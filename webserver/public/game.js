const STORAGE_KEY = 'drukning-players';
const DEFAULT_PLAYER_DATA = [
  {
    name: 'Abe',
    picture: 'abe.png',
    score: 0,
  },
  {
    name: 'Scott',
    picture: 'scott.png',
    score: 0,
  },
  {
    name: 'Jarred',
    picture: 'jarred.png',
    score: 0,
  },
  {
    name: 'Terence',
    picture: 'terence.png',
    score: 0,
  },
];
const messages = {
  hammered: [
    "Congratulations, you blew the maximum score! The authorities have been notified.",
  ],
  drunking: [
    "There is there too much blood in your alcohol system.",
    "Are you slurring or speaking in cursive?",
    "You look like I need a drink",
    "You've had a lot to drink! That's my favourite drink too.",
    "Your super power is getting alcohol to disappear.",
    "Your liver hates you.",
  ],
  warmingup: [
    "You're getting there.",
    "It looks like you have a lot on your mind, maybe you should drink about it.",
    "You look like I need a drink",
  ],
  coolingdown: [

  ],
}

class DrunkingGame {
  constructor () {
    // The participants of the game and whose turn it is
    this.participants = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_PLAYER_DATA;
    this.whoseTurnIsIt = 2;

    // The score labels in the left pane, for easy updating
    this.scoreLabels = document.querySelectorAll('li');

    // Bind an onclick listener to each of the labels in the left pane
    for (let i = 0; i < this.scoreLabels.length; ++i) {
      this.scoreLabels.item(i).addEventListener('click', this.makeClickListener(i));
    }

    // And finally, the socket to communicate with
    this.socket = io();
  }

  start () {
    // Load the images
    var images = this.participants.map(p => this.loadImage(p.picture));
    Promise.all(images).then(this.drawChart.bind(this));

    // While the images are loading, update the scores
    for (let i = 0; i < this.scoreLabels.length; ++i) {
      this.scoreLabels.item(i).querySelector('figure').innerText = this.participants[i].score;
    }

    // Update which player's label is pulsing
    this.updateWhoseTurnItIs();

    // Bind the 'score' event in the socket to update
    this.socket.on('score', this.updateScore.bind(this));
  }

  // Loads an image from a filename. Returns a promise which resolves with an image
  loadImage (filename) {
    return new Promise((resolve, reject) => {
      // Load the raw image first
      var rawImage = new Image();
      rawImage.src = filename;
      rawImage.onload = () => {
        // Get the contents of the image, and resize it
        var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.mozImageSmoothingEnabled = true;
        var height = 100;
        var width = rawImage.width / rawImage.height * height;
        canvas.width = width + 8;
        canvas.height = height + 8;

        // Create the white border around the image
        var displacementArray = [
          -1,-1, 0,-1, 1,-1,
          -1, 0,       1, 0,
          -1, 1, 0, 1, 1, 1
        ];
        var scale = 3;

        var x = 5;
        var y = 5;

        // draw images at offsets from the array scaled by s
        for(let i = 0; i < displacementArray.length; i += 2) {
          ctx.drawImage(rawImage, 0, 0, rawImage.width, rawImage.height, x + displacementArray[i] * scale, y + displacementArray[i+1] * scale, width, height);
        }

        // Make the border white
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the scaled image in normal mode
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(rawImage, 0, 0, rawImage.width, rawImage.height, x, y, width, height);

        // Create the image element and resolve with the results
        var image = new Image();
        image.src = canvas.toDataURL();
        image.onload = function () {
          resolve(image);
        }
      }
    });
  }

  // Draws the chart
  drawChart (images) {
    // Organize the chart data
    var data = {
      labels: [''].concat(this.participants.map(participant => participant.name)).concat(['']),
      datasets: [{
        label: 'Drunkness',
        data: [undefined].concat(this.participants.map(participant => participant.score)).concat([undefined]),
        pointStyle: [undefined].concat(images).concat([undefined]),
        pointRadius: 0,
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 3,
      }],
    };

    // Organize the chart options
    var options = {
      showLines: false,
      maintainAspectRatio: false,
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: false,
            zeroLineColor: '#fff',
          },
        }],
        yAxes: [{
          gridLines: {
            display: false,
            zeroLineColor: '#fff',
          },
          ticks: {
            beginAtZero: true,
          },
        }],
      },
    };

    Chart.defaults.global.defaultFontColor = '#fff';
    Chart.defaults.global.defaultFontFamily = 'Schoolbell';
    this.chart = new Chart(document.getElementById('drunk-o-meter'), {
      type: 'line',
      data: data,
      options: options,
    });
  };

  // Saves the game's data to localStorage
  save () {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.participants));
  }

  // Update which player is pulsing in the left side
  updateWhoseTurnItIs () {
    if (document.querySelector('.selected')) {
      document.querySelector('.selected').classList.remove('selected');
    }

    // Go through the list until that person is found
    for (let i = 0; i < this.scoreLabels.length; ++i) {
      if (i == this.whoseTurnIsIt) {
        this.scoreLabels.item(i).classList.add('selected');
      }
    }

    this.save();
  }

  // Update the score of a player
  updateScore (newScore) {
    newScore = ~~newScore;
    this.participants[this.whoseTurnIsIt].score = newScore;
    this.chart.data.datasets[0].data[1+this.whoseTurnIsIt] = newScore;
    this.chart.update();

    // Update the score in the listeners
    for (let i = 0; i < this.scoreLabels.length; ++i) {
      if (i == this.whoseTurnIsIt) {
        this.transitionScore(newScore, this.scoreLabels.item(i).querySelector('figure'));
      }
    }

    // Show the user a motivational message
    this.handleMessage(newScore, Number(label.innerText));

    this.save();
  }

  // Counts up or down to the new score for a player
  transitionScore (newScore, label) {
    var percentageComplete = 0;
    var oldScore = Number(label.innerText);
    var difference = newScore - oldScore;
    var start;

    // The easing function we'll be using
    var outExpo = function (n) {
      return 1 == n ? n : 1 - Math.pow(2, -10 * n);
    };

    var animate = (now) => {
      if (!start) {
        start = now;
      }

      // Calculate how far the animation is done
      percentageComplete = outExpo((now - start) / 1000);

      // Update the score label
      label.innerText = ~~(oldScore + percentageComplete * difference);

      if (oldScore != newScore) {
        // Recurse
        requestAnimationFrame(animate);
      }
    }
    // Kick off the animation
    requestAnimationFrame(animate);
  }

  // Makes a click listener for one of the thingies in the left pane
  makeClickListener (i) {
    return function () {
      this.whoseTurnIsIt = i;
      this.updateWhoseTurnItIs();
    }.bind(this);
  }

  handleMessage (newScore, oldScore) {
    if (newScore > 1000) {
      showMessage(messages.hammered.pickRandom());
      return;
    }
    if (newScore > oldScore) {
      if (newScore < 600) {
        showMessage(messages.warmingup.pickRandom());
        return;
      } else {
        showMessage(messages.drunking.pickRandom());
        return;
      }
    }
    if (oldScore > newScore) {
      showMessage(messages.cooldown.pickRandom());
      return;
    }
  }

  showMessage (message) {
    var box = document.querySelector('aside');
    box.classList.remove('show');
    box.innerText = message;
    box.classList.add('show');
  }
}

var game = new DrunkingGame();
game.start();

// Make all arrays have a method that gives you a random thing
Array.prototype.pickRandom = function () {
  return this[Math.floor((Math.random()*this.length))];
}
