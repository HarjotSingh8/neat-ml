class NEAT {
  constructor(parameters) {
    this.parameters = parameters;
    if (parameters.exported) {
      this.importFromJSON(paramters);
      return;
    }
    this.input = parameters.input; //number of inputs
    this.output = parameters.output; //number of outputs
    this.score = 0;
    //current generation number
    this.generation = parameters.generation || 0;
    //function to evaluate fitness
    this.fitness = parameters.fitness;

    //population count
    //number >= 2
    this.populationCount = parameters.populationCount || 100;
    if (this.populationCount < 2) this.populationCount = 2;

    //Crossover Methods
    //An array of all possible crossover types
    //currently disabled, might use in future
    //this.crossoverMethods = parameters.crossoverMethods;

    //To have multiple ways to select people for different scenarios
    //currently only tournament implemented
    this.parentSelectionMethod = parameters.parentSelectionMethod || {
      type: "tournament",
      size: 0.3, //size is what fraction of individuals will participate in the tournament
      randomness: 0.5, //what percentage of the sorted participating individuals have chance to get selected
    };

    // Safe Population Percent (Number [0-100))
    // Percentage of population that is safe from mutations and eliminations
    this.safePopulationPercent = parameters.safePopulationPercent || 0.1;

    // Mutation Rate (Number [0-1])
    // How much can nodes mutate
    // Less mutation means slower changes, but reaching a minima is more smoother
    // Higher mutation rate means fater changes, but organism might oscillate on reaching minima)
    this.mutationRate = parameters.mutationRate || 0.9;

    this.mutationAmount = parameters.mutationAmount || 1;
    // Fixed Topology (Bool)
    // Whether the Topology is fixed or augmentable
    //this.fixedTopology = parameters.fixedTopology;

    // Mutation Method
    // An array for possible mutation types
    this.mutationMethod = parameters.mutationMethod || methods.mutation.FFW;

    // Max Nodes
    // Number of Maximum Nodes in a network
    this.maxNodes = parameters.maxNodes || 6;

    // Max Connections
    // Number of Maximum Connections in a network
    this.maxConnections = parameters.maxConnections || Infinity;

    /**
     * generation history will be maintained in dictionaries
     * {
     *   generation:number,
     *   fittestGenome:Genome,
     *   averageFitness:number
     * }
     */
    this.generationHistory = [];

    this.initialise();
  }

  /**
   * Initialises the population pool
   * A prebuilt network can be copied if passed in arguments
   */
  initialise() {
    this.population = [];
    /**
     * If before initialisation
     * json variable exists
     * that means a pre-built network is passed
     * and that network will be copied over
     */
    //console.log(this.parameters);
    if (this.parameters.exported == true) {
      this.importFromJSON(this.parameters);
      //copy network here
    } else {
      //creating a new blank network
      for (var i = 0; i < this.populationCount; i++) {
        var newNetwork = new Network({
          input: this.input,
          output: this.output,
        });
        this.population.push(newNetwork);
      }
    }
  }

  /**
   * Mutates, Eliminates, Crossovers the population
   */
  evolve() {
    /**
     * Check if the population has executed once and has a score
     * If the population does not have a score, evaluate the population once to be able to sort the population
     */
    if (!iterative)
      if (this.population[this.population.length - 1].score == undefined) {
        this.evaluate();
      }
    this.sort();
    //console.log(this.population[0].score)
    //var fittest = Network.importFromJSON(this.population[0].exportToJSON());
    var fittest = this.population[0];
    fittest.score = this.population[0].score;
    var nextPopulation = [];

    /**
     * The portion of population to be kept safe to avoud cases where progress gets lost due to mutation
     */
    var safePopulation = [];
    var safePopulationCount = Math.floor(
      this.safePopulationPercent * this.populationCount
    );
    for (var i = 0; i < safePopulationCount; i++) {
      safePopulation.push(this.population[i]);
    }
    for (i = 0; i < this.populationCount - safePopulationCount; i++) {
      //console.log(this.getOffspring())
      nextPopulation.push(this.getOffspring());
    }

    this.population = nextPopulation;
    //console.log(nextPopulation)
    //console.log(safePopulation)
    //console.log(safePopulationCount)
    this.mutate();
    this.population.push(...safePopulation);
    this.sort();
    //reset scores
    for (var i = 0; i < this.population.length; i++) {
      this.population[i].score = undefined;
    }
    this.generation++;

    return fittest;
  }
  getOffspring() {
    var parent1 = this.getParent();
    var parent2 = this.getParent();
    //console.log(parent1)
    return NetworkcrossOver(parent1, parent2);
  }
  getParent() {
    var i;
    //switch (this.parentSelectionMethod.type) {
    //case "tournament":
    var participants = [];
    for (
      var i = 0;
      i < this.parentSelectionMethod.size * this.population.length;
      i++
    ) {
      participants.push(
        this.population[Math.floor(Math.random() * this.population.length)]
      );
    }
    //console.log(participants)
    participants.sort(function (a, b) {
      return b.score - a.score;
    });
    //console.log(participants);
    //console.log(participants[
    //  Math.floor(Math.random() * participants.length)
    //])
    return participants[Math.floor(Math.random() * participants.length)];
    //}
    //possibly could add a switch for different types of crossover if required
  }
  selectMutationMethod(genome) {
    //var mutationMethod = this.mutationMethods[
    //  Math.floor(Math.random() * this.mutationMethod.length)
    //];
    //to be completed
    //if(mutationMethod == )
    //select mutation method here
    var mutationMethod = this.mutationMethod[
      Math.floor(Math.random() * this.mutationMethod.length)
    ];

    if (
      mutationMethod === methods.mutation.ADD_NODE &&
      genome.nodes.length >= this.maxNodes
    ) {
      //if (config.warnings) console.warn('maxNodes exceeded!');
      return;
    }

    if (
      mutationMethod === methods.mutation.ADD_CONN &&
      genome.connections.length >= this.maxConns
    ) {
      if (config.warnings) console.warn("maxConns exceeded!");
      return;
    }

    if (
      mutationMethod === methods.mutation.ADD_GATE &&
      genome.gates.length >= this.maxGates
    ) {
      if (config.warnings) console.warn("maxGates exceeded!");
      return;
    }

    return mutationMethod;
  }
  mutate() {
    for (var i = 0; i < this.population.length; i++) {
      if (Math.random() <= this.mutationRate) {
        //mutate
        for (var j = 0; j < this.mutationAmount; j++) {
          var mutationMethod = this.selectMutationMethod(this.population[i]);
          //console.log(mutationMethod)
          this.population[i].mutate(mutationMethod);
        }
      }
    }
  }
  evaluate() {
    var i = 0;
    for (i = 0; i < this.population.length; i++) {
      var genome = this.population[i];
      if (this.clear) genome.clear();
      genome.score = this.fitness(genome);
    }
  }
  sort() {
    this.population.sort(function (a, b) {
      return b.score - a.score;
    });
  }
  /**
   * Returns the fittest from the population
   */
  getFittest() {
    if (this.population[this.population.length - 1].score == undefined) {
      this.evaluate();
    }
    if (this.population[0].score < this.population[1].score) {
      this.sort();
    }
    return this.population[0];
  }
  /**
   * Gets average fitness for the generation for graphs and keeping track of progress
   */
  getAverage() {
    if (this.population[this.population.length - 1].score == undefined) {
      this.evaluate();
    }
    var score = 0;
    for (var i = 0; i < this.population.length; i++) {
      score += this.population[i].score;
    }
    return score / this.population.length;
  }
  /**
   * Exports the properties and the complete population
   */
  exportToJSON() {
    var population = [];
    for (var i = 0; i < this.population.length; i++) {
      var genome = this.population[i];
      population.push(genome.exportToJSON());
    }
    this.paramters.exported = true;
    this.paramters.generationHistory = this.generationHistory;
    this.paramters.population = population;
    return this.parameters;
  }
  /**
   * Imports the properties and the complete population
   */
  importFromJSON(json) {
    var population = [];
    for (var i = 0; i < json.population.length; i++) {
      population.push(Network.importFromJSON(json.population[i]));
    }
    this.population = population;
    this.populationCount = population.length;
  }
}
