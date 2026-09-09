// Linear Regression Interactive Visualization

function initLinearRegressionDemo() {
    const container = d3.select('#linear-regression-demo');
    if (container.empty()) return;

    const svg = d3.select('#regression-svg');
    
    // Clear any existing content
    svg.selectAll('*').remove();
    
    const width = 850;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
        .domain([0, 10])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, 10])
        .range([innerHeight, 0]);

    // Axes
    const xAxis = g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));

    const yAxis = g.append('g')
        .call(d3.axisLeft(yScale));

    // Axis labels
    svg.append('text')
        .attr('transform', `translate(${width / 2}, ${height - 5})`)
        .style('text-anchor', 'middle')
        .attr('class', 'axis-label')
        .text('Feature (x)');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 15)
        .attr('x', -height / 2)
        .style('text-anchor', 'middle')
        .attr('class', 'axis-label')
        .text('Target (y)');

    // Data points
    let dataPoints = [];
    
    // Regression line
    const line = g.append('line')
        .attr('class', 'loss-line')
        .style('display', 'none');

    // Residuals group
    const residualsGroup = g.append('g')
        .attr('class', 'residuals')
        .style('display', 'none');

    // Points group
    const pointsGroup = g.append('g')
        .attr('class', 'points');

    // Linear regression parameters
    let w = 0, b = 0;

    function updatePoints() {
        const points = pointsGroup.selectAll('.data-point')
            .data(dataPoints, d => d.id);

        points.enter()
            .append('circle')
            .attr('class', 'data-point')
            .attr('r', 0)
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .on('click', function(event, d) {
                const index = dataPoints.indexOf(d);
                if (index > -1) {
                    dataPoints.splice(index, 1);
                    updatePoints();
                    if (dataPoints.length >= 2) {
                        fitLine();
                    } else {
                        line.style('display', 'none');
                        residualsGroup.style('display', 'none');
                        d3.select('#equation-display').html('');
                    }
                }
            })
            .transition()
            .duration(300)
            .attr('r', 6);

        points.exit()
            .transition()
            .duration(300)
            .attr('r', 0)
            .remove();
    }

    function fitLine() {
        if (dataPoints.length < 2) return;

        // Calculate linear regression coefficients
        const n = dataPoints.length;
        const sumX = dataPoints.reduce((sum, p) => sum + p.x, 0);
        const sumY = dataPoints.reduce((sum, p) => sum + p.y, 0);
        const sumXY = dataPoints.reduce((sum, p) => sum + p.x * p.y, 0);
        const sumX2 = dataPoints.reduce((sum, p) => sum + p.x * p.x, 0);

        w = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        b = (sumY - w * sumX) / n;

        // Update line
        const x1 = 0, x2 = 10;
        const y1 = w * x1 + b;
        const y2 = w * x2 + b;

        line
            .style('display', 'block')
            .transition()
            .duration(500)
            .attr('x1', xScale(x1))
            .attr('y1', yScale(y1))
            .attr('x2', xScale(x2))
            .attr('y2', yScale(y2));

        // Update equation display
        d3.select('#equation-display')
            .html(`ŷ = ${w.toFixed(2)}x + ${b.toFixed(2)}`);

        // Update residuals if checkbox is checked
        updateResiduals();
    }

    function updateResiduals() {
        const showResiduals = d3.select('#show-residuals').property('checked');
        
        if (!showResiduals || dataPoints.length < 2) {
            residualsGroup.style('display', 'none');
            return;
        }

        residualsGroup.style('display', 'block');

        const residuals = residualsGroup.selectAll('.residual-line')
            .data(dataPoints);

        residuals.enter()
            .append('line')
            .attr('class', 'residual-line')
            .merge(residuals)
            .attr('x1', d => xScale(d.x))
            .attr('y1', d => yScale(d.y))
            .attr('x2', d => xScale(d.x))
            .attr('y2', d => yScale(w * d.x + b));

        residuals.exit().remove();

        // Calculate and display MSE
        const mse = dataPoints.reduce((sum, p) => {
            const predicted = w * p.x + b;
            return sum + Math.pow(p.y - predicted, 2);
        }, 0) / dataPoints.length;

        d3.select('#equation-display')
            .html(`ŷ = ${w.toFixed(2)}x + ${b.toFixed(2)} | MSE = ${mse.toFixed(3)}`);
    }

    // Event handlers
    d3.select('#add-points').on('click', () => {
        for (let i = 0; i < 5; i++) {
            dataPoints.push({
                id: Date.now() + i,
                x: Math.random() * 8 + 1,
                y: Math.random() * 8 + 1
            });
        }
        updatePoints();
        if (dataPoints.length >= 2) {
            fitLine();
        }
    });

    d3.select('#clear-points').on('click', () => {
        dataPoints = [];
        updatePoints();
        line.style('display', 'none');
        residualsGroup.style('display', 'none');
        d3.select('#equation-display').html('');
    });

    d3.select('#fit-line').on('click', () => {
        if (dataPoints.length >= 2) {
            fitLine();
        }
    });

    d3.select('#show-residuals').on('change', updateResiduals);

    // Click on SVG to add points
    svg.on('click', function(event) {
        const [mouseX, mouseY] = d3.pointer(event);
        
        // Check if click is within the plot area
        if (mouseX >= margin.left && mouseX <= width - margin.right &&
            mouseY >= margin.top && mouseY <= height - margin.bottom) {
            
            const x = xScale.invert(mouseX - margin.left);
            const y = yScale.invert(mouseY - margin.top);
            
            // Don't add if clicking on existing point
            const clickedOnPoint = dataPoints.some(p => 
                Math.abs(xScale(p.x) - (mouseX - margin.left)) < 10 &&
                Math.abs(yScale(p.y) - (mouseY - margin.top)) < 10
            );
            
            if (!clickedOnPoint) {
                dataPoints.push({
                    id: Date.now(),
                    x: x,
                    y: y
                });
                updatePoints();
                if (dataPoints.length >= 2) {
                    fitLine();
                }
            }
        }
    });

    // Add initial points for demonstration
    dataPoints = [
        { id: 1, x: 2, y: 3 },
        { id: 2, x: 4, y: 5 },
        { id: 3, x: 6, y: 6 },
        { id: 4, x: 8, y: 7 }
    ];
    updatePoints();
    fitLine();
}

