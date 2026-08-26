// General animations for the basics presentation

function initBasicsAnimations() {
    // Initialize simple neural network visualization
    initSimpleNetwork();

    // Initialize RL diagram
    initRLDiagram();

    // Initialize clustering visualizations
    initClusteringRaw();
    initClusteringLabeled();
    initKMeansDemo();
}

// Simple neural network visualization
function initSimpleNetwork() {
    const container = document.getElementById('simple-network-viz');
    if (!container || container.querySelector('svg')) return;
    
    const width = 800;
    const height = 400;
    
    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    // Network structure
    const layers = [
        { neurons: 3, x: 150, label: 'Input' },
        { neurons: 4, x: 400, label: 'Hidden' },
        { neurons: 2, x: 650, label: 'Output' }
    ];
    
    // Calculate neuron positions
    layers.forEach((layer, layerIndex) => {
        layer.positions = [];
        const spacing = height / (layer.neurons + 1);
        for (let i = 0; i < layer.neurons; i++) {
            layer.positions.push({
                x: layer.x,
                y: spacing * (i + 1),
                layerIndex: layerIndex,
                neuronIndex: i,
                activation: 0
            });
        }
    });
    
    // Generate random weights
    const weights = [];
    for (let i = 0; i < layers.length - 1; i++) {
        const layerWeights = [];
        for (let j = 0; j < layers[i].neurons; j++) {
            const neuronWeights = [];
            for (let k = 0; k < layers[i + 1].neurons; k++) {
                neuronWeights.push(Math.random() * 2 - 1); // Random weights between -1 and 1
            }
            layerWeights.push(neuronWeights);
        }
        weights.push(layerWeights);
    }
    
    // Draw connections with weights
    const connections = svg.append('g').attr('class', 'connections');
    const connectionLines = [];
    
    for (let i = 0; i < layers.length - 1; i++) {
        const currentLayer = layers[i];
        const nextLayer = layers[i + 1];
        const layerConnections = [];
        
        currentLayer.positions.forEach((source, si) => {
            const neuronConnections = [];
            nextLayer.positions.forEach((target, ti) => {
                const weight = weights[i][si][ti];
                const connection = connections.append('line')
                    .attr('class', 'connection')
                    .attr('x1', source.x)
                    .attr('y1', source.y)
                    .attr('x2', target.x)
                    .attr('y2', target.y)
                    .attr('stroke', weight > 0 ? '#10099F' : '#FC8484')
                    .attr('stroke-width', Math.abs(weight) * 3 + 2)  // Thicker edges: 2-5 instead of 0.5-3.5
                    .attr('opacity', 0.5 + Math.abs(weight) * 0.3);  // Higher base opacity for darker colors
                neuronConnections.push(connection);
            });
            layerConnections.push(neuronConnections);
        });
        connectionLines.push(layerConnections);
    }
    
    // Draw neurons
    const neurons = svg.append('g').attr('class', 'neurons');
    const neuronElements = [];
    
    layers.forEach((layer, layerIndex) => {
        const layerNeurons = [];
        layer.positions.forEach((pos, neuronIndex) => {
            const neuron = neurons.append('g')
                .attr('class', 'neuron-group')
                .attr('transform', `translate(${pos.x}, ${pos.y})`);
            
            // Neuron circle
            const circle = neuron.append('circle')
                .attr('class', `neuron ${layerIndex === 0 ? 'input' : layerIndex === 1 ? 'hidden' : 'output'}`)
                .attr('r', 20)
                .attr('fill', layerIndex === 0 ? '#10099F' : layerIndex === 1 ? '#2DD2C0' : '#FC8484')
                .attr('stroke', 'white')
                .attr('stroke-width', 2);
            
            // Neuron label
            if (layerIndex === 0) {
                neuron.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('y', 5)
                    .attr('fill', 'white')
                    .style('font-size', '14px')
                    .text(`x${neuronIndex + 1}`);
            } else if (layerIndex === 2) {
                neuron.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('y', 5)
                    .attr('fill', 'white')
                    .style('font-size', '14px')
                    .text(`y${neuronIndex + 1}`);
            }
            
            layerNeurons.push({ circle, pos });
        });
        neuronElements.push(layerNeurons);
        
        // Layer labels
        svg.append('text')
            .attr('x', layer.x)
            .attr('y', height - 20)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .text(layer.label);
    });
    
    // Animate signal propagation
    function animateSignal() {
        const duration = 2000;
        
        // Generate random input activations
        const inputActivations = Array(layers[0].neurons).fill(0).map(() => Math.random());
        
        // Animate input neurons
        neuronElements[0].forEach((neuron, i) => {
            neuron.circle
                .transition()
                .duration(300)
                .attr('r', 20 + inputActivations[i] * 10)
                .transition()
                .duration(300)
                .attr('r', 20);
        });
        
        // Forward propagation through layers
        setTimeout(() => {
            // Input to hidden layer
            const hiddenActivations = [];
            for (let j = 0; j < layers[1].neurons; j++) {
                let sum = 0;
                for (let i = 0; i < layers[0].neurons; i++) {
                    sum += inputActivations[i] * weights[0][i][j];
                    
                    // Animate signal along connection
                    const weight = weights[0][i][j];
                    const particle = svg.append('circle')
                        .attr('r', Math.abs(weight) * 5 + 2)
                        .attr('fill', '#FAC55B')
                        .attr('opacity', 0.8)
                        .attr('cx', layers[0].positions[i].x)
                        .attr('cy', layers[0].positions[i].y);
                    
                    particle.transition()
                        .duration(1000)  // Slower animation: 1000ms instead of 500ms
                        .attr('cx', layers[1].positions[j].x)
                        .attr('cy', layers[1].positions[j].y)
                        .remove();
                }
                hiddenActivations.push(Math.tanh(sum)); // Activation function
            }
            
            // Animate hidden neurons
            setTimeout(() => {
                neuronElements[1].forEach((neuron, j) => {
                    neuron.circle
                        .transition()
                        .duration(300)
                        .attr('r', 20 + Math.abs(hiddenActivations[j]) * 10)
                        .transition()
                        .duration(300)
                        .attr('r', 20);
                });
            }, 1000);  // Adjust timing to match slower particle animation
            
            // Hidden to output layer
            setTimeout(() => {
                const outputActivations = [];
                for (let k = 0; k < layers[2].neurons; k++) {
                    let sum = 0;
                    for (let j = 0; j < layers[1].neurons; j++) {
                        sum += hiddenActivations[j] * weights[1][j][k];
                        
                        // Animate signal along connection
                        const weight = weights[1][j][k];
                        const particle = svg.append('circle')
                            .attr('r', Math.abs(weight) * 5 + 2)
                            .attr('fill', '#FAC55B')
                            .attr('opacity', 0.8)
                            .attr('cx', layers[1].positions[j].x)
                            .attr('cy', layers[1].positions[j].y);
                        
                        particle.transition()
                            .duration(1000)  // Slower animation: 1000ms instead of 500ms
                            .attr('cx', layers[2].positions[k].x)
                            .attr('cy', layers[2].positions[k].y)
                            .remove();
                    }
                    outputActivations.push(Math.tanh(sum));
                }
                
                // Animate output neurons
                setTimeout(() => {
                    neuronElements[2].forEach((neuron, k) => {
                        neuron.circle
                            .transition()
                            .duration(300)
                            .attr('r', 20 + Math.abs(outputActivations[k]) * 10)
                            .transition()
                            .duration(300)
                            .attr('r', 20);
                    });
                }, 1000);  // Adjust timing to match slower particle animation
            }, 2000);  // Delay more for slower animation flow
        }, 300);
    }
    
    // Start animation after a delay
    setTimeout(animateSignal, 1000);
    
    // Repeat animation (increased interval for slower animations)
    const animationInterval = setInterval(animateSignal, 6000);
    
    // Clean up on slide change
    Reveal.on('slidechanged', () => {
        clearInterval(animationInterval);
    });
}

