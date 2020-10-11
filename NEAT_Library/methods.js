  var methods
  var mutation;
  

  function initMethods() {
    methods = {
      activation: {
        LOGISTIC: function (x, derivate) {
          var fx = 1 / (1 + Math.exp(-x));
          if (!derivate) return fx;
          return fx * (1 - fx);
        },
        TANH: function (x, derivate) {
          if (derivate) return 1 - Math.pow(Math.tanh(x), 2);
          return Math.tanh(x);
        },
        IDENTITY: function (x, derivate) {
          return derivate ? 1 : x;
        },
        STEP: function (x, derivate) {
          return derivate ? 0 : x > 0 ? 1 : 0;
        },
        RELU: function (x, derivate) {
          if (derivate) return x > 0 ? 1 : 0;
          return x > 0 ? x : 0;
        },
        SOFTSIGN: function (x, derivate) {
          var d = 1 + Math.abs(x);
          if (derivate) return x / Math.pow(d, 2);
          return x / d;
        },
        SINUSOID: function (x, derivate) {
          if (derivate) return Math.cos(x);
          return Math.sin(x);
        },
        GAUSSIAN: function (x, derivate) {
          var d = Math.exp(-Math.pow(x, 2));
          if (derivate) return -2 * x * d;
          return d;
        },
        BENT_IDENTITY: function (x, derivate) {
          var d = Math.sqrt(Math.pow(x, 2) + 1);
          if (derivate) return x / (2 * d) + 1;
          return (d - 1) / 2 + x;
        },
        BIPOLAR: function (x, derivate) {
          return derivate ? 0 : x > 0 ? 1 : -1;
        },
        BIPOLAR_SIGMOID: function (x, derivate) {
          var d = 2 / (1 + Math.exp(-x)) - 1;
          if (derivate) return 1 / 2 * (1 + d) * (1 - d);
          return d;
        },
        HARD_TANH: function (x, derivate) {
          if (derivate) return x > -1 && x < 1 ? 1 : 0;
          return Math.max(-1, Math.min(1, x));
        },
        ABSOLUTE: function (x, derivate) {
          if (derivate) return x < 0 ? -1 : 1;
          return Math.abs(x);
        },
        INVERSE: function (x, derivate) {
          if (derivate) return -1;
          return 1 - x;
        },
        // https://arxiv.org/pdf/1706.02515.pdf
        SELU: function (x, derivate) {
          var alpha = 1.6732632423543772848170429916717;
          var scale = 1.0507009873554804934193349852946;
          var fx = x > 0 ? x : alpha * Math.exp(x) - alpha;
          if (derivate) { return x > 0 ? scale : (fx + alpha) * scale; }
          return fx * scale;
        }
      },
      connection: {
        ALL_TO_ALL: {
          name: 'OUTPUT'
        },
        ALL_TO_ELSE: {
          name: 'INPUT'
        },
        ONE_TO_ONE: {
          name: 'SELF'
        }
      },
      cost: {
        // Cross entropy error
        CROSS_ENTROPY: function (target, output) {
          var error = 0;
          for (var i = 0; i < output.length; i++) {
            // Avoid negative and zero numbers, use 1e-15 http://bit.ly/2p5W29A
            error -= target[i] * Math.log(Math.max(output[i], 1e-15)) + (1 - target[i]) * Math.log(1 - Math.max(output[i], 1e-15));
          }
          return error / output.length;
        },
        // Mean Squared Error
        MSE: function (target, output) {
          var error = 0;
          for (var i = 0; i < output.length; i++) {
            error += Math.pow(target[i] - output[i], 2);
          }
      
          return error / output.length;
        },
        // Binary error
        BINARY: function (target, output) {
          var misses = 0;
          for (var i = 0; i < output.length; i++) {
            misses += Math.round(target[i] * 2) !== Math.round(output[i] * 2);
          }
      
          return misses;
        },
        // Mean Absolute Error
        MAE: function (target, output) {
          var error = 0;
          for (var i = 0; i < output.length; i++) {
            error += Math.abs(target[i] - output[i]);
          }
      
          return error / output.length;
        },
        // Mean Absolute Percentage Error
        MAPE: function (target, output) {
          var error = 0;
          for (var i = 0; i < output.length; i++) {
            error += Math.abs((output[i] - target[i]) / Math.max(target[i], 1e-15));
          }
      
          return error / output.length;
        },
        // Mean Squared Logarithmic Error
        MSLE: function (target, output) {
          var error = 0;
          for (var i = 0; i < output.length; i++) {
            error += Math.log(Math.max(target[i], 1e-15)) - Math.log(Math.max(output[i], 1e-15));
          }
      
          return error;
        },
        // Hinge loss, for classifiers
        HINGE: function (target, output) {
          var error = 0;
          for (var i = 0; i < output.length; i++) {
            error += Math.max(0, 1 - target[i] * output[i]);
          }
      
          return error;
        }
      },
      crossover: {
        SINGLE_POINT: {
          name: 'SINGLE_POINT',
          config: [0.4]
        },
        TWO_POINT: {
          name: 'TWO_POINT',
          config: [0.4, 0.9]
        },
        UNIFORM: {
          name: 'UNIFORM'
        },
        AVERAGE: {
          name: 'AVERAGE'
        }
      },
      gating:{
        OUTPUT: {
          name: 'OUTPUT'
        },
        INPUT: {
          name: 'INPUT'
        },
        SELF: {
          name: 'SELF'
        }
      },
      
      rate: {
        FIXED: function () {
          var func = function (baseRate, iteration) { return baseRate; };
          return func;
        },
        STEP: function (gamma, stepSize) {
          gamma = gamma || 0.9;
          stepSize = stepSize || 100;
      
          var func = function (baseRate, iteration) {
            return baseRate * Math.pow(gamma, Math.floor(iteration / stepSize));
          };
      
          return func;
        },
        EXP: function (gamma) {
          gamma = gamma || 0.999;
      
          var func = function (baseRate, iteration) {
            return baseRate * Math.pow(gamma, iteration);
          };
      
          return func;
        },
        INV: function (gamma, power) {
          gamma = gamma || 0.001;
          power = power || 2;
      
          var func = function (baseRate, iteration) {
            return baseRate * Math.pow(1 + gamma * iteration, -power);
          };
      
          return func;
        }
      },
      selection: {
        FITNESS_PROPORTIONATE: {
          name: 'FITNESS_PROPORTIONATE'
        },
        POWER: {
          name: 'POWER',
          power: 4
        },
        TOURNAMENT: {
          name: 'TOURNAMENT',
          size: 5,
          probability: 0.5
        }
      }
        //mutation: require('./mutation'),
        //selection: require('./selection'),
        //crossover: require('./crossover'),
        //cost: require('./cost'),
        //gating: require('./gating'),
        //connection: require('./connection'),
        //rate: require('./rate')
      };
      mutation = {
        ADD_NODE: {
          name: 'ADD_NODE'
        },
        SUB_NODE: {
          name: 'SUB_NODE',
          keep_gates: true
        },
        ADD_CONN: {
          name: 'ADD_CONN'
        },
        SUB_CONN: {
          name: 'REMOVE_CONN'
        },
        MOD_WEIGHT: {
          name: 'MOD_WEIGHT',
          min: -1,
          max: 1
        },
        MOD_BIAS: {
          name: 'MOD_BIAS',
          min: -1,
          max: 1
        },
        MOD_ACTIVATION: {
          name: 'MOD_ACTIVATION',
          mutateOutput: true,
          allowed: [
            methods.activation.LOGISTIC,
            methods.activation.TANH,
            methods.activation.RELU,
            methods.activation.IDENTITY,
            methods.activation.STEP,
            methods.activation.SOFTSIGN,
            methods.activation.SINUSOID,
            methods.activation.GAUSSIAN,
            methods.activation.BENT_IDENTITY,
            methods.activation.BIPOLAR,
            methods.activation.BIPOLAR_SIGMOID,
            methods.activation.HARD_TANH,
            methods.activation.ABSOLUTE,
            methods.activation.INVERSE,
            methods.activation.SELU
          ]
        },
        ADD_SELF_CONN: {
          name: 'ADD_SELF_CONN'
        },
        SUB_SELF_CONN: {
          name: 'SUB_SELF_CONN'
        },
        ADD_GATE: {
          name: 'ADD_GATE'
        },
        SUB_GATE: {
          name: 'SUB_GATE'
        },
        ADD_BACK_CONN: {
          name: 'ADD_BACK_CONN'
        },
        SUB_BACK_CONN: {
          name: 'SUB_BACK_CONN'
        },
        SWAP_NODES: {
          name: 'SWAP_NODES',
          mutateOutput: true
        },
        
      }
      mutation.ALL = [
        mutation.ADD_NODE,
        mutation.SUB_NODE,
        mutation.ADD_CONN,
        mutation.SUB_CONN,
        mutation.MOD_WEIGHT,
        mutation.MOD_BIAS,
        mutation.MOD_ACTIVATION,
        mutation.ADD_GATE,
        mutation.SUB_GATE,
        mutation.ADD_SELF_CONN,
        mutation.SUB_SELF_CONN,
        mutation.ADD_BACK_CONN,
        mutation.SUB_BACK_CONN,
        mutation.SWAP_NODES
      ]
      mutation.FFW = [
        mutation.ADD_NODE,
        mutation.SUB_NODE,
        mutation.ADD_CONN,
        mutation.SUB_CONN,
        mutation.MOD_WEIGHT,
        mutation.MOD_BIAS,
        mutation.MOD_ACTIVATION,
        mutation.SWAP_NODES
      ]
      methods.mutation=mutation
  }