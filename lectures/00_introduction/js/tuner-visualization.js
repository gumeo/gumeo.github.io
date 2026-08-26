// Interactive Tuner Visualization for Function Approximation

let tunerViz = {
  svg: null,
  xScale: null,
  yScale: null,
  targetFunction: null,
  currentFunction: null,
  parameters: {
    a1: 0.5,   // sin amplitude - matches HTML default
    b1: 2.0,   // sin frequency - matches HTML default
    a2: 0.5,   // cos amplitude - matches HTML default
    b2: 3.0,   // cos frequency - matches HTML default
    a3: 0.10   // quadratic coefficient - matches HTML default
  },
  width: 420,
  height: 220,
  margin: { top: 15, right: 25, bottom: 35, left: 40 }
};

// Target function to approximate - matches exactly what users can create
function targetFunction(x) {
  return 0.7 * Math.sin(2.5 * Math.PI * x) + 
         -0.4 * Math.cos(3.5 * Math.PI * x) + 
         0.2 * x * x;
}

// User-controlled function
function userFunction(x, params) {
  return params.a1 * Math.sin(params.b1 * Math.PI * x) + 
         params.a2 * Math.cos(params.b2 * Math.PI * x) + 
         params.a3 * x * x;
}

// Calculate error between functions
function calculateError() {
  let error = 0;
  const samples = 100;
  for (let i = 0; i <= samples; i++) {
    const x = i / samples;
    const target = targetFunction(x);
    const user = userFunction(x, tunerViz.parameters);
    error += Math.pow(target - user, 2);
  }
  return Math.sqrt(error / samples);
}

// Initialize the tuner demo
function initializeTunerDemo() {
  const container = d3.select('#function-graph');
  
  // Clear any existing content to prevent duplicates
  container.selectAll('*').remove();
  
  // Reset the tunerViz object
  tunerViz.svg = null;
  tunerViz.targetPath = null;
  tunerViz.userPath = null;
  tunerViz.g = null;
  
  // Read initial values from sliders
  document.querySelectorAll('.tuner').forEach(tuner => {
    const param = tuner.id.replace('tuner-', '');
    tunerViz.parameters[param] = parseFloat(tuner.value);
  });
  
  // Create SVG
  tunerViz.svg = container
    .append('svg')
    .attr('viewBox', `0 0 ${tunerViz.width} ${tunerViz.height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto');
  
  const g = tunerViz.svg.append('g')
    .attr('transform', `translate(${tunerViz.margin.left},${tunerViz.margin.top})`);
  
  // Store the g element reference
  tunerViz.g = g;
  
  // Set up scales
  const innerWidth = tunerViz.width - tunerViz.margin.left - tunerViz.margin.right;
  const innerHeight = tunerViz.height - tunerViz.margin.top - tunerViz.margin.bottom;
  
  tunerViz.xScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, innerWidth]);
  
  tunerViz.yScale = d3.scaleLinear()
    .domain([-2, 2])
    .range([innerHeight, 0]);
  
  // Draw axes
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(tunerViz.xScale))
    .append('text')
    .attr('x', innerWidth / 2)
    .attr('y', 40)
    .attr('fill', 'var(--color-text)')
    .style('text-anchor', 'middle')
    .text('x');
  
  g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(tunerViz.yScale))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -35)
    .attr('x', -innerHeight / 2)
    .attr('fill', 'var(--color-text)')
    .style('text-anchor', 'middle')
    .text('f(x)');
  
  // Style axes
  g.selectAll('.x-axis, .y-axis')
    .style('color', 'var(--color-text-secondary)')
    .selectAll('line, path')
    .style('stroke', 'var(--color-text-secondary)');
  
  // Create line generators
  const lineGenerator = d3.line()
    .x(d => tunerViz.xScale(d.x))
    .y(d => tunerViz.yScale(d.y))
    .curve(d3.curveMonotoneX);
  
  // Generate data for target function
  const targetData = [];
  for (let i = 0; i <= 100; i++) {
    const x = i / 100;
    targetData.push({ x, y: targetFunction(x) });
  }
  
  // Draw target function
  tunerViz.targetPath = g.append('path')
    .datum(targetData)
    .attr('class', 'target-function')
    .attr('fill', 'none')
    .attr('stroke', '#FC8484')
    .attr('stroke-width', 3)
    .attr('opacity', 0.8)
    .attr('stroke-dasharray', '5,5')
    .attr('d', lineGenerator);
  
  // Draw user function (initially)
  tunerViz.userPath = g.append('path')
    .attr('class', 'user-function')
    .attr('fill', 'none')
    .attr('stroke', '#10099F')
    .attr('stroke-width', 3)
    .attr('d', lineGenerator(generateUserData()));
  
  // Add legend (more compact)
  const legend = g.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${innerWidth - 100}, 10)`);
  
  legend.append('line')
    .attr('x1', 0)
    .attr('x2', 20)
    .attr('y1', 0)
    .attr('y2', 0)
    .attr('stroke', '#FC8484')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '5,5');
  
  legend.append('text')
    .attr('x', 25)
    .attr('y', 4)
    .attr('fill', 'var(--color-text)')
    .style('font-size', '12px')
    .text('Target');
  
  legend.append('line')
    .attr('x1', 0)
    .attr('x2', 20)
    .attr('y1', 15)
    .attr('y2', 15)
    .attr('stroke', '#10099F')
    .attr('stroke-width', 2);
  
  legend.append('text')
    .attr('x', 25)
    .attr('y', 19)
    .attr('fill', 'var(--color-text)')
    .style('font-size', '12px')
    .text('Yours');
  
  // Set up tuner event listeners
  setupTunerListeners();
  
  // Initial update
  updateVisualization();
}

