// Interactive regression demonstration
function initRegressionDemo() {
    const container = document.getElementById('regression-demo');
    if (!container || container.querySelector('svg')) return;
    
    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Generate sample data for house prices
    const generateData = () => {
        const n = 50;
        const data = [];
        for (let i = 0; i < n; i++) {
            const size = Math.random() * 200 + 50; // 50-250 m²
            const noise = (Math.random() - 0.5) * 100000;
            const price = 2000 * size + 50000 + noise; // Base price + size factor + noise
            data.push({ size, price });
        }
        return data;
    };
    
    let data = generateData();
    
    // Scales
    const xScale = d3.scaleLinear()
        .domain([0, 300])
        .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
        .domain([0, 700000])
        .range([innerHeight, 0]);
    
    // Axes
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d => d + ' m²');
    
    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d => '$' + (d / 1000) + 'k');
    
    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis);
    
    g.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);
    
    // Axis labels
    g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 50)
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('House Size (m²)');
    
    g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -45)
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Price ($)');
    
    // Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .style('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('House Price Prediction');
    
    // Calculate regression line
    const calculateRegression = (data) => {
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        data.forEach(d => {
            sumX += d.size;
            sumY += d.price;
            sumXY += d.size * d.price;
            sumX2 += d.size * d.size;
        });
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return { slope, intercept };
    };
    
    // Draw regression line
    const regression = calculateRegression(data);
    
    const lineData = [
        { x: 0, y: regression.intercept },
        { x: 300, y: regression.intercept + regression.slope * 300 }
    ];
    
    const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));
    
    // Prediction band (confidence interval)
    const bandData = lineData.map(d => ({ ...d, yLow: d.y - 50000, yHigh: d.y + 50000 }));
    
    const area = d3.area()
        .x(d => xScale(d.x))
        .y0(d => yScale(d.yLow))
        .y1(d => yScale(d.yHigh));
    
    g.append('path')
        .datum(bandData)
        .attr('class', 'prediction-band')
        .attr('d', area);
    
    const regressionLine = g.append('path')
        .datum(lineData)
        .attr('class', 'regression-line')
        .attr('d', line);
    
    // Data points
    const points = g.selectAll('.data-point')
        .data(data)
        .enter().append('circle')
        .attr('class', 'data-point')
        .attr('cx', d => xScale(d.size))
        .attr('cy', d => yScale(d.price))
        .attr('r', 5);
    
    // Tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'chart-tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('padding', '10px')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('border-radius', '5px')
        .style('pointer-events', 'none');
    
    points.on('mouseover', (event, d) => {
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`Size: ${d.size.toFixed(0)} m²<br>Price: $${(d.price / 1000).toFixed(0)}k`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
    });
    
    // Add equation display
    const equation = svg.append('text')
        .attr('x', width - 20)
        .attr('y', 60)
        .style('text-anchor', 'end')
        .style('font-size', '14px')
        .style('font-family', 'monospace')
        .text(`y = ${regression.slope.toFixed(0)}x + ${(regression.intercept / 1000).toFixed(0)}k`);
    
    // Controls
    const controls = d3.select(container)
        .append('div')
        .attr('class', 'demo-controls');
    
    controls.append('button')
        .text('Generate New Data')
        .on('click', () => {
            data = generateData();
            updateVisualization();
        });
    
    controls.append('button')
        .text('Add Point')
        .on('click', () => {
            const newPoint = {
                size: Math.random() * 200 + 50,
                price: (Math.random() * 500000) + 100000
            };
            data.push(newPoint);
            updateVisualization();
        });
    
    // Update visualization
    function updateVisualization() {
        // Recalculate regression
        const newRegression = calculateRegression(data);
        const newLineData = [
            { x: 0, y: newRegression.intercept },
            { x: 300, y: newRegression.intercept + newRegression.slope * 300 }
        ];
        
        // Update line with animation
        regressionLine.datum(newLineData)
            .transition()
            .duration(1000)
            .attr('d', line);
        
        // Update equation
        equation.text(`y = ${newRegression.slope.toFixed(0)}x + ${(newRegression.intercept / 1000).toFixed(0)}k`);
        
        // Update points
        const updatedPoints = g.selectAll('.data-point')
            .data(data);
        
        updatedPoints.enter()
            .append('circle')
            .attr('class', 'data-point')
            .attr('cx', d => xScale(d.size))
            .attr('cy', d => yScale(d.price))
            .attr('r', 0)
            .on('mouseover', (event, d) => {
                tooltip.transition().duration(200).style('opacity', .9);
                tooltip.html(`Size: ${d.size.toFixed(0)} m²<br>Price: $${(d.price / 1000).toFixed(0)}k`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', () => {
                tooltip.transition().duration(500).style('opacity', 0);
            })
            .transition()
            .duration(500)
            .attr('r', 5);
        
        updatedPoints.exit()
            .transition()
            .duration(500)
            .attr('r', 0)
            .remove();
    }
    
    // Clean up tooltip on slide change
    Reveal.on('slidechanged', () => {
        tooltip.remove();
    });
}

// Initialize when the slide is shown
Reveal.on('slidechanged', event => {
    if (event.currentSlide.querySelector('#regression-demo')) {
        setTimeout(initRegressionDemo, 100);
    }
});