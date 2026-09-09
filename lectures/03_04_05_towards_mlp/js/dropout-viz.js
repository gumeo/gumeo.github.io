// Dropout Visualization for Multilayer Perceptrons
(function() {
    'use strict';

    // Wait for Reveal.js to be ready
    if (typeof Reveal !== 'undefined') {
        Reveal.on('ready', initDropoutVisualization);
        Reveal.on('slidechanged', initDropoutVisualization);
    } else {
        document.addEventListener('DOMContentLoaded', initDropoutVisualization);
    }

    function initDropoutVisualization() {
        const container = document.getElementById('dropout-viz');
        if (!container || container.hasAttribute('data-initialized')) return;
        container.setAttribute('data-initialized', 'true');

        // Clear any existing content
        container.innerHTML = '';

        // Configuration
        const width = container.clientWidth || 800;
        const height = 400;
        const margin = { top: 40, right: 40, bottom: 40, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Network architecture
        const layers = [
            { name: 'Input', neurons: 4, x: 0.15 },
            { name: 'Hidden 1', neurons: 6, x: 0.38 },
            { name: 'Hidden 2', neurons: 5, x: 0.62 },
            { name: 'Output', neurons: 3, x: 0.85 }
        ];

        // Create SVG
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', '#ffffff');

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Calculate neuron positions
        const neurons = [];
        const connections = [];
        
        layers.forEach((layer, layerIdx) => {
            const layerX = layer.x * innerWidth;
            const spacing = innerHeight / (layer.neurons + 1);
            
            for (let i = 0; i < layer.neurons; i++) {
                const neuron = {
                    id: `${layerIdx}-${i}`,
                    layer: layerIdx,
                    layerName: layer.name,
                    x: layerX,
                    y: spacing * (i + 1),
                    active: true,
                    value: Math.random()
                };
                neurons.push(neuron);
                
                // Create connections to previous layer
                if (layerIdx > 0) {
                    const prevLayer = layers[layerIdx - 1];
                    for (let j = 0; j < prevLayer.neurons; j++) {
                        connections.push({
                            source: `${layerIdx - 1}-${j}`,
                            target: neuron.id,
                            weight: (Math.random() - 0.5) * 2,
                            active: true
                        });
                    }
                }
            }
        });

        // Draw connections
        const connectionLines = g.append('g')
            .attr('class', 'connections')
            .selectAll('line')
            .data(connections)
            .enter()
            .append('line')
            .attr('x1', d => neurons.find(n => n.id === d.source).x)
            .attr('y1', d => neurons.find(n => n.id === d.source).y)
            .attr('x2', d => neurons.find(n => n.id === d.target).x)
            .attr('y2', d => neurons.find(n => n.id === d.target).y)
            .attr('stroke', d => d.weight > 0 ? '#10099F' : '#FC8484')
            .attr('stroke-width', d => Math.abs(d.weight) * 2)
            .attr('stroke-opacity', 0.3);

        // Draw neurons
        const neuronGroups = g.append('g')
            .attr('class', 'neurons')
            .selectAll('g')
            .data(neurons)
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        const neuronCircles = neuronGroups.append('circle')
            .attr('r', 18)
            .attr('fill', d => {
                if (d.layer === 0) return '#10099F';
                if (d.layer === layers.length - 1) return '#FC8484';
                return '#2DD2C0';
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        // Add neuron labels
        neuronGroups.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('fill', 'white')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .text((d, i) => {
                const layerNeurons = neurons.filter(n => n.layer === d.layer);
                const neuronIndex = layerNeurons.indexOf(d) + 1;
                return neuronIndex;
            });

        // Add layer labels
        layers.forEach((layer, idx) => {
            g.append('text')
                .attr('x', layer.x * innerWidth)
                .attr('y', -10)
                .attr('text-anchor', 'middle')
                .attr('font-size', '14px')
                .attr('font-weight', 'bold')
                .attr('fill', '#262626')
                .text(layer.name);
        });

        // Apply dropout function
        function applyDropout(dropoutRate) {
            // Reset all neurons and connections
            neurons.forEach(n => {
                n.active = true;
                n.dropped = false;
            });
            connections.forEach(c => c.active = true);

            // Apply dropout to hidden layers only
            neurons.forEach(neuron => {
                if (neuron.layer > 0 && neuron.layer < layers.length - 1) {
                    if (Math.random() < dropoutRate) {
                        neuron.active = false;
                        neuron.dropped = true;
                        
                        // Deactivate connections from this neuron
                        connections.forEach(conn => {
                            if (conn.source === neuron.id || conn.target === neuron.id) {
                                conn.active = false;
                            }
                        });
                    }
                }
            });

            // Update visualization
            updateVisualization();
        }

        // Update visualization function
        function updateVisualization() {
            // Update neurons
            neuronCircles
                .transition()
                .duration(500)
                .attr('fill', d => {
                    if (!d.active) return '#EEEEEE';
                    if (d.layer === 0) return '#10099F';
                    if (d.layer === layers.length - 1) return '#FC8484';
                    return '#2DD2C0';
                })
                .attr('opacity', d => d.active ? 1 : 0.3);

            // Update connections
            connectionLines
                .transition()
                .duration(500)
                .attr('stroke-opacity', d => {
                    const sourceActive = neurons.find(n => n.id === d.source).active;
                    const targetActive = neurons.find(n => n.id === d.target).active;
                    return (sourceActive && targetActive) ? 0.3 : 0.05;
                })
                .attr('stroke-width', d => {
                    const sourceActive = neurons.find(n => n.id === d.source).active;
                    const targetActive = neurons.find(n => n.id === d.target).active;
                    return (sourceActive && targetActive) ? Math.abs(d.weight) * 2 : 1;
                });

            // Add dropout indicators
            neuronGroups.selectAll('.dropout-x').remove();
            neuronGroups
                .filter(d => d.dropped)
                .append('text')
                .attr('class', 'dropout-x')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .attr('fill', '#FC8484')
                .attr('font-size', '24px')
                .attr('font-weight', 'bold')
                .text('×')
                .style('opacity', 0)
                .transition()
                .duration(300)
                .style('opacity', 1);
        }

        // Set up controls
        const dropoutSlider = document.getElementById('dropout-rate');
        const dropoutValue = document.getElementById('dropout-value');
        const applyButton = document.getElementById('apply-dropout');
        const resetButton = document.getElementById('reset-dropout');

        if (dropoutSlider) {
            dropoutSlider.addEventListener('input', function() {
                const value = this.value / 100;
                if (dropoutValue) {
                    dropoutValue.textContent = value.toFixed(2);
                }
            });
        }

        if (applyButton) {
            applyButton.addEventListener('click', function() {
                const rate = dropoutSlider ? dropoutSlider.value / 100 : 0.5;
                applyDropout(rate);
                
                // Animate button
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 100);
            });
        }

        if (resetButton) {
            resetButton.addEventListener('click', function() {
                // Reset all neurons
                neurons.forEach(n => {
                    n.active = true;
                    n.dropped = false;
                });
                connections.forEach(c => c.active = true);
                updateVisualization();
                
                // Remove dropout indicators
                neuronGroups.selectAll('.dropout-x').remove();
                
                // Animate button
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 100);
            });
        }

        // Initial state
        updateVisualization();
    }

    // Training comparison visualization
    function initTrainingComparison() {
        const container = document.getElementById('training-comparison');
        if (!container || container.hasAttribute('data-initialized')) return;
        container.setAttribute('data-initialized', 'true');

        // Clear any existing content
        container.innerHTML = '';

        const width = container.clientWidth || 800;
        const height = 400;
        const margin = { top: 40, right: 80, bottom: 60, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Sample training data
        const epochs = 50;
        const data = {
            withoutDropout: {
                train: [],
                test: [],
                color: '#FC8484'
            },
            withDropout: {
                train: [],
                test: [],
                color: '#10099F'
            }
        };

        // Generate synthetic training curves
        for (let i = 0; i <= epochs; i++) {
            // Without dropout - overfitting
            data.withoutDropout.train.push({
                epoch: i,
                loss: 2.5 * Math.exp(-i / 8) + 0.1 + Math.random() * 0.05
            });
            data.withoutDropout.test.push({
                epoch: i,
                loss: 2.5 * Math.exp(-i / 15) + 0.4 + Math.random() * 0.1 + (i > 20 ? (i - 20) * 0.01 : 0)
            });

            // With dropout - better generalization
            data.withDropout.train.push({
                epoch: i,
                loss: 2.5 * Math.exp(-i / 12) + 0.3 + Math.random() * 0.08
            });
            data.withDropout.test.push({
                epoch: i,
                loss: 2.5 * Math.exp(-i / 12) + 0.35 + Math.random() * 0.06
            });
        }

        // Scales
        const xScale = d3.scaleLinear()
            .domain([0, epochs])
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, 3])
            .range([innerHeight, 0]);

        // Line generator
        const line = d3.line()
            .x(d => xScale(d.epoch))
            .y(d => yScale(d.loss))
            .curve(d3.curveMonotoneX);

        // Add axes
        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale).ticks(10))
            .append('text')
            .attr('x', innerWidth / 2)
            .attr('y', 40)
            .attr('fill', '#262626')
            .style('text-anchor', 'middle')
            .text('Epoch');

        g.append('g')
            .call(d3.axisLeft(yScale))
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -40)
            .attr('x', -innerHeight / 2)
            .attr('fill', '#262626')
            .style('text-anchor', 'middle')
            .text('Loss');

        // Add title
        g.append('text')
            .attr('x', innerWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .attr('fill', '#262626')
            .text('Training vs Test Loss');

        // Line groups
        const withoutGroup = g.append('g').attr('class', 'without-dropout');
        const withGroup = g.append('g').attr('class', 'with-dropout');

        // Control functions
        function showWithoutDropout() {
            withoutGroup.selectAll('*').remove();
            
            // Train line
            withoutGroup.append('path')
                .datum(data.withoutDropout.train)
                .attr('fill', 'none')
                .attr('stroke', data.withoutDropout.color)
                .attr('stroke-width', 2)
                .attr('d', line)
                .attr('stroke-dasharray', function() {
                    return this.getTotalLength();
                })
                .attr('stroke-dashoffset', function() {
                    return this.getTotalLength();
                })
                .transition()
                .duration(2000)
                .attr('stroke-dashoffset', 0);

            // Test line
            withoutGroup.append('path')
                .datum(data.withoutDropout.test)
                .attr('fill', 'none')
                .attr('stroke', data.withoutDropout.color)
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '5,5')
                .attr('d', line)
                .style('opacity', 0)
                .transition()
                .delay(1000)
                .duration(1000)
                .style('opacity', 1);

            // Labels
            withoutGroup.append('text')
                .attr('x', innerWidth - 10)
                .attr('y', yScale(data.withoutDropout.train[epochs].loss))
                .attr('fill', data.withoutDropout.color)
                .attr('font-size', '12px')
                .text('Train (No Dropout)')
                .style('opacity', 0)
                .transition()
                .delay(2000)
                .style('opacity', 1);

            withoutGroup.append('text')
                .attr('x', innerWidth - 10)
                .attr('y', yScale(data.withoutDropout.test[epochs].loss))
                .attr('fill', data.withoutDropout.color)
                .attr('font-size', '12px')
                .text('Test (No Dropout)')
                .style('opacity', 0)
                .transition()
                .delay(2000)
                .style('opacity', 1);
        }

        function showWithDropout() {
            withGroup.selectAll('*').remove();
            
            // Train line
            withGroup.append('path')
                .datum(data.withDropout.train)
                .attr('fill', 'none')
                .attr('stroke', data.withDropout.color)
                .attr('stroke-width', 2)
                .attr('d', line)
                .attr('stroke-dasharray', function() {
                    return this.getTotalLength();
                })
                .attr('stroke-dashoffset', function() {
                    return this.getTotalLength();
                })
                .transition()
                .duration(2000)
                .attr('stroke-dashoffset', 0);

            // Test line
            withGroup.append('path')
                .datum(data.withDropout.test)
                .attr('fill', 'none')
                .attr('stroke', data.withDropout.color)
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '5,5')
                .attr('d', line)
                .style('opacity', 0)
                .transition()
                .delay(1000)
                .duration(1000)
                .style('opacity', 1);

            // Labels
            withGroup.append('text')
                .attr('x', innerWidth - 10)
                .attr('y', yScale(data.withDropout.train[epochs].loss) - 10)
                .attr('fill', data.withDropout.color)
                .attr('font-size', '12px')
                .text('Train (Dropout)')
                .style('opacity', 0)
                .transition()
                .delay(2000)
                .style('opacity', 1);

            withGroup.append('text')
                .attr('x', innerWidth - 10)
                .attr('y', yScale(data.withDropout.test[epochs].loss) + 10)
                .attr('fill', data.withDropout.color)
                .attr('font-size', '12px')
                .text('Test (Dropout)')
                .style('opacity', 0)
                .transition()
                .delay(2000)
                .style('opacity', 1);
        }

        // Set up control buttons
        const trainWithoutBtn = document.getElementById('train-without');
        const trainWithBtn = document.getElementById('train-with');
        const compareBtn = document.getElementById('compare-training');

        if (trainWithoutBtn) {
            trainWithoutBtn.addEventListener('click', function() {
                withGroup.selectAll('*').remove();
                showWithoutDropout();
            });
        }

        if (trainWithBtn) {
            trainWithBtn.addEventListener('click', function() {
                withoutGroup.selectAll('*').remove();
                showWithDropout();
            });
        }

        if (compareBtn) {
            compareBtn.addEventListener('click', function() {
                showWithoutDropout();
                setTimeout(showWithDropout, 500);
            });
        }

        // Add legend
        const legend = g.append('g')
            .attr('transform', `translate(20, 20)`);

        legend.append('rect')
            .attr('width', 120)
            .attr('height', 60)
            .attr('fill', 'white')
            .attr('stroke', '#EEEEEE')
            .attr('rx', 5);

        legend.append('line')
            .attr('x1', 10)
            .attr('x2', 30)
            .attr('y1', 20)
            .attr('y2', 20)
            .attr('stroke', '#262626')
            .attr('stroke-width', 2);

        legend.append('text')
            .attr('x', 35)
            .attr('y', 20)
            .attr('dy', '0.35em')
            .attr('font-size', '12px')
            .text('Training');

        legend.append('line')
            .attr('x1', 10)
            .attr('x2', 30)
            .attr('y1', 40)
            .attr('y2', 40)
            .attr('stroke', '#262626')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');

        legend.append('text')
            .attr('x', 35)
            .attr('y', 40)
            .attr('dy', '0.35em')
            .attr('font-size', '12px')
            .text('Validation');
    }

    // Initialize training comparison when slide is shown
    if (typeof Reveal !== 'undefined') {
        Reveal.on('slidechanged', function(event) {
            if (document.getElementById('training-comparison')) {
                initTrainingComparison();
            }
        });
    }
})();