// Interactive classification visualization
function initClassificationDemo() {
    const container = document.getElementById('classification-demo');
    if (!container || container.querySelector('svg')) return;
    
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Initialize with two classes
    let data = generateClassificationData(2);
    let numClasses = 2;
    
    // Scales
    const xScale = d3.scaleLinear()
        .domain([0, 10])
        .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
        .domain([0, 10])
        .range([innerHeight, 0]);
    
    // Color scale
    const colorScale = d3.scaleOrdinal()
        .domain([0, 1, 2])
        .range(['#10099F', '#FC8484', '#2DD2C0']);
    
    // Grid for decision boundary visualization
    const gridSize = 20;
    const grid = [];
    for (let i = 0; i <= gridSize; i++) {
        for (let j = 0; j <= gridSize; j++) {
            grid.push({
                x: i * 10 / gridSize,
                y: j * 10 / gridSize
            });
        }
    }
    
    // Background regions for decision boundaries
    const regionGroup = g.append('g').attr('class', 'regions');
    
    // Draw axes
    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));
    
    g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale));
    
    // Draw data points
    const pointsGroup = g.append('g').attr('class', 'points');
    
    function generateClassificationData(classes) {
        const data = [];
        const pointsPerClass = 30;
        const centers = [
            { x: 3, y: 3 },
            { x: 7, y: 7 },
            { x: 3, y: 7 }
        ];
        
        for (let c = 0; c < classes; c++) {
            const center = centers[c];
            for (let i = 0; i < pointsPerClass; i++) {
                data.push({
                    x: center.x + (Math.random() - 0.5) * 3,
                    y: center.y + (Math.random() - 0.5) * 3,
                    class: c
                });
            }
        }
        return data;
    }
    
    function drawDecisionBoundary() {
        // Simple k-nearest neighbors for visualization
        const k = 3;
        
        const predictions = grid.map(point => {
            const distances = data.map(d => ({
                class: d.class,
                dist: Math.sqrt(Math.pow(d.x - point.x, 2) + Math.pow(d.y - point.y, 2))
            }));
            
            distances.sort((a, b) => a.dist - b.dist);
            const nearest = distances.slice(0, k);
            
            const votes = Array(numClasses).fill(0);
            nearest.forEach(n => votes[n.class]++);
            
            const prediction = votes.indexOf(Math.max(...votes));
            
            return {
                x: point.x,
                y: point.y,
                class: prediction
            };
        });
        
        // Create contour-like visualization
        const cellSize = 10 / gridSize;
        
        const cells = regionGroup.selectAll('.cell')
            .data(predictions);
        
        cells.enter()
            .append('rect')
            .attr('class', 'cell class-region')
            .merge(cells)
            .attr('x', d => xScale(d.x - cellSize / 2))
            .attr('y', d => yScale(d.y + cellSize / 2))
            .attr('width', xScale(cellSize) - xScale(0))
            .attr('height', yScale(0) - yScale(cellSize))
            .attr('fill', d => colorScale(d.class))
            .attr('opacity', 0.2);
        
        cells.exit().remove();
    }
    
    function updateVisualization() {
        // Draw decision boundary
        drawDecisionBoundary();
        
        // Update points
        const points = pointsGroup.selectAll('.class-point')
            .data(data);
        
        points.enter()
            .append('circle')
            .attr('class', 'class-point')
            .attr('r', 0)
            .merge(points)
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('fill', d => colorScale(d.class))
            .transition()
            .duration(500)
            .attr('r', 6);
        
        points.exit()
            .transition()
            .duration(500)
            .attr('r', 0)
            .remove();
    }
    
    // Initial visualization
    updateVisualization();
    
    // Controls
    const controls = d3.select(container)
        .append('div')
        .attr('class', 'demo-controls');
    
    controls.append('button')
        .text('Add Random Point')
        .on('click', () => {
            const newPoint = {
                x: Math.random() * 10,
                y: Math.random() * 10,
                class: Math.floor(Math.random() * numClasses)
            };
            data.push(newPoint);
            updateVisualization();
        });
    
    controls.append('button')
        .text('Toggle 2/3 Classes')
        .on('click', () => {
            numClasses = numClasses === 2 ? 3 : 2;
            data = generateClassificationData(numClasses);
            updateVisualization();
        });
    
    controls.append('button')
        .text('Reset Data')
        .on('click', () => {
            data = generateClassificationData(numClasses);
            updateVisualization();
        });
    
    // Interactive point addition
    svg.on('click', function(event) {
        const [x, y] = d3.pointer(event, g.node());
        if (x >= 0 && x <= innerWidth && y >= 0 && y <= innerHeight) {
            // Find nearest class based on existing points
            const clickX = xScale.invert(x);
            const clickY = yScale.invert(y);
            
            let minDist = Infinity;
            let nearestClass = 0;
            
            data.forEach(d => {
                const dist = Math.sqrt(Math.pow(d.x - clickX, 2) + Math.pow(d.y - clickY, 2));
                if (dist < minDist) {
                    minDist = dist;
                    nearestClass = d.class;
                }
            });
            
            data.push({
                x: clickX,
                y: clickY,
                class: nearestClass
            });
            
            updateVisualization();
        }
    });
}