// Initialize loss visualization
function initLossVisualization() {
    const container = d3.select('#loss-visualization');
    if (container.empty()) return;

    // Clear any existing content to prevent stacking
    container.selectAll('*').remove();
    
    // Immediately create the visualization to prevent layout shift
    createLossVisualization(container);
}

function createLossVisualization(container) {
    const width = 850;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG with viewBox for responsive sizing
    const svg = container.append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('max-width', width + 'px');

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Generate sample data
    const trueW = 2;
    const trueB = 1;
    const noise = 0.5;
    const dataPoints = [];
    
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 5;
        const y = trueW * x + trueB + (Math.random() - 0.5) * noise;
        dataPoints.push({ x, y });
    }

    // Scales
    const xScale = d3.scaleLinear()
        .domain([0, 5])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, 12])
        .range([innerHeight, 0]);

    // Axes
    g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));

    g.append('g')
        .call(d3.axisLeft(yScale));

    // Plot data points
    g.selectAll('.loss-point')
        .data(dataPoints)
        .enter()
        .append('circle')
        .attr('class', 'loss-point')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 4);

    // Animated regression line
    const line = g.append('line')
        .attr('class', 'loss-line')
        .attr('x1', xScale(0))
        .attr('x2', xScale(5));

    // Residual lines
    const residuals = g.selectAll('.residual-line')
        .data(dataPoints)
        .enter()
        .append('line')
        .attr('class', 'residual-line')
        .attr('x1', d => xScale(d.x))
        .attr('x2', d => xScale(d.x))
        .attr('y1', d => yScale(d.y));

    // Loss display
    const lossText = svg.append('text')
        .attr('x', width - margin.right - 100)
        .attr('y', margin.top + 20)
        .attr('text-anchor', 'end')
        .style('font-size', '16px')
        .style('fill', '#333');

    // Animate different regression lines
    let t = 0;
    let animationId = null;
    
    function animate() {
        t += 0.02;
        
        // Vary parameters around true values
        const w = trueW + Math.sin(t) * 1.5;
        const b = trueB + Math.cos(t * 0.7) * 2;
        
        // Update line
        line
            .attr('y1', yScale(b))
            .attr('y2', yScale(w * 5 + b));
        
        // Update residuals
        residuals
            .attr('y2', d => yScale(w * d.x + b));
        
        // Calculate and display loss
        const loss = dataPoints.reduce((sum, d) => {
            const predicted = w * d.x + b;
            return sum + Math.pow(d.y - predicted, 2);
        }, 0) / dataPoints.length;
        
        lossText.text(`Loss: ${loss.toFixed(3)}`);
        
        // Track animation frame
        animationId = requestAnimationFrame(animate);
        if (window.activeAnimations) {
            window.activeAnimations.animationFrames.push(animationId);
        }
    }
    
    animate();
}

