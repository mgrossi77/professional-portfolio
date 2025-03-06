let nodes = [];
let centralPortrait;
let achievementImages = {};
let connectionDistance = 280;

function preload() {
  // Load images with error handling
  const loadImageSafe = (path, name) => {
    return loadImage(path,
      () => console.log(`${name} loaded successfully`),
      (err) => console.error(`Error loading ${name}:`, err)
    );
  };

  centralPortrait = loadImageSafe('assets/my-portrait.jpg', 'Central Portrait');
  
  achievementImages = {
    masters: loadImageSafe('assets/masters.png', 'Masters'),
    cern: loadImageSafe('assets/cern.png', 'CERN'),
    mit: loadImageSafe('assets/mit.jpg', 'MIT'),
    xprize: loadImageSafe('assets/xprize.jpg', 'XPrize'),
    skills: loadImageSafe('assets/skills.jpg', 'Skills'),
    harvard: loadImageSafe('assets/harvard.jpg', 'Harvard'),
    satellite: loadImageSafe('assets/satellite.jpg', 'Satellite'),
    solar: loadImageSafe('assets/solar.jpg', 'Solar'),
    electro: loadImageSafe('assets/electro.jpg', 'Electro')
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Create achievement nodes in circular formation
  const achievementKeys = Object.keys(achievementImages);
  const radius = min(width, height) * 0.35;
  
  achievementKeys.forEach((key, index) => {
    const angle = map(index, 0, achievementKeys.length, 0, TWO_PI);
    const img = achievementImages[key];
    
    nodes.push({
      position: createVector(
        width/2 + radius * cos(angle),
        height/2 + radius * sin(angle)
      ),
      velocity: p5.Vector.random2D().mult(0.3),
      image: img,
      baseSize: 220,
      pulseSpeed: random(0.02, 0.04),
      angle: angle,
      orbitSpeed: random(-0.005, 0.005)
    });
  });

  // Create free plexus dots
  for(let i = 0; i < 100; i++) {
    nodes.push({
      position: createVector(random(width), random(height)),
      velocity: p5.Vector.random2D().mult(0.2),
      size: random(5, 10),
      color: color(
        random(150, 200),
        random(150, 220),
        255,
        150
      ),
      pulseSpeed: random(0.05, 0.1)
    });
  }

  console.log(`Initialized ${nodes.length} nodes`);
}

function draw() {
  background(25);
  
  // Draw central portrait
  imageMode(CENTER);
  const portraitSize = min(width/4, 300);
  const portraitHeight = (centralPortrait.height/centralPortrait.width) * portraitSize;
  image(centralPortrait, width/2, height/2, portraitSize, portraitHeight);

  nodes.forEach(node => {
    updateNode(node);
    drawNode(node);
    drawConnections(node);
  });
}

function updateNode(node) {
  if(node.image) {
    // Update orbital position
    node.angle += node.orbitSpeed;
    const radius = min(width, height) * 0.35;
    const targetX = width/2 + radius * cos(node.angle);
    const targetY = height/2 + radius * sin(node.angle);
    
    // Smooth movement towards target
    node.position.x = lerp(node.position.x, targetX, 0.1);
    node.position.y = lerp(node.position.y, targetY, 0.1);
    
    // Repulsion between images
    nodes.forEach(other => {
      if(other.image && other !== node) {
        const d = dist(node.position.x, node.position.y, other.position.x, other.position.y);
        if(d < 150) {
          const repel = p5.Vector.sub(node.position, other.position)
            .normalize()
            .mult(0.5);
          node.position.add(repel);
        }
      }
    });
  } else {
    // Update free dots
    node.position.add(node.velocity);
    if(node.position.x < 0 || node.position.x > width) node.velocity.x *= -1;
    if(node.position.y < 0 || node.position.y > height) node.velocity.y *= -1;
  }
}

function drawNode(node) {
  push();
  translate(node.position.x, node.position.y);
  
  if(node.image) {
    // Draw pulsing image
    const pulse = 1 + 0.8 * sin(frameCount * node.pulseSpeed);
    const imgWidth = node.baseSize * pulse;
    const imgHeight = (node.image.height/node.image.width) * imgWidth;
    
    imageMode(CENTER);
    image(node.image, 0, 0, imgWidth, imgHeight);
  } else {
    // Draw free dot
    noStroke();
    fill(node.color);
    ellipse(0, 0, node.size);
  }
  pop();
}

function drawConnections(node) {
  strokeWeight(node.image ? 2.5 : 1.5);
  
  nodes.forEach(other => {
    if(node !== other) {
      const d = dist(node.position.x, node.position.y, other.position.x, other.position.y);
      if(d < connectionDistance) {
        const alpha = map(d, 0, connectionDistance, 80, 10);
        
        if(node.image || other.image) {
          stroke(100, 200, 255, alpha);
        } else {
          stroke(150, 150, 150, alpha);
        }
        line(node.position.x, node.position.y, other.position.x, other.position.y);
      }
    }
  });

  // Connect images to center
  if(node.image) {
    stroke(200, 100, 255, 50);
    line(width/2, height/2, node.position.x, node.position.y);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
