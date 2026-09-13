// VGG Network Visualizations
(function() {
    // Evolution of Network Design Visualization
    function createEvolutionVisualization() {
        const container = d3.select("#vgg-evolution-viz");
        if (!container.node()) return;

        // Clear any existing content to prevent duplication
        container.selectAll("*").remove();

        const width = 450;
        const height = 350;

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        // Timeline data
        const evolution = [
            { year: "Early CNNs", level: 1, label: "Individual Layers", color: "#FC8484" },
            { year: "AlexNet", level: 2, label: "Ad-hoc Design", color: "#FFA05F" },
            { year: "VGG", level: 3, label: "Blocks", color: "#2DD2C0" },
            { year: "Modern", level: 4, label: "Foundation Models", color: "#10099F" }
        ];

        // Create gradient
        const gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "evolution-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        evolution.forEach((d, i) => {
            gradient.append("stop")
                .attr("offset", `${(i / (evolution.length - 1)) * 100}%`)
                .attr("stop-color", d.color);
        });

        // Draw evolution path
        const xScale = d3.scaleLinear()
            .domain([0, evolution.length - 1])
            .range([50, width - 50]);

        const yScale = d3.scaleLinear()
            .domain([0, 5])
            .range([height - 50, 50]);

        const line = d3.line()
            .x((d, i) => xScale(i))
            .y(d => yScale(d.level))
            .curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(evolution)
            .attr("fill", "none")
            .attr("stroke", "url(#evolution-gradient)")
            .attr("stroke-width", 3)
            .attr("d", line)
            .style("opacity", 0)
            .transition()
            .duration(1500)
            .style("opacity", 1);

        // Add circles and labels
        const nodes = svg.selectAll(".evolution-node")
            .data(evolution)
            .enter().append("g")
            .attr("class", "evolution-node")
            .attr("transform", (d, i) => `translate(${xScale(i)}, ${yScale(d.level)})`);

        nodes.append("circle")
            .attr("r", 0)
            .attr("fill", d => d.color)
            .transition()
            .delay((d, i) => i * 300)
            .duration(500)
            .attr("r", 8);

        nodes.append("text")
            .attr("y", -15)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .text(d => d.year)
            .style("opacity", 0)
            .transition()
            .delay((d, i) => i * 300 + 200)
            .duration(500)
            .style("opacity", 1);

        nodes.append("text")
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .text(d => d.label)
            .style("opacity", 0)
            .transition()
            .delay((d, i) => i * 300 + 200)
            .duration(500)
            .style("opacity", 1);
    }

    // VGG Block Animation
    function createVGGBlockAnimation() {
        const container = d3.select("#vgg-block-animation");
        if (!container.node()) return;

        // Clear any existing content to prevent duplication
        container.selectAll("*").remove();

        const width = 600;
        const height = 250;

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        // Create block components
        const blockComponents = [
            { x: 50, label: "Input", color: "#10099F", type: "data" },
            { x: 150, label: "3×3 Conv", color: "#2DD2C0", type: "conv" },
            { x: 230, label: "ReLU", color: "#00FFBA", type: "activation" },
            { x: 310, label: "3×3 Conv", color: "#2DD2C0", type: "conv" },
            { x: 390, label: "ReLU", color: "#00FFBA", type: "activation" },
            { x: 470, label: "MaxPool", color: "#FAC55B", type: "pool" },
            { x: 550, label: "Output", color: "#FC8484", type: "data" }
        ];

        // Draw connections
        for (let i = 0; i < blockComponents.length - 1; i++) {
            svg.append("line")
                .attr("x1", blockComponents[i].x + 30)
                .attr("y1", 125)
                .attr("x2", blockComponents[i + 1].x - 30)
                .attr("y2", 125)
                .attr("stroke", "#EEEEEE")
                .attr("stroke-width", 2);
        }

        // Draw components
        const components = svg.selectAll(".block-component")
            .data(blockComponents)
            .enter().append("g")
            .attr("class", "block-component")
            .attr("transform", d => `translate(${d.x}, 100)`);

        components.append("rect")
            .attr("x", -30)
            .attr("y", -25)
            .attr("width", 60)
            .attr("height", 50)
            .attr("fill", d => d.color)
            .attr("rx", 5)
            .attr("opacity", 0.8);

        components.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 5)
            .attr("fill", "white")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .text(d => d.label);

        // Add dimension labels
        const dimensions = [
            { x: 50, text: "H×W×C" },
            { x: 150, text: "H×W×C" },
            { x: 310, text: "H×W×C" },
            { x: 470, text: "H/2×W/2×C" },
            { x: 550, text: "H/2×W/2×C" }
        ];

        svg.selectAll(".dimension-label")
            .data(dimensions)
            .enter().append("text")
            .attr("x", d => d.x)
            .attr("y", 160)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "#666")
            .text(d => d.text);

        // Animate button handler
        d3.select("#animate-vgg-block").on("click", function() {
            animateForwardPass();
        });

        function animateForwardPass() {
            // Create particle
            const particle = svg.append("circle")
                .attr("r", 6)
                .attr("fill", "#10099F")
                .attr("cx", 50)
                .attr("cy", 125);

            // Animate through components
            blockComponents.forEach((comp, i) => {
                particle.transition()
                    .delay(i * 400)
                    .duration(400)
                    .attr("cx", comp.x)
                    .attr("fill", comp.color);
            });

            // Remove particle after animation
            particle.transition()
                .delay(blockComponents.length * 400)
                .remove();
        }
    }

    // Receptive Field Visualization
    function createReceptiveFieldVisualization() {
        const container = d3.select("#receptive-field-viz");
        if (!container.node()) return;

        // Clear any existing content to prevent duplication
        container.selectAll("*").remove();

        const width = 500;
        const height = 200;

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        // Two 3×3 convolutions
        const g1 = svg.append("g").attr("transform", "translate(100, 50)");

        // Input grid
        drawGrid(g1, 0, 0, 5, 5, "#E0E0E0");

        // First 3×3 receptive field
        drawGrid(g1, 10, 10, 3, 3, "#2DD2C0");

        // Arrow
        g1.append("path")
            .attr("d", "M 65 50 L 85 50")
            .attr("stroke", "#666")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrowhead)");

        // Second convolution
        drawGrid(g1, 100, 20, 3, 3, "#00FFBA");

        // One 5×5 convolution
        const g2 = svg.append("g").attr("transform", "translate(280, 50)");

        // Input grid
        drawGrid(g2, 0, 0, 5, 5, "#E0E0E0");

        // 5×5 receptive field
        drawGrid(g2, 0, 0, 5, 5, "#FC8484", 0.5);

        // Arrow marker
        svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("markerWidth", 10)
            .attr("markerHeight", 7)
            .attr("refX", 9)
            .attr("refY", 3.5)
            .attr("orient", "auto")
            .append("polygon")
            .attr("points", "0 0, 10 3.5, 0 7")
            .attr("fill", "#666");

        function drawGrid(parent, x, y, rows, cols, color, opacity = 1) {
            const cellSize = 15;
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    parent.append("rect")
                        .attr("x", x + j * cellSize)
                        .attr("y", y + i * cellSize)
                        .attr("width", cellSize)
                        .attr("height", cellSize)
                        .attr("fill", color)
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 1)
                        .attr("opacity", opacity);
                }
            }
        }
    }

    // VGG Comparison Visualization
    function createVGGComparisonVisualization() {
        const container = d3.select("#vgg-comparison-viz");
        if (!container.node()) return;

        // Clear any existing content to prevent duplication
        container.selectAll("*").remove();

        const width = 600;
        const height = 250;

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        const variants = [
            { name: "VGG-11", blocks: [1, 1, 2, 2, 2], color: "#10099F" },
            { name: "VGG-13", blocks: [2, 2, 2, 2, 2], color: "#2DD2C0" },
            { name: "VGG-16", blocks: [2, 2, 3, 3, 3], color: "#FAC55B" },
            { name: "VGG-19", blocks: [2, 2, 4, 4, 4], color: "#FC8484" }
        ];

        const xScale = d3.scaleBand()
            .domain(variants.map(d => d.name))
            .range([50, width - 50])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, 16])
            .range([height - 40, 20]);

        // Draw bars
        variants.forEach(variant => {
            const totalLayers = variant.blocks.reduce((a, b) => a + b, 0);

            svg.append("rect")
                .attr("x", xScale(variant.name))
                .attr("y", yScale(totalLayers))
                .attr("width", xScale.bandwidth())
                .attr("height", 0)
                .attr("fill", variant.color)
                .attr("opacity", 0.8)
                .transition()
                .duration(1000)
                .attr("height", height - 40 - yScale(totalLayers));

            // Add layer count
            svg.append("text")
                .attr("x", xScale(variant.name) + xScale.bandwidth() / 2)
                .attr("y", yScale(totalLayers) - 5)
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .text(totalLayers)
                .style("opacity", 0)
                .transition()
                .delay(1000)
                .style("opacity", 1);

            // Add name
            svg.append("text")
                .attr("x", xScale(variant.name) + xScale.bandwidth() / 2)
                .attr("y", height - 20)
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .text(variant.name);
        });

        // Add y-axis label
        svg.append("text")
            .attr("x", 20)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("transform", `rotate(-90 20 ${height / 2})`)
            .text("Conv Layers");
    }

    // VGG-11 Flow Visualization
    function createVGG11FlowVisualization() {
        const container = d3.select("#vgg11-flow-viz");
        if (!container.node()) return;

        // Clear any existing content to prevent duplication
        container.selectAll("*").remove();

        const width = 600;
        const height = 150;

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        const flow = [
            { size: "224×224×3", label: "Input" },
            { size: "112×112×64", label: "Block 1" },
            { size: "56×56×128", label: "Block 2" },
            { size: "28×28×256", label: "Block 3" },
            { size: "14×14×512", label: "Block 4" },
            { size: "7×7×512", label: "Block 5" },
            { size: "4096", label: "FC" },
            { size: "10", label: "Output" }
        ];

        const xScale = d3.scaleLinear()
            .domain([0, flow.length - 1])
            .range([50, width - 50]);

        flow.forEach((stage, i) => {
            if (i < flow.length - 1) {
                svg.append("line")
                    .attr("x1", xScale(i))
                    .attr("y1", 75)
                    .attr("x2", xScale(i + 1))
                    .attr("y2", 75)
                    .attr("stroke", "#EEEEEE")
                    .attr("stroke-width", 2);
            }

            const g = svg.append("g")
                .attr("transform", `translate(${xScale(i)}, 75)`);

            g.append("circle")
                .attr("r", 0)
                .attr("fill", i === 0 ? "#10099F" : i === flow.length - 1 ? "#FC8484" : "#2DD2C0")
                .transition()
                .delay(i * 200)
                .duration(500)
                .attr("r", 20);

            g.append("text")
                .attr("y", -30)
                .attr("text-anchor", "middle")
                .attr("font-size", "10px")
                .text(stage.size)
                .style("opacity", 0)
                .transition()
                .delay(i * 200 + 300)
                .style("opacity", 1);

            g.append("text")
                .attr("y", 45)
                .attr("text-anchor", "middle")
                .attr("font-size", "11px")
                .attr("font-weight", "bold")
                .text(stage.label)
                .style("opacity", 0)
                .transition()
                .delay(i * 200 + 300)
                .style("opacity", 1);
        });
    }

    // Training Visualization
    function createVGGTrainingVisualization() {
        const container = d3.select("#vgg-training-viz");
        if (!container.node()) return;

        // Clear any existing content to prevent duplication
        container.selectAll("*").remove();

        const width = 600;
        const height = 400;

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        // Sample training data
        const epochs = d3.range(0, 11);
        const trainLoss = [1.8, 0.9, 0.6, 0.45, 0.35, 0.3, 0.25, 0.22, 0.2, 0.18, 0.17];
        const valLoss = [1.7, 0.85, 0.65, 0.5, 0.42, 0.38, 0.35, 0.33, 0.32, 0.31, 0.3];
        const valAcc = [0.3, 0.65, 0.75, 0.82, 0.85, 0.87, 0.88, 0.89, 0.895, 0.9, 0.905];

        const margin = { top: 20, right: 80, bottom: 40, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales
        const xScale = d3.scaleLinear()
            .domain([0, 10])
            .range([0, innerWidth]);

        const yScaleLoss = d3.scaleLinear()
            .domain([0, 2])
            .range([innerHeight, 0]);

        const yScaleAcc = d3.scaleLinear()
            .domain([0, 1])
            .range([innerHeight, 0]);

        // Axes
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale).ticks(10))
            .append("text")
            .attr("x", innerWidth / 2)
            .attr("y", 35)
            .attr("fill", "black")
            .style("text-anchor", "middle")
            .text("Epoch");

        g.append("g")
            .call(d3.axisLeft(yScaleLoss))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -35)
            .attr("x", -innerHeight / 2)
            .attr("fill", "black")
            .style("text-anchor", "middle")
            .text("Loss");

        g.append("g")
            .attr("transform", `translate(${innerWidth}, 0)`)
            .call(d3.axisRight(yScaleAcc))
            .append("text")
            .attr("transform", "rotate(90)")
            .attr("y", -35)
            .attr("x", innerHeight / 2)
            .attr("fill", "black")
            .style("text-anchor", "middle")
            .text("Accuracy");

        // Lines
        const line = d3.line()
            .x((d, i) => xScale(i))
            .curve(d3.curveMonotoneX);

        // Train loss
        const trainPath = g.append("path")
            .datum(trainLoss)
            .attr("fill", "none")
            .attr("stroke", "#10099F")
            .attr("stroke-width", 2)
            .attr("d", line.y(d => yScaleLoss(d)));

        // Val loss
        const valPath = g.append("path")
            .datum(valLoss)
            .attr("fill", "none")
            .attr("stroke", "#FC8484")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5")
            .attr("d", line.y(d => yScaleLoss(d)));

        // Val accuracy
        const accPath = g.append("path")
            .datum(valAcc)
            .attr("fill", "none")
            .attr("stroke", "#2DD2C0")
            .attr("stroke-width", 2)
            .attr("d", line.y(d => yScaleAcc(d)));

        // Animate paths
        [trainPath, valPath, accPath].forEach(path => {
            const totalLength = path.node().getTotalLength();
            path
                .attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(2000)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
                .on("end", function() {
                    if (this === valPath.node()) {
                        d3.select(this).attr("stroke-dasharray", "5,5");
                    }
                });
        });

        // Legend
        const legend = g.append("g")
            .attr("transform", `translate(${innerWidth - 120}, 20)`);

        const legendItems = [
            { label: "Train Loss", color: "#10099F", dash: false },
            { label: "Val Loss", color: "#FC8484", dash: true },
            { label: "Val Acc", color: "#2DD2C0", dash: false }
        ];

        legendItems.forEach((item, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            legendRow.append("line")
                .attr("x1", 0)
                .attr("x2", 20)
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("stroke", item.color)
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", item.dash ? "5,5" : null);

            legendRow.append("text")
                .attr("x", 25)
                .attr("y", 0)
                .attr("dy", "0.32em")
                .style("font-size", "12px")
                .text(item.label);
        });
    }

    // Initialize all visualizations when the slide is shown
    Reveal.on('slidechanged', event => {
        // Check if we're on a VGG slide
        const currentSlide = event.currentSlide;

        if (currentSlide.querySelector('#vgg-evolution-viz') && !currentSlide.querySelector('#vgg-evolution-viz svg')) {
            createEvolutionVisualization();
        }

        if (currentSlide.querySelector('#vgg-block-animation') && !currentSlide.querySelector('#vgg-block-animation svg')) {
            createVGGBlockAnimation();
        }

        if (currentSlide.querySelector('#receptive-field-viz') && !currentSlide.querySelector('#receptive-field-viz svg')) {
            createReceptiveFieldVisualization();
        }

        if (currentSlide.querySelector('#vgg-comparison-viz') && !currentSlide.querySelector('#vgg-comparison-viz svg')) {
            createVGGComparisonVisualization();
        }

        if (currentSlide.querySelector('#vgg11-flow-viz') && !currentSlide.querySelector('#vgg11-flow-viz svg')) {
            createVGG11FlowVisualization();
        }

        if (currentSlide.querySelector('#vgg-training-viz') && !currentSlide.querySelector('#vgg-training-viz svg')) {
            createVGGTrainingVisualization();
        }
    });

    // Also initialize on ready
    Reveal.on('ready', event => {
        const currentSlide = event.currentSlide;

        if (currentSlide.querySelector('#vgg-evolution-viz')) {
            createEvolutionVisualization();
        }

        if (currentSlide.querySelector('#vgg-block-animation')) {
            createVGGBlockAnimation();
        }

        if (currentSlide.querySelector('#receptive-field-viz')) {
            createReceptiveFieldVisualization();
        }

        if (currentSlide.querySelector('#vgg-comparison-viz')) {
            createVGGComparisonVisualization();
        }

        if (currentSlide.querySelector('#vgg11-flow-viz')) {
            createVGG11FlowVisualization();
        }

        if (currentSlide.querySelector('#vgg-training-viz')) {
            createVGGTrainingVisualization();
        }
    });
})();