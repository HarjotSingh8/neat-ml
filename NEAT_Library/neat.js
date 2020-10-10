class NEAT {
  constructor(parameters) {
    this.parameters = parameters;
    if (parameters.import) {
      this.importFromJSON();
      return;
    }
    this.input = parameters.input; //number of inputs
    this.output = parameters.output; //number of outputs
    this.nodes = [];
    this.connections = [];
    this.gates = [];
    this.selfconnections = [];
    var i;
    for (i = 0; i < this.input + this.output; i++) {
      var type = i < this.input ? "input" : "output";
      this.nodes.push(new Node(type));
    }
    // Connect input nodes with output nodes directly
    for (i = 0; i < this.input; i++) {
      for (var j = this.input; j < this.output + this.input; j++) {
        // https://stats.stackexchange.com/a/248040/147931
        var weight = Math.random() * this.input * Math.sqrt(2 / this.input);
        this.connect(this.nodes[i], this.nodes[j], weight);
      }
    }
    /**
     * Fitness
     * function
     * Function to evaluate fitness
     */
    this.fitness = parameters.fitness;
    /**
     * population count
     * number > 0
     * Size of population pool
     */
    this.populationCount = parameters.populationCount;
    /**
     * Crossover Methods
     * Array
     * An array of all possible crossover types
     */
    this.crossoverMethods = parameters.crossoverMethods;
    /**
     * Safe Population Percent
     * Number [0-100)
     * Percentage of population that is safe from mutations and eliminations
     */
    this.safePopulationPercent = parameters.safePopulationPercent;
    /**
     * Mutation Rate
     * Number [0-1]
     * How much can nodes mutate
     * Less mutation means slower changes, but reaching a minima is more smoother
     * Higher mutation rate means fater changes, but organism might oscillate on reaching minima)
     */
    this.mutationRate = parameters.mutationRate;
    /**
     * Fixed Topology
     * Boolean
     * Whether the Topology is fixed or variable
     */
    this.fixedTopology = parameters.fixedTopology;
    /**
     * Mutation Method
     * Array
     * An array for possible mutation types
     */
    this.mutationMethod = parameters.mutationMethod;
    /**
     * Max Nodes
     * Number
     * Number of Maximum Nodes in a network
     */
    this.maxNodes = parameters.maxNodes || Infinity;
    /**
     * Max Connections
     * Number
     * Number of Maximum Connections in a network
     */
    this.maxConnections = parameters.maxConnections || Infinity;
    /**
     *
     */
    this.template = parameters.template || false;
  }
  /**
   * @function
   * initialises the population pool
   */
  initialise() {
    this.population = [];
    for (var i = 0; i < this.populationCount; i++) {
      //initialise new brains and push to population array
      var newNetwork;
    }
  }
  exportToJSON() {
    //export
  }
  importFromJSON() {
    //import
  }
}

class Network {
  constructor(parameters) {
    this.fixedTopology = false; //whether the model has a fixed topology or a variable one
    this.input = parameters.input; //big thanks to tha coding godd @sehajdeep_sandhu, hit my guy up on the insta bro big shout outs
    this.output = parameters.output;
    this.alive = true;
    this.completed = false;
    this.fitness = 0;
  }
  activate(input, training) {
    var output = [];

    // Activate nodes chronologically
    for (var i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].type === "input") {
        this.nodes[i].activate(input[i]);
      } else if (this.nodes[i].type === "output") {
        var activation = this.nodes[i].activate();
        output.push(activation);
      } else {
        if (training) this.nodes[i].mask = Math.random() < this.dropout ? 0 : 1;
        this.nodes[i].activate();
      }
    }

    return output;
  }
  connect(from, to, weight) {
    var connections = from.connect(to, weight);

    for (var i = 0; i < connections.length; i++) {
      var connection = connections[i];
      if (from !== to) {
        this.connections.push(connection);
      } else {
        this.selfconns.push(connection);
      }
    }

    return connections;
  }
  propagate(rate, momentum, update, target) {
    if (typeof target === "undefined" || target.length !== this.output) {
      throw new Error(
        "Output target length should match network output length"
      );
    }

    var targetIndex = target.length;

    // Propagate output nodes
    var i;
    for (i = this.nodes.length - 1; i >= this.nodes.length - this.output; i--) {
      this.nodes[i].propagate(rate, momentum, update, target[--targetIndex]);
    }

    // Propagate hidden and input nodes
    for (i = this.nodes.length - this.output - 1; i >= this.input; i--) {
      this.nodes[i].propagate(rate, momentum, update);
    }
  }
  clear() {
    for (var i = 0; i < this.nodes.length; i++) {
      this.nodes[i].clear();
    }
  }
  initialise() {}
  exportToJSON() {}
  importFromJSON(json) {
    var newNetwork = new Network({ input: json.input, output: json.output });
    newNetwork.nodes = [];
    newNetwork.connections = [];
    var i;
    for (i = 0; i < json.nodes.length; i++) {
      network.nodes.push(Node.fromJSON(json.nodes[i]));
    }

    for (i = 0; i < json.connections.length; i++) {
      var conn = json.connections[i];

      var connection = network.connect(
        network.nodes[conn.from],
        network.nodes[conn.to]
      )[0];
      connection.weight = conn.weight;
    }

    return network;
  }
}
