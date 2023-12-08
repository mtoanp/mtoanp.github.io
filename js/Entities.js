// -------------------------------------------------------------
// CLASS
// -------------------------------------------------------------
const canvas = document.querySelector("#container-game");
const ctx = canvas.getContext("2d");

class Entity {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  // method to draw a disc inside the canvas
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}


export class Player extends Entity {
  constructor(x, y, radius, color, type = '', url = '') {
    super(x, y, radius, color);
    this.status = 'alive'
    this.type = type;
    this.url = url;
  }


  draw(munition) {
    super.draw()
    if (this.type == "image") {
      this.image = new Image();
      this.image.src = this.url;

      ctx.drawImage(this.image, 
          this.x - this.radius*0.9, 
          this.y - this.radius*0.9,
          this.radius*1.8, this.radius*1.8);
    }
    this.munitionDrawn(munition)
  }
  
  // draw(munition) {
  //   super.draw()
  //   this.munitionDrawn(munition)
  // }

  munitionDrawn(munition) {
    ctx.font = "20px Comic Sans MS";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText(munition.rocketBullet, canvas.width/2, canvas.height/2 + 7);
  }
}


class Projectable extends Entity {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color);
    this.velocity = velocity;
  }

  // method to update the position of the disc by adding the velocity to the x and y coordinates
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}


export class Projectile extends Projectable {
  constructor(x, y, radius, color, velocity, type) {
    super(x, y, radius, color, velocity);
    this.type = type || "normal";
  }
}


export class Enemy extends Projectable {
  constructor(x, y, radius, color, velocity, type) {
    super(x, y, radius, color, velocity);
    this.type = type || 'mob'
  }
}


export class Particle extends Projectable {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
    this.alpha = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}
