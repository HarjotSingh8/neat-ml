class GenericClass {
    constructor(args) {
        properties
        this.populationCount = args.population||100;
        this.population = []

        /**
         * Rendering Modes
         *   Generation - render after every generation
         *   Iteration - render after every iteration
         */
        this.renderingCycle = "Generation"; 

        /**
         * Rendering Type
         *   Grid Best
         */
        this.renderingType = 
        this.renderingFrequency = 0.1; //10 times less renders
    }
    seed(seed="None") {
        //seeds for random functions if implemented
    }
    step() {
        //calculate step
    }
    reset() {
        //reset
    }
    render() {
        //draw
    }
    close() {
        //exit
    } 
 }