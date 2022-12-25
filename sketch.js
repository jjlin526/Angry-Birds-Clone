// Example is based on examples from: http://brm.io/matter-js/, https://github.com/shiffman/p5-matter
// add also Benedict Gross credit

var Engine = Matter.Engine;
var Render = Matter.Render;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;
var Constraint = Matter.Constraint;
var Mouse = Matter.Mouse;
var MouseConstraint = Matter.MouseConstraint;

var engine;
var propeller;
var boxes = [];
var birds = [];
// Store colors for each bird generated
var birdColors = [];
var colors = [];
var ground;
var slingshotBird, slingshotConstraint;
var angle = 0;
var angleSpeed = 0;
var canvas;

// Player cursor
let gameCursor;
let redEnemy;

// Gradient colors for canvas background
let darkGradientColor;
let lightGradientColor;

// Fade animation for instructions
var fade;
var fadeAmount;

// Time left to knock over blocks
var timeRemaining;

// Number of blocks left to knock out
var blocksRemaining;

// Track if timer should be stopped
var stopTimer;

// Determine if collision with enemy has occurred
var enemyCollisionDetected;

// Determine if the player has won the game
var isVictorious;

// Moving enemy attributes
let enemyXPosition;
let enemyYPosition;
let enemyXSpeed;
let enemyYSpeed;
let enemyRadius;

function preload() {
  // Moving enemy
  redEnemy = loadImage("impostor.png");
  // Target cursor
  gameCursor = loadImage("gameCursor.png");
}

////////////////////////////////////////////////////////////
function setup() {
  canvas = createCanvas(1000, 600);

  // Initialize fade and fade rate to baseline values
  fade = 255;
  fadeAmount = 4;

  // Initialize timer to 60 seconds
  timeRemaining = 60;

  // Timer should count down by default
  stopTimer = false;

  // Initialize starting number of blocks
  blocksRemaining = 18;

  // Collision has not occurred by default
  enemyCollisionDetected = false;

  // Player has not won by default
  isVictorious = false;

  // Set up enemy properties for initial position and movement
  enemyXPosition = 900;
  enemyYPosition = 80;
  enemyXSpeed = 5;
  enemyYSpeed = 2;
  enemyRadius = 25;

  engine = Engine.create(); // create an engine

  setupGround();

  setupPropeller();

  setupTower();

  setupSlingshot();

  setupMouseInteraction();

  // Decrement remaining time every second
  if (!stopTimer) setInterval(decrementTimeRemaining, 1000);
}

////////////////////////////////////////////////////////////
function draw() {
  Engine.update(engine);

  // Draw a dark to light blue background gradient
  drawBackgroundGradient();

  // Draw 'Angry Birds' title
  drawTitle();

  // Draw fade-in and fade-out game instructions
  drawGameInstructions();

  // Display number of blocks remaining below time
  displayBlocksRemaining();

  // Display 'Victory' screen if all boxes have been knocked off screen
  if (boxes.length == 0) victoryScreen();

  // Display remaining time
  displayTimeRemaining();

  fill(255);

  drawCursor();

  drawGround();

  drawPropeller();

  drawTower();

  drawBirds();

  drawSlingshot();

  // Draw moving enemy that bounces off canvas walls
  drawMovingEnemy();

  // Determine if cursor has collided with moving enemy
  detectEnemyCollision();

  // Time ran out: Game over
  if (timeRemaining == 0 || enemyCollisionDetected) gameOverScreen();
}

// Function that decrements the remaining time
function decrementTimeRemaining() {
  if (timeRemaining > 0 && !stopTimer) timeRemaining -= 1;
}

// Function that displays the remaining time in the top-left corner
function displayTimeRemaining() {
  fill(70);
  textSize(30);
  textAlign(LEFT);
  text("Time Remaining: " + timeRemaining, 10, 60);
}

