function NewElement(tagName, className) {
  const element = document.createElement(tagName);
  element.className = className;
  return element;
}

function Barrier(reverse = false) {
  this.element = NewElement("div", "barrier");

  const board = NewElement("div", "board");
  const bodies = NewElement("div", "bodies");
  this.element.appendChild(reverse ? bodies : board);
  this.element.appendChild(reverse ? board : bodies);

  this.setHeight = (height) => (bodies.style.height = `${height}px`);
}

function PairOfBarrier(height, space, x) {
  this.element = NewElement("div", "pair-barrier");

  this.superior = new Barrier(true);
  this.inferior = new Barrier(false);

  this.element.appendChild(this.superior.element);
  this.element.appendChild(this.inferior.element);

  this.randonSpace = () => {
    const superiorHeight = Math.random() * (height - space);
    const inferiorHeight = height - space - superiorHeight;
    this.superior.setHeight(superiorHeight);
    this.inferior.setHeight(inferiorHeight);
  };

  this.getX = () => parseInt(this.element.style.left.split("px")[0]);
  this.setX = (x) => (this.element.style.left = `${x}px`);
  this.getWidth = () => this.element.clientWidth;

  this.randonSpace();
  this.setX(x);
}

function Barriers(height, width, space, axisX, notifyScore) {
  this.pairs = [
    new PairOfBarrier(height, space, width + axisX * 0),
    new PairOfBarrier(height, space, width + axisX * 1),
    new PairOfBarrier(height, space, width + axisX * 2),
    new PairOfBarrier(height, space, width + axisX * 3),
  ];

  const moviment = 3;

  this.animate = () => {
    this.pairs.forEach((pair) => {
      pair.setX(pair.getX() - moviment);

      if (pair.getX() < -pair.getWidth()) {
        pair.setX(pair.getX() + axisX * this.pairs.length);
        pair.randonSpace();
      }

      const mid = width / 2;
      const inMid = pair.getX() + moviment >= mid && pair.getX() < mid;
      if (inMid) notifyScore();
    });
  };
}

//Flappy
function Bird(axisY) {
  let fly = false;

  this.element = NewElement("img", "bird");
  this.element.src = "imgs/passaro.png";

  this.getY = () => parseInt(this.element.style.bottom.split("px")[0]);
  this.setY = (y) => (this.element.style.bottom = `${y}px`);

  window.onkeydown = (e) => (fly = true);
  window.onkeyup = (e) => (fly = false);

  this.animate = () => {
    const newY = this.getY() + (fly ? 7 : -5);
    const maxHeight = axisY - this.element.clientHeight;

    if (newY <= 0) {
      this.setY(0);
    } else if (newY >= maxHeight) {
      this.setY(maxHeight);
    } else {
      this.setY(newY);
    }
  };

  this.setY(axisY / 2);
}

function Progress() {
  this.element = NewElement("span", "progress");
  this.attScore = (scores) => {
    this.element.innerHTML = scores;
  };
  this.attScore(0);
}

function overlapping(elementA, elementB) {
  const a = elementA.getBoundingClientRect();
  const b = elementB.getBoundingClientRect();

  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;

  return horizontal && vertical;
}

function collision(bird, barriers) {
  let collision = false;
  barriers.pairs.forEach((pairOfBarriers) => {
    if (!collision) {
      const superior = pairOfBarriers.superior.element;
      const inferior = pairOfBarriers.inferior.element;

      collision =
        overlapping(bird.element, superior) ||
        overlapping(bird.element, inferior);
    }
  });
  return collision;
}

function FlappyBird() {
  let scores = 0;

  const gameArea = document.querySelector("[wm-flappy]");
  const heightGame = gameArea.clientHeight;
  const widthGame = gameArea.clientWidth;

  const progress = new Progress();
  const barriers = new Barriers(heightGame, widthGame, 200, 400, () =>
    progress.attScore(++scores)
  );
  const bird = new Bird(heightGame);

  gameArea.appendChild(progress.element);
  gameArea.appendChild(bird.element);
  barriers.pairs.forEach((pairs) => gameArea.appendChild(pairs.element));

  this.start = () => {
    //loop game
    const timer = setInterval(() => {
      barriers.animate();
      bird.animate();

      if (collision(bird, barriers)) {
        clearInterval(timer);
      }
    }, 20);
  };
}

new FlappyBird().start();
// const barriers = new Barriers(700, 1200, 200, 400);
// const bird = new Bird(700);
// const gameArea = document.querySelector("[wm-flappy]");

// gameArea.appendChild(bird.element);
// gameArea.appendChild(new Progress().element)
// barriers.pairs.forEach((pairs) => gameArea.appendChild(pairs.element));
// setInterval(() => {
//   barriers.animate();
//   bird.animate();
// }, 20);
