let neat;
let iterationPerGeneration = 25;
let currentIteration = 0;
let iterative = false;

//if you want more control over when the population evolves to next generation, change iterationPerGeneration to Infinity, and change nextGenerationTrigger to true to move to next generation
let nextGenerationTrigger = false;

function initializeNeat(parameters) {
  //initialize neat here
  iterative = parameters.iterative || true;
  neat = new NEAT(parameters.NEATparams);
  
}

/**
 * For non-iterative scenarios
 * iterative should be set to false
 */
function nonIterativeEvaluate(population) {
  for (var i = 0; i < population.length; i++) {
    population[i].output = neat.population[i].activate(population[i].inputs);
    if(neat.population[i].score==undefined)
    neat.population[i].score=0;
    neat.population[i].score += scenarioClass.score(population[i]);
  }
}

function nextIteration(population) {
  if (currentIteration >= iterationPerGeneration || nextGenerationTrigger) {
    nextGeneration();
    return;
  }
  for (var i = 0; i < population.length; i++) {
    //evaluate
    neat.population[i].score = this.population.score;
    if (population[i].completed) {
      continue;
    }
    if (population[i].alive) {
      //give inputs to the corresponding network
      population[i].output = neat.population[i].activate(population[i].inputs);
    }
  }
  //this function will evaluate for next iteration in applications where execution is performed in iterations
}

function nextGeneration(population) {
  //this function will move on to next generation
  scenarioReset();
  neat.evolve();
}
