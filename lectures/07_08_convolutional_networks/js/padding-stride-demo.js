// Main interactive padding and stride demonstrations

document.addEventListener('DOMContentLoaded', function() {
    
    // Padding Calculator Demo
    function initPaddingCalculator() {
        const inputSizeSlider = document.getElementById('input-size-pad');
        const kernelSizeSlider = document.getElementById('kernel-size-pad');
        const paddingSlider = document.getElementById('padding-amount');
        const vizContainer = document.getElementById('padding-viz-container');
        
        if (!inputSizeSlider || !vizContainer) return;
        
        function updatePaddingViz() {
            const inputSize = parseInt(inputSizeSlider.value);
            const kernelSize = parseInt(kernelSizeSlider.value);
            const padding = parseInt(paddingSlider.value);
            
            // Update display values
            document.getElementById('input-size-pad-value').textContent = `${inputSize}×${inputSize}`;
            document.getElementById('kernel-size-pad-value').textContent = `${kernelSize}×${kernelSize}`;
            document.getElementById('padding-value').textContent = padding;
            
            // Calculate output size
            const outputSize = inputSize - kernelSize + 2 * padding + 1;
            
            // Create visualization
            vizContainer.innerHTML = `
                <div style="display: flex; justify-content: space-around; align-items: center;">
                    <div style="text-align: center;">
                        <h5>Input with Padding</h5>
                        <svg width="200" height="200" viewBox="0 0 200 200">
                            ${createPaddingGrid(inputSize, padding, kernelSize)}
                        </svg>
                        <p>${inputSize + 2 * padding}×${inputSize + 2 * padding} (with padding)</p>
                    </div>
                    <div style="font-size: 24px;">→</div>
                    <div style="text-align: center;">
                        <h5>Output</h5>
                        <svg width="200" height="200" viewBox="0 0 200 200">
                            ${createOutputGrid(outputSize)}
                        </svg>
                        <p>${outputSize}×${outputSize}</p>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <p><strong>Formula:</strong> Output = ${inputSize} - ${kernelSize} + 2×${padding} + 1 = ${outputSize}</p>
                </div>
            `;
        }
        
        function createPaddingGrid(size, padding, kernelSize) {
            const totalSize = size + 2 * padding;
            const cellSize = 180 / totalSize;
            let svg = '';
            
            for (let i = 0; i < totalSize; i++) {
                for (let j = 0; j < totalSize; j++) {
                    const x = j * cellSize + 10;
                    const y = i * cellSize + 10;
                    
                    // Determine if this is padding, input, or kernel position
                    let fill = '#ffffff';
                    let stroke = '#ddd';
                    
                    if (i < padding || i >= size + padding || j < padding || j >= size + padding) {
                        // Padding area
                        fill = '#e3f2fd';
                        stroke = '#90caf9';
                    } else {
                        // Input area
                        fill = '#ffffff';
                        stroke = '#10099F';
                    }
                    
                    // Highlight kernel position (top-left)
                    if (i <= kernelSize - 1 && j <= kernelSize - 1) {
                        fill = '#fce4ec';
                    }
                    
                    svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" 
                            fill="${fill}" stroke="${stroke}" stroke-width="0.5"/>`;
                }
            }
            
            return svg;
        }
        
        function createOutputGrid(size) {
            if (size <= 0) {
                return '<text x="100" y="100" text-anchor="middle" fill="#f44336">Invalid output size!</text>';
            }
            
            const cellSize = Math.min(180 / size, 30);
            const offset = (200 - size * cellSize) / 2;
            let svg = '';
            
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    const x = j * cellSize + offset;
                    const y = i * cellSize + offset;
                    
                    svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" 
                            fill="#e8f5e9" stroke="#4caf50" stroke-width="0.5"/>`;
                }
            }
            
            return svg;
        }
        
        // Event listeners
        inputSizeSlider.addEventListener('input', updatePaddingViz);
        kernelSizeSlider.addEventListener('input', updatePaddingViz);
        paddingSlider.addEventListener('input', updatePaddingViz);
        
        // Initial update
        updatePaddingViz();
    }
    
    // Combined Calculator Demo
    function initCombinedCalculator() {
        const inputSlider = document.getElementById('combined-input');
        const kernelSelect = document.getElementById('combined-kernel');
        const paddingSelect = document.getElementById('combined-padding');
        const strideSelect = document.getElementById('combined-stride');
        const vizContainer = document.getElementById('combined-viz');
        const outputDisplay = document.getElementById('combined-output');
        
        if (!inputSlider || !vizContainer) return;
        
        function updateCombined() {
            const inputSize = parseInt(inputSlider.value);
            const kernelSize = parseInt(kernelSelect.value);
            const stride = parseInt(strideSelect.value);
            
            // Calculate padding
            let padding = 0;
            const paddingValue = paddingSelect.value;
            if (paddingValue === 'same') {
                padding = Math.floor((kernelSize - 1) / 2);
            } else if (paddingValue !== '0') {
                padding = parseInt(paddingValue);
            }
            
            // Update display
            document.getElementById('combined-input-value').textContent = `${inputSize}×${inputSize}`;
            
            // Calculate output size
            const outputSize = Math.floor((inputSize - kernelSize + 2 * padding + stride) / stride);
            
            // Create visualization
            vizContainer.innerHTML = createCombinedVisualization(inputSize, kernelSize, padding, stride, outputSize);
            
            // Update output display
            outputDisplay.innerHTML = `
                <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid #10099F;">
                    <h5>Configuration Summary</h5>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; text-align: left;">
                        <div><strong>Input:</strong> ${inputSize}×${inputSize}</div>
                        <div><strong>Kernel:</strong> ${kernelSize}×${kernelSize}</div>
                        <div><strong>Padding:</strong> ${padding} ${paddingValue === 'same' ? '(same)' : ''}</div>
                        <div><strong>Stride:</strong> ${stride}</div>
                        <div style="grid-column: span 2;"><strong>Output:</strong> ${outputSize}×${outputSize}</div>
                    </div>
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                        <strong>Formula:</strong><br>
                        ⌊(${inputSize} - ${kernelSize} + 2×${padding} + ${stride}) / ${stride}⌋ = ${outputSize}
                    </div>
                </div>
            `;
        }
        
        function createCombinedVisualization(inputSize, kernelSize, padding, stride, outputSize) {
            const scale = 300 / (inputSize + 2 * padding);
            const cellSize = Math.min(scale, 20);
            
            return `
                <svg width="600" height="300" style="background: white; border: 1px solid #ddd; border-radius: 8px;">
                    <!-- Input with padding -->
                    <g transform="translate(50, 50)">
                        <text x="100" y="-10" text-anchor="middle" font-weight="bold">Input + Padding</text>
                        ${drawGridWithPadding(inputSize, padding, cellSize)}
                    </g>
                    
                    <!-- Arrow -->
                    <path d="M 250 150 L 350 150" stroke="#10099F" stroke-width="2" marker-end="url(#arrowhead)"/>
                    <text x="300" y="140" text-anchor="middle" font-size="12">Conv</text>
                    
                    <!-- Output -->
                    <g transform="translate(400, 50)">
                        <text x="75" y="-10" text-anchor="middle" font-weight="bold">Output</text>
                        ${drawOutputGridForCombined(outputSize, cellSize * 1.5)}
                    </g>
                    
                    <!-- Arrow marker -->
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#10099F"/>
                        </marker>
                    </defs>
                </svg>
            `;
        }
        
        function drawGridWithPadding(size, padding, cellSize) {
            const totalSize = size + 2 * padding;
            let svg = '';
            
            for (let i = 0; i < totalSize; i++) {
                for (let j = 0; j < totalSize; j++) {
                    const x = j * cellSize;
                    const y = i * cellSize;
                    
                    let fill = '#ffffff';
                    if (i < padding || i >= size + padding || j < padding || j >= size + padding) {
                        fill = '#e3f2fd';
                    }
                    
                    svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" 
                            fill="${fill}" stroke="#999" stroke-width="0.5"/>`;
                }
            }
            
            return svg;
        }
        
        function drawOutputGridForCombined(size, cellSize) {
            let svg = '';
            
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    const x = j * cellSize;
                    const y = i * cellSize;
                    
                    svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" 
                            fill="#e8f5e9" stroke="#4caf50" stroke-width="0.5"/>`;
                }
            }
            
            return svg;
        }
        
        // Event listeners
        inputSlider.addEventListener('input', updateCombined);
        kernelSelect.addEventListener('change', updateCombined);
        paddingSelect.addEventListener('change', updateCombined);
        strideSelect.addEventListener('change', updateCombined);
        
        // Initial update
        updateCombined();
    }
    
    // Lab Calculator
    function initLabCalculator() {
        const calculateBtn = document.getElementById('calculate-output');
        const visualizeBtn = document.getElementById('visualize-config');
        const resultsDiv = document.getElementById('lab-results');
        
        if (!calculateBtn || !resultsDiv) return;
        
        calculateBtn.addEventListener('click', function() {
            const inputH = parseInt(document.getElementById('lab-input-h').value);
            const inputW = parseInt(document.getElementById('lab-input-w').value);
            const kernelH = parseInt(document.getElementById('lab-kernel-h').value);
            const kernelW = parseInt(document.getElementById('lab-kernel-w').value);
            const padH = parseInt(document.getElementById('lab-pad-h').value);
            const padW = parseInt(document.getElementById('lab-pad-w').value);
            const strideH = parseInt(document.getElementById('lab-stride-h').value);
            const strideW = parseInt(document.getElementById('lab-stride-w').value);
            
            const outputH = Math.floor((inputH - kernelH + 2 * padH + strideH) / strideH);
            const outputW = Math.floor((inputW - kernelW + 2 * padW + strideW) / strideW);
            
            const receptiveFieldH = kernelH;
            const receptiveFieldW = kernelW;
            
            const numOperations = outputH * outputW * kernelH * kernelW;
            
            resultsDiv.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div>
                        <strong>Output Dimensions:</strong> ${outputH} × ${outputW}
                    </div>
                    <div>
                        <strong>Total Output Elements:</strong> ${outputH * outputW}
                    </div>
                    <div>
                        <strong>Receptive Field:</strong> ${receptiveFieldH} × ${receptiveFieldW}
                    </div>
                    <div>
                        <strong>Operations per Output:</strong> ${kernelH * kernelW}
                    </div>
                    <div style="grid-column: span 2;">
                        <strong>Total Operations:</strong> ${numOperations.toLocaleString()}
                    </div>
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                    <strong>Height Calculation:</strong><br>
                    ⌊(${inputH} - ${kernelH} + 2×${padH} + ${strideH}) / ${strideH}⌋ = ${outputH}<br>
                    <strong>Width Calculation:</strong><br>
                    ⌊(${inputW} - ${kernelW} + 2×${padW} + ${strideW}) / ${strideW}⌋ = ${outputW}
                </div>
            `;
        });
        
        visualizeBtn.addEventListener('click', function() {
            // This would create a more detailed visualization
            // For now, just trigger the calculate
            calculateBtn.click();
        });
    }
    
    // Initialize all demos when their slides are shown
    Reveal.addEventListener('slidechanged', function(event) {
        // Check if we're on a slide with our demos
        const currentSlide = event.currentSlide;
        
        if (currentSlide.querySelector('#padding-calculator')) {
            initPaddingCalculator();
        }
        if (currentSlide.querySelector('#combined-calculator')) {
            initCombinedCalculator();
        }
        if (currentSlide.querySelector('#padding-stride-lab')) {
            initLabCalculator();
        }
    });
    
    // Also initialize on load in case we're already on the right slide
    initPaddingCalculator();
    initCombinedCalculator();
    initLabCalculator();
});