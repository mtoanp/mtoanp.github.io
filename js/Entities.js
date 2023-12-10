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


  draw() {
    super.draw()
    if (this.type == "avatar") this.imageDraw()
  }
  
  imageDraw() {
    this.image = new Image();
    this.image.src = this.url;
    ctx.drawImage(this.image, 
        this.x - this.radius*1.2, 
        this.y - this.radius*1.2,
        this.radius*2.4, this.radius*2.4);
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
  constructor(x, y, radius, color, velocity, type, angle = 0, range = 100) {
    super(x, y, radius, color, velocity);
    this.type = type || "normal";
    this.angle = angle;
    this.range = range;
  }

  shield() {
    this.angle += 0.02;
    this.draw();
    this.x = canvas.width / 2 + Math.cos(this.angle ) * this.range;
    this.y = canvas.height / 2 + Math.sin(this.angle ) * this.range;
  }
}


export class Enemy extends Projectable {
  constructor(x, y, radius, color, velocity, type = 'mob', url = '') {
    super(x, y, radius, color, velocity);
    this.type = type
    this.url = url
  }

  update() {
    super.update();
    if (this.type === "lucky" || this.type === "boss") this.imageDraw()
  }

  imageDraw() {
    this.image = new Image();
    this.image.src = this.url;

    ctx.drawImage(this.image, 
        this.x - this.radius, 
        this.y - this.radius,
        this.radius*2, this.radius*2);
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
