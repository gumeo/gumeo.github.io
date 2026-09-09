// Interactive 2D classification boundary visualization
function initClassificationBoundary() {
    const container = d3.select('#boundary-visualization');
    if (container.empty()) return;
    
    // Clear previous content
    container.selectAll('*').remove();
    
    const width = container.node().getBoundingClientRect().width || 800;
    const height = 290;
    const margin = { top: 20, right: 80, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
        .domain([-3, 3])
        .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
        .domain([-3, 3])
        .range([innerHeight, 0]);
    
    // Color scale for classes (swapped for better contrast)
    const classColors = ['#2DD2C0', '#10099F', '#FC8484'];
    
    // Training data
    let trainingData = [];
    let weights = { w1: 0.5, w2: 0.5, b: 0.1 };  // Non-zero bias for better initial boundary
    let learningRate = 0.1;
    let isTraining = false;
    let selectedClass = 0; // Default to Class 1
    
    // Background gradient for decision regions
    const defs = svg.append('defs');
    
    // Create background grid to show decision boundary
    const gridSize = 50;  // Finer grid for smoother decision boundary
    const grid = [];
    
    for (let i = 0; i <= gridSize; i++) {
        for (let j = 0; j <= gridSize; j++) {
            grid.push({
                x: xScale.invert(i * innerWidth / gridSize),
                y: yScale.invert(j * innerHeight / gridSize),
                i: i,
                j: j
            });
        }
    }
    
    // Draw grid cells
    const cells = g.append('g')
        .attr('class', 'grid-cells')
        .selectAll('.cell')
        .data(grid)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('x', d => (d.i * innerWidth / gridSize))
        .attr('y', d => (d.j * innerHeight / gridSize))
        .attr('width', innerWidth / gridSize)
        .attr('height', innerHeight / gridSize)
        .attr('fill', '#FAFAFA')
        .attr('stroke', 'none')
        .attr('opacity', 0.3);
    
    // Add axes
    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight / 2})`)
        .call(d3.axisBottom(xScale).tickSize(-innerHeight).tickFormat(''));
    
    g.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${innerWidth / 2},0)`)
        .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(''));
    
    // Style grid lines
    g.selectAll('.x-axis line, .y-axis line')
        .style('stroke', '#EEEEEE')
        .style('stroke-dasharray', '2,2');
    
    g.selectAll('.x-axis path, .y-axis path')
        .style('stroke', '#262626');
    
    // Add axis labels
    g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 35)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text('Feature 1');
    
    g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -25)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text('Feature 2');
    
    // Group for data points
    const pointsGroup = g.append('g')
        .attr('class', 'points');
    
    // Decision boundary line
    const boundaryLine = g.append('line')
        .attr('class', 'decision-boundary')
        .attr('stroke', '#262626')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0);
    
    // Sigmoid function for probability calculation
    function sigmoid(x1, x2) {
        const score = weights.w1 * x1 + weights.w2 * x2 + weights.b;
        return 1 / (1 + Math.exp(-score));
    }
    
    // Softmax function for classification (hard decision)
    function softmax(x1, x2) {
        const prob = sigmoid(x1, x2);
        return prob > 0.5 ? 1 : 0;  // Swapped to match point colors
    }
    
    // Update decision boundary visualization
    function updateBoundary() {
        // Update grid cells based on classification
        cells.attr('fill', d => {
            const pred = softmax(d.x, d.y);
            return classColors[pred];
        });
        
        // Draw decision boundary line (where w1*x1 + w2*x2 + b = 0)
        if (weights.w2 !== 0) {
            const x1_start = xScale.domain()[0];
            const x1_end = xScale.domain()[1];
            const y1 = (-weights.b - weights.w1 * x1_start) / weights.w2;
            const y2 = (-weights.b - weights.w1 * x1_end) / weights.w2;
            
            boundaryLine
                .attr('x1', xScale(x1_start))
                .attr('y1', yScale(y1))
                .attr('x2', xScale(x1_end))
                .attr('y2', yScale(y2))
                .attr('opacity', 1);
        }
    }
    
    // Draw data points
    function drawPoints() {
        const points = pointsGroup.selectAll('.data-point')
            .data(trainingData, d => d.id);
        
        // Remove old points
        points.exit().remove();
        
        // Add new points
        const pointsEnter = points.enter()
            .append('g')
            .attr('class', 'data-point')
            .attr('transform', d => `translate(${xScale(d.x)},${yScale(d.y)})`);
        
        pointsEnter.append('circle')
            .attr('r', 6)
            .attr('fill', d => classColors[d.class])
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .attr('cursor', 'pointer')
            .on('click', function(event, d) {
                // Remove point on click
                trainingData = trainingData.filter(p => p.id !== d.id);
                drawPoints();
            });
        
        // Add hover effect
        pointsEnter.selectAll('circle')
            .on('mouseover', function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 8);
            })
            .on('mouseout', function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 6);
            });
    }
    
    // Add points on canvas click
    svg.on('click', function(event) {
        if (event.target === svg.node() || event.target.classList.contains('cell')) {
            const coords = d3.pointer(event, g.node());
            const x = xScale.invert(coords[0]);
            const y = yScale.invert(coords[1]);
            
            // Use the selected class from dropdown
            trainingData.push({
                x: x,
                y: y,
                class: selectedClass,
                id: Date.now() + Math.random()
            });
            
            drawPoints();
        }
    });
    
    // Training parameters
    const regularizationStrength = 0.01;
    const maxGradient = 5.0;  // For gradient clipping
    let previousLoss = Infinity;
    let lossHistory = [];
    
    // Training function with regularization and gradient clipping
    function trainStep() {
        if (trainingData.length === 0) return;
        
        // Calculate gradients using soft predictions
        let gradW1 = 0;
        let gradW2 = 0;
        let gradB = 0;
        let totalLoss = 0;
        
        trainingData.forEach(point => {
            // Use sigmoid for soft predictions (probabilities)
            const prob = sigmoid(point.x, point.y);
            // Error is based on probability, not hard classification
            const error = point.class - prob;
            
            // Accumulate gradients
            gradW1 += error * point.x;
            gradW2 += error * point.y;
            gradB += error;
            
            // Calculate binary cross-entropy loss for monitoring
            const epsilon = 1e-7;  // Prevent log(0)
            const loss = -point.class * Math.log(prob + epsilon) - 
                         (1 - point.class) * Math.log(1 - prob + epsilon);
            totalLoss += loss;
        });
        
        const n = trainingData.length;
        
        // Average gradients
        gradW1 = gradW1 / n;
        gradW2 = gradW2 / n;
        gradB = gradB / n;
        
        // Add L2 regularization to weight gradients (not bias)
        gradW1 -= regularizationStrength * weights.w1;
        gradW2 -= regularizationStrength * weights.w2;
        
        // Gradient clipping to prevent instability
        const gradNorm = Math.sqrt(gradW1 * gradW1 + gradW2 * gradW2 + gradB * gradB);
        if (gradNorm > maxGradient) {
            const scale = maxGradient / gradNorm;
            gradW1 *= scale;
            gradW2 *= scale;
            gradB *= scale;
        }
        
        // Update weights with clipped gradients
        weights.w1 += learningRate * gradW1;
        weights.w2 += learningRate * gradW2;
        weights.b += learningRate * gradB;
        
        // Track loss for convergence detection
        const avgLoss = totalLoss / n;
        lossHistory.push(avgLoss);
        if (lossHistory.length > 10) {
            lossHistory.shift();  // Keep only last 10 losses
        }
        
        // Check for convergence (stop if loss not improving)
        const lossImprovement = previousLoss - avgLoss;
        if (Math.abs(lossImprovement) < 0.0001 && lossHistory.length >= 10) {
            // Loss has converged, stop training
            stopTraining();
            console.log('Training converged');
        }
        previousLoss = avgLoss;
        
        updateBoundary();
    }
    
    // Animation loop for training
    let trainingInterval;
    
    function startTraining() {
        if (isTraining) return;
        isTraining = true;
        
        trainingInterval = setInterval(() => {
            trainStep();
        }, 100);
        
        d3.select('#train-model').text('Stop Training');
    }
    
    function stopTraining() {
        isTraining = false;
        clearInterval(trainingInterval);
        d3.select('#train-model').text('Train Model');
    }
    
    // Connect buttons
    d3.select('#cb-add-points').on('click', () => {
        // Add random points
        for (let i = 0; i < 10; i++) {
            const x = (Math.random() - 0.5) * 4;
            const y = (Math.random() - 0.5) * 4;
            const cls = x + y > 0 ? 0 : 1; // Simple linear separation
            
            trainingData.push({
                x: x,
                y: y,
                class: cls,
                id: Date.now() + Math.random()
            });
        }
        drawPoints();
    });
    
    d3.select('#train-model').on('click', () => {
        if (isTraining) {
            stopTraining();
        } else {
            startTraining();
        }
    });
    
    d3.select('#reset-demo').on('click', () => {
        stopTraining();
        trainingData = [];
        weights = { w1: 0.5, w2: 0.5, b: 0.1 };  // Reset to non-zero bias
        previousLoss = Infinity;  // Reset loss tracking
        lossHistory = [];
        drawPoints();
        updateBoundary();
        boundaryLine.attr('opacity', 0);
        cells.attr('fill', '#FAFAFA');
    });
    
    // Connect learning rate slider
    d3.select('#cb-lr-slider').on('input', function() {
        learningRate = +this.value;
        d3.select('#cb-lr-value').text(learningRate.toFixed(2));
    });
    
    // Connect class selector dropdown
    d3.select('#class-selector').on('change', function() {
        selectedClass = +this.value;
    });
    
    // Add legend (updated to reflect correct colors)
    const legend = svg.append('g')
        .attr('transform', `translate(${width - 90}, 20)`);
    
    const legendData = [
        { label: 'Class 1', color: '#2DD2C0' },  // Green
        { label: 'Class 2', color: '#10099F' }   // Blue
    ];
    
    const legendItems = legend.selectAll('.legend-item')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 25})`);
    
    legendItems.append('circle')
        .attr('r', 6)
        .attr('cx', 7)
        .attr('cy', 7)
        .attr('fill', d => d.color)
        .attr('stroke', 'white')
        .attr('stroke-width', 2);
    
    legendItems.append('text')
        .attr('x', 20)
        .attr('y', 11)
        .style('font-size', '12px')
        .text(d => d.label);
    
    // Instructions
    container.append('div')
        .style('margin-top', '12px')
        .style('padding', '8px')
        .style('background', '#F0F8FF')
        .style('border-radius', '5px')
        .style('font-size', '12px')
        .html(`
            <strong>Instructions:</strong>
            Click on canvas to add points | Click points to remove | 
            Use "Add Training Points" for random data | 
            "Train Model" to learn decision boundary
        `);
    
    // Initialize
    updateBoundary();
}
