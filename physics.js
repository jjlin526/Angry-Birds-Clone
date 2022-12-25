////////////////////////////////////////////////////////////////
function setupGround() {
  ground = Bodies.rectangle(500, 600, 1000, 40, {
    isStatic: true,
    angle: 0,
  });
  World.add(engine.world, [ground]);
}

////////////////////////////////////////////////////////////////
function drawGround() {
  push();
  fill(color(200, 80, 90));
  drawVertices(ground.vertices);
  pop();
}

// Draw a cursor graphic at the player's mouse position
function drawCursor() {
  imageMode(CENTER);
  image(gameCursor, mouseX, mouseY, 50, 50);
}

////////////////////////////////////////////////////////////////
function setupPropeller() {
  // Create a static propeller at the bottom-right corner of the screen
  propeller = Bodies.rectangle(150, 480, 200, 15, {
    isStatic: true,
    angle: angle,
  });
  // Add propeller to physics world
  World.add(engine.world, [propeller]);
}
////////////////////////////////////////////////////////////////
// updates and draws the propeller
function drawPropeller() {
  push();
  // Set propeller angle and angular velocity
  Body.setAngle(propeller, angle);
  Body.setAngularVelocity(propeller, angleSpeed);
  // Update angle based on angular velocity between frames
  angle += angleSpeed;
  // Set outline color and size
  stroke(90, 110, 180);
  strokeWeight(4);
  // Set fill color
  fill(180, 180, 250);
  // Draw propeller
  drawVertices(propeller.vertices);
  pop();
}
////////////////////////////////////////////////////////////////
function setupBird() {
  // Create a bird at the mouse location with given properties
  var bird = Bodies.polygon(mouseX, mouseY, random(1, 15), 20, {
    friction: 0,
    restitution: 0.95,
  });
  // Set mass of bird
  Matter.Body.setMass(bird, bird.mass * 10);
  // Give bird an arbitrary color
  birdColors.push(color(random(255), random(255), random(255)));
  // Add bird to internal representation and physics world
  World.add(engine.world, [bird]);
  birds.push(bird);
}
////////////////////////////////////////////////////////////////
function drawBirds() {
  push();
  // Draw each bird
  for (var i = 0; i < birds.length; ++i) {
    // Remove off-screen birds internally and from physics world
    if (isOffScreen(birds[i])) {
      removeFromWorld(birds[i]);
      birds.splice(i, 1);
      birdColors.splice(i, 1);
      // Ensure that each bird is accounted for
      --i;
    } else {
      // Assign bird a random color
      fill(birdColors[i]);
      // Draw on-screen birds
      drawVertices(birds[i].vertices);
    }
  }
  pop();
}
////////////////////////////////////////////////////////////////
//creates a tower of boxes
function setupTower() {
  // Level of box (1 - 6)
  var level = 0;
  // Number of pixels between boxes in adjacent rows and columns
  var BOX_HEIGHT = 80;
  var BOX_WIDTH = 80;

  // Create 18 boxes (6 rows, 3 columns)
  for (var i = 0; i < 18; ++i) {
    // Each box is colored a random hue of blue
    colors.push(color(random(255), random(255), 255));
    var box;
    if (i % 3 == 0) {
      // Box in first column
      box = Bodies.rectangle(
        710,
        540 - level * BOX_HEIGHT,
        BOX_WIDTH,
        BOX_HEIGHT
      );
    } else if (i % 3 == 1) {
      // Box in second column
      box = Bodies.rectangle(
        710 + BOX_WIDTH,
        540 - level * BOX_HEIGHT,
        BOX_WIDTH,
        BOX_HEIGHT
      );
    } else {
      // Box in third column
      box = Bodies.rectangle(
        710 + 2 * BOX_WIDTH,
        540 - level * BOX_HEIGHT,
        BOX_WIDTH,
        BOX_HEIGHT
      );
      // Move to higher level
      level += 1;
    }

    // Store box internally
    boxes.push(box);
    // Store box in physics world
    World.add(engine.world, [box]);
  }
}
////////////////////////////////////////////////////////////////
//draws tower of boxes
function drawTower() {
  push();
  // Create 18 boxes (6 x 3) with random hues of blue
  for (var i = 0; i < boxes.length; ++i) {
    // Remove off-screen boxes internally and from physics world
    if (isOffScreen(boxes[i])) {
      removeFromWorld(boxes[i]);
      boxes.splice(i, 1);
      colors.splice(i, 1);
      // Update number of blocks still on screen
      blocksRemaining -= 1;
      // Ensure that each box is accounted for
      --i;
    } else {
      // Assign box a random hue of blue
      fill(colors[i]);
      // Draw on-screen boxes
      drawVertices(boxes[i].vertices);
    }
  }
  pop();
}
////////////////////////////////////////////////////////////////
function setupSlingshot() {
  // Define slingshot bird properties
  var slingshotBirdOptions = { friction: 0, restitution: 0.95 };

  // Create rigid body for slingshot bird with given properties
  slingshotBird = Bodies.polygon(150, 150, 8, 25, slingshotBirdOptions);

  // Set mass of slingshot bird
  Body.setMass(slingshotBird, slingshotBird.mass * 10);

  // Create constraint between a fixed point and the slingshot bird
  slingshotConstraint = Constraint.create({
    render: {
      visible: true,
      lineWidth: 30,
      strokeStyle: "#123",
    },
    // Fixed point
    pointA: { x: 150, y: 150 },
    // Set properties of slingshot bird
    bodyB: slingshotBird,
    stiffness: 0.01,
    damping: 0.0001,
  });

  // Add slingshot bird and constraints to physics world
  World.add(engine.world, [slingshotBird, slingshotConstraint]);
}
////////////////////////////////////////////////////////////////
//draws slingshot bird and its constraint
function drawSlingshot() {
  // Set outline color and size
  stroke(90, 110, 180);
  strokeWeight(4);
  // Set fill color
  fill(180, 180, 250);
  drawVertices(slingshotBird.vertices);
  drawConstraint(slingshotConstraint);
}
/////////////////////////////////////////////////////////////////
function setupMouseInteraction() {
  var mouse = Mouse.create(canvas.elt);
  var mouseParams = {
    mouse: mouse,
    constraint: { stiffness: 0.05 },
  };
  mouseConstraint = MouseConstraint.create(engine, mouseParams);
  mouseConstraint.mouse.pixelRatio = pixelDensity();
  World.add(engine.world, mouseConstraint);
}