// Initialize clustering visualization
function initClusteringVisualization() {
    const container = document.getElementById('clustering-viz');
    if (!container || container.querySelector('svg')) return;
    
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Generate random data
    const generateData = () => {
        const data = [];
        for (let i = 0; i < 100; i++) {
            data.push({
                x: Math.random() * 10,
                y: Math.random() * 10,
                cluster: -1
            });
        }
        return data;
    };
    
    let data = generateData();
    let centers = [];
    let k = 3;
    
    // Scales
    const xScale = d3.scaleLinear()
        .domain([0, 10])
        .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
        .domain([0, 10])
        .range([innerHeight, 0]);
    
    const colorScale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4])
        .range(['#10099F', '#FC8484', '#2DD2C0', '#FAC55B', '#FFA05F']);
    
    // Draw axes
    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));
    
    g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale));
    
    // Groups for visualization
    const pointsGroup = g.append('g').attr('class', 'points');
    const centersGroup = g.append('g').attr('class', 'centers');
    
    // K-means algorithm step
    function kMeansStep() {
        // Assign points to nearest center
        data.forEach(point => {
            let minDist = Infinity;
            let nearestCenter = 0;
            
            centers.forEach((center, i) => {
                const dist = Math.sqrt(
                    Math.pow(point.x - center.x, 2) + 
                    Math.pow(point.y - center.y, 2)
                );
                if (dist < minDist) {
                    minDist = dist;
                    nearestCenter = i;
                }
            });
            
            point.cluster = nearestCenter;
        });
        
        // Update centers
        const newCenters = Array(k).fill(null).map(() => ({ x: 0, y: 0, count: 0 }));
        
        data.forEach(point => {
            if (point.cluster >= 0) {
                newCenters[point.cluster].x += point.x;
                newCenters[point.cluster].y += point.y;
                newCenters[point.cluster].count++;
            }
        });
        
        centers = newCenters.map((center, i) => ({
            x: center.count > 0 ? center.x / center.count : centers[i].x,
            y: center.count > 0 ? center.y / center.count : centers[i].y
        }));
    }
    
    // Initialize random centers
    function initializeCenters() {
        centers = [];
        const indices = new Set();
        while (indices.size < k) {
            indices.add(Math.floor(Math.random() * data.length));
        }
        Array.from(indices).forEach(i => {
            centers.push({ x: data[i].x, y: data[i].y });
        });
    }
    
    function updateVisualization() {
        // Update points
        const points = pointsGroup.selectAll('.cluster-point')
            .data(data);
        
        points.enter()
            .append('circle')
            .attr('class', 'cluster-point')
            .attr('r', 4)
            .merge(points)
            .transition()
            .duration(500)
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('fill', d => d.cluster >= 0 ? colorScale(d.cluster) : '#999');
        
        points.exit().remove();
        
        // Update centers
        const centerPoints = centersGroup.selectAll('.cluster-center')
            .data(centers);
        
        centerPoints.enter()
            .append('circle')
            .attr('class', 'cluster-center')
            .attr('r', 8)
            .merge(centerPoints)
            .transition()
            .duration(500)
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('fill', (d, i) => colorScale(i));
        
        centerPoints.exit().remove();
    }
    
    // Initialize
    initializeCenters();
    updateVisualization();
    
    // Auto-run animation
    let animationInterval;
    function startAnimation() {
        animationInterval = setInterval(() => {
            kMeansStep();
            updateVisualization();
        }, 1500);
    }
    
    // Start animation when slide is visible
    setTimeout(startAnimation, 1000);
    
    // Clean up on slide change
    Reveal.on('slidechanged', () => {
        if (animationInterval) {
            clearInterval(animationInterval);
        }
    });
}

// Initialize when slides are shown
Reveal.on('slidechanged', event => {
    if (event.currentSlide.querySelector('#classification-demo')) {
        setTimeout(initClassificationDemo, 100);
    }
    if (event.currentSlide.querySelector('#clustering-viz')) {
        setTimeout(initClusteringVisualization, 100);
    }
});