// Function that displays a 'Game Over' screen when time has depleted
function gameOverScreen() {
  if (!isVictorious) {
    // Draw 'Game Over' title in center of screen
    fill(220, 20, 20);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(80);
    textStyle(BOLD);
    text("GAME OVER", 500, 300);
    enemyCollisionDetected = true;
    // Give option to play again
    playAgainScreen();
  }
}

// Function that displays a 'Victory' screen when boxes have been knocked down within time limit
function victoryScreen() {
  // Draw 'Victory' title in center of screen
  fill(20, 220, 20);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(80);
  textStyle(BOLD);
  text("VICTORY", 500, 300);
  // Give option to play again
  playAgainScreen();
  // Prevent 'Game Over' screen from triggering
  isVictorious = true;
}

// Freeze the game state and display a 'Play Again' option
function playAgainScreen() {
  textSize(65);
  fill(0);
  text("Press 'ENTER' to play again!", 500, 390);
  // Stop the timer from decrementing
  stopTimer = true;
  // Prevent enemy from continually moving after game end
  enemyXSpeed = 0;
  enemyYSpeed = 0;
}

// Draw 'Angry Birds' title
function drawTitle() {
  // Draw title in center of screen
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(36);
  textStyle(BOLD);
  text("Angry Birds", 500, 60);
}

// Draw game instructions and controls with fade-in and fade-out effects
function drawGameInstructions() {
  // Text color with reduced opacity
  fill(0, 0, 0, fade);

  // Adjust fade rate
  if (fade < 60) fadeAmount = 4;
  if (fade > 255) fadeAmount = -4;
  fade += fadeAmount;

  textSize(16);
  textAlign(LEFT);

  // Player control keyboard instructions
  text("Drag the octagon to fire it using the slingshot", 245, 115);
  text("Press 'r' to reset the ball to its initial position", 245, 140);
  text("Press 'b' to spawn a shape at your mouse position", 245, 165);
  text("Press 'left arrow' to spin propeller clockwise", 245, 190);
  text("Press 'right arrow' to spin propeller counterclockwise", 245, 215);
  textStyle(BOLD);
  fill(180, 40, 40, fade);
  // Game objective instructions
  text("Do not let your cursor touch the flying creature!", 245, 240);
  text("Remove all blocks in less than 60 seconds to win!", 245, 265);
}

// Display the number of blocks that have not been knocked out
function displayBlocksRemaining() {
  textAlign(LEFT);
  fill(color(100, 10, 10));
  textSize(20);
  text("Blocks Remaining: " + blocksRemaining, 15, 95);
}

// Determine if cursor has collided with impostor
function detectEnemyCollision() {
  // Determine if mouse is within the bounds of the enemy impostor
  if (
    mouseX > enemyXPosition - enemyRadius &&
    mouseX < enemyXPosition + enemyRadius &&
    mouseY > enemyYPosition - enemyRadius &&
    mouseY < enemyYPosition + enemyRadius
  )
    // Terminate game upon collision
    gameOverScreen();
}

// Draw moving enemy that ends game upon collision with player mouse
function drawMovingEnemy() {
  // Generate enemy
  image(
    redEnemy,
    enemyXPosition,
    enemyYPosition,
    enemyRadius * 2,
    enemyRadius * 2
  );
  // Update enemy position based on its speed in both dimensions
  enemyXPosition += enemyXSpeed;
  enemyYPosition += enemyYSpeed;
  // Prevent enemy from leaving screen in X axis by reversing direction
  if (enemyXPosition > 1000 - enemyRadius || enemyXPosition < enemyRadius) {
    enemyXSpeed = -enemyXSpeed;
  }
  // Prevent enemy from leaving screen in Y axis by reversing direction
  if (enemyYPosition > 600 - enemyRadius || enemyYPosition < enemyRadius) {
    enemyYSpeed = -enemyYSpeed;
  }
}

////////////////////////////////////////////////////////////
//use arrow keys to control propeller
function keyPressed() {
  // Left arrow increments the angular speed
  if (keyCode == LEFT_ARROW) {
    angleSpeed += 0.01;
    // Right arrow decrements the angular speed
  } else if (keyCode == RIGHT_ARROW) {
    angleSpeed -= 0.01;
  } else if (keyCode == ENTER) resetGameState();
}

