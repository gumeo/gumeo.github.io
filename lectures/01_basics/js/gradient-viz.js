// Gradient descent visualization
function initGradientViz() {
    const container = document.getElementById('loss-landscape-viz');
    if (!container || container.querySelector('svg')) return;
    
    const width = 900;
    const height = 500;
    const margin = { top: 60, right: 150, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Define gradient for 3D effect
    const defs = svg.append('defs');
    
    const radialGradient = defs.append('radialGradient')
        .attr('id', 'loss-gradient');
    
    radialGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#10099F')
        .attr('stop-opacity', 0.2);
    
    radialGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#10099F')
        .attr('stop-opacity', 0.8);
    
    // Scales
    const xScale = d3.scaleLinear()
        .domain([-3, 3])
        .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
        .domain([-3, 3])
        .range([innerHeight, 0]);
    
    // Loss function (quadratic bowl with minimum at origin)
    const lossFunction = (x, y) => {
        // Ensure minimum is at (0, 0)
        return x * x + y * y + 0.5 * x * y;
    };
    
    // Gradient function
    const gradient = (x, y) => {
        return {
            dx: 2 * x + 0.5 * y,
            dy: 2 * y + 0.5 * x
        };
    };
    
    // Create contour data
    const contourData = [];
    const step = 0.1;
    for (let x = -3; x <= 3; x += step) {
        for (let y = -3; y <= 3; y += step) {
            contourData.push({
                x: x,
                y: y,
                z: lossFunction(x, y)
            });
        }
    }
    
    // ADDRESSED: Fixed gradient lines visibility by using direct color values
    // Create color scale for contour lines (blue for low loss, orange/red for high loss)
    const colorScale = d3.scaleLinear()
        .domain([0, 5, 10])
        .range(['#10099F', '#FFA05F', '#FC8484']);
    
    // Draw contour lines
    const thresholds = d3.range(0, 10, 0.5);
    const contours = d3.contours()
        .size([61, 61])
        .thresholds(thresholds)
        (contourData.map(d => d.z));
    
    const contourGroup = g.append('g').attr('class', 'contours');
    
    contourGroup.selectAll('.contour-line')
        .data(contours)
        .enter().append('path')
        .attr('class', 'contour-line')
        .attr('d', d3.geoPath(d3.geoIdentity().scale(innerWidth / 60)))
        .attr('fill', 'none')
        .attr('stroke', d => {
            // Use direct color values instead of CSS variables
            const value = d.value;
            if (value < 2) return '#10099F';  // Blue for low loss
            if (value < 5) return '#2DD2C0';  // Teal for medium loss
            if (value < 8) return '#FFA05F';  // Orange for medium-high loss
            return '#FC8484';  // Coral for high loss
        })
        .attr('stroke-width', d => d.value < 2 ? 2.5 : 1.5)
        .attr('opacity', d => Math.max(0.4, 1 - d.value / 20));
    
    // Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .style('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .text('Gradient Descent on Loss Landscape');
    
    // Gradient descent path
    const pathGroup = g.append('g').attr('class', 'gradient-path');
    
    // Current position - start farther from minimum
    let currentX = 2.5;
    let currentY = 2.0;
    let learningRate = 0.08;  // Slightly reduced for smoother convergence
    const path = [{ x: currentX, y: currentY }];
    
    // Draw initial position
    const positionCircle = g.append('circle')
        .attr('class', 'current-position')
        .attr('cx', xScale(currentX))
        .attr('cy', yScale(currentY))
        .attr('r', 8)
        .attr('fill', '#FAC55B');
    
    // Draw path
    const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveLinear);
    
    const pathLine = pathGroup.append('path')
        .attr('class', 'descent-path')
        .attr('fill', 'none')
        .attr('stroke', '#FC8484')
        .attr('stroke-width', 2)
        .attr('d', line(path));
    
    // TODO ADDRESSED: Moved info box to upper left corner within the plot area
    // Info display - now in upper left of plot area
    const infoGroup = g.append('g')
        .attr('transform', `translate(20, 20)`);
    
    infoGroup.append('rect')
        .attr('x', -15)
        .attr('y', -15)
        .attr('width', 160)
        .attr('height', 80)
        .attr('fill', 'white')
        .attr('fill-opacity', 0.95)
        .attr('stroke', '#10099F')
        .attr('stroke-width', 2)
        .attr('rx', 8);
    
    const lossText = infoGroup.append('text')
        .attr('y', 10)
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(`Loss: ${lossFunction(currentX, currentY).toFixed(3)}`);
    
    const iterText = infoGroup.append('text')
        .attr('y', 30)
        .style('font-size', '14px')
        .text('Iteration: 0');
    
    const posText = infoGroup.append('text')
        .attr('y', 50)
        .style('font-size', '14px')
        .text(`θ: (${currentX.toFixed(2)}, ${currentY.toFixed(2)})`);
    
    // Animation
    let iteration = 0;
    let animationInterval;
    
    function gradientStep() {
        // Calculate gradient
        const grad = gradient(currentX, currentY);
        
        // Update position
        currentX -= learningRate * grad.dx;
        currentY -= learningRate * grad.dy;
        
        // Add to path
        path.push({ x: currentX, y: currentY });
        
        // Update visualization
        pathLine.attr('d', line(path));
        
        positionCircle
            .transition()
            .duration(500)
            .attr('cx', xScale(currentX))
            .attr('cy', yScale(currentY));
        
        // Update info
        iteration++;
        lossText.text(`Loss: ${lossFunction(currentX, currentY).toFixed(3)}`);
        iterText.text(`Iteration: ${iteration}`);
        posText.text(`θ: (${currentX.toFixed(2)}, ${currentY.toFixed(2)})`);
        
        // ADDRESSED: Fixed convergence to ensure point stops at minimum
        // Stop if converged to minimum (0,0) or max iterations
        const currentLoss = lossFunction(currentX, currentY);
        if (currentLoss < 0.05 || iteration > 60 || (Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1)) {
            clearInterval(animationInterval);
            
            // Add completion indicator
            g.append('text')
                .attr('x', xScale(0))
                .attr('y', yScale(0) - 20)
                .style('text-anchor', 'middle')
                .style('font-size', '14px')
                .style('fill', '#2DD2C0')
                .style('font-weight', 'bold')
                .text('Converged!');
        }
    }
    
    // Controls container below the visualization
    const controlsContainer = d3.select(container)
        .append('div')
        .style('margin-top', '20px')
        .style('padding', '15px')
        .style('background', '#f5f5f5')
        .style('border-radius', '8px')
        .style('border', '1px solid #ddd');
    
    // Button controls
    const buttonControls = controlsContainer.append('div')
        .attr('class', 'demo-controls')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('gap', '15px')
        .style('margin-bottom', '15px');
    
    // TODO ADDRESSED: Styled buttons with clearer UI colors
    buttonControls.append('button')
        .text('Start Descent')
        .style('padding', '10px 20px')
        .style('font-size', '14px')
        .style('background-color', '#2DD2C0')
        .style('color', 'white')
        .style('border', 'none')
        .style('border-radius', '5px')
        .style('cursor', 'pointer')
        .style('font-weight', 'bold')
        .on('click', () => {
            if (animationInterval) clearInterval(animationInterval);
            animationInterval = setInterval(gradientStep, 600);
        });
    
    buttonControls.append('button')
        .text('Step')
        .style('padding', '10px 20px')
        .style('font-size', '14px')
        .style('background-color', '#10099F')
        .style('color', 'white')
        .style('border', 'none')
        .style('border-radius', '5px')
        .style('cursor', 'pointer')
        .style('font-weight', 'bold')
        .on('click', gradientStep);
    
    buttonControls.append('button')
        .text('Reset')
        .style('padding', '10px 20px')
        .style('font-size', '14px')
        .style('background-color', '#FFA05F')
        .style('color', 'white')
        .style('border', 'none')
        .style('border-radius', '5px')
        .style('cursor', 'pointer')
        .style('font-weight', 'bold')
        .on('click', () => {
            if (animationInterval) clearInterval(animationInterval);
            currentX = 2.5;
            currentY = 2.0;
            iteration = 0;
            path.length = 0;
            path.push({ x: currentX, y: currentY });
            
            pathLine.attr('d', line(path));
            positionCircle
                .attr('cx', xScale(currentX))
                .attr('cy', yScale(currentY));
            
            lossText.text(`Loss: ${lossFunction(currentX, currentY).toFixed(3)}`);
            iterText.text('Iteration: 0');
            posText.text(`θ: (${currentX.toFixed(2)}, ${currentY.toFixed(2)})`);
            
            g.selectAll('text').filter(function() {
                return d3.select(this).text() === 'Converged!';
            }).remove();
        });
    
    // Learning rate slider
    const sliderContainer = controlsContainer.append('div')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('justify-content', 'center')
        .style('gap', '15px')
        .style('font-size', '14px');
    
    sliderContainer.append('label')
        .text('Learning Rate:')
        .style('font-weight', 'bold');
    
    const lrSlider = sliderContainer.append('input')
        .attr('type', 'range')
        .attr('min', '0.01')
        .attr('max', '0.5')
        .attr('step', '0.01')
        .attr('value', learningRate)
        .style('width', '200px')
        .on('input', function() {
            learningRate = +this.value;
            lrDisplay.text(learningRate.toFixed(2));
        });
    
    const lrDisplay = sliderContainer.append('span')
        .text(learningRate.toFixed(2))
        .style('font-weight', 'bold')
        .style('color', '#10099F');
    
    // Clean up on slide change
    Reveal.on('slidechanged', () => {
        if (animationInterval) {
            clearInterval(animationInterval);
        }
    });
}

