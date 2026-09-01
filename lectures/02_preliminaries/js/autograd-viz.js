// Autograd Visualization for Automatic Differentiation Section
// Based on D2L Chapter 2.5

// Initialize all autograd visualizations once Reveal (and slide layout) is ready
function initVisibleAutogradVizzes() {
    const currentSlide = (typeof Reveal !== 'undefined' && Reveal.getCurrentSlide) ? Reveal.getCurrentSlide() : document;
    if (currentSlide.querySelector('#comp-graph-viz')) {
        initComputationalGraphViz();
    }
    if (currentSlide.querySelector('#gradient-comp-viz')) {
        initGradientCompViz();
    }
    if (currentSlide.querySelector('#detach-viz')) {
        initDetachViz();
    }
}

if (typeof Reveal !== 'undefined') {
    Reveal.on('ready', initVisibleAutogradVizzes);
} else {
    document.addEventListener('DOMContentLoaded', initVisibleAutogradVizzes);
}

// Computational Graph Visualization
function initComputationalGraphViz() {
    const container = d3.select('#comp-graph-viz');
    if (container.empty()) return;
    container.selectAll('*').remove();

    const width = container.node().getBoundingClientRect().width || 800;
    const height = 400;
    
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Define the computational graph structure
    const nodes = [
        {id: 'x', label: 'x', level: 0, type: 'input'},
        {id: 'mul1', label: '×2', level: 1, type: 'operation'},
        {id: 'dot', label: 'dot', level: 2, type: 'operation'},
        {id: 'mul2', label: '×', level: 2, type: 'operation'},
        {id: 'y', label: 'y', level: 3, type: 'output'}
    ];
    
    const edges = [
        {source: 'x', target: 'mul1', label: ''},
        {source: 'x', target: 'dot', label: ''},
        {source: 'x', target: 'dot', label: ''},
        {source: 'dot', target: 'mul2', label: 'x·x'},
        {source: 'mul1', target: 'mul2', label: '2'},
        {source: 'mul2', target: 'y', label: '2x·x'}
    ];
    
    // Calculate positions
    const levelWidth = width / 4;
    const nodeHeight = height / 3;
    
    nodes.forEach(node => {
        node.x = (node.level + 0.5) * levelWidth;
        if (node.level === 0 || node.level === 3) {
            node.y = height / 2;
        } else if (node.level === 1) {
            node.y = height / 3;
        } else {
            node.y = node.id === 'dot' ? 2 * height / 3 : height / 3;
        }
    });
    
    // Create gradients for edges
    const defs = svg.append('defs');
    
    const gradient = defs.append('linearGradient')
        .attr('id', 'edge-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
    
    gradient.append('stop')
        .attr('offset', '0%')
        .style('stop-color', '#10099F')
        .style('stop-opacity', 0.8);
    
    gradient.append('stop')
        .attr('offset', '100%')
        .style('stop-color', '#2DD2C0')
        .style('stop-opacity', 0.8);
    
    // Draw edges
    const edgeGroup = svg.append('g').attr('class', 'edges');
    
    edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        edgeGroup.append('line')
            .attr('x1', sourceNode.x)
            .attr('y1', sourceNode.y)
            .attr('x2', targetNode.x)
            .attr('y2', targetNode.y)
            .attr('stroke', 'url(#edge-gradient)')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrowhead)');
        
        // Add edge labels
        if (edge.label) {
            edgeGroup.append('text')
                .attr('x', (sourceNode.x + targetNode.x) / 2)
                .attr('y', (sourceNode.y + targetNode.y) / 2 - 10)
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px')
                .attr('fill', '#666')
                .text(edge.label);
        }
    });
    
    // Add arrowhead marker
    defs.append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 25)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#2DD2C0');
    
    // Draw nodes
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    
    nodes.forEach(node => {
        const g = nodeGroup.append('g')
            .attr('transform', `translate(${node.x}, ${node.y})`);
        
        // Node circle
        g.append('circle')
            .attr('r', 25)
            .attr('fill', node.type === 'input' ? '#10099F' : 
                          node.type === 'output' ? '#FC8484' : '#2DD2C0')
            .attr('fill-opacity', 0.2)
            .attr('stroke', node.type === 'input' ? '#10099F' : 
                           node.type === 'output' ? '#FC8484' : '#2DD2C0')
            .attr('stroke-width', 2);
        
        // Node label
        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .attr('fill', '#262626')
            .text(node.label);
    });
    
    // Add title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('fill', '#10099F')
        .text('y = 2 × (x · x)');
}

