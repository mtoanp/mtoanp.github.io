import { Player, Projectile, Enemy, Particle } from './Entities.js'

// Get the canvas tag
const canvas = document.querySelector("#container-game");

// Get the 2d context of the canvas
const ctx = canvas.getContext("2d");

// Put the canvas dimensions equal to the window dimensions
canvas.width = innerWidth;
canvas.height = innerHeight;

// DOM elements for UI
const scoreEl = document.getElementById("scoreEl");
const difficultEl = document.getElementById("difficultEl");
const difficultBig = document.getElementById("difficultBig");
const bonusEl = document.getElementById("bonusEl");
const startGameBtn = document.getElementById("startGameBtn");
const modalEl = document.getElementById("modalEl");
const modalContentEl = document.getElementById("modalContentEl");
const guideEl = document.getElementById("guideEl");
const bigScoreEl = document.getElementById("bigScoreEl");
const gunshotSound = document.getElementById("gunshotEl");
const rocketSound = document.getElementById("rocketEl");
const infinitySound = document.getElementById("infinityEl");
const explosiveSound = document.getElementById("explosiveEl");
const bossSound = document.getElementById("bossEl");
const selfSound = document.getElementById("selfEl");
const bg = '../assets/images/gameover.jpg'
modalContentEl.classList.add('gamestart')

// -------------------------------------------------------------
// INITIALIZE
// -------------------------------------------------------------
let player = new Player(canvas.width / 2, canvas.height / 2, 10, "white");
let projectiles = [];
let enemies = [];
let particles = [];
let bonus = [];
let ennemyLoop

let score = 0;
let coords = {x:0, y:0}
let munition = {}
let difficult = 0
const difficultMax = 10
const difficultBase = 500

function init() {
  // player = new Player(canvas.width / 2, canvas.height / 2, 15, "white");
  player = new Player(canvas.width / 2, canvas.height / 2, 15, "white", "image", "../assets/images/smiley.gif");
  projectiles = [];
  enemies = [];
  particles = [];
  bonus = {rocket: 0, infinity: 0};
  munition = {rocketBullet: 0, infinityBullet: 4, rocketMax: 4, infinityMax: 10}

  score = 0;
  difficult = 0;
  scoreEl.innerText = score;
  bigScoreEl.innerText = score;
  difficultEl.innerHTML = difficult;
  bonusEl.innerHTML = '+' + bonus.rocket + '/' + bonus.infinity
}


// function to generate every second a new enemy coming from outside of the screen randomly
function spawnEnemiesLoop() {
  let delay = difficultMax - difficult
  ennemyLoop = setInterval(() => {
    spawnEnemy()
  }, delay * 200 + 200);
}