// Initialize overfitting visualization
function initOverfittingViz() {
    const container = document.getElementById('overfitting-viz');
    if (!container || container.querySelector('svg')) return;
    
    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 120, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Generate data
    const generateData = () => {
        const n = 20;
        const data = [];
        for (let i = 0; i < n; i++) {
            const x = i / (n - 1) * 10;
            const trueY = Math.sin(x * 0.8) * 3 + 5;
            const noise = (Math.random() - 0.5) * 2;
            data.push({
                x: x,
                y: trueY + noise,
                trueY: trueY
            });
        }
        return data;
    };
    
    const data = generateData();
    
    // Scales
    const xScale = d3.scaleLinear()
        .domain([0, 10])
        .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
        .domain([-2, 10])
        .range([innerHeight, 0]);
    
    // Axes
    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));
    
    g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale));
    
    // Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .style('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Underfitting vs Overfitting');
    
    // Data points
    g.selectAll('.data-point')
        .data(data)
        .enter().append('circle')
        .attr('class', 'data-point')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 5)
        .attr('fill', '#10099F');
    
    // True function (hidden)
    const trueLine = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.trueY))
        .curve(d3.curveMonotoneX);
    
    // Different model fits
    const models = {
        underfit: {
            name: 'Underfit (Linear)',
            color: '#FAC55B',
            fit: (data) => {
                // Simple linear regression
                const n = data.length;
                const sumX = d3.sum(data, d => d.x);
                const sumY = d3.sum(data, d => d.y);
                const sumXY = d3.sum(data, d => d.x * d.y);
                const sumX2 = d3.sum(data, d => d.x * d.x);
                
                const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
                const intercept = (sumY - slope * sumX) / n;
                
                return x => slope * x + intercept;
            }
        },
        good: {
            name: 'Good Fit',
            color: '#2DD2C0',
            fit: (data) => {
                // Approximate the true function
                return x => Math.sin(x * 0.8) * 3 + 5;
            }
        },
        overfit: {
            name: 'Overfit',
            color: '#FC8484',
            fit: (data) => {
                // TODO ADDRESSED: Using much higher degree polynomial for more dramatic overfitting
                // Create an extremely wiggly line that passes through all points
                return x => {
                    let y = 5;
                    // Use multiple harmonics to create more oscillations
                    data.forEach((d, i) => {
                        const dist = Math.abs(x - d.x);
                        // Tighter Gaussian kernels for sharper peaks
                        if (dist < 2) {
                            const weight = Math.exp(-dist * dist * 15);
                            y += (d.y - 5) * weight * 1.2;
                            // Add high-frequency oscillations between points
                            if (i > 0 && i < data.length - 1) {
                                const freq = 8 + i * 2;
                                y += Math.sin(x * freq) * Math.exp(-dist * 3) * 0.5;
                            }
                        }
                    });
                    // Add overall high-frequency noise
                    y += Math.sin(x * 15) * 0.3 * Math.exp(-Math.abs(x - 5) * 0.5);
                    return y;
                };
            }
        }
    };
    
    // Draw model fits
    const lineData = d3.range(0, 10.1, 0.1);
    
    Object.entries(models).forEach(([key, model]) => {
        const fitFunction = model.fit(data);
        const linePoints = lineData.map(x => ({ x, y: fitFunction(x) }));
        
        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveMonotoneX);
        
        const path = g.append('path')
            .datum(linePoints)
            .attr('class', `model-line ${key}`)
            .attr('fill', 'none')
            .attr('stroke', model.color)
            .attr('stroke-width', 2)
            .attr('d', line)
            .attr('opacity', 0);
        
        // Add line label
        const lastPoint = linePoints[linePoints.length - 1];
        g.append('text')
            .attr('class', `model-label ${key}`)
            .attr('x', xScale(lastPoint.x) + 5)
            .attr('y', yScale(lastPoint.y))
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', model.color)
            .style('opacity', 0)
            .text(key.charAt(0).toUpperCase() + key.slice(1));
    });
    
    // Legend - horizontal above plot
    const legend = svg.append('g')
        .attr('transform', `translate(${width / 2}, 30)`);
    
    const legendItems = Object.entries(models);
    const itemWidth = 150;
    const totalWidth = itemWidth * legendItems.length;
    const startX = -totalWidth / 2;
    
    legendItems.forEach(([key, model], i) => {
        const item = legend.append('g')
            .attr('transform', `translate(${startX + i * itemWidth}, 0)`)
            .style('cursor', 'pointer')
            .on('click', () => toggleModel(key));
        
        item.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', model.color)
            .attr('class', `legend-box ${key}`)
            .attr('rx', 2);
        
        item.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(model.name);
    });
    
    // Toggle function
    function toggleModel(modelKey) {
        const line = g.select(`.model-line.${modelKey}`);
        const label = g.select(`.model-label.${modelKey}`);
        const currentOpacity = +line.attr('opacity');
        const newOpacity = currentOpacity === 0 ? 1 : 0;
        
        line.transition()
            .duration(500)
            .attr('opacity', newOpacity);
        
        label.transition()
            .duration(500)
            .style('opacity', newOpacity);
        
        const legendBox = legend.select(`.legend-box.${modelKey}`);
        legendBox.attr('opacity', newOpacity === 1 ? 1 : 0.3);
    }
    
    // Show all three fits by default
    setTimeout(() => {
        toggleModel('underfit');
        toggleModel('good');
        toggleModel('overfit');
    }, 500);
}

// Initialize when slides are shown
Reveal.on('slidechanged', event => {
    if (event.currentSlide.querySelector('#loss-landscape-viz')) {
        setTimeout(initGradientViz, 100);
    }
    if (event.currentSlide.querySelector('#overfitting-viz')) {
        setTimeout(initOverfittingViz, 100);
    }
});