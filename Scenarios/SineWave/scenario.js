class Scenario {
  constructor(scenarioParameters) {
    this.scenarioParameters = {
      //if useTrainingSets==true, the population will share data from same pool of training data
      //if useTrainingDataPool==false, the population will use newly generated random data for each iteration
      useTrainingDataPool: scenarioParameters.useTrainingDataPool || true,
      populationSize: scenarioParameters.populationSize || 10,
      scenarioLength: 1,
      trainingIterationsPerGeneration:
        scenarioParameters.trainingIterationsPerGeneration || 10,
      trainingDataSchema: scenarioParameters.trainingDataSchema || {
        a: { min: 0, max: 2 * Math.PI },
      },
      randomizeTrainingDataEveryGeneration:
        scenarioParameters.randomizeTrainingDataEveryGeneration || false,
      iterative: scenarioParameters.iterative || false,
    };
    this.generation = 0;
    this.population = [];
    this.trainingData = scenarioParameters.trainingData || [];
    this.activeIndividuals = [];
    this.trained = false;
    this.initPopulation();
    //console.log(this.population[0]);
  }
  /**
   * Init Population
   * This function will not vary with scenario
   */
  initPopulation() {
    var data = {};
    for (var i in this.scenarioParameters.trainingDataSchema) {
      data[i] = 0;
    }
    if (
      this.scenarioParameters.randomizeTrainingDataEveryGeneration == true ||
      this.trainingData.length == 0
    )
      this.randomizeTrainingData();
    for (var i = 0; i < this.scenarioParameters.populationSize; i++) {
      this.population.push({
        id: i,
        alive: true,
        generationCompleted: false,
        trainingCompleted: false,
        trainingIndex: 0,
        inputs: { ...this.trainingData[0] },
        outputs: null,
        data: null,
        iteration: 0,
        score: 0,
      });
    }
  }
  /**
   * Random Training Data
   * This function will not vary with scenario
   * This function generates one set of randomised training data
   */
  randomTrainingData() {
    var temp = [];
    for (var i in this.scenarioParameters.trainingDataSchema) {
      temp.push(
        random(
          this.scenarioParameters.trainingDataSchema[i].min,
          this.scenarioParameters.trainingDataSchema[i].max
        )
      );
    }
    return temp;
  }
  /**
   * Randomize Training Data
   * This function will not vary with scenario,
   * Randomizes entire training data
   */
  randomizeTrainingData() {
    if (
      this.scenarioParameters.randomizeTrainingDataEveryGeneration ||
      this.trainingData.length !=
        this.scenarioParameters.trainingIterationsPerGeneration
    ) {
      this.trainingData = [];
      for (
        var i = 0;
        i < this.scenarioParameters.trainingIterationsPerGeneration;
        i++
      ) {
        var temp = this.randomTrainingData();
        this.trainingData.push(temp);
      }
    }
  }
  /**
   * Evaluate
   * This function will not vary with scenario,
   * check scenario parameters instead to make this function suit your needs
   * Evaluates a generation
   */
  evaluate() {
    for (var i = 0; i < this.scenarioParameters.populationSize; i++) {
      this.population[i].score += this.evaluateIndividual();
      this.population[i].iteration += 1;
      this.population[i];
    }
  }
  /**
   * Evaluate Individual
   * This function will not vary with scenario,
   * Evaluates an individual
   */
  evaluateIndividual(index) {
    let inputs = [];
    for (var i in this.population[index].trainingData) {
      inputs.push(this.population[index].trainingData[i]);
    }
    let outputs = neat.population[index].activate(inputs);
    //evaluate neat and get its outputs here
    this.step(this.population[index], outputs);
    return score;
  }
  /**
   * Reset Population
   * This function will not vary with scenario,
   * check scenario parameters instead to make this function suit your needs
   * Resets Population
   */
  resetPopulation() {
    for (var i = 0; i < this.scenarioParameters.populationSize; i++) {
      this.population[i].score = 0;
      neat.population[i].score = 0;
      this.population[i].iteration = 0;
      this.population[i].trainingIndex = 0;
      this.population[i].alive = true;
    }
    if (this.scenarioParameters.randomizeTrainingDataEveryGeneration == true)
      this.randomizeTrainingData();
    for (var i = 0; i < this.scenarioParameters.populationSize; i++) {
      this.population[i].trainingIndex = 0;
      this.population[i].inputs = { ...this.trainingData[0] };
    }
  }
  train() {
    //if (this.generationCompleted) {
    //  this.nextGeneration();
    //} else {
    this.step();
    this.draw();
    //}
  }
  /**
   * Step
   * This function will vary with scenario
   * One step of evaluation
   */
  step() {
    for (var i = 0; i < this.scenarioParameters.populationSize; i++) {
      for (
        var j = 0;
        j < this.scenarioParameters.trainingIterationsPerGeneration;
        j++
      ) {
        neat.population[i].score += this.score(
          this.trainingData[j],
          neat.population[i].activate(this.trainingData[j])[0]
        );
      }
    }
    neat.sort();
    this.generation++;
    if (this.generation % 2 == 0) this.drawEveryGeneration();
    neat.evolve();
    //console.log("generation");
    //console.log("generation" + this.generation);
    //console.log(neat.population[0]);
    this.resetPopulation();
    /*
    console.log("step");
    if (this.generation > 100) {
      noLoop();
    }
    if (!this.trained) {
      var completedCount = 0;
      for (var i = 0; i < this.scenarioParameters.populationSize; i++) {
        //go through population
        if (this.population[i].alive) {
          //is alive/remaining steps
          //evaluate
          //add score
          this.population[i].outputs = neat.population[i].activate(
            this.trainingData[this.population[i].iteration]
          );
          //console.log(this.score(i));
          //console.log(neat.population[i].score);

          neat.population[i].score += this.score(i);

          this.population[i].iteration++;
          if (
            this.population[i].iteration >=
            this.scenarioParameters.scenarioLength
          ) {
            this.population[i].alive = false;
          }
        } else {
          //is dead/completed steps for current inputs
          if (
            this.population[i].trainingIndex <
            this.scenarioParameters.trainingIterationsPerGeneration
          ) {
            this.population[i].trainingIndex++;
            this.population[i].inputs = {
              ...this.trainingData[this.population[i].trainingIndex],
            };
            //more training data sets remain for this generation
            //proceed to next training set
          } else {
            //training data sets for this generation are completed
            //if every index is complete, then next generation
            completedCount++;
          }
        }
      }
      if (completedCount == this.scenarioParameters.populationSize) {
        neat.sort();

        this.generation++;
        if (this.generation % 2 == 0) this.drawEveryGeneration();
        neat.evolve();
        console.log("generation");
        //console.log("generation" + this.generation);
        //console.log(neat.population[0]);
        this.resetPopulation();
      }
    }*/
  }
  /**
   * Score
   * This function will vary with scenario
   * Calculates score from current situation
   */
  score(inputs, output) {
    var x = Math.sin(inputs[0]);
    x = Math.abs(x - output) + 0.1;
    return 1 / x;
    /*var a = this.trainingData[this.population[individual].iteration][0];
    var b = this.trainingData[this.population[individual].iteration][1];
    var score = Math.abs(a - b);
    var score = 100 * Math.abs(score - this.population[individual].outputs[0]);
    var score = 1 / (score + 0.1);
    return score;*/
  }
  /**
   * Draw Every Iteration
   * This function will vary with scenario
   * manages drawing on the canvas
   */
  drawEveryIteration() {}
  /**
   * Draw Every Genration
   * This function varies with scenario
   */
  drawEveryGeneration() {
    /*console.log(
      0 + " " + 0 + " " + neat.population[0].activate([0 / 100, 0 / 100])[0]
    );
    console.log(
      1 + " " + 0 + " " + neat.population[0].activate([1 / 100, 0 / 100])[0]
    );
    console.log(
      0 + " " + 1 + " " + neat.population[0].activate([0 / 100, 1 / 100])[0]
    );
    console.log(
      1 + " " + 1 + " " + neat.population[0].activate([1 / 100, 1 / 100])[0]
    );*/
    background(0);
    if (this.trained) {
      console.log(this.generation);
      var resolution = 1;
    } else {
      var resolution = 5;
    }
    for (var i = 0; i < 100; i += resolution) {
      var j =
        neat.population[0].activate([(2 * Math.PI * i) / 100])[0] * 50 + 50;
      fill(255);
      rect(i, j, resolution, resolution);
    }

    if (this.trained) {
      noLoop();
    }
    this.trained = true;
    for (
      var i = 0;
      i < this.scenarioParameters.trainingIterationsPerGeneration;
      i++
    ) {
      var x = neat.population[0].activate(this.trainingData[i])[0];
      var y = Math.sin(this.trainingData[i][0]);
      x = Math.abs(x - y);
      if (x < 0.001) {
        fill(0, 255, 0);
        rect(Math.floor(this.trainingData[i][0] / 3.6), x, 1, 1);
      } else {
        fill(255, 0, 0);
        rect(Math.floor(this.trainingData[i][0] / 3.6), x, 1, 1);
        this.trained = false;
      }
    }
    //checking if trained
  }
}

function scenarioInit() {
  background(0);
  var pop = 100;
  initializeNeat({
    iterative: false,
    NEATparams: {
      input: 2,
      output: 1,
      populationCount: pop,
      mutationRate: 1,
      maxNodes: 10,
      safePopulationPercent: 0.2,
      exported: false,
    },
  });
  scenarioClass = new Scenario({
    populationSize: pop,
    trainingIterationsPerGeneration: 10,
    /*trainingData: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
      [0.5, 0.5],
    ],*/
  });
}
