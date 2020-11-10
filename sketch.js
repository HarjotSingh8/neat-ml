var cnv;

function setup() {
  cnv = createCanvas(100, 100);
  //cnv.parent("canvasParent");
  centerCanvas();
  noStroke();
  frameRate(60);
  initMethods();
  //scenarioInit = null;
  XORgateGradientInit()
  //XORgateInit()
}

function draw() {
  if (scenarioDraw) {
    //noStroke()
    scenarioDraw();
    //noFill()
    //stroke(1);
    //rect(0,0,100,100)
  } else {
    //background(100);
  }
  document.getElementById("framerate").innerText = round(frameRate());
}

function centerCanvas() {
  //console.log(document.getElementById("navbar").style);
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2 + 40 / 2;
  cnv.position(x, y);
}

function windowResized() {
  //resizeCanvas(windowWidth, windowHeight - 38);
  centerCanvas();
}
