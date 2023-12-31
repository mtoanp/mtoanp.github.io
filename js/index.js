import { Player, Projectile, Enemy, Particle } from './Entities.js'

// Get the canvas tag
const canvas = document.querySelector("#container-game");

// Get the 2d context of the canvas
const ctx = canvas.getContext("2d");

// Put the canvas dimensions equal to the window dimensions
canvas.width = innerWidth;
canvas.height = innerHeight;

// DOM elements for UI
const rocketEl = document.getElementById("rocketEl");
const infinityEl = document.getElementById("infinityEl");

const scoreEl = document.getElementById("scoreEl");
const difficultyEl = document.getElementById("difficultyEl");
const difficultyBig = document.getElementById("difficultyBig");
const bonusEl = document.getElementById("bonusEl");
const bestScoreEl = document.getElementById("bestScoreEl");
const mtoEl = document.getElementById("mtoEl");

const startGameBtn = document.getElementById("startGameBtn");
const startGameBtnContent = document.getElementById("startGameBtnContent");
const modalEl = document.getElementById("modalEl");
const modalContentEl = document.getElementById("modalContentEl");
const guideEl = document.getElementById("guideEl");
const bigScoreEl = document.getElementById("bigScoreEl");

const volumeEl = document.getElementById("volumeEl");
const volumeToggleEl = document.getElementById("volumeToggleEl");
const soundtrackToggleEl = document.getElementById("soundtrackToggleEl");

// avatar
const earthAvatar = "../assets/images/earth.png"
// const smileyAvatar = "../assets/images/smiley.png"
// const luckyAvatar = "../assets/images/lucky.png"
const luckyAvatar = "../assets/images/moon.png"
const bossAvatar = "../assets/images/boss.png"

// Audi Resources
const soundtrackSound = '../audio/soundtrack.mp3'
const gunshotSound = '../audio/gunshot.mp3'
const rocketSound = '../audio/rocket.mp3'
const infinitySound = '../audio/infinity.mp3'
const explosiveSound = '../audio/pop.mp3'
const bossSound = '../audio/boss.mp3'
const selfSound = '../audio/self.mp3'

// Setup
modalContentEl.classList.add('gamestart')
mtoEl.innerHTML = 'by mto'

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
let bestScore = 0
let coords = {x:0, y:0}
let msg = {msg: '', color: ''}
let munition = {}
let lvl = 0, speed = 0
const speedMax = 15
const difficultyBase = 500
let globalVol = 50
let isMuted = false
let soundTrackIsPlay = false
let soundtrack = new Audio(soundtrackSound)
let isPlay = false

// playSound('soundtrack')

function init() {
  isPlay = true
  player = new Player(canvas.width / 2, canvas.height / 2, 30, "", "avatar", earthAvatar);
  projectiles = [];
  enemies = [];
  particles = [];
  bonus = {rocket: 0, infinity: 0, doubleShot: false, multiShot: false, shield: false};
  munition = {rocketBullet: 0, infinityBullet: 4, rocketMax: 4, infinityMax: 10}

  score = 0;
  msg = {msg: '', color: ''};
  lvl = 0, speed = 0;
  scoreEl.innerText = score;
  bigScoreEl.innerText = score;
  difficultyEl.innerHTML = lvl;
  rocketEl.innerHTML = munition.rocketBullet;
  infinityEl.innerHTML = munition.infinityBullet;
  bonusEl.innerHTML = '+' + bonus.rocket + '/' + bonus.infinity
}


// function to generate every second a new enemy coming from outside of the screen randomly
function spawnEnemiesLoop() {
  let delay = speedMax - speed
  ennemyLoop = setInterval(() => {
    if (!isPaused) {
      let luckyMob = successRate(0.05)      // 10%
      let mob = luckyMob ? 'lucky' : 'mob' // 10%
      spawnEnemy(mob)
    }
  }, delay * 150 + 200);
}

