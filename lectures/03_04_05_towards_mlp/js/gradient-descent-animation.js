// Gradient Descent Animation for Linear Regression

function initGradientDescentAnimation() {
    const container = d3.select('#gradient-descent-demo');
    if (container.empty()) return;

    const landscapeContainer = d3.select('#loss-landscape');
    const historyContainer = d3.select('#loss-history');
    
    // Clear any existing content to allow re-initialization
    landscapeContainer.selectAll('*').remove();
    historyContainer.selectAll('*').remove();
    
    // Dimensions for side-by-side layout
    const landscapeWidth = 380;
    const landscapeHeight = 230;
    const historyWidth = 340;
    const historyHeight = 230;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerLandscapeWidth = landscapeWidth - margin.left - margin.right;
    const innerLandscapeHeight = landscapeHeight - margin.top - margin.bottom;
    const innerHistoryWidth = historyWidth - margin.left - margin.right;
    const innerHistoryHeight = historyHeight - margin.top - margin.bottom;

    // Create SVG for loss landscape
    const svg = landscapeContainer.append('svg')
        .attr('viewBox', `0 0 ${landscapeWidth} ${landscapeHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create SVG for loss history
    const historySvg = historyContainer.append('svg')
        .attr('viewBox', `0 0 ${historyWidth} ${historyHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    const historyG = historySvg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Generate synthetic data
    const trueW = 2.5;
    const trueB = 1.0;
    const dataPoints = [];
    const nPoints = 50;
    
    for (let i = 0; i < nPoints; i++) {
        const x = Math.random() * 5;
        const noise = (Math.random() - 0.5) * 1.5;
        const y = trueW * x + trueB + noise;
        dataPoints.push({ x, y });
    }

    // Parameter space for visualization
    const wRange = [-1, 5];
    const bRange = [-3, 5];

    // Scales
    const wScale = d3.scaleLinear()
        .domain(wRange)
        .range([0, innerLandscapeWidth]);

    const bScale = d3.scaleLinear()
        .domain(bRange)
        .range([innerLandscapeHeight, 0]);

    const colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain([0, 20]);

    // Loss function
    function computeLoss(w, b) {
        const mse = dataPoints.reduce((sum, p) => {
            const pred = w * p.x + b;
            return sum + Math.pow(p.y - pred, 2);
        }, 0) / dataPoints.length;
        return mse;
    }

    // Compute gradient
    function computeGradient(w, b, batch) {
        const n = batch.length;
        let dw = 0, db = 0;
        
        batch.forEach(p => {
            const pred = w * p.x + b;
            const error = pred - p.y;
            dw += error * p.x;
            db += error;
        });
        
        return { dw: dw / n, db: db / n };
    }

    // Create heatmap instead of contours
    const resolution = 25;
    const cellWidth = innerLandscapeWidth / resolution;
    const cellHeight = innerLandscapeHeight / resolution;
    
    // Generate heatmap data
    const heatmapData = [];
    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            const w = wRange[0] + (wRange[1] - wRange[0]) * i / (resolution - 1);
            const b = bRange[0] + (bRange[1] - bRange[0]) * j / (resolution - 1);
            const loss = computeLoss(w, b);
            heatmapData.push({
                x: i * cellWidth,
                y: j * cellHeight,
                w: w,
                b: b,
                loss: loss
            });
        }
    }

    // Draw heatmap cells
    g.selectAll('.heatmap-cell')
        .data(heatmapData)
        .enter()
        .append('rect')
        .attr('class', 'heatmap-cell')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        .attr('fill', d => colorScale(d.loss))
        .attr('stroke', 'none')
        .attr('opacity', 0.8);

    // Add axes
    g.append('g')
        .attr('transform', `translate(0,${innerLandscapeHeight})`)
        .call(d3.axisBottom(wScale).ticks(5))
        .append('text')
        .attr('x', innerLandscapeWidth / 2)
        .attr('y', 38)
        .style('text-anchor', 'middle')
        .style('fill', '#333')
        .style('font-size', '12px')
        .text('Weight (w)');

    g.append('g')
        .call(d3.axisLeft(bScale).ticks(5))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('x', -innerLandscapeHeight / 2)
        .style('text-anchor', 'middle')
        .style('fill', '#333')
        .style('font-size', '12px')
        .text('Bias (b)');

    // Add title
    svg.append('text')
        .attr('x', landscapeWidth / 2)
        .attr('y', 15)
        .style('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('fill', '#333')
        .text('Loss Landscape');

    // Mark optimal point
    g.append('circle')
        .attr('cx', wScale(trueW))
        .attr('cy', bScale(trueB))
        .attr('r', 5)
        .attr('fill', '#FC8484')
        .attr('stroke', 'white')
        .attr('stroke-width', 2);

    g.append('text')
        .attr('x', wScale(trueW) + 10)
        .attr('y', bScale(trueB) - 10)
        .style('fill', '#FC8484')
        .style('font-size', '12px')
        .text('Optimal');

    // Gradient descent state
    let isRunning = false;
    let currentW = Math.random() * 2;
    let currentB = Math.random() * 2;
    let lossHistory = [];
    let pathPoints = [];
    let animationId = null;

    // Path group
    const pathGroup = g.append('g').attr('class', 'gd-path');
    
    // Current position marker
    const marker = g.append('circle')
        .attr('class', 'gradient-point')
        .attr('r', 6)
        .attr('cx', wScale(currentW))
        .attr('cy', bScale(currentB));

    // Loss history scale
    const iterScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, innerHistoryWidth]);

    const lossScale = d3.scaleLinear()
        .domain([0, 5])
        .range([innerHistoryHeight, 0]);

    // Loss history axes
    historyG.append('g')
        .attr('transform', `translate(0,${innerHistoryHeight})`)
        .call(d3.axisBottom(iterScale).ticks(5))
        .append('text')
        .attr('x', innerHistoryWidth / 2)
        .attr('y', 38)
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#333')
        .text('Iteration');

    historyG.append('g')
        .call(d3.axisLeft(lossScale).ticks(5))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('x', -innerHistoryHeight / 2)
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#333')
        .text('Loss');

    // Add title for loss history
    historySvg.append('text')
        .attr('x', historyWidth / 2)
        .attr('y', 15)
        .style('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('fill', '#333')
        .text('Loss History');

    // Loss history line generator
    const historyLine = d3.line()
        .x((d, i) => iterScale(i))
        .y(d => lossScale(d))
        .curve(d3.curveBasis);

    const lossPath = historyG.append('path')
        .attr('fill', 'none')
        .attr('stroke', '#10099F')
        .attr('stroke-width', 2);

    function getBatch(batchSize) {
        if (batchSize === 'full') {
            return dataPoints;
        }
        const batch = [];
        const size = parseInt(batchSize);
        for (let i = 0; i < size; i++) {
            batch.push(dataPoints[Math.floor(Math.random() * dataPoints.length)]);
        }
        return batch;
    }

    function step() {
        if (!isRunning) return;

        const lr = parseFloat(d3.select('#learning-rate').property('value'));
        const batchSize = d3.select('#batch-size').property('value');
        
        // Get batch
        const batch = getBatch(batchSize);
        
        // Compute gradient
        const { dw, db } = computeGradient(currentW, currentB, batch);
        
        // Update parameters
        currentW -= lr * dw;
        currentB -= lr * db;
        
        // Record path
        pathPoints.push({ w: currentW, b: currentB });
        
        // Compute and record loss
        const loss = computeLoss(currentW, currentB);
        lossHistory.push(loss);
        
        // Update visualization
        updateVisualization();
        
        // Continue if not converged
        if (lossHistory.length < 100 && loss > 0.1) {
            animationId = requestAnimationFrame(() => setTimeout(step, 50));
        } else {
            isRunning = false;
            d3.select('#start-gd').text('Start');
        }
    }

    function updateVisualization() {
        // Update path
        const pathLine = d3.line()
            .x(d => wScale(d.w))
            .y(d => bScale(d.b))
            .curve(d3.curveLinear);

        const paths = pathGroup.selectAll('.gradient-path')
            .data([pathPoints]);

        paths.enter()
            .append('path')
            .attr('class', 'gradient-path')
            .merge(paths)
            .attr('d', pathLine);

        // Update marker position
        marker.transition()
            .duration(50)
            .attr('cx', wScale(currentW))
            .attr('cy', bScale(currentB));

        // Update loss history
        if (lossHistory.length > 1) {
            lossPath
                .attr('d', historyLine(lossHistory));
        }

        // Update loss value display
        if (lossHistory.length > 0) {
            const currentLoss = lossHistory[lossHistory.length - 1];
            // Remove previous loss value display
            d3.selectAll('.loss-value').remove();
            d3.select('#gradient-descent-demo')
                .append('div')
                .attr('class', 'loss-value')
                .style('position', 'absolute')
                .style('right', '10px')
                .style('top', '50px')
                .html(`Loss: ${currentLoss.toFixed(4)}<br>Iteration: ${lossHistory.length}`);
        }
    }

    // Event handlers
    d3.select('#start-gd').on('click', function() {
        if (isRunning) {
            isRunning = false;
            cancelAnimationFrame(animationId);
            d3.select(this).text('Start');
        } else {
            isRunning = true;
            d3.select(this).text('Stop');
            step();
        }
    });

    d3.select('#reset-gd').on('click', function() {
        isRunning = false;
        cancelAnimationFrame(animationId);
        
        // Reset parameters
        currentW = Math.random() * 2;
        currentB = Math.random() * 2;
        lossHistory = [];
        pathPoints = [];
        
        // Clear visualizations
        pathGroup.selectAll('.gradient-path').remove();
        lossPath.attr('d', '');
        d3.selectAll('.loss-value').remove();
        
        // Update marker
        marker
            .attr('cx', wScale(currentW))
            .attr('cy', bScale(currentB));
        
        d3.select('#start-gd').text('Start');
    });

    // Update learning rate display
    d3.select('#learning-rate').on('input', function() {
        d3.select('#lr-value').text(this.value);
    });

    // Add color scale legend
    const legendWidth = 100;
    const legendHeight = 10;
    
    const legendSvg = svg.append('g')
        .attr('transform', `translate(${landscapeWidth - legendWidth - 30}, ${margin.top})`);
    
    const legendScale = d3.scaleLinear()
        .domain([0, 20])
        .range([0, legendWidth]);
    
    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickSize(6);
    
    // Create gradient for legend
    const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'loss-gradient')
        .attr('x1', '0%')
        .attr('x2', '100%');
    
    const nStops = 10;
    for (let i = 0; i <= nStops; i++) {
        gradient.append('stop')
            .attr('offset', `${i * 100 / nStops}%`)
            .attr('stop-color', colorScale(i * 20 / nStops));
    }
    
    legendSvg.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#loss-gradient)');
    
    legendSvg.append('g')
        .attr('transform', `translate(0,${legendHeight})`)
        .call(legendAxis);
    
    legendSvg.append('text')
        .attr('x', legendWidth / 2)
        .attr('y', -5)
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#666')
        .text('Loss');
}