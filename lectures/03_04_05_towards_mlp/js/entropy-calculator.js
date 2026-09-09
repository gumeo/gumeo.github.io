// Interactive Entropy Calculator
function initEntropyCalculator() {
    const container = d3.select('#entropy-visualization');
    if (container.empty()) return;
    
    // Clear previous content
    container.selectAll('*').remove();
    
    const width = container.node().getBoundingClientRect().width || 800;
    const height = 320;
    const margin = { top: 40, right: 60, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Number of categories
    const numCategories = 10;
    let distribution = new Array(numCategories).fill(1/numCategories); // Start with uniform
    
    // Scales
    const xScale = d3.scaleBand()
        .domain(d3.range(numCategories))
        .range([0, innerWidth])
        .padding(0.1);
    
    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);
    
    // Add axes
    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d => `C${d+1}`))
        .append('text')
        .attr('x', innerWidth / 2)
        .attr('y', 40)
        .attr('fill', '#262626')
        .style('text-anchor', 'middle')
        .text('Categories');
    
    g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale).ticks(10, '.0%'))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -45)
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
        .text('Probability Distribution & Entropy');
    
    // Create bars
    const bars = g.selectAll('.prob-bar')
        .data(distribution)
        .enter()
        .append('rect')
        .attr('class', 'prob-bar')
        .attr('x', (d, i) => xScale(i))
        .attr('width', xScale.bandwidth())
        .attr('fill', '#10099F')
        .attr('opacity', 0.8);
    
    // Create value labels
    const valueLabels = g.selectAll('.value-label')
        .data(distribution)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', (d, i) => xScale(i) + xScale.bandwidth() / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#262626');
    
    // Draggable sliders for custom distribution
    const sliderGroup = g.append('g')
        .attr('class', 'sliders')
        .style('display', 'none');
    
    const sliders = sliderGroup.selectAll('.slider')
        .data(distribution)
        .enter()
        .append('circle')
        .attr('class', 'slider')
        .attr('cx', (d, i) => xScale(i) + xScale.bandwidth() / 2)
        .attr('r', 6)
        .attr('fill', '#FAC55B')
        .attr('stroke', '#262626')
        .attr('stroke-width', 2)
        .style('cursor', 'ns-resize')
        .call(d3.drag()
            .on('drag', function(event, d) {
                const i = sliders.nodes().indexOf(this);
                const newY = Math.max(0, Math.min(innerHeight, event.y));
                const newValue = yScale.invert(newY);
                distribution[i] = Math.max(0, Math.min(1, newValue));
                normalizeDistribution();
                update();
            }));
    
    // Calculate entropy
    function calculateEntropy(dist) {
        let entropy = 0;
        for (let p of dist) {
            if (p > 0) {
                entropy -= p * Math.log(p);
            }
        }
        return entropy;
    }
    
    // Normalize distribution to sum to 1
    function normalizeDistribution() {
        const sum = distribution.reduce((a, b) => a + b, 0);
        if (sum > 0) {
            distribution = distribution.map(p => p / sum);
        }
    }
    
    // Preset distributions
    const distributions = {
        uniform: () => new Array(numCategories).fill(1/numCategories),
        peaked: () => {
            const dist = new Array(numCategories).fill(0.02);
            dist[4] = 0.82; // Peak at category 5
            return dist;
        },
        binary: () => {
            const dist = new Array(numCategories).fill(0);
            dist[0] = 0.5;
            dist[1] = 0.5;
            return dist;
        },
        custom: () => distribution // Keep current
    };
    
    // Update function
    function update() {
        // Update bars
        bars.data(distribution)
            .transition()
            .duration(300)
            .attr('y', d => yScale(d))
            .attr('height', d => innerHeight - yScale(d))
            .attr('fill', (d, i) => {
                const maxProb = Math.max(...distribution);
                return d === maxProb ? '#2DD2C0' : '#10099F';
            });
        
        // Update value labels
        valueLabels.data(distribution)
            .transition()
            .duration(300)
            .attr('y', d => yScale(d) - 5)
            .text(d => d > 0.005 ? (d * 100).toFixed(1) + '%' : '');
        
        // Update sliders
        sliders.data(distribution)
            .transition()
            .duration(300)
            .attr('cy', d => yScale(d));
        
        // Calculate and display entropy
        const entropy = calculateEntropy(distribution);
        const entropyBits = entropy / Math.log(2); // Convert to bits
        
        d3.select('#entropy-value')
            .text(`H = ${entropy.toFixed(2)} nats = ${entropyBits.toFixed(2)} bits`);
        
        // Color code entropy value
        const maxEntropy = Math.log(numCategories);
        const entropyRatio = entropy / maxEntropy;
        const color = entropyRatio > 0.8 ? '#FC8484' : // High entropy
                     entropyRatio > 0.5 ? '#FAC55B' : // Medium entropy
                     '#2DD2C0'; // Low entropy
        
        d3.select('#entropy-value').style('color', color);
    }
    
    // Connect to distribution type selector
    const distSelector = d3.select('#dist-type');
    if (!distSelector.empty()) {
        distSelector.on('change', function() {
            const type = this.value;
            distribution = distributions[type]();
            
            // Show/hide sliders for custom mode
            sliderGroup.style('display', type === 'custom' ? 'block' : 'none');
            
            update();
        });
    }
    
    // Add entropy scale visualization
    const entropyScale = svg.append('g')
        .attr('transform', `translate(${width - 50}, ${margin.top})`);
    
    const maxEntropy = Math.log(numCategories);
    const entropyHeight = innerHeight;
    
    // Gradient for entropy scale
    const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'entropy-gradient')
        .attr('x1', '0%')
        .attr('y1', '100%')
        .attr('x2', '0%')
        .attr('y2', '0%');
    
    gradient.append('stop')
        .attr('offset', '0%')
        .style('stop-color', '#2DD2C0');
    
    gradient.append('stop')
        .attr('offset', '50%')
        .style('stop-color', '#FAC55B');
    
    gradient.append('stop')
        .attr('offset', '100%')
        .style('stop-color', '#FC8484');
    
    entropyScale.append('rect')
        .attr('width', 20)
        .attr('height', entropyHeight)
        .attr('fill', 'url(#entropy-gradient)')
        .attr('stroke', '#262626')
        .attr('stroke-width', 1);
    
    entropyScale.append('text')
        .attr('x', 10)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('H');
    
    entropyScale.append('text')
        .attr('x', 10)
        .attr('y', entropyHeight + 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .text('0');
    
    entropyScale.append('text')
        .attr('x', 10)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .text(maxEntropy.toFixed(1));
    
    // Current entropy indicator
    const entropyIndicator = entropyScale.append('g')
        .attr('class', 'entropy-indicator');
    
    entropyIndicator.append('line')
        .attr('x1', -5)
        .attr('x2', 25)
        .attr('stroke', '#262626')
        .attr('stroke-width', 2);
    
    entropyIndicator.append('circle')
        .attr('cx', 10)
        .attr('cy', 0)
        .attr('r', 4)
        .attr('fill', '#262626');
    
    // Update entropy indicator position
    function updateEntropyIndicator() {
        const entropy = calculateEntropy(distribution);
        const y = entropyHeight * (1 - entropy / maxEntropy);
        
        entropyIndicator
            .transition()
            .duration(300)
            .attr('transform', `translate(0, ${y})`);
    }
    
    // Initialize
    update();
    updateEntropyIndicator();
    
    // Update indicator when distribution changes
    const originalUpdate = update;
    update = function() {
        originalUpdate();
        updateEntropyIndicator();
    };
}