// Generate data for user function
function generateUserData() {
  const data = [];
  for (let i = 0; i <= 100; i++) {
    const x = i / 100;
    data.push({ x, y: userFunction(x, tunerViz.parameters) });
  }
  return data;
}

// Update visualization when tuners change
function updateVisualization() {
  if (!tunerViz.userPath || !tunerViz.xScale || !tunerViz.yScale) {
    console.error('Visualization not ready');
    return;
  }
  
  // Generate new data
  const newData = generateUserData();
  
  // Create line generator
  const lineGenerator = d3.line()
    .x(d => tunerViz.xScale(d.x))
    .y(d => tunerViz.yScale(d.y))
    .curve(d3.curveMonotoneX);
  
  // Update the path using D3 properly
  tunerViz.userPath
    .datum(newData)
    .attr('d', lineGenerator);
  
  // Update error display
  const error = calculateError();
  const errorElement = document.getElementById('error-value');
  if (errorElement) {
    errorElement.textContent = error.toFixed(3);
  
    // Update error color based on value
    const errorDisplay = document.querySelector('.error-display');
    if (errorDisplay) {
      if (error < 0.01) {
        errorDisplay.style.color = '#2DD2C0'; // UI Teal for success
        errorElement.textContent = '✨ Perfect!';
      } else if (error < 0.1) {
        errorDisplay.style.color = '#2DD2C0'; // UI Teal for good
      } else if (error < 0.5) {
        errorDisplay.style.color = '#FAC55B'; // UI Yellow for warning
      } else {
        errorDisplay.style.color = '#FC8484'; // UI Coral for error
      }
    }
  }
}

// Set up event listeners for tuners
function setupTunerListeners() {
  const tuners = document.querySelectorAll('.tuner');
  
  tuners.forEach(tuner => {
    // Remove any existing listeners first
    tuner.removeEventListener('input', handleTunerChange);
    tuner.removeEventListener('change', handleTunerChange);
    
    // Add both input and change events for better compatibility
    tuner.addEventListener('input', handleTunerChange);
    tuner.addEventListener('change', handleTunerChange);
  });
}

// Separate handler function for better debugging
function handleTunerChange(e) {
  const param = this.id.replace('tuner-', '');
  const value = parseFloat(this.value);
  
  // Update parameter
  tunerViz.parameters[param] = value;
  
  // Update display
  const valueDisplay = this.parentElement.querySelector('.tuner-value');
  if (valueDisplay) {
    // Use 2 decimal places for all parameters now that we have finer granularity
    const decimals = 2;
    valueDisplay.textContent = value.toFixed(decimals);
  }
  
  // Update visualization
  updateVisualization();
}

// Reset tuners to default values (scrambled from target)
function resetTuners() {
  const defaults = {
    a1: 0.5,
    b1: 2.0,
    a2: 0.5,
    b2: 3.0,
    a3: 0.1
  };
  
  Object.entries(defaults).forEach(([param, value]) => {
    tunerViz.parameters[param] = value;
    const tuner = document.getElementById(`tuner-${param}`);
    tuner.value = value;
    const decimals = 2; // Use 2 decimal places for all
    tuner.parentElement.querySelector('.tuner-value').textContent = value.toFixed(decimals);
  });
  
  updateVisualization();
}