function successRate(rate) {
  // Generate a random boolean with a 10% chance of being true
  // let randomBoolean = Math.random() < 0.1;
  let randomBoolean = Math.random() < rate;
  return randomBoolean;
}

function spawnEnemy(type = 'mob') {
    // random radius
    let radius, avatar
    if(type === 'boss') {
      radius = 70
      avatar = bossAvatar
    } else if(type === 'lucky') {
      radius = 20
      avatar = luckyAvatar
    } else {
      radius = Math.random() * (30 - 4) + 4;
    }
    // console.log(type + ' : ' + radius)

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
    enemies.push(new Enemy(x, y, radius, color, velocity, type, avatar));
    // enemies.push(new Enemy(x, y, radius, color, velocity, type), "image", smileyGif);
}




// -------------------------------------------------------------
// ANIMATION
// -------------------------------------------------------------
let animationId;
let isPaused = false

// animate function executed recursively
function animate() {
  if (isPaused || !isPlay) {
    cancelAnimationFrame(animationId);
    return;
  }

  animationId = requestAnimationFrame(animate);

  // Set the global alpha (opacity)
  // ctx.globalAlpha = 0.9;

  // Clear the canvas on each frame
  // ctx.clearRect(0, 0, canvas.width, canvas.height);

  // fill the canvas with a rectangle on each frame
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set the global alpha (opacity)
  // ctx.globalAlpha = 1;

  // draw the player in the canvas
  if(player.status === 'alive')  player.draw();

  // Drawn MSG
  if(msg.msg !== '')  drawMsg();

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
    if(projectile.type !== 'shield') {
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

    } else {
      projectile.shield();
    }
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

        
        // -------------------------------------------------
        // HIT
        // -------------------------------------------------
        // reduce the radius of enemy or remove enemy
        let degat
        if(projectile.type === 'rocket') {
          degat = 25
        } else if( projectile.type === 'infinity' ) {
          degat = 20
        } else if( projectile.type === 'double' || 
                   projectile.type === 'multishot' ||
                   projectile.type === 'shield'
        ) {
          degat = 20
        } else {
          degat = 10
        }
          

        if (enemy.radius - degat > 5) {   // alive
          score += degat * 10;  
          gsap.to(enemy, {
            radius: enemy.radius - degat,
          });

        } else { // kill confirmed
          if (enemy.type === 'boss') {
            playSound('boss') 
            addPassives()
            score += 1000;
          } else if(enemy.type === 'lucky') {
            playSound('explosive') 
            addBonus()
            score += 500;
          } else {
            playSound('explosive')
            score += 250;
          }
          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
          }, 0);
        }

        // Remove or Not projectile
        setTimeout(() => {
          if ( (projectile.type === 'normal') || 
               (projectile.type === 'double') ||
               (projectile.type === 'multishot') ||
               (projectile.type === 'rocket' && enemy.type === 'boss') 
          ){
            projectiles.splice(projectileIndex, 1);
          } 
        }, 0);
        scoreEl.innerText = score;
      }
    });  // PROJECTILES Block



    // Check and update difficulty base on score
    // reset Mob Spawn speed
    let ilvl = Math.floor( score / (2000 + speed*difficultyBase) );
    if (lvl < ilvl) {
      lvl = ilvl
      if(speed < speedMax) speed = lvl
      clearInterval(ennemyLoop);      // Clear the existing interval
      spawnEnemiesLoop()              // Call with new Interval
      difficultyEl.innerHTML = lvl;
      if (lvl % 3 === 0) spawnEnemy('boss')
      // if ([0, 1, 2, 3, 6, 9].includes(lvl)) spawnEnemy('boss')
    } 



    // -------------------------------------------------
    // END GAME
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

      setTimeout(() => {
        gsap.to(player, {
          radius: 0
        });
        enemies.splice(enemyIndex, 1);
      }, 70);
      player.status = 'dead'

      // GAMEOVER + SCORE 
      setTimeout(() => {
        isPlay = false
        cancelAnimationFrame(animationId);
        fadeGameBoard()
      }, 1500);
    }


    enemy.update();  // re-Drawn ennemy !
  }); // ENEMIES Block
}