// Reset the game to its default playable state
function resetGameState() {
  // Remove all current shapes internally an in physics world
  for (var i = 0; i < birds.length; ++i) {
    removeFromWorld(birds[i]);
    birds.splice(i, 1);
    birdColors.splice(i, 1);
    --i;
  }
  // Remove all current boxes internally and in physics world
  for (var i = 0; i < boxes.length; ++i) {
    removeFromWorld(boxes[i]);
    boxes.splice(i, 1);
    colors.splice(i, 1);
    --i;
  }
  // Restart game

  // Re-initialize timer to 60 seconds
  timeRemaining = 60;
  // Timer should count down by default
  stopTimer = false;
  // Re-initialize starting number of blocks
  blocksRemaining = 18;
  // Collision has not occurred by default
  enemyCollisionDetected = false;
  // Player has not won by default
  isVictorious = false;

  // Set up enemy properties for initial position
  enemyXPosition = 900;
  enemyYPosition = 80;

  // Enable enemy movement
  enemyXSpeed = 5;
  enemyYSpeed = 2;

  // Set up tower of blocks
  setupTower();
}

// Functions that draws a dark to light blue background gradient
function drawBackgroundGradient() {
  // Dark gradient color
  darkGradientColor = color(255);
  // Light gradient color
  lightGradientColor = color(mouseY, 191, 250);

  for (let currentHeight = 0; currentHeight < height; currentHeight++) {
    // Map the height of the canvas to a smaller range to blend colors
    mappedColorRange = map(currentHeight, 0, height, 0, 1);
    // Create a color gradient by interpolating from the light and dark colors
    let colorGradient = lerpColor(
      darkGradientColor,
      lightGradientColor,
      mappedColorRange
    );
    stroke(colorGradient);
    line(0, currentHeight, width, currentHeight);
  }
}

////////////////////////////////////////////////////////////
function keyTyped() {
  //if 'b' create a new bird to use with propeller
  if (key === "b") {
    setupBird();
  }

  //if 'r' reset the slingshot
  if (key === "r") {
    removeFromWorld(slingshotBird);
    removeFromWorld(slingshotConstraint);
    setupSlingshot();
  }
}

//**********************************************************************
//  HELPER FUNCTIONS - DO NOT WRITE BELOW THIS line
//**********************************************************************

//if mouse is released destroy slingshot constraint so that
//slingshot bird can fly off
function mouseReleased() {
  setTimeout(() => {
    slingshotConstraint.bodyB = null;
    slingshotConstraint.pointA = { x: 0, y: 0 };
  }, 100);
}
////////////////////////////////////////////////////////////
//tells you if a body is off-screen
function isOffScreen(body) {
  var pos = body.position;
  return pos.y > height || pos.x < 0 || pos.x > width;
}
////////////////////////////////////////////////////////////
//removes a body from the physics world
function removeFromWorld(body) {
  World.remove(engine.world, body);
}
////////////////////////////////////////////////////////////
function drawVertices(vertices) {
  beginShape();
  for (var i = 0; i < vertices.length; i++) {
    vertex(vertices[i].x, vertices[i].y);
  }
  endShape(CLOSE);
}
////////////////////////////////////////////////////////////
function drawConstraint(constraint) {
  push();
  var offsetA = constraint.pointA;
  var posA = { x: 0, y: 0 };
  if (constraint.bodyA) {
    posA = constraint.bodyA.position;
  }
  var offsetB = constraint.pointB;
  var posB = { x: 0, y: 0 };
  if (constraint.bodyB) {
    posB = constraint.bodyB.position;
  }
  strokeWeight(5);
  stroke(255);
  line(
    posA.x + offsetA.x,
    posA.y + offsetA.y,
    posB.x + offsetB.x,
    posB.y + offsetB.y
  );
  pop();
}
