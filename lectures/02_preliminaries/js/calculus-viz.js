// Calculus Visualizations for Deep Learning Presentation

// Derivative Visualization
function createDerivativeVisualization(containerId) {
    const container = d3.select(containerId);
    const width = container.node().getBoundingClientRect().width || 800;
    const height = 400;
    const margin = {top: 20, right: 30, bottom: 50, left: 60};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous content
    container.selectAll("*").remove();

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
        .domain([-1, 4])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([-5, 20])
        .range([innerHeight, 0]);

    // Axes
    g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", innerWidth / 2)
        .attr("y", 40)
        .style("text-anchor", "middle")
        .style("fill", "#262626")
        .text("x");

    g.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", -innerHeight / 2)
        .style("text-anchor", "middle")
        .style("fill", "#262626")
        .text("f(x)");

    // Function: f(x) = 3x² - 4x
    const f = x => 3 * x * x - 4 * x;
    const fPrime = x => 6 * x - 4; // derivative

    // Generate data points
    const data = d3.range(-1, 4.1, 0.1).map(x => ({x: x, y: f(x)}));

    // Line generator
    const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveBasis);

    // Draw function
    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#10099F")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Interactive point
    const pointX = 1;
    const pointY = f(pointX);
    const slope = fPrime(pointX);

    // Tangent line
    const tangentLine = g.append("line")
        .attr("x1", xScale(-1))
        .attr("y1", yScale(pointY + slope * (-1 - pointX)))
        .attr("x2", xScale(4))
        .attr("y2", yScale(pointY + slope * (4 - pointX)))
        .attr("stroke", "#FC8484")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .style("opacity", 0);

    // Point on curve
    const point = g.append("circle")
        .attr("cx", xScale(pointX))
        .attr("cy", yScale(pointY))
        .attr("r", 5)
        .attr("fill", "#2DD2C0")
        .style("opacity", 0);

    // Labels
    const label = g.append("text")
        .attr("x", xScale(pointX) + 10)
        .attr("y", yScale(pointY) - 10)
        .style("font-size", "14px")
        .style("fill", "#262626")
        .style("opacity", 0);

    // Animate
    point.transition()
        .duration(1000)
        .style("opacity", 1);

    tangentLine.transition()
        .delay(500)
        .duration(1000)
        .style("opacity", 1);

    label.text(`f'(${pointX}) = ${slope}`)
        .transition()
        .delay(1000)
        .duration(1000)
        .style("opacity", 1);

    // Add legend
    const legend = g.append("g")
        .attr("transform", `translate(${innerWidth - 150}, 20)`);

    legend.append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", "#10099F")
        .attr("stroke-width", 2);

    legend.append("text")
        .attr("x", 25)
        .attr("y", 5)
        .style("font-size", "12px")
        .text("f(x) = 3x² - 4x");

    legend.append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 20)
        .attr("y2", 20)
        .attr("stroke", "#FC8484")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");

    legend.append("text")
        .attr("x", 25)
        .attr("y", 25)
        .style("font-size", "12px")
        .text("Tangent line");
}

