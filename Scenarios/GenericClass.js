class GenericClass {
    constructor(args) {
        properties
        this.populationCount = args.population||100;
        this.population = []
        
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