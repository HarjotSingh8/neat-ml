class Scenario {
  constructor(scenarioParameters) {
    this.scenarioParameters = {
      //if shared episodes is true, then each individual will have identical sets of data for episodes in a generation
      sharedEpisodes: scenarioParameters.sharedEpisodes || true,
      populationSize: scenarioParameters.populationSize || 10,
      episodeLength: scenarioParameters.episodeLength || 1,
      episodesPerGeneration: scenarioParameters.episodesPerGeneration || 10,
      trainingDataSchema: scenarioParameters.trainingDataSchema || {
        a: { min: 0, max: 1 },
        b: { min: 0, max: 1 },
      },
      randomizeTrainingDataEveryGeneration:
        scenarioParameters.randomizeTrainingDataEveryGeneration || false,
      iterative: scenarioParameters.iterative || false,
    };
    this.scenarioVariables = scenarioParameters.scenarioVariables;
    this.currentIndividual = 0;
    this.generation = 0;
    this.population = [];
    this.trainingData = scenarioParameters.trainingData || [];
    this.trained = false;
    this.initPopulation();
    //if (this.scenarioParameters.iterative)
    this.activeIndividuals = Array.from(
      { length: this.scenarioParameters.populationSize },
      (_, i) => i
    );
    this.avgEpisodeDuration = 0;
    this.bestScore = 0;
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
        episode: 0,
        inputs: [...this.trainingData[0]],
        outputs: null,
        data: null,
        iteration: 0,
        score: 0,
        totalIterations: 0,
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
      this.trainingData.length != this.scenarioParameters.episodesPerGeneration
    ) {
      this.trainingData = [];
      for (var i = 0; i < this.scenarioParameters.episodesPerGeneration; i++) {
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
    this.avgEpisodeDuration = 0;
    this.activeIndividuals = Array.from(
      { length: this.scenarioParameters.populationSize },
      (_, i) => i
    );
    for (var i = 0; i < this.scenarioParameters.populationSize; i++) {
      this.population[i].score = 0;
      neat.population[i].score = 0;
      this.population[i].iteration = 0;
      this.population[i].episode = 0;
      this.population[i].alive = true;
      this.population[i].totalIterations = 0;
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
  runIteration(individual, actions) {
    //console.log(actions[0]);
    //actions are outputs of ML
    var x = individual.inputs[0];
    var x_dot = individual.inputs[1];
    var theta = individual.inputs[2];
    var theta_dot = individual.inputs[3];
    var force = this.scenarioVariables.force_mag * actions[0] > 0 ? 1 : -1;
    var costheta = Math.cos(theta);
    var sintheta = Math.sin(theta);
    //console.log(force);
    //console.log([x, x_dot, theta, theta_dot, force, costheta, sintheta]);
    var temp =
      (force +
        this.scenarioVariables.polemass_length *
          Math.pow(theta_dot, 2) *
          sintheta) /
      this.scenarioVariables.total_mass;
    //console.log(this.scenarioVariables.polemass_length);
    var thetaacc =
      (this.scenarioVariables.gravity * sintheta - costheta * temp) /
      (this.scenarioVariables.length *
        (4.0 / 3.0 -
          (this.scenarioVariables.masspole * Math.pow(costheta, 2)) /
            this.scenarioVariables.total_mass));
    var xacc =
      temp -
      (this.scenarioVariables.polemass_length * thetaacc * costheta) /
        this.scenarioVariables.total_mass;

    if (this.scenarioVariables.kinematics_integrator == "euler") {
      x = x + this.scenarioVariables.tau * x_dot;
      x_dot = x_dot + this.scenarioVariables.tau * xacc;
      theta = theta + this.scenarioVariables.tau * theta_dot;
      theta_dot = theta_dot + this.scenarioVariables.tau * thetaacc;
    } else {
      // semi-implicit euler
      x_dot = x_dot + this.scenarioVariables.tau * xacc;
      x = x + this.scenarioVariables.tau * x_dot;
      theta_dot = theta_dot + this.scenarioVariables.tau * thetaacc;
      theta = theta + this.scenarioVariables.tau * theta_dot;
    }
    //console.log(theta);
    individual.inputs = [x, x_dot, theta, theta_dot];
    var done =
      x < -this.scenarioVariables.x_threshold ||
      x > this.scenarioVariables.x_threshold ||
      theta < -this.scenarioVariables.theta_threshold_radians ||
      theta > this.scenarioVariables.theta_threshold_radians
        ? true
        : false;
    if (
      x < -this.scenarioVariables.x_threshold ||
      x > this.scenarioVariables.x_threshold ||
      theta < -this.scenarioVariables.theta_threshold_radians ||
      theta > this.scenarioVariables.theta_threshold_radians
    ) {
      //console.log("done");
    }
    var reward;
    if (!done) {
      reward = 1;
      individual.totalIterations += 1;
    } else {
      //console.log("dead");
      individual.alive = false;
      reward = 0;
    }
    return reward;
  }
  step() {
    //console.log(this.activeIndividuals);
    // console.log(neat);
    var index;

    //console.log([this.population[0].inputs[0], this.population[0].inputs[2]]);
    this.drawEveryIteration();
    //console.log(this.activeIndividuals.length);
    if (this.activeIndividuals.length == 0) {
      neat.sort();
      console.log(neat.population[0].score);
      console.log(neat);
      this.generation++;
      document.getElementById("generation").innerText = this.generation;
      //if (this.generation % 1 == 0) this.drawEveryGeneration();
      if (this.generation == 20) {
        noLoop();
        this.resetPopulation();
        return;
      }
      neat.evolve();

      this.resetPopulation();
    }
    for (var i = this.activeIndividuals.length - 1; i >= 0; i--) {
      index = this.activeIndividuals[i];
      //console.log(index);

      //if episode is completed
      if (
        !this.population[index].alive ||
        this.population[index].iteration > this.scenarioParameters.episodeLength
      ) {
        this.population[index].alive = true;
        this.population[index].episode++;
        this.population[index].iteration = 0;
        if (
          this.population[index].episode <
          this.scenarioParameters.episodesPerGeneration
        )
          this.population[index].inputs = [
            ...this.trainingData[this.population[index].episode],
          ];
      }

      //if all episodes for an individual for a generation are completed
      if (
        this.population[index].episode >
        this.scenarioParameters.episodesPerGeneration
      ) {
        this.activeIndividuals.splice(i, 1);
      } else {
        this.population[index].iteration += 1;
        neat.population[index].score += this.runIteration(
          this.population[index],
          neat.population[index].activate(this.population[index].inputs)
        );
        if (neat.population[index].score > this.bestScore) {
          this.bestScore = neat.population[index].score;
          document.getElementById("bestScore").innerText =
            this.bestScore +
            "/" +
            (this.scenarioParameters.episodesPerGeneration + 1) *
              (this.scenarioParameters.episodeLength + 1);
        }
        //console.log("yolo");
        //neat.population[index].score += this.score(this.population[index]);
      }
    }
    /*
    for (var i = 0; i < this.scenarioParameters.populationSize; i++) {
      for (var j = 0; j < this.scenarioParameters.episodesPerGeneration; j++) {
        neat.population[i].score += this.score(
          this.trainingData[j],
          neat.population[i].activate(this.trainingData[j])[0]
        );
      }
    }
    neat.sort();
    this.generation++;
    if (this.generation % 1 == 0) this.drawEveryGeneration();
    neat.evolve();
    //console.log("generation");
    //console.log("generation" + this.generation);
    //console.log(neat.population[0]);
    this.resetPopulation();*/
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
    var d = Math.abs(inputs[0] - inputs[1]);
    d = Math.abs(d - output) + 0.1;
    return 1 / d;
  }
  /**
   * Draw Every Iteration
   * This function will vary with scenario
   * manages drawing on the canvas
   */
  drawEveryIteration() {
    //let index = this.scenarioParameters.populationSize - 1;
    let index = this.activeIndividuals[0] || 0;

    if (!this.population[index].alive) {
      background(255, 0, 0);
      return;
    }
    var screen_width = 100;
    var screen_height = 100;
    var screen_offset_x = 0;
    var screen_offset_y = 0;
    var world_width = this.scenarioVariables.x_threshold * 2;
    var scale = screen_width / world_width;

    var polewidth = 10;
    var polelen = scale * (2 * this.scenarioVariables.length);
    var cartwidth = 0.5;
    var cartheight = 0.3;
    var carty = 100 - cartheight * scale;
    //cart
    background(0);
    fill(0);
    stroke(255, 0, 0);
    //console.log(this.population[0]);

    rect(
      (this.population[index].inputs[0] - cartwidth / 2) * scale +
        screen_width / 2,
      carty,
      cartwidth * scale,
      cartheight * scale
    );
    //pole
    stroke(255, 255, 255);
    strokeWeight(1);

    line(
      this.population[index].inputs[0] * scale + screen_width / 2,
      carty,
      this.population[index].inputs[0] * scale +
        scale * polelen * Math.sin(this.population[index].inputs[2]) +
        screen_width / 2,
      carty -
        Math.abs(scale * polelen * Math.cos(this.population[index].inputs[2]))
    );
  }
  /**
   * Draw Every Genration
   * This function varies with scenario
   */
  drawEveryGeneration() {}
}

function scenarioInit() {
  background(0);
  var pop = 100;
  initializeNeat({
    iterative: false,
    NEATparams: {
      input: 4,
      output: 1,
      populationCount: pop,
      mutationRate: 1,
      maxNodes: 10,
      safePopulationPercent: 0.2,
      exported: false,
    },
  });
  let gravity = 9.8;
  let masscart = 1.0;
  let masspole = 0.1;
  let total_mass = masspole + masscart;
  let length = 0.5; // actually half the pole's length
  let polemass_length = masspole * length;
  let force_mag = 10.0;
  let tau = 0.02; // seconds between state updates
  let kinematics_integrator = "euler";

  // Angle at which to fail the episode
  let theta_threshold_radians = (12 * 2 * Math.PI) / 360;

  let x_threshold = 2.4;
  scenarioClass = new Scenario({
    populationSize: pop,
    episodesPerGeneration: 10,
    episodeLength: 500,
    trainingDataSchema: {
      cartPosition: { min: -0.45, max: 0.45 },
      cartVelocity: { min: -0.05, max: 0.05 },
      theta: { min: -0.05, max: 0.05 },
      theta_dot: { min: -0.05, max: 0.05 },
    },
    scenarioVariables: {
      resolution: 50,
      gravity: gravity,
      masscart: masscart,
      masspole: masspole,
      total_mass: total_mass,
      length: length,
      polemass_length: polemass_length,
      force_mag: force_mag,
      tau: tau,
      kinematics_integrator: kinematics_integrator,
      theta_threshold_radians: theta_threshold_radians,
      x_threshold: x_threshold,
    },
  });
}