// -------------------------------------------------------------
// SHOTS
// -------------------------------------------------------------
const shooter = (x, y, type = 'normal') => {
  const angle = Math.atan2(y - player.y, x - player.x);
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };

  // create new projectile
  let color = 'white'
  let radius = 3
  if (type === 'rocket') {
      color = 'red'
      radius = 10
      rocketEl.innerHTML = --munition.rocketBullet;
  } else if (type === 'infinity') {
      color = 'green'
      radius = 3
      infinityEl.innerHTML = --munition.infinityBullet;
  } else if (type === 'double') {
     color = 'yellow'
  }

  let projectile = new Projectile(player.x, player.y, radius, color, velocity, type);
  projectiles.push(projectile);
}

// loopShoot for Infinity Bullet
function loopShoot(projectile) {
  const angle = Math.atan2(projectile.y - player.y, projectile.x - player.x);
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  // projectile.velocity = velocity
  projectile = new Projectile(player.x, player.y, 3, 'green', velocity, 'infinity');
  projectiles.push(projectile);
}

const doubleShot = (x, y) => {
  shooter(x, y, 'double')
  playSound('gunshot')
  setTimeout(() => {
    shooter(x, y, 'double')
    playSound('gunshot')
  }, 100)
}

const multiShot = (x, y) => {
  let angle, velocity, color, radius, yy = y - 2*10

  playSound('gunshot')
  for(let i = 0; i < 5; i++) {
    yy += i*10
    angle = Math.atan2(yy - player.y, x - player.x);
    velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5,
    };

    color = 'yellow'  // yellow
    radius = 2

    let projectile = new Projectile(player.x, player.y, radius, color, velocity, 'multishot');
    projectiles.push(projectile);
  }
}

const shieldUp = () => {
  const velocity = {x: 0, y: 0}
  // create new projectile
  const type = 'shield'
  let color = '#e50faf9c' // violet
  let radius = 3

  let shield1 = new Projectile(player.x, player.y, radius, color, velocity, type, 0, 200);
  let shield2 = new Projectile(player.x, player.y, radius, color, velocity, type, 180, 200);
  let shield3 = new Projectile(player.x, player.y, radius, color, velocity, type, 360, 200);
  projectiles.push(shield1);
  projectiles.push(shield2);
  projectiles.push(shield3);
}

// -------------------------------------------------------------
// ACTION
// -------------------------------------------------------------
// click listener to add a new projectile in direction of the mouse pointer
window.addEventListener("click", (event) => {
  if(!isPaused) {
    let x = event.clientX
    let y = event.clientY 
    if (munition.rocketBullet > 0) {
      shooter(x, y, 'rocket')
      playSound('rocket')
    }
    
  }
});

// click listener to add a new projectile in direction of the mouse pointer
window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if(!isPaused) {
      let x = event.clientX
      let y = event.clientY 
      let type = 'normal'
      if (munition.infinityBullet > 0) {
        shooter(x, y, 'infinity')
        playSound('infinity')  
      }
    }
});


const activeDoubleShot = () => {
  bonus.doubleShot = true
  setMsg('+ Double Shot', 'yellow')
}
const activeMultiShot = () => {
  bonus.multiShot = true
  setMsg('+ Multi Shot', 'yellow')
}
const activeShield = () => {
  bonus.shield = true
  shieldUp()
  setMsg('+ Shield', 'yellow')
}

