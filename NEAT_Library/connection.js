class Connection {
  constructor(from, to, weight) {
    this.from = from;
    this.to = to;
    this.gain = 1;

    this.weight =
      typeof weight === "undefined" ? Math.random() * 0.2 - 0.1 : weight;

    this.gater = null;
    this.elegibility = 0;

    // For tracking momentum
    this.previousDeltaWeight = 0;

    // Batch training
    this.totalDeltaWeight = 0;

    this.xtrace = {
      nodes: [],
      values: [],
    };
  }

  /**
   * Returns an innovation ID
   * https://en.wikipedia.org/wiki/Pairing_function (Cantor pairing function)
   */
  innovationID(a, b) {
    return (1 / 2) * (a + b) * (a + b + 1) + b;
  };

  /**
   * Converts the connection to a json object
   */
  toJSON() {
    var json = {
      weight: this.weight,
    };

    return json;
  }
}

function innovationID(a, b) {
  return (1 / 2) * (a + b) * (a + b + 1) + b;
};