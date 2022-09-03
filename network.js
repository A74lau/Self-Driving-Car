/* Our neural network will have 3 layers:

    - First Layer (Input)
        -neurons on the first layer will be connected to the sensors
        -they will send signals to the second layer
    - Second Layer (Hidden)
        -will send signals to the third layer (controls)
    - Third Layer (Output)

    We can seperate this network into two levels:
        - Each level has a floor, a ceiling and connections in between
        - The ceiling of one level will be the floor of the next

*/

class NeuralNetwork {
    constructor(neuronCounts) {
        this.levels = [];
        for (let i = 0; i < neuronCounts.length-1; i++) {
            //put the neuron counts from each level (floor and ceiling) to the array
            this.levels.push(new Level (
                neuronCounts[i],neuronCounts[i+1]
            ));
        }
    }

    static feedForward(givenInputs,network) {
        //calling the outputs for the first level
        let outputs = Level.feedForward(givenInputs,network.levels[0]);
        
        //loop through remaining levels
            //get the output for the next level using the previous output as current input
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(outputs,network.levels[i]);
        }
        return outputs;
    }

    //genetic algorithm
    static mutate (network,amount = 1) {
        network.levels.forEach(level => {
            for (let i = 0; i < level.biases.length; i++) {
                //linear interpolation between current bias value and value between [-1,1] depending on "amount"
                level.biases[i] = linear(
                    level.biases[i],
                    Math.random()*2-1,
                    amount
                )
            }
            for(let i = 0; i < level.weights.length; i++) {
                //linear interpolation between current weight value and value between [-1,1] depending on "amount"
                for (let j = 0; j < level.weights[i].length; j++) {
                    level.weights[i][j] = linear (
                        level.weights[i][j],
                        Math.random()*2-1,
                        amount
                    )
                }
            }
        });
    }
}


class Level {
    constructor(inputCount,outputCount) {

        //we will use an array of values to hold the inputs, outputs and biases(an additional parameter in the network which is used to adjust the output)
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);

        //we will connect every input neuron to every output neuron with WEIGHTS
        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array (outputCount);
        }

        Level.#randomize(this);
    }

    //we use static to serialize the object b/c methods don't serialize
    static #randomize(level) {
        //iterate through the inputs, outputs, and biases, and set the weight to a random value between -1 and 1
            //negative weights can help us send a signal to not do a certain action
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random()*2-1;
            }
        }

        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random()*2-1;
        }
    }


    /*The inputs we receive from the car sensors will be weighted 
        and we will use those values to compute the output */
    
    static feedForward(givenInputs,level) {

        //go through the level inputs and set them to the given inputs (values from the sensors)
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        //loop through every output 
        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;

            //loop through every input
                //the sum will add the product between the values of the input and the weights
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j]*level.weights[j][i];
            }

            //if the sum is greater than the bias of the output neuron we set it to 1
            if (sum > level.biases[i]) {
                level.outputs[i] = 1;
            } else {
                level.outputs[i] = 0;
            }
        }

        return level.outputs;
    }

    /* Notes 
        What we have now is the hyperplane equation:

            WoSo + w1s1 + w2s2 + b = 0 (for each output)

        In a simple network we have a line equation:

            ws + b = 0

            w = weight
                -controls the slope
            s = sensor (input)
            b = bias
                -controls the y-intercept

        Each neuron will have one of these functions for each output.
        The neuron will fire as long as the value of the function is above 0.

        With weights and biases between [-1,1] we can implement any situation.

        However, when have two sensors we are now working in a plane in 3D space.
        Thus, if we add more sensors, we have higher dimensions, which is modeled in the hyperplane equation.


        **Only the last layer of the network must be binary to give a clear yes or no answer.
            (Scientist have neurons fire at random at the second layer, just at different amounts)
    */


}