function addPassives() {
  const randomNumber = Math.random();

  if(bonus.doubleShot && bonus.multiShot && bonus.shield) {
    addBonus()
    return
  }
  
  const randomBinary = Math.round(randomNumber); // 0 or 1
  if(!bonus.doubleShot && !bonus.multiShot && !bonus.shield) {
    const randomPassive = Math.round(randomNumber * 2); // 0 or 1 or 2
    switch (randomPassive) {
      case 0:
        activeDoubleShot()
        break;
      case 1:
        activeMultiShot()
        break;
      case 2:
        activeShield()
        break;
    }
  } else if(!bonus.doubleShot && !bonus.multiShot) {
    if(randomBinary === 0) {
      activeDoubleShot()
    } else {
      activeMultiShot()
    }
  } else if(!bonus.doubleShot && !bonus.shield) {
    if(randomBinary === 0) {
      activeDoubleShot()
    } else {
      activeShield()
    }
  } else if(!bonus.multiShot && !bonus.shield) {
    if(randomBinary === 0) {
      activeMultiShot()
    } else {
      activeShield()
    }
  } else {
    if(!bonus.doubleShot) {
      activeDoubleShot()
    } else if(!bonus.multiShot) {
      activeMultiShot()
    } else if(!bonus.shield) {
      activeShield()
    }
  }
}


function addBonus(type = 'munition') {
  let msg, color 

  if(type === 'munition') {
    const randomNumber = Math.random();
    const randomBinary = Math.round(randomNumber); // 0 or 1
    switch (randomBinary) {
      case 0:
        bonus.rocket++
        munition.rocketMax++
        msg = '+ 1 Rocket'
        color = 'red'
        break;
      case 1:
        bonus.infinity++
        infinityEl.innerHTML = ++munition.infinityBullet;
        msg = '+ 1 Infinity'
        color = 'green'
        break;
    }
    bonusEl.innerHTML = '+' + bonus.rocket + '/' + bonus.infinity

  }  
 
  setMsg(msg, color)
}


function setMsg(msgContent, color, delay = 1500) {
  msg = {msg: msgContent, color: color}
  setTimeout(() => {
    msg = {msg: '', color: ''}
  }, delay)
}

function drawMsg(directMsg = '', color = 'white', time = 1000) {
  ctx.font = "50px Comic Sans MS";
  ctx.fillStyle = directMsg !== '' ? color : msg.color;
  ctx.textAlign = "center";
  ctx.fillText(directMsg !== '' ? directMsg : msg.msg, canvas.width/2, canvas.height/2 - 200);
}

// -------------------------------------------
let isMouseOver = false;

