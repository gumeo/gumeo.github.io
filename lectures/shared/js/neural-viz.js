// Neural Network Visualization Library for Deep Learning Course

const neuralViz = {
  // Create a neural network visualization
  createNetwork: function(config) {
    const defaults = {
      container: '#neural-network',
      layers: [3, 4, 4, 2],
      width: 800,
      height: 400,
      neuronRadius: 20,
      layerSpacing: 200,
      neuronSpacing: 80
    };
    
    const settings = { ...defaults, ...config };
    const svg = d3Utils.createSVG(settings.container, settings.width, settings.height);
    
    // Calculate positions for neurons
    const neurons = [];
    const connections = [];
    
    settings.layers.forEach((layerSize, layerIndex) => {
      const layerNeurons = [];
      const x = settings.layerSpacing * (layerIndex + 0.5);
      const layerHeight = layerSize * settings.neuronSpacing;
      const startY = (settings.height - layerHeight) / 2 + settings.neuronSpacing / 2;
      
      for (let i = 0; i < layerSize; i++) {
        const neuron = {
          id: `neuron-${layerIndex}-${i}`,
          layer: layerIndex,
          index: i,
          x: x,
          y: startY + i * settings.neuronSpacing,
          value: 0,
          type: layerIndex === 0 ? 'input' : 
                layerIndex === settings.layers.length - 1 ? 'output' : 'hidden'
        };
        layerNeurons.push(neuron);
        neurons.push(neuron);
      }
      
      // Create connections to previous layer
      if (layerIndex > 0) {
        const prevLayerStart = neurons.length - layerSize - settings.layers[layerIndex - 1];
        const prevLayerEnd = neurons.length - layerSize;
        
        for (let i = prevLayerStart; i < prevLayerEnd; i++) {
          for (let j = neurons.length - layerSize; j < neurons.length; j++) {
            connections.push({
              source: neurons[i],
              target: neurons[j],
              weight: (Math.random() - 0.5) * 2,
              id: `connection-${i}-${j}`
            });
          }
        }
      }
    });
    
    // Draw connections
    const connectionGroup = svg.append('g').attr('class', 'connections');
    
    const connectionLines = connectionGroup.selectAll('.connection')
      .data(connections)
      .enter()
      .append('line')
      .attr('class', 'connection')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .style('stroke', d => d3Utils.getWeightColor(d.weight))
      .style('stroke-width', d => Math.abs(d.weight) * 2 + 1)
      .style('opacity', 0.6);
    
    // Draw neurons
    const neuronGroup = svg.append('g').attr('class', 'neurons');
    
    const neuronCircles = neuronGroup.selectAll('.neuron')
      .data(neurons)
      .enter()
      .append('g')
      .attr('class', 'neuron-group')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);
    
    neuronCircles.append('circle')
      .attr('class', d => `neuron ${d.type}`)
      .attr('r', settings.neuronRadius)
      .style('fill', d => {
        if (d.type === 'input') return 'var(--color-input)';
        if (d.type === 'hidden') return 'var(--color-hidden)';
        if (d.type === 'output') return 'var(--color-output)';
      });
    
    neuronCircles.append('text')
      .attr('class', 'neuron-value')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('fill', 'white')
      .style('font-size', '12px')
      .text('0.0');
    
    return {
      svg,
      neurons,
      connections,
      neuronCircles,
      connectionLines,
      settings
    };
  },

  // Animate forward propagation
  animateForwardPass: function(network, inputValues, duration = 2000) {
    const { neurons, connections, neuronCircles } = network;
    const layerCount = network.settings.layers.length;
    const layerDuration = duration / layerCount;
    
    // Set input values
    neurons.filter(n => n.type === 'input').forEach((neuron, i) => {
      neuron.value = inputValues[i] || Math.random();
    });
    
    // Update input neurons immediately
    neuronCircles.filter(d => d.type === 'input')
      .select('.neuron-value')
      .text(d => d.value.toFixed(2));
    
    // Animate through layers
    const animateLayer = (layerIndex) => {
      if (layerIndex >= layerCount) return Promise.resolve();
      
      // Get neurons in current layer
      const currentLayerNeurons = neurons.filter(n => n.layer === layerIndex);
      
      // Animate connections from previous layer
      if (layerIndex > 0) {
        const incomingConnections = connections.filter(c => 
          currentLayerNeurons.some(n => n === c.target)
        );
        
        // Highlight connections
        network.connectionLines
          .filter(d => incomingConnections.includes(d))
          .transition()
          .duration(layerDuration / 2)
          .style('stroke', 'var(--color-gradient)')
          .style('opacity', 1)
          .style('stroke-width', 3)
          .transition()
          .duration(layerDuration / 2)
          .style('stroke', d => d3Utils.getWeightColor(d.weight))
          .style('opacity', 0.6)
          .style('stroke-width', d => Math.abs(d.weight) * 2 + 1);
        
        // Calculate neuron values (simplified)
        currentLayerNeurons.forEach(neuron => {
          const inputs = connections
            .filter(c => c.target === neuron)
            .reduce((sum, c) => sum + c.source.value * c.weight, 0);
          neuron.value = Math.tanh(inputs); // Activation function
        });
      }
      
      // Animate neurons
      neuronCircles
        .filter(d => d.layer === layerIndex)
        .select('circle')
        .transition()
        .duration(layerDuration / 2)
        .attr('r', network.settings.neuronRadius * 1.2)
        .transition()
        .duration(layerDuration / 2)
        .attr('r', network.settings.neuronRadius);
      
      // Update values
      neuronCircles
        .filter(d => d.layer === layerIndex)
        .select('.neuron-value')
        .transition()
        .duration(layerDuration)
        .tween('text', function(d) {
          const i = d3.interpolate(0, d.value);
          return function(t) {
            this.textContent = i(t).toFixed(2);
          };
        });
      
      // Animate next layer
      return new Promise(resolve => {
        setTimeout(() => {
          animateLayer(layerIndex + 1).then(resolve);
        }, layerDuration);
      });
    };
    
    return animateLayer(0);
  },

  // Animate backpropagation
  animateBackprop: function(network, gradients, duration = 3000) {
    const { neurons, connections, connectionLines } = network;
    const layerCount = network.settings.layers.length;
    const layerDuration = duration / layerCount;
    
    // Animate from output to input
    const animateLayer = (layerIndex) => {
      if (layerIndex < 0) return Promise.resolve();
      
      // Get neurons in current layer
      const currentLayerNeurons = neurons.filter(n => n.layer === layerIndex);
      
      // Highlight neurons with gradient
      network.neuronCircles
        .filter(d => d.layer === layerIndex)
        .select('circle')
        .transition()
        .duration(layerDuration / 2)
        .style('stroke', 'var(--color-gradient)')
        .style('stroke-width', 4)
        .transition()
        .duration(layerDuration / 2)
        .style('stroke', 'white')
        .style('stroke-width', 2);
      
      // Animate connections to next layer
      if (layerIndex < layerCount - 1) {
        const outgoingConnections = connections.filter(c => 
          currentLayerNeurons.some(n => n === c.source)
        );
        
        connectionLines
          .filter(d => outgoingConnections.includes(d))
          .transition()
          .duration(layerDuration)
          .style('stroke', 'var(--color-gradient)')
          .style('opacity', 1)
          .transition()
          .duration(layerDuration / 2)
          .style('stroke', d => d3Utils.getWeightColor(d.weight))
          .style('opacity', 0.6);
      }
      
      // Animate to previous layer
      return new Promise(resolve => {
        setTimeout(() => {
          animateLayer(layerIndex - 1).then(resolve);
        }, layerDuration);
      });
    };
    
    return animateLayer(layerCount - 1);
  },

  // Highlight a specific path through the network
  highlightPath: function(network, path, duration = 500) {
    const { connectionLines, neuronCircles } = network;
    
    // Reset all elements
    connectionLines
      .transition()
      .duration(duration / 2)
      .style('opacity', 0.2);
    
    neuronCircles.select('circle')
      .transition()
      .duration(duration / 2)
      .style('opacity', 0.3);
    
    // Highlight path neurons
    neuronCircles
      .filter(d => path.includes(d))
      .select('circle')
      .transition()
      .duration(duration)
      .style('opacity', 1)
      .attr('r', network.settings.neuronRadius * 1.2);
    
    // Highlight path connections
    for (let i = 0; i < path.length - 1; i++) {
      connectionLines
        .filter(d => d.source === path[i] && d.target === path[i + 1])
        .transition()
        .duration(duration)
        .style('opacity', 1)
        .style('stroke', 'var(--color-accent)')
        .style('stroke-width', 4);
    }
  },

  // Reset network visualization
  resetNetwork: function(network, duration = 300) {
    const { connectionLines, neuronCircles, neurons } = network;
    
    // Reset neuron values
    neurons.forEach(n => n.value = 0);
    
    // Reset visual elements
    neuronCircles.select('circle')
      .transition()
      .duration(duration)
      .style('opacity', 1)
      .attr('r', network.settings.neuronRadius);
    
    neuronCircles.select('.neuron-value')
      .transition()
      .duration(duration)
      .text('0.0');
    
    connectionLines
      .transition()
      .duration(duration)
      .style('opacity', 0.6)
      .style('stroke', d => d3Utils.getWeightColor(d.weight))
      .style('stroke-width', d => Math.abs(d.weight) * 2 + 1);
  },

  // Create activation function visualization
  createActivationViz: function(container, functionType = 'tanh', width = 300, height = 200) {
    const svg = d3Utils.createSVG(container, width, height);
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Define activation functions
    const activationFunctions = {
      sigmoid: x => 1 / (1 + Math.exp(-x)),
      tanh: x => Math.tanh(x),
      relu: x => Math.max(0, x),
      leaky_relu: x => x > 0 ? x : 0.01 * x
    };
    
    const fn = activationFunctions[functionType];
    const xDomain = [-5, 5];
    const yDomain = functionType === 'relu' || functionType === 'leaky_relu' ? [-1, 5] : [-1.5, 1.5];
    
    const xScale = d3.scaleLinear()
      .domain(xDomain)
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain(yDomain)
      .range([innerHeight, 0]);
    
    // Generate data points
    const data = [];
    for (let x = xDomain[0]; x <= xDomain[1]; x += 0.1) {
      data.push({ x, y: fn(x) });
    }
    
    // Draw axes
    d3Utils.drawAxes(g, xScale, yScale, {
      xLabel: 'x',
      yLabel: 'f(x)',
      width: innerWidth,
      height: innerHeight,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    
    // Draw function
    const line = d3Utils.createLineGenerator(xScale, yScale);
    
    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'var(--color-accent)')
      .attr('stroke-width', 3)
      .attr('d', line);
    
    d3Utils.animatePath(path, 1000);
    
    // Add label
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'var(--color-text)')
      .text(functionType.replace('_', ' ').toUpperCase());
    
    return { svg, xScale, yScale, data };
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = neuralViz;
}