// Interactive Tangent Line
function createInteractiveTangent(containerId) {
    const container = d3.select(containerId);
    const width = container.node().getBoundingClientRect().width || 800;
    const height = 400;
    const margin = {top: 20, right: 30, bottom: 50, left: 60};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    container.selectAll("*").remove();

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
        .domain([-2, 4])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([-10, 30])
        .range([innerHeight, 0]);

    // Axes
    g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));

    g.append("g")
        .call(d3.axisLeft(yScale));

    // Function
    const f = x => x * x * x - 3 * x * x + 2;
    const fPrime = x => 3 * x * x - 6 * x;

    // Generate curve data
    const curveData = d3.range(-2, 4.1, 0.05).map(x => ({x: x, y: f(x)}));

    const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveBasis);

    // Draw function
    g.append("path")
        .datum(curveData)
        .attr("fill", "none")
        .attr("stroke", "#10099F")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Tangent line group
    const tangentGroup = g.append("g");

    const tangentLine = tangentGroup.append("line")
        .attr("stroke", "#FC8484")
        .attr("stroke-width", 2);

    const point = tangentGroup.append("circle")
        .attr("r", 6)
        .attr("fill", "#2DD2C0");

    const slopeText = g.append("text")
        .attr("x", 10)
        .attr("y", 30)
        .style("font-size", "16px")
        .style("fill", "#262626");

    // Overlay for mouse interaction
    const overlay = g.append("rect")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mousemove", function(event) {
            const [mouseX, mouseY] = d3.pointer(event);
            const x = xScale.invert(mouseX);
            const y = f(x);
            const slope = fPrime(x);

            // Update point
            point
                .attr("cx", xScale(x))
                .attr("cy", yScale(y));

            // Update tangent line
            const x1 = -2;
            const x2 = 4;
            tangentLine
                .attr("x1", xScale(x1))
                .attr("y1", yScale(y + slope * (x1 - x)))
                .attr("x2", xScale(x2))
                .attr("y2", yScale(y + slope * (x2 - x)));

            // Update text
            slopeText.text(`x = ${x.toFixed(2)}, f'(x) = ${slope.toFixed(2)}`);
        });
}

// Gradient Descent Visualization
function createGradientDescent(containerId) {
    const container = d3.select(containerId);
    const width = container.node().getBoundingClientRect().width || 800;
    const height = 400;
    const margin = {top: 20, right: 30, bottom: 50, left: 60};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    container.selectAll("*").remove();

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
        .domain([-3, 3])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, 10])
        .range([innerHeight, 0]);

    // Axes
    g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", innerWidth / 2)
        .attr("y", 40)
        .style("text-anchor", "middle")
        .style("fill", "#262626")
        .text("Parameter (w)");

    g.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", -innerHeight / 2)
        .style("text-anchor", "middle")
        .style("fill", "#262626")
        .text("Loss");

    // Loss function: L(w) = (w - 1)² + 1
    const loss = w => (w - 1) * (w - 1) + 1;
    const lossGradient = w => 2 * (w - 1);

    // Generate loss curve
    const lossData = d3.range(-3, 3.1, 0.05).map(w => ({x: w, y: loss(w)}));

    const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveBasis);

    // Draw loss function
    g.append("path")
        .datum(lossData)
        .attr("fill", "none")
        .attr("stroke", "#10099F")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Gradient descent path
    const pathGroup = g.append("g");
    const steps = [];
    let w = -2.5;  // Starting point
    const learningRate = 0.1;
    const numSteps = 20;

    for (let i = 0; i < numSteps; i++) {
        steps.push({x: w, y: loss(w)});
        w = w - learningRate * lossGradient(w);
    }

    // Animate gradient descent
    steps.forEach((step, i) => {
        setTimeout(() => {
            // Add point
            pathGroup.append("circle")
                .attr("cx", xScale(step.x))
                .attr("cy", yScale(step.y))
                .attr("r", 0)
                .attr("fill", "#FC8484")
                .attr("opacity", 0.8)
                .transition()
                .duration(300)
                .attr("r", 4);

            // Add connecting line
            if (i > 0) {
                pathGroup.append("line")
                    .attr("x1", xScale(steps[i-1].x))
                    .attr("y1", yScale(steps[i-1].y))
                    .attr("x2", xScale(steps[i-1].x))
                    .attr("y2", yScale(steps[i-1].y))
                    .attr("stroke", "#FFA05F")
                    .attr("stroke-width", 2)
                    .attr("opacity", 0.6)
                    .transition()
                    .duration(300)
                    .attr("x2", xScale(step.x))
                    .attr("y2", yScale(step.y));
            }

            // Update iteration counter
            if (i === 0 || i === 5 || i === 10 || i === 19) {
                pathGroup.append("text")
                    .attr("x", xScale(step.x))
                    .attr("y", yScale(step.y) - 10)
                    .style("font-size", "12px")
                    .style("fill", "#262626")
                    .text(`Step ${i + 1}`)
                    .style("opacity", 0)
                    .transition()
                    .duration(300)
                    .style("opacity", 1);
            }
        }, i * 200);
    });

    // Add minimum point
    setTimeout(() => {
        g.append("circle")
            .attr("cx", xScale(1))
            .attr("cy", yScale(1))
            .attr("r", 6)
            .attr("fill", "#2DD2C0")
            .attr("stroke", "#262626")
            .attr("stroke-width", 2);

        g.append("text")
            .attr("x", xScale(1) + 10)
            .attr("y", yScale(1) - 10)
            .style("font-size", "14px")
            .style("fill", "#262626")
            .text("Minimum");
    }, numSteps * 200);
}

