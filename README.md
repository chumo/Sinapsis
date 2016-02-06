Sinapsis
========
#### (Spanish word for **synapse**)

In this D3 web-app you will visualize the computations inside a convolutional neural network trained for digit recognition.

Try the app at [http://chumo.github.io/Sinapsis/](http://chumo.github.io/Sinapsis/).

The neural network takes 784 input values (input layer) corresponding to the grayscale values a 28x28 pixels image, 200 neurons at the hidden layer, and the final 10 classes at the output layer (digits from 0 to 9).

Given that the network is a fully connected one, every neuron in a layer is connected with all neurons in the next layer. Each of this connections is visualized with a synapse signal (coded with blue color), which represents the communication from a neuron to one or more other neurons. Due to the large amount of neurons and connection between them, I opted for a radial topology, so that the input layer is in the center, the hidden layer surrounds it and the output layer is at the outer radius.

### Acknowledgements

The parameters of the network were obtained by [H. Eichner](http://myselph.de/aboutMe.html) by training it with the [MNIST](http://yann.lecun.com/exdb/mnist/) dataset. This data is for a 784-200-10 unit, with logistic non-linearity in the hidden and softmax in the output layer. You can check his app at [http://myselph.de/neuralNet.html](http://myselph.de/neuralNet.html).

### Other approaches
The problem of digit recognition can be tackled much simplier using another approach. Since the input data is a handwritten path that can be acquired directly by the app, there is no need to map it to an image. Just by using the sequence of point  coordinates along the handwritten path, and a much faster and robust algorithm like random forest or svm, it is possible to recognize digits (or any kind of sketch for that matter). You can see an example at this other app: [http://chumo.github.io/NUMBERS/](http://chumo.github.io/NUMBERS/).

Enjoy!

Jesús Martínez-Blanco