function spawnEnemy(type = 'mob') {
    // random radius
    const radius = type === 'boss'? 60 : Math.random() * (30 - 4) + 4;

    // random red, green and blue value
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    // random rgb color
    const color = `rgb(${r}, ${g}, ${b})`;

    // random value to generate the x and y coordinates
    const randomValue = Math.random();
    let x, y;
    if (randomValue < 0.25) {
      x = 0 - radius;
      y = Math.random() * canvas.height;
    } else if (randomValue >= 0.25 && randomValue < 0.5) {
      x = canvas.width + radius;
      y = Math.random() * canvas.height;
    } else if (randomValue >= 0.5 && randomValue < 0.75) {
      x = Math.random() * canvas.width;
      y = 0 - radius;
    } else if (randomValue >= 0.75) {
      x = Math.random() * canvas.width;
      y = canvas.height + radius;
    }

    // calcul of the velocity
    const angle = Math.atan2(player.y - y, player.x - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    // add a new enemy in enemies array
    enemies.push(new Enemy(x, y, radius, color, velocity, type));
}




// -------------------------------------------------------------
// ANIMATION
// -------------------------------------------------------------
let animationId;
let isPaused = false

// animate function executed recursively
function animate() {
  if (isPaused) {
    cancelAnimationFrame(animationId);
    return;
  }

  animationId = requestAnimationFrame(animate);

  // fill the canvas with a rectangle
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw the player in the canvas
  if(player.status === 'alive')
    player.draw(munition);

  // go through the particles array to update all particle positions
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });

  // go through the projectiles array to update all projectile positions
  projectiles.forEach((projectile, index) => {
    if (
      projectile.x - projectile.radius < 0 ||
      projectile.x + projectile.radius > canvas.width ||
      projectile.y - projectile.radius < 0 ||
      projectile.y + projectile.radius > canvas.height
    ) {
      projectiles.splice(index, 1); 
      if(projectile.type === 'infinity') {
        loopShoot(projectile)
      }
    }
    projectile.update();
  });



  // go through the enemies array to update all enemy positions
  enemies.forEach((enemy, enemyIndex) => {
    // detection of collision between a projectile and an enemy
    projectiles.forEach((projectile, projectileIndex) => {
      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );
      if (distance - projectile.radius - enemy.radius <= 0) {
        // particles creation
        for (let i = 0; i < 8; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * (3 - 1) + 1,
              enemy.color,
              {
                x: (Math.random() - 0.5) * 3,
                y: (Math.random() - 0.5) * 3,
              }
            )
          );
        }

        
        // reduce the radius of enemy or remove enemy
        if (projectile.type === 'rocket') {
          if (enemy.type === 'boss') {
            score += 200;
            gsap.to(enemy, {
              radius: enemy.radius - 20,
            });
            setTimeout(() => {
              if (projectile.type !== 'infinity') projectiles.splice(projectileIndex, 1);
            }, 0);
          } else {
            score += 250;
            playSound('explosive')
            setTimeout(() => {
              enemies.splice(enemyIndex, 1);
            }, 0);
          }

        } else if (enemy.radius - 10 > 5) {
          score += 100;
          gsap.to(enemy, {
            radius: (enemy.type === 'boss') ? enemy.radius - 10 : enemy.radius - 10,
          });
          setTimeout(() => {
            if (projectile.type !== 'infinity') projectiles.splice(projectileIndex, 1);
          }, 0);

        } else {
          // increase our score
          if (enemy.type === 'boss') {
            score += 1000;
            playSound('boss') 
            addBonus()
          } else {
            score += 250;
          }
          playSound('explosive')
          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
            if (projectile.type !== 'infinity') projectiles.splice(projectileIndex, 1);
          }, 0);
        }
        scoreEl.innerText = score;


        // Check and update difficult base on score
        let dif = Math.floor( score / (2000 + difficult*difficultBase) );
        if (difficult < dif && difficult < difficultMax) {
          difficult = dif
          clearInterval(ennemyLoop);  // Clear the existing interval
          spawnEnemiesLoop()              // Call with new Interval
          difficultEl.innerHTML = difficult;
          if ([3, 6, 9].includes(difficult)) spawnEnemy('boss')
        } 
      }
    });


    // -------------------------------------------------
    // end game condition
    // -------------------------------------------------

    // detection of collision between the player and an enemy
    const distPlayerEnemy = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    if (distPlayerEnemy - enemy.radius - player.radius <= 0) {
      playSound('self')
      // particles creation for engame sceen
      for (let i = 0; i < 8; i++) {
        // random red, green and blue value
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        // random rgb color
        const color = `rgb(${r}, ${g}, ${b})`;
        
        particles.push(
          new Particle(
            player.x,
            player.y,
            Math.random() * (3 - 1) + 1,
            color,
            {
              x: (Math.random() - 0.5) * 10,
              y: (Math.random() - 0.5) * 10,
            }
          )
        );
      }

      gsap.to(player, {
        radius: 0
      });
      player.status = 'dead'

      // end game timeout
      setTimeout(() => {
        cancelAnimationFrame(animationId);
        bigScoreEl.innerText = score;
        startGameBtn.innerText = "Restart Game";
        modalEl.style.display = "flex";
        difficultBig.innerHTML = 'Difficult ' + difficult
        modalContentEl.classList.add('gameover')
      }, 1500);
    }


    enemy.update();
  });
}



// -------------------------------------------------------------
// ACTION
// -------------------------------------------------------------
function loopShoot(projectile) {
  // console.log('green hit floor')
  const angle = Math.atan2(projectile.y - player.y, projectile.x - player.x);
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  // projectile.velocity = velocity
  projectile = new Projectile(player.x, player.y, 3, 'green', velocity, 'infinity');
  projectiles.push(projectile);
}

