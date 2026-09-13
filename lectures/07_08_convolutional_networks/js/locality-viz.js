// Locality Principle and Receptive Field Visualization
(function() {
    let svg;
    const gridSize = 10;
    const cellSize = 30;
    
    function initReceptiveFieldDemo() {
        const container = document.getElementById('locality-field-svg');
        if (!container || !window.d3) return;

        svg = d3.select(container);
        svg.selectAll("*").remove();

        const width = 600;
        const height = 400;

        // Create main groups
        const inputGroup = svg.append('g')
            .attr('transform', 'translate(100, 50)');

        // Move output neuron more to the right to avoid overlap
        const outputGroup = svg.append('g')
            .attr('transform', 'translate(480, 150)');

        // Draw input grid
        drawGrid(inputGroup, gridSize, gridSize, 'Input Image');

        // Draw output neuron
        drawOutputNeuron(outputGroup);

        // Update connections based on kernel size
        updateConnections();

        setupLocalityControls();
    }
    
    function drawGrid(group, rows, cols, label) {
        // Add label
        group.append('text')
            .attr('x', (cols * cellSize) / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .attr('fill', '#10099F')
            .text(label);
        
        // Draw cells
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = group.append('g')
                    .attr('class', 'grid-cell')
                    .attr('data-row', i)
                    .attr('data-col', j);
                
                cell.append('rect')
                    .attr('x', j * cellSize)
                    .attr('y', i * cellSize)
                    .attr('width', cellSize)
                    .attr('height', cellSize)
                    .attr('fill', 'white')
                    .attr('stroke', '#ddd')
                    .attr('stroke-width', 1);
                
                // Add pixel value (random for demonstration)
                cell.append('text')
                    .attr('x', j * cellSize + cellSize/2)
                    .attr('y', i * cellSize + cellSize/2)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('font-size', '10px')
                    .attr('fill', '#666')
                    .text(Math.floor(Math.random() * 10));
            }
        }
    }
    
    function drawOutputNeuron(group) {
        // Draw neuron
        const neuron = group.append('g')
            .attr('class', 'output-neuron');
        
        neuron.append('circle')
            .attr('r', 30)
            .attr('fill', '#2DD2C0')
            .attr('stroke', '#262626')
            .attr('stroke-width', 2);
        
        neuron.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('fill', 'white')
            .text('Output');
        
        // Add label
        group.append('text')
            .attr('y', 50)
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .attr('fill', '#10099F')
            .text('Hidden Unit');
    }
    
    function updateConnections() {
        // Remove existing connections
        svg.selectAll('.connection').remove();
        svg.selectAll('.receptive-field').remove();
        
        const slider = document.getElementById('delta-slider');
        const deltaValue = document.getElementById('delta-value');
        if (!slider || !deltaValue) return;
        
        const kernelSize = parseInt(slider.value);
        deltaValue.textContent = `${kernelSize}×${kernelSize}`;
        
        // Calculate center position for receptive field
        const centerRow = Math.floor(gridSize / 2);
        const centerCol = Math.floor(gridSize / 2);
        const delta = Math.floor(kernelSize / 2);
        
        // Highlight receptive field
        const inputGroup = svg.select('g');
        const receptiveField = inputGroup.append('g')
            .attr('class', 'receptive-field');
        
        // Draw receptive field rectangle
        receptiveField.append('rect')
            .attr('x', (centerCol - delta) * cellSize)
            .attr('y', (centerRow - delta) * cellSize)
            .attr('width', kernelSize * cellSize)
            .attr('height', kernelSize * cellSize)
            .attr('fill', '#10099F')
            .attr('fill-opacity', 0.1)
            .attr('stroke', '#10099F')
            .attr('stroke-width', 2);
        
        // Draw connections
        const connectionGroup = svg.append('g')
            .attr('class', 'connection')
            .attr('transform', 'translate(100, 50)');
        
        let connectionCount = 0;
        
        for (let i = -delta; i <= delta; i++) {
            for (let j = -delta; j <= delta; j++) {
                const row = centerRow + i;
                const col = centerCol + j;
                
                if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
                    const startX = col * cellSize + cellSize/2;
                    const startY = row * cellSize + cellSize/2;
                    const endX = 380;  // Adjusted to point to new output position
                    const endY = 100;
                    
                    // Draw connection line
                    connectionGroup.append('line')
                        .attr('x1', startX)
                        .attr('y1', startY)
                        .attr('x2', endX)
                        .attr('y2', endY)
                        .attr('stroke', '#10099F')
                        .attr('stroke-width', 1)
                        .attr('stroke-opacity', 0.3)
                        .attr('stroke-dasharray', '2,2');
                    
                    // Highlight connected cells
                    inputGroup.select(`.grid-cell[data-row="${row}"][data-col="${col}"] rect`)
                        .attr('fill', '#e3f2fd');
                    
                    connectionCount++;
                }
            }
        }
        
        // Update parameter count display
        updateParameterCount(connectionCount);
    }
    
    function updateParameterCount(count) {
        // Remove existing parameter display
        svg.selectAll('.param-display').remove();

        // Add parameter count
        const paramGroup = svg.append('g')
            .attr('class', 'param-display')
            .attr('transform', 'translate(300, 350)');

        // Make box wider to accommodate text
        paramGroup.append('rect')
            .attr('x', -110)
            .attr('y', -20)
            .attr('width', 220)
            .attr('height', 40)
            .attr('fill', '#f9f9f9')
            .attr('stroke', '#10099F')
            .attr('stroke-width', 2)
            .attr('rx', 5);

        paramGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .attr('fill', '#10099F')
            .text(`Parameters: ${count} weights + 1 bias`);
    }
    
    function setupLocalityControls() {
        const slider = document.getElementById('delta-slider');
        
        if (slider) {
            slider.addEventListener('input', updateConnections);
        }
    }
    
    // Also create the receptive field growth demo
    function initReceptiveGrowthDemo() {
        const container = document.getElementById('receptive-growth-svg');
        if (!container || !window.d3) return;

        const svg = d3.select(container);
        svg.selectAll("*").remove();

        const width = 750;
        const height = 400;
        
        // Create layer visualization
        updateLayerVisualization(svg, width, height);
        
        setupGrowthControls();
    }
    
    function updateLayerVisualization(svg, width, height) {
        const depthSlider = document.getElementById('depth-slider');
        const depthValue = document.getElementById('depth-value');
        if (!depthSlider || !depthValue) return;
        
        const depth = parseInt(depthSlider.value);
        depthValue.textContent = depth === 1 ? '1 layer' : `${depth} layers`;
        
        svg.selectAll("*").remove();
        
        // Calculate receptive field size (assuming 3x3 kernels)
        const rfSize = 2 * depth + 1;
        const maxRfSize = 11; // Maximum for 5 layers
        const scale = Math.min(300 / maxRfSize, 25);
        
        // Draw input image grid
        const inputGroup = svg.append('g')
            .attr('transform', `translate(150, ${height/2})`);
        
        // Draw grid
        const gridExtent = 15;
        for (let i = -gridExtent; i <= gridExtent; i++) {
            for (let j = -gridExtent; j <= gridExtent; j++) {
                const isInRF = Math.abs(i) <= depth && Math.abs(j) <= depth;
                
                inputGroup.append('rect')
                    .attr('x', i * scale - scale/2)
                    .attr('y', j * scale - scale/2)
                    .attr('width', scale - 1)
                    .attr('height', scale - 1)
                    .attr('fill', isInRF ? '#10099F' : '#f5f5f5')
                    .attr('fill-opacity', isInRF ? 0.6 : 1)
                    .attr('stroke', '#ddd')
                    .attr('stroke-width', 0.5);
            }
        }
        
        // Draw layers
        const layerWidth = 50;
        const layerSpacing = 70;
        
        for (let l = 0; l < depth; l++) {
            const layerGroup = svg.append('g')
                .attr('transform', `translate(${350 + l * layerSpacing}, ${height/2})`);
            
            // Layer rectangle
            layerGroup.append('rect')
                .attr('x', -layerWidth/2)
                .attr('y', -40)
                .attr('width', layerWidth)
                .attr('height', 80)
                .attr('fill', d3.interpolateViridis(l / Math.max(depth - 1, 1)))
                .attr('stroke', '#262626')
                .attr('stroke-width', 2)
                .attr('rx', 5);
            
            // Layer label
            layerGroup.append('text')
                .attr('text-anchor', 'middle')
                .attr('y', 0)
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .attr('fill', 'white')
                .text(`L${l + 1}`);
            
            // Receptive field size label
            layerGroup.append('text')
                .attr('text-anchor', 'middle')
                .attr('y', 60)
                .attr('font-size', '10px')
                .attr('fill', '#666')
                .text(`${2*(l+1)+1}×${2*(l+1)+1}`);
        }
        
        // Add receptive field size label
        inputGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', -gridExtent * scale - 20)
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .attr('fill', '#10099F')
            .text(`Receptive Field: ${rfSize}×${rfSize} pixels`);
    }
    
    function setupGrowthControls() {
        const depthSlider = document.getElementById('depth-slider');
        
        if (depthSlider) {
            depthSlider.addEventListener('input', () => {
                const container = document.getElementById('receptive-growth-svg');
                if (container) {
                    const svg = d3.select(container);
                    updateLayerVisualization(svg, 600, 400);
                }
            });
        }
    }
    
    // Initialize when slide is shown
    Reveal.on('slidechanged', event => {
        if (event.currentSlide.querySelector('#receptive-field-locality-demo')) {
            setTimeout(initReceptiveFieldDemo, 150);
        }
        if (event.currentSlide.querySelector('#receptive-growth-demo')) {
            setTimeout(initReceptiveGrowthDemo, 150);
        }
    });

    // Initialize on Reveal ready event
    Reveal.on('ready', () => {
        if (document.querySelector('.present #receptive-field-locality-demo')) {
            setTimeout(initReceptiveFieldDemo, 150);
        }
        if (document.querySelector('.present #receptive-growth-demo')) {
            setTimeout(initReceptiveGrowthDemo, 150);
        }
    });

    // Also initialize if already on the slide
    if (document.querySelector('.present #receptive-field-locality-demo')) {
        setTimeout(initReceptiveFieldDemo, 150);
    }
    if (document.querySelector('.present #receptive-growth-demo')) {
        setTimeout(initReceptiveGrowthDemo, 150);
    }
})();