// Gradient descent implementation
let isRunningGradientDescent = false;
let gradientDescentAnimation = null;

async function startGradientDescent() {
  const button = document.querySelector('.gradient-button');
  
  // If already running, stop it
  if (isRunningGradientDescent) {
    stopGradientDescent();
    return;
  }
  
  isRunningGradientDescent = true;
  button.textContent = 'Stop Learning';
  button.disabled = false; // Keep button enabled so user can stop
  
  // Learning parameters
  const learningRate = 0.005;
  const maxIterations = 200;
  const targetError = 0.01;
  
  let iteration = 0;
  
  // Create TensorFlow.js tensors
  const xSamples = tf.linspace(0, 1, 100);
  const targetY = xSamples.arraySync().map(x => targetFunction(x));
  const targetTensor = tf.tensor1d(targetY);
  
  // Parameters as TensorFlow variables
  const params = {
    a1: tf.variable(tf.scalar(tunerViz.parameters.a1)),
    b1: tf.variable(tf.scalar(tunerViz.parameters.b1)),
    a2: tf.variable(tf.scalar(tunerViz.parameters.a2)),
    b2: tf.variable(tf.scalar(tunerViz.parameters.b2)),
    a3: tf.variable(tf.scalar(tunerViz.parameters.a3))
  };
  
  // Loss function
  function loss() {
    return tf.tidy(() => {
      // Compute predictions
      const predictions = tf.add(
        tf.add(
          tf.mul(params.a1, tf.sin(tf.mul(params.b1, tf.mul(Math.PI, xSamples)))),
          tf.mul(params.a2, tf.cos(tf.mul(params.b2, tf.mul(Math.PI, xSamples))))
        ),
        tf.mul(params.a3, tf.square(xSamples))
      );
      
      // MSE loss
      return tf.mean(tf.square(tf.sub(predictions, targetTensor)));
    });
  }
  
  // Optimizer
  const optimizer = tf.train.adam(learningRate);
  
  // Training loop
  async function trainStep() {
    if (!isRunningGradientDescent || iteration >= maxIterations) {
      stopGradientDescent();
      return;
    }
    
    // Compute gradients and update parameters
    optimizer.minimize(loss);
    
    // Update UI with current parameter values
    await tf.tidy(() => {
      tunerViz.parameters.a1 = params.a1.dataSync()[0];
      tunerViz.parameters.b1 = params.b1.dataSync()[0];
      tunerViz.parameters.a2 = params.a2.dataSync()[0];
      tunerViz.parameters.b2 = params.b2.dataSync()[0];
      tunerViz.parameters.a3 = params.a3.dataSync()[0];
    });
    
    // Update sliders and display
    updateUIFromParameters();
    updateVisualization();
    
    // Check if we've reached target error
    const currentError = calculateError();
    if (currentError < targetError) {
      stopGradientDescent();
      return;
    }
    
    iteration++;
    
    // Continue training
    gradientDescentAnimation = setTimeout(trainStep, 50);
  }
  
  // Start training
  trainStep();
}

function stopGradientDescent() {
  isRunningGradientDescent = false;
  if (gradientDescentAnimation) {
    clearTimeout(gradientDescentAnimation);
  }
  
  const button = document.querySelector('.gradient-button');
  button.textContent = 'Use Deep Learning';
  button.disabled = false;
  
  // Clean up TensorFlow resources
  tf.disposeVariables();
}

// Update UI sliders from parameters
function updateUIFromParameters() {
  Object.entries(tunerViz.parameters).forEach(([param, value]) => {
    const tuner = document.getElementById(`tuner-${param}`);
    tuner.value = value;
    const decimals = 2; // Use 2 decimal places for all
    tuner.parentElement.querySelector('.tuner-value').textContent = value.toFixed(decimals);
  });
}

// Export for global access - move these outside any function scope
window.tunerViz = tunerViz;

// Export functions
window.initializeTunerDemo = initializeTunerDemo;
window.resetTuners = resetTuners;
window.startGradientDescent = startGradientDescent;
window.handleTunerChange = handleTunerChange;
window.updateVisualization = updateVisualization;
window.setupTunerListeners = setupTunerListeners;