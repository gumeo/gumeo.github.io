/**
 * Backpropagation Visualization
 * Interactive visualization of gradient flow through neural network
 */

(function() {
    'use strict';

    // Wait for Reveal to be ready
    if (typeof Reveal !== 'undefined') {
        Reveal.on('ready', initBackpropVisualization);
        Reveal.on('slidechanged', initBackpropVisualization);
    } else {
        document.addEventListener('DOMContentLoaded', initBackpropVisualization);
    }

    function initBackpropVisualization() {
        const container = document.getElementById('backprop-viz');
        if (!container) return;

        // Clear previous content
        container.innerHTML = '';

        // Setup dimensions with fallback for zero width
        const width = Math.max(600, container.clientWidth || 600);
        const height = 350;
        const margin = { top: 40, right: 40, bottom: 40, left: 40 };
        const innerWidth = Math.max(100, width - margin.left - margin.right);
        const innerHeight = Math.max(100, height - margin.top - margin.bottom);

        // Create SVG
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Network architecture
        const layers = [
            { name: 'Input', neurons: 3, x: 0 },
            { name: 'Hidden', neurons: 4, x: innerWidth / 2 },
            { name: 'Output', neurons: 2, x: innerWidth }
        ];

        const neuronRadius = 20;
        const layerSpacing = innerWidth / 2;

        // Calculate neuron positions
        layers.forEach(layer => {
            layer.neurons_data = [];
            const layerHeight = layer.neurons * (neuronRadius * 2.5);
            const startY = (innerHeight - layerHeight) / 2 + neuronRadius;
            
            for (let i = 0; i < layer.neurons; i++) {
                layer.neurons_data.push({
                    x: layer.x,
                    y: startY + i * (neuronRadius * 2.5),
                    layer: layer.name,
                    index: i
                });
            }
        });

        // Draw connections
        const connections = g.append('g').attr('class', 'connections');
        
        for (let l = 0; l < layers.length - 1; l++) {
            const currentLayer = layers[l];
            const nextLayer = layers[l + 1];
            
            currentLayer.neurons_data.forEach(source => {
                nextLayer.neurons_data.forEach(target => {
                    connections.append('line')
                        .attr('class', 'connection')
                        .attr('x1', source.x)
                        .attr('y1', source.y)
                        .attr('x2', target.x)
                        .attr('y2', target.y)
                        .style('stroke', '#ddd')
                        .style('stroke-width', 2)
                        .style('opacity', 0.5);
                });
            });
        }

        // Draw neurons
        const neurons = g.append('g').attr('class', 'neurons');
        
        layers.forEach(layer => {
            const layerGroup = neurons.append('g')
                .attr('class', `layer-${layer.name.toLowerCase()}`);
            
            // Add layer label
            layerGroup.append('text')
                .attr('x', layer.x)
                .attr('y', -10)
                .attr('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .style('font-size', '14px')
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
                .style('fill', layer.name === 'Input' ? '#10099F' : 
                               layer.name === 'Hidden' ? '#2DD2C0' : '#FC8484')
                .style('stroke', '#fff')
                .style('stroke-width', 2);
        });

        // Gradient flow particles group
        const particlesGroup = g.append('g').attr('class', 'particles');

        // Animation state
        let animationStep = 0;
        let isAnimating = false;
        let showMath = true;

        // Control elements
        const startBtn = document.getElementById('bp-start');
        const stepBtn = document.getElementById('bp-step');
        const resetBtn = document.getElementById('bp-reset');
        const showMathCheckbox = document.getElementById('bp-show-math');
        const statusText = document.getElementById('bp-status');
        const equationDiv = document.getElementById('bp-equation');

        // Gradient flow steps
        const gradientSteps = [
            {
                name: 'Loss Gradient',
                description: 'Computing ∂L/∂o (gradient of loss w.r.t. output)',
                fromLayer: 2,
                toLayer: 2,
                equation: '∂J/∂o = ∂L/∂o',
                color: '#FC8484'
            },
            {
                name: 'Output Weight Gradient',
                description: 'Computing ∂J/∂W² = (∂J/∂o) h^T + λW²',
                fromLayer: 2,
                toLayer: 1,
                equation: '∂J/∂W² = (∂J/∂o) h^T + λW²',
                color: '#FFA05F'
            },
            {
                name: 'Hidden Gradient',
                description: 'Computing ∂J/∂h = W²^T (∂J/∂o)',
                fromLayer: 1,
                toLayer: 1,
                equation: '∂J/∂h = W²^T (∂J/∂o)',
                color: '#FAC55B'
            },
            {
                name: 'Activation Gradient',
                description: 'Computing ∂J/∂z = (∂J/∂h) ⊙ φ\'(z)',
                fromLayer: 1,
                toLayer: 1,
                equation: '∂J/∂z = (∂J/∂h) ⊙ φ\'(z)',
                color: '#2DD2C0'
            },
            {
                name: 'Hidden Weight Gradient',
                description: 'Computing ∂J/∂W¹ = (∂J/∂z) x^T + λW¹',
                fromLayer: 1,
                toLayer: 0,
                equation: '∂J/∂W¹ = (∂J/∂z) x^T + λW¹',
                color: '#10099F'
            }
        ];

        function createGradientParticle(fromNeuron, toNeuron, color, duration = 1000) {
            const particle = particlesGroup.append('circle')
                .attr('r', 5)
                .style('fill', color)
                .style('opacity', 0.8)
                .attr('cx', fromNeuron.x)
                .attr('cy', fromNeuron.y);

            particle.transition()
                .duration(duration)
                .attr('cx', toNeuron.x)
                .attr('cy', toNeuron.y)
                .on('end', function() {
                    d3.select(this).remove();
                });

            // Add gradient value text
            const text = particlesGroup.append('text')
                .attr('x', fromNeuron.x)
                .attr('y', fromNeuron.y - 10)
                .style('font-size', '10px')
                .style('fill', color)
                .style('font-weight', 'bold')
                .text('∇')
                .style('opacity', 0.8);

            text.transition()
                .duration(duration)
                .attr('x', toNeuron.x)
                .attr('y', toNeuron.y - 10)
                .on('end', function() {
                    d3.select(this).remove();
                });
        }

        function animateGradientFlow(step) {
            const gradStep = gradientSteps[step];
            if (!gradStep) return;

            // Update status
            statusText.textContent = gradStep.description;
            
            // Show equation if enabled
            if (showMath && equationDiv) {
                equationDiv.style.display = 'block';
                equationDiv.innerHTML = `<strong>Current computation:</strong> ${gradStep.equation}`;
            }

            // Highlight relevant layers
            layers[gradStep.fromLayer].neurons_data.forEach(neuron => {
                d3.select(`.layer-${layers[gradStep.fromLayer].name.toLowerCase()}`)
                    .selectAll('.neuron')
                    .filter(d => d.index === neuron.index)
                    .transition()
                    .duration(200)
                    .style('stroke', gradStep.color)
                    .style('stroke-width', 4)
                    .transition()
                    .duration(200)
                    .style('stroke', '#fff')
                    .style('stroke-width', 2);
            });

            // Animate gradient particles
            if (gradStep.fromLayer !== gradStep.toLayer) {
                // Flow between layers
                const fromNeurons = layers[gradStep.fromLayer].neurons_data;
                const toNeurons = layers[gradStep.toLayer].neurons_data;
                
                fromNeurons.forEach((fromNeuron, i) => {
                    toNeurons.forEach((toNeuron, j) => {
                        setTimeout(() => {
                            createGradientParticle(fromNeuron, toNeuron, gradStep.color);
                        }, i * 100 + j * 50);
                    });
                });

                // Highlight connections
                connections.selectAll('line')
                    .filter(function() {
                        const x1 = +d3.select(this).attr('x1');
                        const x2 = +d3.select(this).attr('x2');
                        return Math.abs(x1 - layers[gradStep.fromLayer].x) < 1 &&
                               Math.abs(x2 - layers[gradStep.toLayer].x) < 1;
                    })
                    .transition()
                    .duration(500)
                    .style('stroke', gradStep.color)
                    .style('stroke-width', 3)
                    .style('opacity', 1)
                    .transition()
                    .duration(500)
                    .style('stroke', '#ddd')
                    .style('stroke-width', 2)
                    .style('opacity', 0.5);
            }
        }

        function runFullAnimation() {
            if (!isAnimating) return;
            
            animateGradientFlow(animationStep);
            animationStep++;
            
            if (animationStep >= gradientSteps.length) {
                animationStep = 0;
                isAnimating = false;
                statusText.textContent = 'Backpropagation complete! Gradients computed for all parameters.';
                startBtn.textContent = 'Start Backprop';
            } else {
                setTimeout(() => runFullAnimation(), 2000);
            }
        }

        function reset() {
            isAnimating = false;
            animationStep = 0;
            particlesGroup.selectAll('*').remove();
            statusText.textContent = 'Ready to start backpropagation...';
            if (equationDiv) equationDiv.style.display = 'none';
            startBtn.textContent = 'Start Backprop';
            
            // Reset all connections
            connections.selectAll('line')
                .style('stroke', '#ddd')
                .style('stroke-width', 2)
                .style('opacity', 0.5);
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
                    runFullAnimation();
                }
            });
        }

        if (stepBtn) {
            stepBtn.addEventListener('click', () => {
                if (!isAnimating) {
                    animateGradientFlow(animationStep);
                    animationStep++;
                    if (animationStep >= gradientSteps.length) {
                        animationStep = 0;
                        statusText.textContent = 'Backpropagation complete! Click Step to restart.';
                    }
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', reset);
        }

        if (showMathCheckbox) {
            showMathCheckbox.addEventListener('change', (e) => {
                showMath = e.target.checked;
                if (!showMath && equationDiv) {
                    equationDiv.style.display = 'none';
                }
            });
        }

        // Initialize
        reset();
    }

    // Also initialize training cycle visualization
    function initTrainingCycleVisualization() {
        const container = document.getElementById('training-cycle-viz');
        if (!container) return;

        // Clear previous content
        container.innerHTML = '';

        // Setup dimensions with fallback for zero width
        const width = Math.max(600, container.clientWidth || 600);
        const height = 350;
        const margin = { top: 40, right: 40, bottom: 40, left: 40 };
        const innerWidth = Math.max(100, width - margin.left - margin.right);
        const innerHeight = Math.max(100, height - margin.top - margin.bottom);

        // Create SVG
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create circular training flow diagram
        const centerX = innerWidth / 2;
        const centerY = innerHeight / 2;
        const radius = Math.max(30, Math.min(innerWidth, innerHeight) / 3);

        // Training phases
        const phases = [
            { name: 'Initialize', angle: -90, color: '#10099F', icon: '🎲' },
            { name: 'Forward', angle: -18, color: '#2DD2C0', icon: '→' },
            { name: 'Loss', angle: 54, color: '#FAC55B', icon: '📊' },
            { name: 'Backward', angle: 126, color: '#FC8484', icon: '←' },
            { name: 'Update', angle: 198, color: '#FFA05F', icon: '🔄' }
        ];

        // Draw cycle circle
        g.append('circle')
            .attr('cx', centerX)
            .attr('cy', centerY)
            .attr('r', radius)
            .style('fill', 'none')
            .style('stroke', '#ddd')
            .style('stroke-width', 2)
            .style('stroke-dasharray', '5,5');

        // Draw phase nodes
        const phaseNodes = g.selectAll('.phase-node')
            .data(phases)
            .enter()
            .append('g')
            .attr('class', 'phase-node')
            .attr('transform', d => {
                const angleRad = (d.angle * Math.PI) / 180;
                const x = centerX + radius * Math.cos(angleRad);
                const y = centerY + radius * Math.sin(angleRad);
                return `translate(${x},${y})`;
            });

        phaseNodes.append('circle')
            .attr('r', 30)
            .style('fill', d => d.color)
            .style('opacity', 0.8)
            .style('stroke', '#fff')
            .style('stroke-width', 3);

        phaseNodes.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', -35)
            .style('font-weight', 'bold')
            .style('font-size', '12px')
            .text(d => d.name);

        phaseNodes.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', 5)
            .style('font-size', '20px')
            .text(d => d.icon);

        // Draw arrows between phases
        phases.forEach((phase, i) => {
            const nextPhase = phases[(i + 1) % phases.length];
            const startAngle = (phase.angle + 36) * Math.PI / 180;
            const endAngle = (nextPhase.angle - 36) * Math.PI / 180;
            
            const path = d3.path();
            path.arc(centerX, centerY, radius, startAngle, endAngle);
            
            g.append('path')
                .attr('d', path.toString())
                .style('fill', 'none')
                .style('stroke', '#999')
                .style('stroke-width', 2)
                .attr('marker-end', 'url(#arrowhead)');
        });

        // Add arrowhead marker
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 5)
            .attr('refY', 0)
            .attr('markerWidth', 5)
            .attr('markerHeight', 5)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .style('fill', '#999');

        // Animation state
        let currentPhase = 0;
        let isTraining = false;
        let epoch = 0;
        let loss = 2.3;
        let accuracy = 0.1;

        // Control elements
        const startBtn = document.getElementById('cycle-start');
        const pauseBtn = document.getElementById('cycle-pause');
        const resetBtn = document.getElementById('cycle-reset');
        const lrSlider = document.getElementById('cycle-lr');
        const lrValue = document.getElementById('cycle-lr-value');
        const epochText = document.getElementById('cycle-epoch');
        const lossText = document.getElementById('cycle-loss');
        const accText = document.getElementById('cycle-acc');
        const phaseText = document.getElementById('cycle-phase');
        const detailText = document.getElementById('cycle-detail');

        // Highlight current phase
        function highlightPhase(index) {
            phaseNodes.selectAll('circle')
                .transition()
                .duration(300)
                .attr('r', (d, i) => i === index ? 35 : 30)
                .style('opacity', (d, i) => i === index ? 1 : 0.5);

            const phase = phases[index];
            if (phaseText) phaseText.textContent = phase.name;
            
            const details = {
                'Initialize': 'Setting random weights and biases',
                'Forward': 'Computing predictions through layers',
                'Loss': 'Calculating error between predictions and targets',
                'Backward': 'Computing gradients via chain rule',
                'Update': 'Adjusting parameters using gradients'
            };
            
            if (detailText) detailText.textContent = details[phase.name];
        }

        // Animate training cycle
        function animateCycle() {
            if (!isTraining) return;

            highlightPhase(currentPhase);
            
            // Update metrics based on phase
            if (currentPhase === 2) { // Loss phase
                loss = Math.max(0.3, loss * (0.95 + Math.random() * 0.05));
                if (lossText) lossText.textContent = loss.toFixed(4);
            } else if (currentPhase === 4) { // Update phase
                accuracy = Math.min(0.99, accuracy + (1 - accuracy) * 0.05);
                if (accText) accText.textContent = (accuracy * 100).toFixed(1) + '%';
                
                if (currentPhase === 4) {
                    epoch++;
                    if (epochText) epochText.textContent = epoch;
                }
            }

            currentPhase = (currentPhase + 1) % phases.length;
            
            setTimeout(() => animateCycle(), 1500);
        }

        function resetCycle() {
            isTraining = false;
            currentPhase = 0;
            epoch = 0;
            loss = 2.3;
            accuracy = 0.1;
            
            highlightPhase(0);
            if (epochText) epochText.textContent = '0';
            if (lossText) lossText.textContent = '-';
            if (accText) accText.textContent = '-';
            if (phaseText) phaseText.textContent = 'Idle';
            if (detailText) detailText.textContent = 'Click Start to begin training';
        }

        // Event handlers
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                isTraining = true;
                animateCycle();
            });
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                isTraining = false;
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', resetCycle);
        }

        if (lrSlider && lrValue) {
            lrSlider.addEventListener('input', () => {
                lrValue.textContent = lrSlider.value;
            });
        }

        // Initialize
        resetCycle();
    }

    // Initialize training cycle visualization too
    if (typeof Reveal !== 'undefined') {
        Reveal.on('ready', initTrainingCycleVisualization);
        Reveal.on('slidechanged', initTrainingCycleVisualization);
    } else {
        document.addEventListener('DOMContentLoaded', initTrainingCycleVisualization);
    }

})();