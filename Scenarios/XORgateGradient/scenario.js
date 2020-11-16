class XORgateGradient {
  constructor(population) {
    this.populationCount = population;
    this.population = [];
    this.resolution = 10;
    this.numDataPoints = 100;
    this.currentDataPoint = [];
    this.initPopulation();
  }
  initPopulation() {
    for (var i = 0; i < this.populationCount; i++) {
      var temp = {
        inputs: this.currentDataPoint,
        outputs: [],
        score: 0,
      };
      this.population.push(temp);
    }
    this.dataPoints = [];
    for (var i = 0; i < this.numDataPoints; i++) {
      if (random(0, 1) < 0.5) {
        if (random(0, 1) < 0.5)
          this.dataPoints.push([random(0, 0.49), random(0, 0.49)]);
        else this.dataPoints.push([random(0, 0.49), random(0.51, 1)]);
      } else {
        if (random(0, 1) < 0.5)
          this.dataPoints.push([random(0.51, 1), random(0, 0.49)]);
        else this.dataPoints.push([random(0.51, 1), random(0.51, 1)]);
      }
      //this.dataPoints.push([random(),random()])
    }
    //this.randomizePopulation()
  }
  randomizePopulation() {
    for (var i = 0; i < this.populationCount; i++) {
      if (random(0, 1) < 0.5) {
        if (random(0, 1) < 0.5)
          this.population[i].inputs = [random(0, 0.4), random(0, 0.4)];
        else this.population[i].inputs = [random(0, 0.4), random(0.6, 1)];
      } else {
        if (random(0, 1) < 0.5)
          this.population[i].inputs = [random(0.6, 1), random(0, 0.4)];
        else this.population[i].inputs = [random(0.6, 1), random(0.6, 1)];
      }
      //this.population[i].inputs = [random(0, 1), random(0, 1)];
    }
  }
  resetPopulation() {
    //for (var i = 0; i < this.population.length; i++) {
    //this.population[i].score = 0;
    // }
    //this.randomizePopulation();
  }
  score(x) {
    //console.log(i)
    //let x = this.population[i];
    //console.log(x)
    //var a = x.inputs[0] > 0.5 ? 1 : 0;
    //var b = x.inputs[1] > 0.5 ? 1 : 0;
    var a = x.inputs[0];
    var b = x.inputs[1];
    var c = x.output[0];
    /*var temp = 1;
    if (a == b) temp = 0;
    if (temp == 1) {
      x.score = c;
      return  c;
    } else {
      x.score = 1-c;
      return 1 - c;
    }*/
    /*if(c>1 || c<0) {
      x.score = c;
      return -1
    }
    if(a==b) {
      x.score = c;
      //if(a==1)
      return 1-c;
    }
    else {
      x.score = c;
      return c;
    }*/
    /*if(a>b){
      var t=a;
      a=b;
      b=t;
    }*/
    //console.log(a)
    //var d = 1-b-a;
    //var d = 2*Math.sqrt((0.5-b)*(0.5-b)+(0.5-a)*(0.5-a));
    var d = a - b;
    if (d < 0) {
      d *= -1;
    }
    if (c > d) {
      var t = d;
      d = c;
      c = t;
    }
    d = d - c + 0.1;
    //d=d*d+1;
    //d+=1;
    /*if(d>0.5)
    d=1
    else d=0*/
    return 1 / d;
  }
}

function scenarioDraw() {
  //for(var i=0; i<1; i++) {
  scenarioEvaluate();
  //nextGeneration(scenarioClass.population)
  // }
  /*for(var i=0; i<scenarioClass.population.length; i++) {
    fill(scenarioClass.population[i].score*255)
    //console.log(scenarioClass.population[i].score*255);
    rect(Math.floor(scenarioClass.population[i].inputs[0]*100), 
    Math.floor(scenarioClass.population[i].inputs[1]*100),1,1)
  }*/
  //if(neat.generation%1==0) {
  //if(neat.generation%100==0) {
  neat.sort();
  //document.getElementById("framerate").innerText=neat.population[0].score
  //console.log(neat.population[0].score)

  for (var i = 0; i < 100; i += scenarioClass.resolution) {
    for (var j = 0; j < 100; j += scenarioClass.resolution) {
      fill(neat.population[0].activate([i / 100, j / 100]) * 255);
      //console.log(scenarioClass.population[i].score*255);
      rect(i, j, scenarioClass.resolution, scenarioClass.resolution);
    }
  }

  //neat.population.sort()
  var count = 0;
  //var x = Math.floor(random(0,scenarioClass.populationCount/10))
  var x = 0;
  for (var i = 0; i < scenarioClass.dataPoints.length; i++) {
    var a = scenarioClass.dataPoints[i][0];
    var b = scenarioClass.dataPoints[i][1];
    var c = neat.population[x].activate([a, b]);
    //var d = scenarioClass.score(0,[a,b,c])
    fill(255, 0, 0);

    //console.log(a)
    //var d = 2*Math.sqrt((0.5-b)*(0.5-b)+(0.5-a)*(0.5-a));
    var d = a - b;
    if (d < 0) {
      d *= -1;
    }
    if (c > d) {
      var t = d;
      d = c;
      c = t;
    }
    d = d - c;

    if (d < 0.01) {
      fill(0, 255, 0);
      count++;
    } else fill(255, 0, 0);
    rect(Math.floor(a * 100), Math.floor(b * 100), 1, 1);
  }
  if (count == scenarioClass.numDataPoints) {
    noLoop();
    for (var i = 0; i < 100; i += 1) {
      for (var j = 0; j < 100; j += 1) {
        fill(neat.population[0].activate([i / 100, j / 100]) * 255);
        //console.log(scenarioClass.population[i].score*255);
        rect(i, j, 1, 1);
      }
    }
    return;
  }
  // }
  //console.log(neat.population[0].score);
  nextGeneration(scenarioClass.population);

  //noLoop();
  //console.log("yolo");
}

function scenarioInit() {
  background(0);
  var pop = 50;
  initializeNeat({
    iterative: false,
    NEATparams: {
      input: 2,
      output: 1,
      populationCount: pop,
      mutationRate: 0.9,
      maxNodes: 10,
      safePopulationPercent: 0.2,
      exported: false,
    },
  });
  scenarioClass = new XORgateGradient(pop);
  scenarioReset = () => {
    scenarioClass.resetPopulation();
  };
  scenarioScore = scenarioClass.score;
  console.log("successfully initiated");
}

function scenarioEvaluate() {
  for (var i = 0; i < scenarioClass.numDataPoints; i++) {
    scenarioClass.currentDataPoint = scenarioClass.dataPoints[i];

    for (var j = 0; j < scenarioClass.populationCount; j++) {
      scenarioClass.population[j].inputs = scenarioClass.currentDataPoint;
      //scenarioClass.population[j].inputs.push(scenarioClass.dataPoints[i][0]);
      //scenarioClass.population[j].inputs.push(scenarioClass.dataPoints[i][1]);
    }
    nonIterativeEvaluate(scenarioClass.population);
    //scenarioClass.resetPopulation();
  }
}

//function XORgateScore() {}