// Gradient Computation Visualization
function initGradientCompViz() {
    const container = d3.select('#gradient-comp-viz');
    if (container.empty()) return;
    container.selectAll('*').remove();

    const width = container.node().getBoundingClientRect().width || 800;
    const height = 450;
    
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create forward and backward pass visualization
    const passWidth = width / 2 - 20;
    
    // Forward Pass
    const forwardG = svg.append('g')
        .attr('transform', 'translate(10, 50)');
    
    forwardG.append('rect')
        .attr('width', passWidth)
        .attr('height', height - 100)
        .attr('fill', '#10099F')
        .attr('fill-opacity', 0.05)
        .attr('stroke', '#10099F')
        .attr('stroke-width', 2)
        .attr('rx', 10);
    
    forwardG.append('text')
        .attr('x', passWidth / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('fill', '#10099F')
        .text('Forward Pass');
    
    // Forward pass steps
    const forwardSteps = [
        'x = [0, 1, 2, 3]',
        'x·x = 0+1+4+9 = 14',
        'y = 2 × 14 = 28',
        'Build computation graph'
    ];
    
    forwardSteps.forEach((step, i) => {
        const g = forwardG.append('g')
            .attr('transform', `translate(20, ${80 + i * 70})`);
        
        g.append('circle')
            .attr('r', 20)
            .attr('fill', '#10099F')
            .attr('fill-opacity', 0.2);
        
        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text(i + 1);
        
        g.append('text')
            .attr('x', 35)
            .attr('dy', '0.35em')
            .attr('font-size', '14px')
            .text(step);
    });
    
    // Backward Pass
    const backwardG = svg.append('g')
        .attr('transform', `translate(${width / 2 + 10}, 50)`);
    
    backwardG.append('rect')
        .attr('width', passWidth)
        .attr('height', height - 100)
        .attr('fill', '#FC8484')
        .attr('fill-opacity', 0.05)
        .attr('stroke', '#FC8484')
        .attr('stroke-width', 2)
        .attr('rx', 10);
    
    backwardG.append('text')
        .attr('x', passWidth / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('fill', '#FC8484')
        .text('Backward Pass');
    
    // Backward pass steps
    const backwardSteps = [
        '∂y/∂y = 1',
        '∂y/∂(x·x) = 2',
        '∂(x·x)/∂x = 2x',
        '∂y/∂x = 2 × 2x = 4x'
    ];
    
    backwardSteps.forEach((step, i) => {
        const g = backwardG.append('g')
            .attr('transform', `translate(20, ${80 + i * 70})`);
        
        g.append('circle')
            .attr('r', 20)
            .attr('fill', '#FC8484')
            .attr('fill-opacity', 0.2);
        
        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text(i + 1);
        
        g.append('text')
            .attr('x', 35)
            .attr('dy', '0.35em')
            .attr('font-size', '14px')
            .text(step);
    });
    
    // Add arrow between passes
    const arrowY = height / 2;
    svg.append('path')
        .attr('d', `M ${width/2 - 15} ${arrowY} L ${width/2 + 5} ${arrowY}`)
        .attr('stroke', '#FFA05F')
        .attr('stroke-width', 3)
        .attr('marker-end', 'url(#gradient-arrow)');
    
    // Arrow marker
    svg.append('defs').append('marker')
        .attr('id', 'gradient-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#FFA05F');
}

// Detach Visualization
function initDetachViz() {
    const container = d3.select('#detach-viz');
    if (container.empty()) return;
    container.selectAll('*').remove();

    const width = container.node().getBoundingClientRect().width || 800;
    const height = 400;
    
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create two graphs side by side
    const graphWidth = (width - 40) / 2;
    
    // Normal gradient flow
    const normalG = svg.append('g')
        .attr('transform', 'translate(10, 50)');
    
    normalG.append('text')
        .attr('x', graphWidth / 2)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', '#10099F')
        .text('Normal: z = x³');
    
    // Draw normal graph
    drawDetachGraph(normalG, graphWidth, height - 100, false);
    
    // With detach
    const detachG = svg.append('g')
        .attr('transform', `translate(${width / 2 + 10}, 50)`);
    
    detachG.append('text')
        .attr('x', graphWidth / 2)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', '#FC8484')
        .text('Detached: z = u × x');
    
    // Draw detached graph
    drawDetachGraph(detachG, graphWidth, height - 100, true);
}

function drawDetachGraph(g, width, height, withDetach) {
    const nodes = [
        {id: 'x', label: 'x', x: width / 4, y: height / 2},
        {id: 'y', label: 'y = x²', x: width / 2, y: height / 3},
        {id: 'u', label: withDetach ? 'u = detach(y)' : 'y', x: width / 2, y: 2 * height / 3},
        {id: 'z', label: 'z', x: 3 * width / 4, y: height / 2}
    ];
    
    const edges = [
        {source: 'x', target: 'y', blocked: false},
        {source: 'y', target: 'u', blocked: withDetach},
        {source: 'u', target: 'z', blocked: false},
        {source: 'x', target: 'z', blocked: false}
    ];
    
    // Draw edges
    edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        g.append('line')
            .attr('x1', sourceNode.x)
            .attr('y1', sourceNode.y)
            .attr('x2', targetNode.x)
            .attr('y2', targetNode.y)
            .attr('stroke', edge.blocked ? '#FF0000' : '#2DD2C0')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', edge.blocked ? '5,5' : 'none')
            .attr('opacity', edge.blocked ? 0.5 : 1);
    });
    
    // Draw nodes
    nodes.forEach(node => {
        const nodeG = g.append('g')
            .attr('transform', `translate(${node.x}, ${node.y})`);
        
        nodeG.append('circle')
            .attr('r', 25)
            .attr('fill', node.id === 'u' && withDetach ? '#FF0000' : '#10099F')
            .attr('fill-opacity', 0.2)
            .attr('stroke', node.id === 'u' && withDetach ? '#FF0000' : '#10099F')
            .attr('stroke-width', 2);
        
        nodeG.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text(node.label);
    });
    
    // Add gradient value annotations
    g.append('text')
        .attr('x', width / 2)
        .attr('y', height - 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#666')
        .text(withDetach ? '∂z/∂x = x²' : '∂z/∂x = 3x²');
}

// Reveal.js integration - reinitialize on slide change
if (typeof Reveal !== 'undefined') {
    Reveal.on('slidechanged', event => {
        // Check if current slide has autograd visualizations
        const currentSlide = event.currentSlide;
        if (currentSlide.querySelector('#comp-graph-viz')) {
            const container = d3.select('#comp-graph-viz');
            container.selectAll('*').remove();
            initComputationalGraphViz();
        }
        if (currentSlide.querySelector('#gradient-comp-viz')) {
            const container = d3.select('#gradient-comp-viz');
            container.selectAll('*').remove();
            initGradientCompViz();
        }
        if (currentSlide.querySelector('#detach-viz')) {
            const container = d3.select('#detach-viz');
            container.selectAll('*').remove();
            initDetachViz();
        }
    });
}