// TODO ADDRESSED: Fixed diagram centering and text positioning
// Reinforcement Learning Diagram
function initRLDiagram() {
    const container = document.getElementById('rl-diagram');
    if (!container || container.querySelector('svg')) return;
    
    const width = 800;
    const height = 450;  // Increased height to accommodate description below
    
    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    // Add gradient definitions
    const defs = svg.append('defs');
    
    // Gradient for agent
    const agentGradient = defs.append('linearGradient')
        .attr('id', 'agent-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%');
    
    agentGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#10099F');
    
    agentGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#2DD2C0');
    
    // Gradient for environment
    const envGradient = defs.append('linearGradient')
        .attr('id', 'env-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%');
    
    envGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#FAC55B');
    
    envGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#FFA05F');
    
    // Arrow markers
    const arrowColors = ['#10099F', '#FC8484', '#2DD2C0'];
    arrowColors.forEach((color, i) => {
        defs.append('marker')
            .attr('id', `arrowhead-${i}`)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 10)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', color);
    });
    
    // Components
    const components = [
        { id: 'agent', x: 200, y: 200, width: 140, height: 80, label: 'Agent', icon: '🤖' },
        { id: 'environment', x: 500, y: 200, width: 140, height: 80, label: 'Environment', icon: '🌍' }
    ];
    
    // Draw components with better styling
    components.forEach(comp => {
        const g = svg.append('g');
        
        // Shadow
        g.append('rect')
            .attr('x', comp.x - comp.width / 2 + 3)
            .attr('y', comp.y - comp.height / 2 + 3)
            .attr('width', comp.width)
            .attr('height', comp.height)
            .attr('fill', 'rgba(0,0,0,0.1)')
            .attr('rx', 12);
        
        // Main rectangle with gradient
        g.append('rect')
            .attr('class', 'rl-component')
            .attr('x', comp.x - comp.width / 2)
            .attr('y', comp.y - comp.height / 2)
            .attr('width', comp.width)
            .attr('height', comp.height)
            .attr('fill', comp.id === 'agent' ? 'url(#agent-gradient)' : 'url(#env-gradient)')
            .attr('stroke', 'none')
            .attr('rx', 12);
        
        // Icon
        g.append('text')
            .attr('x', comp.x)
            .attr('y', comp.y - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '24px')
            .text(comp.icon);
        
        // Label
        g.append('text')
            .attr('class', 'rl-label')
            .attr('x', comp.x)
            .attr('y', comp.y + 25)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .style('fill', 'white')
            .text(comp.label);
    });
    
    // Arrows and labels with better positioning
    const arrows = [
        {
            id: 'action',
            x1: 270, y1: 170,
            x2: 430, y2: 170,
            label: 'Action (a)',
            curve: -40,
            color: '#10099F',
            markerIndex: 0,
            description: 'Agent chooses action'
        },
        {
            id: 'state',
            x1: 430, y1: 200,
            x2: 270, y2: 200,
            label: 'State (s)',
            curve: 0,
            color: '#2DD2C0',
            markerIndex: 2,
            description: 'Environment state'
        },
        {
            id: 'reward',
            x1: 430, y1: 230,
            x2: 270, y2: 230,
            label: 'Reward (r)',
            curve: 40,
            color: '#FC8484',
            markerIndex: 1,
            description: 'Feedback signal'
        }
    ];
    
    arrows.forEach(arrow => {
        // Create curved path
        const midX = (arrow.x1 + arrow.x2) / 2;
        const midY = (arrow.y1 + arrow.y2) / 2 + arrow.curve;
        
        const g = svg.append('g');
        
        // Path with thicker stroke
        const path = g.append('path')
            .attr('class', 'rl-arrow')
            .attr('d', `M${arrow.x1},${arrow.y1} Q${midX},${midY} ${arrow.x2},${arrow.y2}`)
            .attr('fill', 'none')
            .attr('stroke', arrow.color)
            .attr('stroke-width', 3)
            .attr('marker-end', `url(#arrowhead-${arrow.markerIndex})`);
        
        // Label background
        const labelBg = g.append('rect')
            .attr('x', midX - 40)
            .attr('y', midY - Math.sign(arrow.curve) * 25 - 10)
            .attr('width', 80)
            .attr('height', 20)
            .attr('fill', 'white')
            .attr('stroke', arrow.color)
            .attr('stroke-width', 1)
            .attr('rx', 10)
            .attr('opacity', 0.9);
        
        // Add label
        const label = g.append('text')
            .attr('x', midX)
            .attr('y', midY - Math.sign(arrow.curve) * 25 + 3)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .style('fill', arrow.color)
            .text(arrow.label);
    });
    
    // Animate flow
    function animateFlow() {
        arrows.forEach((arrow, i) => {
            setTimeout(() => {
                const particle = svg.append('circle')
                    .attr('r', 5)
                    .attr('fill', '#FAC55B')
                    .attr('cx', arrow.x1)
                    .attr('cy', arrow.y1);
                
                const midX = (arrow.x1 + arrow.x2) / 2;
                const midY = (arrow.y1 + arrow.y2) / 2 + arrow.curve;
                
                // Animate along curve
                particle.transition()
                    .duration(1500)
                    .attrTween('transform', function() {
                        const path = d3.path();
                        path.moveTo(arrow.x1, arrow.y1);
                        path.quadraticCurveTo(midX, midY, arrow.x2, arrow.y2);
                        const length = path.toString().length;
                        
                        return function(t) {
                            const p = getPointAtLength(path.toString(), t * length);
                            return `translate(${p.x - arrow.x1}, ${p.y - arrow.y1})`;
                        };
                    })
                    .on('end', function() {
                        d3.select(this).remove();
                    });
            }, i * 500);
        });
    }
    
    // Helper function to get point on path
    function getPointAtLength(pathString, length) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathString);
        const point = path.getPointAtLength(length);
        return { x: point.x, y: point.y };
    }
    
    // Start animation
    setTimeout(animateFlow, 1000);
    setInterval(animateFlow, 3000);
    
    // Add description box - properly centered
    const descGroup = svg.append('g')
        .attr('transform', `translate(${width / 2}, ${height - 50})`);
    
    descGroup.append('rect')
        .attr('x', -200)
        .attr('y', -20)
        .attr('width', 400)
        .attr('height', 40)
        .attr('fill', '#F5F5F5')
        .attr('stroke', '#EEEEEE')
        .attr('rx', 15);
    
    descGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 5)  // Vertically center text within the rectangle
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', '#262626')
        .text('Agent learns optimal behavior through trial and error');
}