// Check mouse state & shoot
function autoShooting() {
  if (isMouseOver && !isPaused && player.status === 'alive') {
      
      if(bonus.doubleShot && successRate(0.3)) {
        doubleShot(coords.x, coords.y)
      } else if(bonus.multiShot && successRate(0.3)) {
        multiShot(coords.x, coords.y)
      } else {
        shooter(coords.x, coords.y)
        playSound('gunshot')
      }
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
  if (!isPaused && munition.rocketBullet < munition.rocketMax)
    rocketEl.innerHTML = ++munition.rocketBullet;
}

// Mouseover event
document.addEventListener("keydown", function(event) {   
  // You can perform actions based on the pressed key
  if(event.key === ' ' && isPlay) {
    isPaused = !isPaused
    console.log(isPaused ? 'Paused' : 'Un Pause');
    if (!isPaused) {
      animate(); // If unpaused, start the animation again
    }
  } else if(event.key === 'Enter') {
    // Test
    playSound('rocket')
  }
});




// -------------------------------------------------------------
// START POINT
// -------------------------------------------------------------
startGameBtn.addEventListener("click", () => {
  init();
  fadeGameBoard() 
  addBonus()
  setTimeout(() => {
    modalEl.style.display = "none";
    animate();
  }, 700 )
  clearInterval(ennemyLoop);      // Clear the existing interval
  spawnEnemiesLoop()              // Call with new Interval
});

window.addEventListener("mousemove", (event) => {
  coords = {x: event.clientX, y: event.clientY}
});

setInterval(autoShooting, 400);
setInterval(chargeRocket, 3000);

function fadeGameBoard() {
  // isPlay = !isPlay
  if(isPlay) {
    modalEl.style.opacity = 0
    guideEl.style.opacity = 0
    setInterval(() => {
      // modalEl.style.display = "none";
      guideEl.style.display = 'none';
    }, 1000)
  } 
  else {
    if(score > bestScore) {
      bestScore = score
      bestScoreEl.innerHTML = bestScore
    }
    bigScoreEl.innerText = score;
    startGameBtnContent.innerText = "Restart";
    difficultyBig.innerHTML = 'Difficulty ' + lvl
    modalContentEl.classList.add('gameover')
    modalEl.style.opacity = 1
    modalEl.style.display = "flex";
  }
}
// -------------------------------------------------------------
// SOUND
// -------------------------------------------------------------
// Update the current slider value (each time you drag the slider handle)
volumeEl.oninput = function() {
  globalVol = this.value;
}

volumeToggleEl.addEventListener('click', () => {
  isMuted = !isMuted
  // console.log('toggle Muted: ' + isMuted)
  if(isMuted) {
    volumeToggleEl.classList.remove('bi-volume-off-fill')
    volumeToggleEl.classList.add('bi-volume-mute-fill')
  } else {
    volumeToggleEl.classList.remove('bi-volume-mute-fill')
    volumeToggleEl.classList.add('bi-volume-off-fill')
  }
})

soundtrackToggleEl.addEventListener('click', () => {
  soundTrackIsPlay = !soundTrackIsPlay
  if(soundTrackIsPlay) {
    soundtrackToggleEl.classList.remove('bi-music-note')
    soundtrackToggleEl.classList.add('bi-pause-fill')
    playSound('soundtrack')
  } else {
    soundtrackToggleEl.classList.remove('bi-pause-fill')
    soundtrackToggleEl.classList.add('bi-music-note')
    soundtrackFade()
    // soundtrack.pause()
  }
})


function playSound(type = 'gunshot') {   // Equalizer
  if(!isMuted) {
    switch (type) {
      case 'gunshot':
        playSoundDetail(gunshotSound, 0.1, 5)
        break;
      case 'rocket':
        playSoundDetail(rocketSound, 0.2, 1.5)
        break;
      case 'infinity':
        playSoundDetail(infinitySound, 0.4, 1)
        break;
      case 'explosive':
        playSoundDetail(explosiveSound, 0.2, 1.5)
        break;
      case 'boss':
        playSoundDetail(bossSound, 1, 1, 1)
        break;
      case 'self':
        playSoundDetail(selfSound, 0.3, 1)
        break;
      case 'soundtrack':
        playSoundtrack(soundtrackSound, 0.5, 1, 0, true)
        break;
      default:
        playSoundDetail(type, 0.5, 1)
        break;
    }
  }
}

function soundtrackFade() {
  let volume = 0.5 * (globalVol / 100); // Initial volume (1.0 is full volume)
  let fadeOutInterval = setInterval(function() {
      if (volume > 0) {
          volume -= 0.05; // Adjust the decrement value for different fade-out speeds
          soundtrack.volume = volume;
      } else {
          clearInterval(fadeOutInterval);
          soundtrack.pause();
          // soundtrack.volume = globalVol; // Reset the volume to its original level
      }
  }, 100); // Adjust the interval for different fade-out speeds
}

function playSoundtrack(audioSrc, volume, speed, currentTime = 0, loop = true) {
  soundtrack.volume = volume * (globalVol / 100);
  soundtrack.playbackRate = speed;
  soundtrack.currentTime = currentTime;
  soundtrack.loop = loop
  soundtrack.play();
}

function playSoundDetail(audioSrc, volume, speed, currentTime = 0, loop = false) {
    let audio = new Audio(audioSrc)
    // audio.src = audioSrc
    audio.volume = volume * (globalVol / 100);
    audio.playbackRate = speed;
    audio.currentTime = currentTime;
    audio.loop = loop
    audio.play();
}
// -------------------------------------------------------------