// Initialize normal distribution visualization
function initNormalDistribution() {
    const container = d3.select('#normal-distribution-viz');
    if (container.empty()) return;

    // Clear any existing content
    container.selectAll('*').remove();

    const width = 850;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
        .domain([-6, 6])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, 0.5])
        .range([innerHeight, 0]);

    // Axes
    g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));

    g.append('g')
        .call(d3.axisLeft(yScale).ticks(5));

    // Path for distribution curve
    const path = g.append('path')
        .attr('class', 'distribution-curve')
        .style('stroke', '#10099F')
        .style('fill', 'none')
        .style('stroke-width', 2);

    // Area under curve
    const area = g.append('path')
        .attr('class', 'distribution-area')
        .style('fill', '#10099F')
        .style('opacity', 0.3);

    function updateDistribution() {
        const mean = parseFloat(d3.select('#normal-mean').property('value'));
        const std = parseFloat(d3.select('#normal-std').property('value'));
        
        d3.select('#mean-value').text(mean.toFixed(1));
        d3.select('#std-value').text(std.toFixed(1));
        
        // Generate points for the curve
        const points = [];
        for (let x = -6; x <= 6; x += 0.1) {
            const y = (1 / (std * Math.sqrt(2 * Math.PI))) * 
                     Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
            points.push([x, y]);
        }
        
        // Create line generator
        const lineGen = d3.line()
            .x(d => xScale(d[0]))
            .y(d => yScale(d[1]))
            .curve(d3.curveBasis);
        
        // Update curve
        path.transition()
            .duration(300)
            .attr('d', lineGen(points));
        
        // Create area generator
        const areaGen = d3.area()
            .x(d => xScale(d[0]))
            .y0(innerHeight)
            .y1(d => yScale(d[1]))
            .curve(d3.curveBasis);
        
        // Update area
        area.transition()
            .duration(300)
            .attr('d', areaGen(points.filter(p => p[0] >= mean - std && p[0] <= mean + std)));
    }

    // Event listeners
    d3.select('#normal-mean').on('input', updateDistribution);
    d3.select('#normal-std').on('input', updateDistribution);
    
    // Initial update
    updateDistribution();
}