// ---------------------------------------------------------------------
// Clustering visualizations
// ---------------------------------------------------------------------

const CLUSTER_COLORS = ['#10099F', '#2DD2C0', '#FC8484', '#FFA05F', '#FAC55B', '#00FFBA'];

// Deterministic PRNG so the sampled points are the same on every load
function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function gaussianRandom(rng) {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

let _clusterData = null;

// Points sampled from three 2D Gaussians, cached so every slide draws the same data
function getClusterData() {
    if (_clusterData) return _clusterData;

    const rng = mulberry32(42);
    const clusterDefs = [
        { mean: [1, 8], std: [0.7, 0.6] },
        { mean: [8.5, 8], std: [0.65, 0.7] },
        { mean: [4.5, 1], std: [0.7, 0.6] }
    ];

    const points = [];
    clusterDefs.forEach((def, ci) => {
        for (let i = 0; i < 40; i++) {
            points.push({
                x: def.mean[0] + gaussianRandom(rng) * def.std[0],
                y: def.mean[1] + gaussianRandom(rng) * def.std[1],
                cluster: ci
            });
        }
    });

    _clusterData = points;
    return _clusterData;
}

// Draws a scatter plot of `data` into `container`, returning the svg + scales
// so callers (like the k-means demo) can recolor points or add centroids later.
function renderScatter(container, data, options = {}) {
    const width = 600;
    const height = 400;
    const margin = { top: 30, right: 30, bottom: 30, left: 30 };

    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('max-width', '100%')
        .style('height', 'auto');

    const xExtent = d3.extent(data, d => d.x);
    const yExtent = d3.extent(data, d => d.y);
    const xPad = (xExtent[1] - xExtent[0]) * 0.15;
    const yPad = (yExtent[1] - yExtent[0]) * 0.15;

    const xScale = d3.scaleLinear()
        .domain([xExtent[0] - xPad, xExtent[1] + xPad])
        .range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear()
        .domain([yExtent[0] - yPad, yExtent[1] + yPad])
        .range([height - margin.bottom, margin.top]);

    svg.selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 6)
        .attr('fill', d => options.colorBy ? CLUSTER_COLORS[d[options.colorBy] % CLUSTER_COLORS.length] : '#10099F')
        .attr('opacity', 0.85)
        .attr('stroke', '#262626')
        .attr('stroke-width', 0.5);

    return { svg, xScale, yScale };
}

