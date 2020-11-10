# Neat ML Research

###### This is currently a work in progress, more functionality is in the works

Goal of this project is to create a [Neuro-Evolution of Augmenting Topologies(NEAT)](https://en.wikipedia.org/wiki/Neuroevolution_of_augmenting_topologies) Algorithm from scratch in JavaScript and create a sandbox where user can choose a scenario, tweak parameters, train a model, compare models, and visualise the neural network.

## NEAT

> NeuroEvolution of Augmenting Topologies (NEAT) is a genetic algorithm (GA) for the generation of evolving artificial neural networks (a neuroevolution technique) developed by Ken Stanley in 2002 while at The University of Texas at Austin. It alters both the weighting parameters and structures of networks, attempting to find a balance between the fitness of evolved solutions and their diversity. It is based on applying three key techniques: tracking genes with history markers to allow crossover among topologies, applying speciation (the evolution of species) to preserve innovations, and developing topologies incrementally from simple initial structures ("complexifying").


### How is NEAT different?

NEAT starts with an empty Neural Network with no nodes or connections, starting with just input and output nodes. Connections are added dynamically during training, and due to this dynamic nature, NEAT can be optimised to find the best solution in the minimal possible Neural Networks.

[This paper by Kenneth O. Stanley(Developer of NEAT) gives more insight on NEAT](http://nn.cs.utexas.edu/downloads/papers/stanley.ec02.pdf)