// Partial Derivatives Visualization
function createPartialDerivatives(containerId) {
    const container = d3.select(containerId);
    const width = container.node().getBoundingClientRect().width || 800;
    const height = 400;

    container.selectAll("*").remove();

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    // Function: f(x, y) = x² + y²
    const gridSize = 20;
    const scale = 15;

    // Project (i, j) grid coordinates to raw 2D isometric-style coordinates
    function project(i, j) {
        const x = i * scale / gridSize;
        const y = j * scale / gridSize;
        const z = (i * i + j * j) / (gridSize * gridSize) * 20;
        return { rawX: x - y * 0.5, rawY: y * 0.5 - z };
    }

    const gridPoints = [];
    for (let i = -gridSize; i <= gridSize; i += 4) {
        for (let j = -gridSize; j <= gridSize; j += 4) {
            gridPoints.push(project(i, j));
        }
    }

    const highlightXPoints = [];
    for (let i = -gridSize; i <= gridSize; i += 2) {
        highlightXPoints.push(project(i, 0));
    }

    const highlightYPoints = [];
    for (let j = -gridSize; j <= gridSize; j += 2) {
        highlightYPoints.push(project(0, j));
    }

    // Fit the raw projected coordinates to the available canvas area
    const allPoints = gridPoints.concat(highlightXPoints, highlightYPoints);
    const rawXExtent = d3.extent(allPoints, d => d.rawX);
    const rawYExtent = d3.extent(allPoints, d => d.rawY);
    const topPadding = 70;
    const bottomPadding = 20;
    const sidePadding = 40;

    const fitScale = Math.min(
        (width - sidePadding * 2) / (rawXExtent[1] - rawXExtent[0]),
        (height - topPadding - bottomPadding) / (rawYExtent[1] - rawYExtent[0])
    );

    const rawCenterX = (rawXExtent[0] + rawXExtent[1]) / 2;
    const rawCenterY = (rawYExtent[0] + rawYExtent[1]) / 2;
    const canvasCenterX = width / 2;
    const canvasCenterY = topPadding + (height - topPadding - bottomPadding) / 2;

    function toCanvas(p) {
        return {
            x: canvasCenterX + (p.rawX - rawCenterX) * fitScale,
            y: canvasCenterY + (p.rawY - rawCenterY) * fitScale
        };
    }

    // Create 3D-like visualization
    const g = svg.append("g");

    // Draw grid
    gridPoints.forEach(p => {
        const c = toCanvas(p);
        g.append("circle")
            .attr("cx", c.x)
            .attr("cy", c.y)
            .attr("r", 1.5)
            .attr("fill", "#10099F")
            .attr("opacity", 0.3);
    });

    // Highlight partial derivative directions
    const highlightX = g.append("g");
    const highlightY = g.append("g");

    // X direction (∂f/∂x)
    highlightXPoints.forEach(p => {
        const c = toCanvas(p);
        highlightX.append("circle")
            .attr("cx", c.x)
            .attr("cy", c.y)
            .attr("r", 3)
            .attr("fill", "#FC8484");
    });

    // Y direction (∂f/∂y)
    highlightYPoints.forEach(p => {
        const c = toCanvas(p);
        highlightY.append("circle")
            .attr("cx", c.x)
            .attr("cy", c.y)
            .attr("r", 3)
            .attr("fill", "#2DD2C0");
    });

    // Labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#262626")
        .text("f(x, y) = x² + y²");

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, 50)`);

    legend.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 4)
        .attr("fill", "#FC8484");

    legend.append("text")
        .attr("x", 10)
        .attr("y", 5)
        .style("font-size", "14px")
        .text("∂f/∂x direction");

    legend.append("circle")
        .attr("cx", 0)
        .attr("cy", 20)
        .attr("r", 4)
        .attr("fill", "#2DD2C0");

    legend.append("text")
        .attr("x", 10)
        .attr("y", 25)
        .style("font-size", "14px")
        .text("∂f/∂y direction");
}

// Chain Rule Visualization
function createChainRuleVisualization(containerId) {
    const container = d3.select(containerId);
    const width = container.node().getBoundingClientRect().width || 800;
    const height = 300;

    container.selectAll("*").remove();

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g")
        .attr("transform", "translate(50, 50)");

    // Create nodes for chain rule
    const nodes = [
        {id: "x", label: "x", x: 100, y: 100, color: "#10099F"},
        {id: "u", label: "u = g(x)", x: 300, y: 100, color: "#2DD2C0"},
        {id: "y", label: "y = f(u)", x: 500, y: 100, color: "#FC8484"}
    ];

    // Create edges
    const edges = [
        {source: "x", target: "u", label: "du/dx"},
        {source: "u", target: "y", label: "dy/du"}
    ];

    // Draw edges
    edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);

        // Arrow line
        g.append("line")
            .attr("x1", source.x + 30)
            .attr("y1", source.y)
            .attr("x2", target.x - 30)
            .attr("y2", target.y)
            .attr("stroke", "#262626")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrowhead)");

        // Edge label
        g.append("text")
            .attr("x", (source.x + target.x) / 2)
            .attr("y", source.y - 20)
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "#262626")
            .text(edge.label);
    });

    // Draw nodes
    nodes.forEach(node => {
        g.append("circle")
            .attr("cx", node.x)
            .attr("cy", node.y)
            .attr("r", 30)
            .attr("fill", node.color)
            .attr("opacity", 0.8);

        g.append("text")
            .attr("x", node.x)
            .attr("y", node.y + 5)
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", "white")
            .style("font-weight", "bold")
            .text(node.label);
    });

    // Add chain rule formula
    g.append("text")
        .attr("x", 300)
        .attr("y", 180)
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .style("fill", "#262626")
        .text("dy/dx = (dy/du) × (du/dx)");

    // Arrow marker definition
    svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 8)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#262626");
}

// Initialize visualizations for whichever slide is currently active
function initVisibleCalculusVizzes(currentSlide) {
    if (!currentSlide) return;
    if (currentSlide.querySelector('#derivative-viz')) {
        createDerivativeVisualization('#derivative-viz');
    }
    if (currentSlide.querySelector('#interactive-tangent')) {
        createInteractiveTangent('#interactive-tangent');
    }
    if (currentSlide.querySelector('#gradient-descent-viz')) {
        createGradientDescent('#gradient-descent-viz');
    }
    if (currentSlide.querySelector('#partial-derivatives-viz')) {
        createPartialDerivatives('#partial-derivatives-viz');
    }
    if (currentSlide.querySelector('#chain-rule-viz')) {
        createChainRuleVisualization('#chain-rule-viz');
    }
}

// Hook into Reveal.js: 'ready' covers the slide the deck opens on (including a
// direct deep link), 'slidechanged' covers every navigation after that.
if (typeof Reveal !== 'undefined') {
    Reveal.on('ready', () => {
        setTimeout(() => initVisibleCalculusVizzes(Reveal.getCurrentSlide()), 100);
    });
    Reveal.on('slidechanged', function(event) {
        setTimeout(() => initVisibleCalculusVizzes(event.currentSlide), 100);
    });
}