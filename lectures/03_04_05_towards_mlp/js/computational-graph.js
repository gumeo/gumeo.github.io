/**
 * Computational Graph Visualization
 * Interactive visualization of forward propagation computational graph
 */

(function() {
    'use strict';

    // Wait for Reveal to be ready
    if (typeof Reveal !== 'undefined') {
        Reveal.on('ready', initComputationalGraph);
        Reveal.on('slidechanged', initComputationalGraph);
    } else {
        document.addEventListener('DOMContentLoaded', initComputationalGraph);
    }

    function initComputationalGraph() {
        const container = document.getElementById('computational-graph-container');
        if (!container) return;

        // Clear previous content
        container.innerHTML = '';

        // Setup dimensions
        const width = container.clientWidth;
        const height = 400;
        const margin = { top: 40, right: 60, bottom: 60, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Define computational graph nodes
        const nodes = [
            // Variables (squares)
            { id: 'x', type: 'variable', label: 'x', x: 0, y: innerHeight, description: 'Input vector x ∈ ℝᵈ' },
            { id: 'W1', type: 'variable', label: 'W¹', x: 0, y: innerHeight * 0.7, description: 'Hidden weights W¹ ∈ ℝʰˣᵈ' },
            { id: 'z', type: 'variable', label: 'z', x: innerWidth * 0.25, y: innerHeight * 0.8, description: 'Pre-activation z = W¹x' },
            { id: 'h', type: 'variable', label: 'h', x: innerWidth * 0.45, y: innerHeight * 0.7, description: 'Hidden activation h = φ(z)' },
            { id: 'W2', type: 'variable', label: 'W²', x: innerWidth * 0.45, y: innerHeight * 0.4, description: 'Output weights W² ∈ ℝᵍˣʰ' },
            { id: 'o', type: 'variable', label: 'o', x: innerWidth * 0.65, y: innerHeight * 0.5, description: 'Output o = W²h' },
            { id: 'y', type: 'variable', label: 'y', x: innerWidth * 0.65, y: innerHeight * 0.2, description: 'Target label y' },
            { id: 'L', type: 'variable', label: 'L', x: innerWidth * 0.85, y: innerHeight * 0.3, description: 'Loss L = l(o, y)' },
            { id: 's', type: 'variable', label: 's', x: innerWidth * 0.85, y: innerHeight * 0.1, description: 'Regularization s = λ/2(||W¹||² + ||W²||²)' },
            { id: 'J', type: 'variable', label: 'J', x: innerWidth, y: innerHeight * 0.2, description: 'Objective J = L + s' },
            
            // Operations (circles)
            { id: 'matmul1', type: 'operation', label: '×', x: innerWidth * 0.125, y: innerHeight * 0.85, description: 'Matrix multiplication' },
            { id: 'activation', type: 'operation', label: 'φ', x: innerWidth * 0.35, y: innerHeight * 0.75, description: 'Activation function (ReLU)' },
            { id: 'matmul2', type: 'operation', label: '×', x: innerWidth * 0.55, y: innerHeight * 0.55, description: 'Matrix multiplication' },
            { id: 'loss_fn', type: 'operation', label: 'l', x: innerWidth * 0.75, y: innerHeight * 0.35, description: 'Loss function' },
            { id: 'regularize', type: 'operation', label: 'λ/2||·||²', x: innerWidth * 0.75, y: innerHeight * 0.05, description: 'L2 regularization' },
            { id: 'add', type: 'operation', label: '+', x: innerWidth * 0.925, y: innerHeight * 0.2, description: 'Addition' }
        ];

        // Define edges
        const edges = [
            { source: 'x', target: 'matmul1' },
            { source: 'W1', target: 'matmul1' },
            { source: 'matmul1', target: 'z' },
            { source: 'z', target: 'activation' },
            { source: 'activation', target: 'h' },
            { source: 'h', target: 'matmul2' },
            { source: 'W2', target: 'matmul2' },
            { source: 'matmul2', target: 'o' },
            { source: 'o', target: 'loss_fn' },
            { source: 'y', target: 'loss_fn' },
            { source: 'loss_fn', target: 'L' },
            { source: 'W1', target: 'regularize' },
            { source: 'W2', target: 'regularize' },
            { source: 'regularize', target: 's' },
            { source: 'L', target: 'add' },
            { source: 's', target: 'add' },
            { source: 'add', target: 'J' }
        ];

        // Add gradient definitions for arrows
        const defs = svg.append('defs');
        
        defs.append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .style('fill', '#666');

        defs.append('marker')
            .attr('id', 'arrow-highlight')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .style('fill', '#10099F');

        // Draw edges
        const edgeGroup = g.append('g').attr('class', 'edges');
        
        edges.forEach(edge => {
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            
            edgeGroup.append('line')
                .attr('class', 'edge')
                .attr('data-source', edge.source)
                .attr('data-target', edge.target)
                .attr('x1', source.x)
                .attr('y1', source.y)
                .attr('x2', target.x)
                .attr('y2', target.y)
                .style('stroke', '#666')
                .style('stroke-width', 1.5)
                .style('opacity', 0.6)
                .attr('marker-end', 'url(#arrow)');
        });

        // Draw nodes
        const nodeGroup = g.append('g').attr('class', 'nodes');
        
        const nodeElements = nodeGroup.selectAll('.node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', d => `node node-${d.type}`)
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .style('cursor', 'pointer');

        // Add shapes based on type
        nodeElements.each(function(d) {
            const group = d3.select(this);
            
            if (d.type === 'variable') {
                // Draw square for variables
                group.append('rect')
                    .attr('x', -20)
                    .attr('y', -15)
                    .attr('width', 40)
                    .attr('height', 30)
                    .style('fill', '#f9f9f9')
                    .style('stroke', '#10099F')
                    .style('stroke-width', 2);
            } else {
                // Draw circle for operations
                group.append('circle')
                    .attr('r', 20)
                    .style('fill', '#fff')
                    .style('stroke', '#2DD2C0')
                    .style('stroke-width', 2);
            }
            
            // Add label
            group.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', d.type === 'variable' ? 4 : 5)
                .style('font-weight', 'bold')
                .style('font-size', d.label.length > 2 ? '11px' : '14px')
                .text(d.label);
        });

        // Add tooltip
        const tooltip = d3.select(container)
            .append('div')
            .attr('class', 'graph-tooltip')
            .style('position', 'absolute')
            .style('padding', '10px')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('border-radius', '5px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('font-size', '12px')
            .style('z-index', 1000);

        // Highlight function
        function highlightPath(nodeId) {
            // Reset all edges
            edgeGroup.selectAll('.edge')
                .style('stroke', '#666')
                .style('stroke-width', 1.5)
                .style('opacity', 0.6)
                .attr('marker-end', 'url(#arrow)');

            // Find all edges in the path to this node
            const pathEdges = [];
            const visited = new Set();
            
            function findPath(targetId) {
                if (visited.has(targetId)) return;
                visited.add(targetId);
                
                edges.forEach(edge => {
                    if (edge.target === targetId) {
                        pathEdges.push(edge);
                        findPath(edge.source);
                    }
                });
            }
            
            findPath(nodeId);
            
            // Highlight path edges
            pathEdges.forEach(edge => {
                edgeGroup.selectAll('.edge')
                    .filter(function() {
                        return d3.select(this).attr('data-source') === edge.source &&
                               d3.select(this).attr('data-target') === edge.target;
                    })
                    .style('stroke', '#10099F')
                    .style('stroke-width', 2.5)
                    .style('opacity', 1)
                    .attr('marker-end', 'url(#arrow-highlight)');
            });
        }

        // Add interactivity
        nodeElements
            .on('mouseenter', function(event, d) {
                // Highlight node
                d3.select(this).select('rect, circle')
                    .transition()
                    .duration(200)
                    .style('fill', d.type === 'variable' ? '#e8f4ff' : '#e8fff9');
                
                // Show tooltip
                tooltip
                    .style('opacity', 1)
                    .html(`<strong>${d.label}</strong><br>${d.description}`)
                    .style('left', (d.x + margin.left + 30) + 'px')
                    .style('top', (d.y + margin.top - 10) + 'px');
                
                // Highlight path
                highlightPath(d.id);
            })
            .on('mouseleave', function(event, d) {
                // Reset node
                d3.select(this).select('rect, circle')
                    .transition()
                    .duration(200)
                    .style('fill', d.type === 'variable' ? '#f9f9f9' : '#fff');
                
                // Hide tooltip
                tooltip.style('opacity', 0);
                
                // Reset edges
                edgeGroup.selectAll('.edge')
                    .transition()
                    .duration(200)
                    .style('stroke', '#666')
                    .style('stroke-width', 1.5)
                    .style('opacity', 0.6)
                    .attr('marker-end', 'url(#arrow)');
            });

        // Also handle forward propagation animation
        initForwardPropAnimation();
    }

    function initForwardPropAnimation() {
        const container = document.getElementById('forward-prop-full-viz');
        if (!container) return;

        // Clear previous content
        container.innerHTML = '';

        // Setup dimensions
        const width = container.clientWidth;
        const height = 350;
        const margin = { top: 40, right: 40, bottom: 40, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Network architecture for forward prop demo
        const layers = [
            { name: 'Input (x)', neurons: 3, x: 0 },
            { name: 'z = W¹x', neurons: 4, x: innerWidth * 0.3 },
            { name: 'h = φ(z)', neurons: 4, x: innerWidth * 0.6 },
            { name: 'o = W²h', neurons: 2, x: innerWidth }
        ];

        const neuronRadius = 18;

        // Calculate neuron positions
        layers.forEach(layer => {
            layer.neurons_data = [];
            const layerHeight = layer.neurons * (neuronRadius * 2.5);
            const startY = (innerHeight - layerHeight) / 2 + neuronRadius;
            
            for (let i = 0; i < layer.neurons; i++) {
                layer.neurons_data.push({
                    x: layer.x,
                    y: startY + i * (neuronRadius * 2.5),
                    value: Math.random() * 2 - 1, // Random initial values
                    index: i
                });
            }
        });

        // Draw connections
        const connections = g.append('g').attr('class', 'connections');
        
        for (let l = 0; l < layers.length - 1; l++) {
            if (l === 1) continue; // Skip z to h (same layer, just activation)
            
            const sourceLayer = l === 2 ? layers[2] : layers[l];
            const targetLayer = l === 2 ? layers[3] : layers[l + 1];
            
            sourceLayer.neurons_data.forEach(source => {
                targetLayer.neurons_data.forEach(target => {
                    connections.append('line')
                        .attr('class', `connection conn-${l}`)
                        .attr('x1', source.x)
                        .attr('y1', source.y)
                        .attr('x2', target.x)
                        .attr('y2', target.y)
                        .style('stroke', '#ddd')
                        .style('stroke-width', 1.5)
                        .style('opacity', 0.4);
                });
            });
        }

        // Draw curved arrow from z to h (activation)
        const activationPath = d3.path();
        activationPath.moveTo(layers[1].x + 30, innerHeight/2);
        activationPath.quadraticCurveTo(
            (layers[1].x + layers[2].x) / 2, 
            innerHeight/2 - 50,
            layers[2].x - 30, 
            innerHeight/2
        );
        
        connections.append('path')
            .attr('class', 'activation-arrow')
            .attr('d', activationPath.toString())
            .style('stroke', '#2DD2C0')
            .style('stroke-width', 2)
            .style('fill', 'none')
            .style('stroke-dasharray', '5,5')
            .style('opacity', 0.6);

        // Draw neurons
        const neurons = g.append('g').attr('class', 'neurons');
        
        layers.forEach((layer, layerIdx) => {
            const layerGroup = neurons.append('g')
                .attr('class', `layer-${layerIdx}`);
            
            // Add layer label
            layerGroup.append('text')
                .attr('x', layer.x)
                .attr('y', -10)
                .attr('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .style('font-size', '12px')
                .text(layer.name);
            
            // Add neurons
            layerGroup.selectAll('.neuron')
                .data(layer.neurons_data)
                .enter()
                .append('circle')
                .attr('class', 'neuron')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('r', neuronRadius)
                .style('fill', '#fff')
                .style('stroke', layerIdx === 0 ? '#10099F' : 
                               layerIdx === 3 ? '#FC8484' : '#2DD2C0')
                .style('stroke-width', 2);
            
            // Add value labels
            layerGroup.selectAll('.value-label')
                .data(layer.neurons_data)
                .enter()
                .append('text')
                .attr('class', 'value-label')
                .attr('x', d => d.x)
                .attr('y', d => d.y + 4)
                .attr('text-anchor', 'middle')
                .style('font-size', '10px')
                .style('font-weight', 'bold')
                .style('opacity', 0)
                .text(d => d.value.toFixed(2));
        });

        // Particles group for animation
        const particlesGroup = g.append('g').attr('class', 'particles');

        // Animation controls
        const startBtn = document.getElementById('fp-full-start');
        const stepBtn = document.getElementById('fp-full-step');
        const resetBtn = document.getElementById('fp-full-reset');
        const speedSlider = document.getElementById('fp-full-speed');
        const speedValue = document.getElementById('fp-full-speed-value');
        const statusText = document.getElementById('fp-full-status');

        let animationStep = 0;
        let isAnimating = false;
        let animationSpeed = 1;

        // Update speed display
        if (speedSlider && speedValue) {
            speedSlider.addEventListener('input', () => {
                animationSpeed = parseFloat(speedSlider.value);
                speedValue.textContent = animationSpeed + 'x';
            });
        }

        // Animation functions
        function createParticle(x1, y1, x2, y2, value, duration) {
            const particle = particlesGroup.append('g');
            
            const circle = particle.append('circle')
                .attr('r', 6)
                .style('fill', '#10099F')
                .style('opacity', 0.8)
                .attr('cx', x1)
                .attr('cy', y1);
            
            const text = particle.append('text')
                .attr('x', x1)
                .attr('y', y1 - 10)
                .attr('text-anchor', 'middle')
                .style('font-size', '10px')
                .style('font-weight', 'bold')
                .style('fill', '#10099F')
                .text(value.toFixed(2));
            
            circle.transition()
                .duration(duration / animationSpeed)
                .attr('cx', x2)
                .attr('cy', y2)
                .on('end', function() {
                    particle.remove();
                });
            
            text.transition()
                .duration(duration / animationSpeed)
                .attr('x', x2)
                .attr('y', y2 - 10);
        }

        function animateForwardStep(step) {
            if (step === 0) {
                // Input to z
                statusText.textContent = 'Step 1: Computing z = W¹x (matrix multiplication)';
                
                layers[0].neurons_data.forEach((source, i) => {
                    layers[1].neurons_data.forEach((target, j) => {
                        setTimeout(() => {
                            createParticle(source.x, source.y, target.x, target.y, source.value, 800);
                        }, i * 100 + j * 50);
                    });
                });
                
                // Show z values after animation
                setTimeout(() => {
                    g.selectAll('.layer-1 .value-label')
                        .transition()
                        .duration(300)
                        .style('opacity', 1);
                }, 1000 / animationSpeed);
                
            } else if (step === 1) {
                // z to h (activation)
                statusText.textContent = 'Step 2: Computing h = φ(z) (applying ReLU activation)';
                
                // Highlight activation arrow
                g.select('.activation-arrow')
                    .transition()
                    .duration(500 / animationSpeed)
                    .style('stroke', '#00FFBA')
                    .style('stroke-width', 3)
                    .style('opacity', 1)
                    .transition()
                    .duration(500 / animationSpeed)
                    .style('stroke', '#2DD2C0')
                    .style('stroke-width', 2)
                    .style('opacity', 0.6);
                
                // Copy and transform values
                layers[1].neurons_data.forEach((neuron, i) => {
                    const activated = Math.max(0, neuron.value); // ReLU
                    layers[2].neurons_data[i].value = activated;
                });
                
                // Show h values
                g.selectAll('.layer-2 .value-label')
                    .text(d => d.value.toFixed(2))
                    .transition()
                    .duration(300)
                    .style('opacity', 1);
                    
            } else if (step === 2) {
                // h to o
                statusText.textContent = 'Step 3: Computing o = W²h (final output)';
                
                layers[2].neurons_data.forEach((source, i) => {
                    layers[3].neurons_data.forEach((target, j) => {
                        setTimeout(() => {
                            createParticle(source.x, source.y, target.x, target.y, source.value, 800);
                        }, i * 100 + j * 50);
                    });
                });
                
                // Show output values
                setTimeout(() => {
                    g.selectAll('.layer-3 .value-label')
                        .transition()
                        .duration(300)
                        .style('opacity', 1);
                    
                    statusText.textContent = 'Forward propagation complete! Output computed.';
                }, 1000 / animationSpeed);
            }
        }

        function runFullForwardAnimation() {
            if (!isAnimating) return;
            
            animateForwardStep(animationStep);
            animationStep++;
            
            if (animationStep > 2) {
                animationStep = 0;
                isAnimating = false;
                startBtn.textContent = 'Start Forward Pass';
            } else {
                setTimeout(() => runFullForwardAnimation(), 2000 / animationSpeed);
            }
        }

        function resetAnimation() {
            isAnimating = false;
            animationStep = 0;
            particlesGroup.selectAll('*').remove();
            g.selectAll('.value-label').style('opacity', 0);
            statusText.textContent = 'Ready to start forward propagation...';
            if (startBtn) startBtn.textContent = 'Start Forward Pass';
        }

        // Event handlers
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (isAnimating) {
                    isAnimating = false;
                    startBtn.textContent = 'Resume';
                } else {
                    isAnimating = true;
                    startBtn.textContent = 'Pause';
                    runFullForwardAnimation();
                }
            });
        }

        if (stepBtn) {
            stepBtn.addEventListener('click', () => {
                if (!isAnimating) {
                    animateForwardStep(animationStep);
                    animationStep++;
                    if (animationStep > 2) {
                        animationStep = 0;
                    }
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', resetAnimation);
        }

        // Initialize
        resetAnimation();
    }

})();