// Initialize linear network visualization
function initLinearNetworkViz() {
    const container = d3.select('#linear-network-viz');
    if (container.empty()) return;

    // Clear any existing content
    container.selectAll('*').remove();

    const width = 850;
    const height = 300;

    const svg = container.append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Network structure
    const inputNeurons = [
        { id: 'x1', label: 'x₁', x: 150, y: 80 },
        { id: 'x2', label: 'x₂', x: 150, y: 150 },
        { id: 'x3', label: 'x₃', x: 150, y: 220 }
    ];

    const outputNeuron = { id: 'y', label: 'ŷ', x: 700, y: 150 };

    // Bias node
    const biasNode = { id: 'bias', label: '1', x: 150, y: 280 };

    // Draw connections
    const connections = svg.append('g').attr('class', 'connections');

    inputNeurons.forEach(input => {
        const connection = connections.append('line')
            .attr('class', 'connection')
            .attr('x1', input.x + 25)
            .attr('y1', input.y)
            .attr('x2', outputNeuron.x - 25)
            .attr('y2', outputNeuron.y);
        
        // Weight label
        const midX = (input.x + outputNeuron.x) / 2;
        const midY = (input.y + outputNeuron.y) / 2;
        
        connections.append('text')
            .attr('class', 'weight-label')
            .attr('x', midX)
            .attr('y', midY - 10)
            .text(`w${input.id.substring(1)}`);
    });

    // Bias connection
    connections.append('line')
        .attr('class', 'connection')
        .attr('x1', biasNode.x + 25)
        .attr('y1', biasNode.y)
        .attr('x2', outputNeuron.x - 25)
        .attr('y2', outputNeuron.y + 30)
        .style('stroke-dasharray', '5,5');

    connections.append('text')
        .attr('class', 'weight-label')
        .attr('x', (biasNode.x + outputNeuron.x) / 2)
        .attr('y', (biasNode.y + outputNeuron.y + 30) / 2 - 10)
        .text('b');

    // Draw neurons
    const neurons = svg.append('g').attr('class', 'neurons');

    // Input neurons
    inputNeurons.forEach(neuron => {
        neurons.append('circle')
            .attr('class', 'neuron input')
            .attr('cx', neuron.x)
            .attr('cy', neuron.y)
            .attr('r', 25);
        
        neurons.append('text')
            .attr('class', 'neuron-label')
            .attr('x', neuron.x)
            .attr('y', neuron.y)
            .text(neuron.label);
    });

    // Bias node
    neurons.append('circle')
        .attr('class', 'neuron')
        .attr('cx', biasNode.x)
        .attr('cy', biasNode.y)
        .attr('r', 20)
        .style('fill', '#FAC55B');

    neurons.append('text')
        .attr('class', 'neuron-label')
        .attr('x', biasNode.x)
        .attr('y', biasNode.y)
        .text(biasNode.label);

    // Output neuron
    neurons.append('circle')
        .attr('class', 'neuron output')
        .attr('cx', outputNeuron.x)
        .attr('cy', outputNeuron.y)
        .attr('r', 30);

    neurons.append('text')
        .attr('class', 'neuron-label')
        .attr('x', outputNeuron.x)
        .attr('y', outputNeuron.y)
        .text(outputNeuron.label);

    // Labels
    svg.append('text')
        .attr('x', 150)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('fill', '#333')
        .text('Input Layer');

    svg.append('text')
        .attr('x', 700)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('fill', '#333')
        .text('Output Layer');

    // Equation
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', '#666')
        .text('ŷ = w₁x₁ + w₂x₂ + w₃x₃ + b');

    // Animate signal propagation
    function animateSignal() {
        inputNeurons.forEach((input, i) => {
            setTimeout(() => {
                const particle = neurons.append('circle')
                    .attr('class', 'signal-particle')
                    .attr('cx', input.x)
                    .attr('cy', input.y)
                    .attr('r', 5);
                
                particle.transition()
                    .duration(1500)
                    .attr('cx', outputNeuron.x)
                    .attr('cy', outputNeuron.y)
                    .transition()
                    .duration(200)
                    .attr('r', 0)
                    .remove();
            }, i * 200);
        });

        // Highlight output
        setTimeout(() => {
            d3.select('.neuron.output')
                .transition()
                .duration(300)
                .attr('r', 35)
                .transition()
                .duration(300)
                .attr('r', 30);
        }, 1000);
    }

    // Animate on load and repeat
    animateSignal();
    const intervalId = setInterval(animateSignal, 4000);
    
    // Track interval for cleanup
    if (window.activeAnimations) {
        window.activeAnimations.intervals.push(intervalId);
    }
}