function initClusteringRaw() {
    const container = document.getElementById('clustering-viz-raw');
    if (!container || container.querySelector('svg')) return;
    renderScatter(container, getClusterData());
}

function initClusteringLabeled() {
    const container = document.getElementById('clustering-viz-labeled');
    if (!container || container.querySelector('svg')) return;
    renderScatter(container, getClusterData(), { colorBy: 'cluster' });
}

// Simple Lloyd's-algorithm k-means, seeded so results are reproducible per k
function runKMeansAlgorithm(data, k, seed) {
    const rng = mulberry32(seed);

    const centroidIdx = [];
    while (centroidIdx.length < k) {
        const idx = Math.floor(rng() * data.length);
        if (!centroidIdx.includes(idx)) centroidIdx.push(idx);
    }
    let centroids = centroidIdx.map(i => [data[i].x, data[i].y]);
    let assignments = new Array(data.length).fill(0);

    for (let iter = 0; iter < 50; iter++) {
        let changed = false;

        data.forEach((d, i) => {
            let minDist = Infinity;
            let minC = 0;
            centroids.forEach((c, ci) => {
                const dist = (d.x - c[0]) ** 2 + (d.y - c[1]) ** 2;
                if (dist < minDist) {
                    minDist = dist;
                    minC = ci;
                }
            });
            if (assignments[i] !== minC) changed = true;
            assignments[i] = minC;
        });

        const sums = centroids.map(() => [0, 0, 0]);
        data.forEach((d, i) => {
            const c = assignments[i];
            sums[c][0] += d.x;
            sums[c][1] += d.y;
            sums[c][2] += 1;
        });
        centroids = centroids.map((c, ci) => sums[ci][2] > 0 ? [sums[ci][0] / sums[ci][2], sums[ci][1] / sums[ci][2]] : c);

        if (!changed) break;
    }

    return { assignments, centroids };
}

