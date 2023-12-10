// Get the canvas and its context
const canvas = document.querySelector("#container-game");
canvas.width = innerWidth;
canvas.height = innerHeight;
const ctx = canvas.getContext('2d');


// Object to be moved
const object = {
    // x: canvas.width / 2,
    // y: canvas.height / 2,
    x: 0,
    y: canvas.height / 2,
    radius: 20,
    angle: 0,
    // speed: 0.1,
    speed: 0.02,
};

// Destination point
const destination = {
    x: 380,
    y: 100,
};

// // Animation variables
let t = 0;
const speed = 0.00005;

function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the circular path
    // ctx.beginPath();
    // ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, 2 * Math.PI);
    // ctx.fillStyle = 'white';
    // ctx.stroke();

    // Draw the moving object
    ctx.beginPath();
    ctx.arc(object.x, object.y, object.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'blue';
    ctx.fill();

    // Update object position in a circular path
    // object.x = 0 + Math.cos(object.angle) * 500;
    object.x = canvas.width / 2 + Math.cos(object.angle) * 200;
    object.y = canvas.height / 2 + Math.sin(object.angle) * 200;

    // Increment angle for the next frame
    object.angle += object.speed;

    // Request the next frame
    requestAnimationFrame(draw);
}

// Start the animation
draw();