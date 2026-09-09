// Softmax visualization with temperature control
function initSoftmaxViz() {
    const container = d3.select('#softmax-visualization');
    if (container.empty()) return;
    
    // Clear previous content
    container.selectAll('*').remove();
    
    const width = container.node().getBoundingClientRect().width || 800;
    const height = 320;
    const margin = { top: 35, right: 60, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Initial logits (raw scores)
    const logits = [2.5, 1.2, -0.5, 0.8, -1.0];
    const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
    
    // Scales
    const xScale = d3.scaleBand()
        .domain(classes)
        .range([0, innerWidth])
        .padding(0.1);
    
    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);
    
    // Add axes
    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .append('text')
        .attr('x', innerWidth / 2)
        .attr('y', 40)
        .attr('fill', '#262626')
        .style('text-anchor', 'middle')
        .text('Classes');
    
    g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale).ticks(10, '.0%'))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -60)
        .attr('x', -innerHeight / 2)
        .attr('fill', '#262626')
        .style('text-anchor', 'middle')
        .text('Probability');
    
    // Add title
    g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', '#10099F')
        .text('Softmax Output Distribution');
    
    // Function to compute softmax
    function softmax(logits, temperature) {
        const scaledLogits = logits.map(l => l / temperature);
        const maxLogit = Math.max(...scaledLogits);
        const expScores = scaledLogits.map(l => Math.exp(l - maxLogit));
        const sumExpScores = expScores.reduce((a, b) => a + b, 0);
        return expScores.map(e => e / sumExpScores);
    }
    
    // Create bars for probabilities
    const bars = g.selectAll('.probability-bar')
        .data(classes)
        .enter()
        .append('rect')
        .attr('class', 'probability-bar')
        .attr('x', d => xScale(d))
        .attr('width', xScale.bandwidth())
        .attr('fill', '#10099F')
        .attr('opacity', 0.8);
    
    // Create value labels
    const valueLabels = g.selectAll('.value-label')
        .data(classes)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => xScale(d) + xScale.bandwidth() / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#262626');
    
    // Create logit labels
    const logitLabels = g.selectAll('.logit-label')
        .data(classes)
        .enter()
        .append('text')
        .attr('class', 'logit-label')
        .attr('x', d => xScale(d) + xScale.bandwidth() / 2)
        .attr('y', innerHeight + 25)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#666')
        .text((d, i) => `logit: ${logits[i].toFixed(1)}`);
    
    // Update function
    function update(temperature) {
        const probabilities = softmax(logits, temperature);
        
        // Update bars with animation
        bars.data(probabilities)
            .transition()
            .duration(300)
            .attr('y', d => yScale(d))
            .attr('height', d => innerHeight - yScale(d))
            .attr('fill', (d, i) => {
                // Color the highest probability differently
                const maxProb = Math.max(...probabilities);
                return d === maxProb ? '#2DD2C0' : '#10099F';
            });
        
        // Update value labels
        valueLabels.data(probabilities)
            .transition()
            .duration(300)
            .attr('y', d => yScale(d) - 5)
            .text(d => (d * 100).toFixed(1) + '%');
        
        // Update temperature display
        d3.select('#temp-value').text(temperature.toFixed(1));
    }
    
    // Initialize with default temperature
    update(1.0);
    
    // Connect to temperature slider
    const tempSlider = d3.select('#temperature');
    if (!tempSlider.empty()) {
        tempSlider.on('input', function() {
            update(+this.value);
        });
    }
    
    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width - 100}, 20)`);
    
    const legendData = [
        { label: 'Regular', color: '#10099F' },
        { label: 'Maximum', color: '#2DD2C0' }
    ];
    
    const legendItems = legend.selectAll('.legend-item')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 20})`);
    
    legendItems.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d => d.color)
        .attr('opacity', 0.8);
    
    legendItems.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .style('font-size', '12px')
        .text(d => d.label);
    
    // Add network architecture diagram
    const archContainer = d3.select('#softmax-architecture');
    if (!archContainer.empty()) {
        drawSoftmaxArchitecture(archContainer);
    }
}

function drawSoftmaxArchitecture(container) {
    container.selectAll('*').remove();
    
    const width = container.node().getBoundingClientRect().width || 800;
    const height = 260;
    
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Center the diagram horizontally within the container
    const layerSpacing = 260;
    const offsetX = Math.max(20, (width - layerSpacing) / 2);
    const g = svg.append('g')
        .attr('transform', `translate(${offsetX}, 40)`);
    
    // Define network structure
    const inputNeurons = 4;
    const outputNeurons = 3;
    const neuronRadius = 20;
    
    // Calculate positions
    const inputY = d3.range(inputNeurons).map(i => 
        (i + 1) * height / (inputNeurons + 1) - 50
    );
    const outputY = d3.range(outputNeurons).map(i => 
        (i + 1) * height / (outputNeurons + 1) - 50
    );
    
    // Draw connections
    const connections = g.append('g').attr('class', 'connections');
    
    inputY.forEach((iy, i) => {
        outputY.forEach((oy, j) => {
            connections.append('line')
                .attr('class', 'connection')
                .attr('x1', neuronRadius)
                .attr('y1', iy)
                .attr('x2', layerSpacing - neuronRadius)
                .attr('y2', oy)
                .attr('stroke', '#CCCCCC')
                .attr('stroke-width', 1)
                .attr('opacity', 0.5);
        });
    });
    
    // Draw input neurons
    const inputGroup = g.append('g').attr('class', 'input-layer');
    
    inputY.forEach((y, i) => {
        inputGroup.append('circle')
            .attr('class', 'neuron input')
            .attr('cx', 0)
            .attr('cy', y)
            .attr('r', neuronRadius)
            .attr('fill', '#10099F')
            .attr('stroke', 'white')
            .attr('stroke-width', 2);
        
        inputGroup.append('text')
            .attr('x', 0)
            .attr('y', y)
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .style('fill', 'white')
            .style('font-size', '12px')
            .text(`x${i+1}`);
    });
    
    // Draw output neurons
    const outputGroup = g.append('g').attr('class', 'output-layer');
    
    outputY.forEach((y, i) => {
        outputGroup.append('circle')
            .attr('class', 'neuron output')
            .attr('cx', layerSpacing)
            .attr('cy', y)
            .attr('r', neuronRadius)
            .attr('fill', '#FC8484')
            .attr('stroke', 'white')
            .attr('stroke-width', 2);
        
        outputGroup.append('text')
            .attr('x', layerSpacing)
            .attr('y', y)
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .style('fill', 'white')
            .style('font-size', '12px')
            .text(`ŷ${i+1}`);
    });
    
    // Add labels
    g.append('text')
        .attr('x', 0)
        .attr('y', -30)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', '#10099F')
        .text('Input');
    
    g.append('text')
        .attr('x', layerSpacing)
        .attr('y', -30)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', '#FC8484')
        .text('Output (Softmax)');
    
    // Add weight matrix notation
    g.append('text')
        .attr('x', layerSpacing / 2)
        .attr('y', height / 2 - 50)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', '#262626')
        .text('W ∈ ℝ⁴ˣ³');
    
    // Add softmax notation
    g.append('text')
        .attr('x', layerSpacing + 80)
        .attr('y', height / 2 - 50)
        .attr('text-anchor', 'start')
        .style('font-size', '14px')
        .style('fill', '#262626')
        .text('softmax(Wx + b)');
}