function initKMeansDemo() {
    const container = document.getElementById('clustering-viz-kmeans');
    if (!container || container.querySelector('svg')) return;

    const data = getClusterData();
    const { svg, xScale, yScale } = renderScatter(container, data);

    const slider = document.getElementById('kmeans-k-slider');
    const valueLabel = document.getElementById('kmeans-k-value');
    const runBtn = document.getElementById('kmeans-run-btn');
    if (!slider || !valueLabel || !runBtn) return;

    const symbolGenerator = d3.symbol().type(d3.symbolCross).size(220);

    function runKMeans() {
        const k = parseInt(slider.value, 10);
        valueLabel.textContent = k;

        const { assignments, centroids } = runKMeansAlgorithm(data, k, 7 + k);

        svg.selectAll('circle')
            .data(data)
            .attr('fill', (d, i) => CLUSTER_COLORS[assignments[i] % CLUSTER_COLORS.length]);

        svg.selectAll('path.centroid')
            .data(centroids)
            .join('path')
            .attr('class', 'centroid')
            .attr('d', symbolGenerator)
            .attr('transform', d => `translate(${xScale(d[0])}, ${yScale(d[1])}) rotate(45)`)
            .attr('fill', 'none')
            .attr('stroke', '#262626')
            .attr('stroke-width', 3);
    }

    slider.addEventListener('input', () => {
        valueLabel.textContent = slider.value;
    });
    slider.addEventListener('change', runKMeans);
    runBtn.addEventListener('click', runKMeans);

    runKMeans();
}