const shooter = (x, y, type = 'normal') => {
    const angle = Math.atan2(y - player.y, x - player.x);
    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5,
    };
  
    // create new projectile
    let color = 'white'
    let radius = 2
    if (type === 'rocket') {
        color = 'red'
        radius = 10
        munition.rocketBullet--;
    } else if (type === 'infinity') {
        color = 'green'
        radius = 3
        munition.infinityBullet--;
    }

    let projectile = new Projectile(player.x, player.y, radius, color, velocity, type);
    projectiles.push(projectile);
}


// click listener to add a new projectile in direction of the mouse pointer
window.addEventListener("click", (event) => {
    let x = event.clientX
    let y = event.clientY 
    let type = 'normal'
    if (munition.rocketBullet > 0) {
      shooter(x, y, 'rocket')
      type = 'rocket'
    } else {
      shooter(x, y)
    }
    playSound(type)
});

// click listener to add a new projectile in direction of the mouse pointer
window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    let x = event.clientX
    let y = event.clientY 
    let type = 'normal'
    if (munition.infinityBullet > 0) {
      shooter(x, y, 'infinity')
      type = 'infinity'
    } else {
      shooter(x, y)
    }
    playSound(type)  
});

function playSound(type = 'gun') {   
  switch (type) {
    case 'rocket':
      playSoundDetail(rocketSound, 0.05, 3)
      break;
    case 'infinity':
      playSoundDetail(infinitySound, 0.5, 1)
      break;
    case 'explosive':
      playSoundDetail(explosiveSound, 0.2, 1.5)
      break;
    case 'boss':
      playSoundDetail(bossSound, 0.5, 3)
      break;
    case 'self':
      playSoundDetail(selfSound, 0.3, 1)
      break;
    default:
      playSoundDetail(gunshotSound, 0.1, 5)
      break;
  }
}

function playSoundDetail(soundEl, volume, speed, repeat = 1) {
    soundEl.volume = volume;
    soundEl.playbackRate = speed;
    soundEl.play();
}

function addBonus() {
  let msg, color
  // Generate a random number between 0 and 1
  const randomNumber = Math.random();
  // Convert the random number to either 0 or 1
  const randomBinary = Math.round(randomNumber);
  switch (randomBinary) {
    case 0:
      bonus.rocket++
      munition.rocketMax++
      msg = '+ 1 Rocket'
      color = 'red'
      break;
    case 1:
      bonus.infinity++
      munition.infinityBullet++
      msg = '+ 1 Infinity'
      color = 'green'
      break;
  }
  bonusEl.innerHTML = '+' + bonus.rocket + '/' + bonus.infinity

  ctx.font = "50px Comic Sans MS";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(msg, canvas.width/2, canvas.height/2 - 200);
}

// -------------------------------------------
let isMouseOver = false;

// Check mouse state & shoot
function autoShooting() {
  if (isMouseOver && !isPaused && player.status === 'alive') {
      shooter(coords.x, coords.y)
      playSound()
  }
}

// Mouseover event
canvas.addEventListener("mouseover", function(event) {
    isMouseOver = true;
});

// Mouseout event
canvas.addEventListener("mouseout", function(event) {
    isMouseOver = false;
});


function chargeRocket() {
  if (munition.rocketBullet < munition.rocketMax)
    munition.rocketBullet++;
}

// Mouseover event
document.addEventListener("keydown", function(event) {   
  // You can perform actions based on the pressed key
  if(event.key === ' ') {
    isPaused = !isPaused
    console.log(isPaused ? 'Paused' : 'Un Pause');
    if (!isPaused) {
      animate(); // If unpaused, start the animation again
    }
  }
});



// -------------------------------------------------------------
// START POINT
// -------------------------------------------------------------
startGameBtn.addEventListener("click", () => {
  init();
  modalEl.style.display = "none";
  guideEl.style.display = 'none'
  addBonus()
  setTimeout(() => {
    animate();
  }, 300 )
  clearInterval(ennemyLoop);      // Clear the existing interval
  spawnEnemiesLoop()              // Call with new Interval
});

window.addEventListener("mousemove", (event) => {
  coords = {x: event.clientX, y: event.clientY}
});

setInterval(autoShooting, 400);
setInterval(chargeRocket, 3000);

