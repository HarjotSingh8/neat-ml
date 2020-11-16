/**
 * Cart-pole system implemented by openai
 * Copied from https://github.com/openai/gym/blob/master/gym/envs/classic_control/cartpole.py
 *
 * Openai's cart-pole was copied from:
 *   Classic cart-pole system implemented by Rich Sutton et al.
 *   Copied from http://incompleteideas.net/sutton/book/code/pole.c
 *   permalink: https://perma.cc/C9ZM-652R
 *
 */

class PoleBalancing {
  /**
     * Description from openai's repository
    Description:
        A pole is attached by an un-actuated joint to a cart, which moves along
        a frictionless track. The pendulum starts upright, and the goal is to
        prevent it from falling over by increasing and reducing the cart's
        velocity.
    Source:
        This environment corresponds to the version of the cart-pole problem
        described by Barto, Sutton, and Anderson
    Observation:
        Type: Box(4)
        Num     Observation               Min                     Max
        0       Cart Position             -4.8                    4.8
        1       Cart Velocity             -Inf                    Inf
        2       Pole Angle                -0.418 rad (-24 deg)    0.418 rad (24 deg)
        3       Pole Angular Velocity     -Inf                    Inf
    Actions:
        Type: Discrete(2)
        Num   Action
        0     Push cart to the left
        1     Push cart to the right
        Note: The amount the velocity that is reduced or increased is not
        fixed; it depends on the angle the pole is pointing. This is because
        the center of gravity of the pole increases the amount of energy needed
        to move the cart underneath it
    Reward:
        Reward is 1 for every step taken, including the termination step
    Starting State:
        All observations are assigned a uniform random value in [-0.05..0.05]
    Episode Termination:
        Pole Angle is more than 12 degrees.
        Cart Position is more than 2.4 (center of the cart reaches the edge of
        the display).
        Episode length is greater than 200.
        Solved Requirements:
        Considered solved when the average return is greater than or equal to
        195.0 over 100 consecutive trials.
        
     */

