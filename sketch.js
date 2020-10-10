var cnv;

function setup() {
  cnv = createCanvas(windowWidth, windowHeight - 38);
  //cnv.parent("canvasParent");
  centerCanvas();
  noStroke();
  frameRate(30);
}

function draw() {
  background(100);
  ellipse(mouseX, mouseY, 20, 20);
  document.getElementById("framerate").innerText = round(frameRate());
}

function centerCanvas() {
  //console.log(document.getElementById("navbar").style);
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2 + 40 / 2;
  cnv.position(x, y);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - 38);
  centerCanvas();
}