  constructor(population) {
    this.trainingDataSize = 100;
    this.trainingData = [];
    this.populationSize = population;
    this.population = [];
    this.resolution = 50;
    this.gravity = 9.8;
    this.cartMass = 1;
    this.poleMass = 0.1;
    this.total_mass = this.cartMass + this.poleMass;
    this.poleLength = 0.2;
    this.forceMag = 10;
    this.deltaTime = 0.02;
    this.cartwidth = 0.2;
    this.cartheight = 0.1;
    this.x_threshold = 0.5;
    this.initPopulation();
  }
  initPopulation() {
    for (var i = 0; i < this.populationSize; i++) {
      this.population.push([]);
    }
    for (var i = 0; i < this.trainingDataSize; i++) {
      var cartPosition = random(0.45, 0.55);
      var cartVelocity = random(-0.05, 0.05);
      var theta = random(-0.05, 0.05);
      var theta_dot = random(-0.05, 0.05);
      var color = [random(0, 255), random(0, 255), random(0, 255)];
      this.trainingData.push({
        cartPosition: cartPosition,
        cartVelocity: cartVelocity,
        theta: theta,
        theta_dot: theta_dot,
        force: 0,
        color: color,
      });
      for (var j = 0; j < this.populationSize; j++) {
        this.population[j].push({
          cartPosition: cartPosition,
          cartVelocity: cartVelocity,
          theta: theta,
          theta_dot: theta_dot,
          force: 0,
          color: color,
        });
      }
    }
  }
  /**
   * cart Pole Physics
   * If the pole is falling down, there are some things to consider
   * If no force is being applied,
   * the center of mass of the pole and cart should remain constant in x-axis as the pole starts falling
   * beacuse direction of gravitational force is along y-axis
   *
   * speed of the pole falling down is to be calculated
   */
  step(self, action) {
    /*var theta = state.poleAngle;
        var force = action;
        //theta is the angle the stick makes with y axis
        var cosTheta = Math.cos(theta); //for forces along y-axis
        var sinTheta = Math.sin(theta); //for forces along x-axis
        var stickCounterForceY = this.gravity*cosTheta*this.poleMass; //force supported by the base of the stick
        var stickForceX = this.graviy*sinTheta*this.poleMass; //force exerted by stick on the cart X axis
        var cartForceX = stickForceX + force;
        state.cartVelocity = cartVelocity + (cartForceX/this.cartMass)*this.deltaTime; //v=u+at; a=f/m
        var changeCartPosX = state.cartVelocity*this.deltaTime
        state.cartPosition = state.cartPosition + changeCartPosX; //s=d+vt
        
        var netVerticalAcceleration = g(1-cosTheta);
        var changePoleCenterY = 
        var newPoleXdisplacement = sinTheta+changeCartPosX;
        var newPoleYdisplacement = cosTheta+*/
    var x = self.state[0];
    var x_dot = self.state[1];
    var theta = self.state[2];
    var theta_dot = self.state[3];
    var force = self.force_mag * action > 0 ? 1 : -1;
    var costheta = Math.cos(theta);
    var sintheta = Math.sin(theta);

    var temp =
      (force + self.polemass_length * theta_dot ** 2 * sintheta) /
      self.total_mass;
    var thetaacc =
      (self.gravity * sintheta - costheta * temp) /
      (self.length *
        (4.0 / 3.0 - (self.masspole * costheta ** 2) / self.total_mass));
    var xacc =
      temp - (self.polemass_length * thetaacc * costheta) / self.total_mass;

    if (self.kinematics_integrator == "euler") {
      x = x + self.tau * x_dot;
      x_dot = x_dot + self.tau * xacc;
      theta = theta + self.tau * theta_dot;
      theta_dot = theta_dot + self.tau * thetaacc;
    } else {
      // semi-implicit euler
      x_dot = x_dot + self.tau * xacc;
      x = x + self.tau * x_dot;
      theta_dot = theta_dot + self.tau * thetaacc;
      theta = theta + self.tau * theta_dot;
    }

    self.state = [x, x_dot, theta, theta_dot];
    done =
      x < -self.x_threshold ||
      x > self.x_threshold ||
      theta < -self.theta_threshold_radians ||
      theta > self.theta_threshold_radians;

    var reward;
    if (!done) {
      reward = 1;
    } else {
      reward = 0;
    }
    return reward;
  }
  reset() {
    //reset here
    for (var i = 0; i < this.populationCount; i++) {}
  }
  render() {
    var screen_width = 100;
    var screen_height = 100;
    var screen_offset_x = 0;
    var screen_offset_y = 0;
    var world_width = this.x_threshold * 2;
    var scale = screen_width / world_width;
    var carty = 100 - this.cartheight * scale;
    var polewidth = 10;
    var polelen = scale * (2 * this.length);
    var cartwidth = 50;
    var cartheight = 30;

    //cart
    background(0);
    fill(0);
    stroke(255, 0, 0);
    rect(
      (this.states[0].cartPosition - this.cartwidth / 2) * scale,
      carty,
      this.cartwidth * scale,
      this.cartheight * scale
    );
    //pole
    stroke(255, 255, 255);
    strokeWeight(1);
    console.log(this.states[0].theta_dot);
    console.log(sin(this.states[0].theta_dot));
    line(
      this.states[0].cartPosition * scale,
      carty,
      this.states[0].cartPosition * scale +
        scale * this.poleLength * Math.sin(this.states[0].theta),
      carty - Math.abs(scale * this.poleLength * Math.cos(this.states[0].theta))
    );
  }
}

class Scenario {}

function scenarioDraw() {
  scenarioObject.render();
}

function scenarioInit() {
  background(0);
  var pop = 100;
  initializeNeat({
    NEATparams: {
      input: 4,
      output: 1,
      populationCount: pop,
      mutationRate: 0.9,
      maxNodes: 10,
      safePopulationPercent: 0.2,
      exported: false,
    },
  });
  scenarioObject = new PoleBalancing(pop);
  scenarioReset = () => {
    scenarioObject.resetPopulation();
  };
  scenarioScore = scenarioObject.score;
}

function scenarioEvaluate() {
  for (var i = 0; i < scenarioObject.populationCount; i++) {}
}
