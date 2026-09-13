// Stride animation and visualization

document.addEventListener('DOMContentLoaded', function() {
    
    // Stride Demo Animation
    function initStrideDemo() {
        const hStrideSlider = document.getElementById('h-stride');
        const vStrideSlider = document.getElementById('v-stride');
        const animateBtn = document.getElementById('animate-stride');
        const resetBtn = document.getElementById('reset-stride');
        const vizContainer = document.getElementById('stride-viz-container');
        
        if (!hStrideSlider || !vizContainer) return;
        
        let animationId = null;
        let currentPosition = { x: 0, y: 0 };
        
        const inputSize = 8;
        const kernelSize = 3;
        const cellSize = 40;
        
        function createStrideVisualization() {
            const hStride = parseInt(hStrideSlider.value);
            const vStride = parseInt(vStrideSlider.value);
            
            document.getElementById('h-stride-value').textContent = hStride;
            document.getElementById('v-stride-value').textContent = vStride;
            
            const outputH = Math.floor((inputSize - kernelSize + 1) / vStride);
            const outputW = Math.floor((inputSize - kernelSize + 1) / hStride);
            
            const svg = `
                <div style="display: flex; justify-content: space-around; align-items: flex-start;">
                    <div>
                        <h5 style="text-align: center; color: #10099F;">Input (${inputSize}×${inputSize})</h5>
                        <svg id="stride-input-grid" width="${inputSize * cellSize + 20}" height="${inputSize * cellSize + 20}">
                            ${drawInputGrid()}
                            ${drawKernel(currentPosition.x, currentPosition.y, hStride, vStride)}
                        </svg>
                    </div>
                    <div style="display: flex; align-items: center; font-size: 24px; margin: 0 20px;">→</div>
                    <div>
                        <h5 style="text-align: center; color: #10099F;">Output (${outputH}×${outputW})</h5>
                        <svg id="stride-output-grid" width="${outputW * cellSize + 20}" height="${outputH * cellSize + 20}">
                            ${drawOutputGrid(outputH, outputW)}
                            ${drawOutputHighlight(currentPosition.x / hStride, currentPosition.y / vStride, outputH, outputW)}
                        </svg>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <p><strong>Kernel Position:</strong> (${currentPosition.x}, ${currentPosition.y})</p>
                    <p><strong>Output Position:</strong> (${Math.floor(currentPosition.x / hStride)}, ${Math.floor(currentPosition.y / vStride)})</p>
                </div>
            `;
            
            vizContainer.innerHTML = svg;
        }
        
        function drawInputGrid() {
            let svg = '';
            for (let i = 0; i < inputSize; i++) {
                for (let j = 0; j < inputSize; j++) {
                    const x = j * cellSize + 10;
                    const y = i * cellSize + 10;
                    svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" 
                            fill="white" stroke="#ddd" stroke-width="1"/>`;
                    // Add coordinates
                    svg += `<text x="${x + cellSize/2}" y="${y + cellSize/2}" 
                            text-anchor="middle" dominant-baseline="middle" 
                            font-size="10" fill="#999">${i},${j}</text>`;
                }
            }
            return svg;
        }
        
        function drawKernel(posX, posY, hStride, vStride) {
            if (posX + kernelSize > inputSize || posY + kernelSize > inputSize) {
                return '';
            }
            
            const x = posX * cellSize + 10;
            const y = posY * cellSize + 10;
            const size = kernelSize * cellSize;
            
            // Draw kernel boundary
            let svg = `<rect x="${x}" y="${y}" width="${size}" height="${size}" 
                        fill="rgba(16, 9, 159, 0.2)" stroke="#10099F" stroke-width="3" rx="5"/>`;
            
            // Draw stride indicators
            if (posX + hStride < inputSize - kernelSize + 1) {
                // Horizontal stride arrow
                const nextX = (posX + hStride) * cellSize + 10;
                svg += `<path d="M ${x + size} ${y + size/2} L ${nextX} ${y + size/2}" 
                        stroke="#FFA05F" stroke-width="2" stroke-dasharray="5,5" 
                        marker-end="url(#stride-arrow)"/>`;
            }
            
            if (posY + vStride < inputSize - kernelSize + 1) {
                // Vertical stride arrow
                const nextY = (posY + vStride) * cellSize + 10;
                svg += `<path d="M ${x + size/2} ${y + size} L ${x + size/2} ${nextY}" 
                        stroke="#FFA05F" stroke-width="2" stroke-dasharray="5,5" 
                        marker-end="url(#stride-arrow)"/>`;
            }
            
            // Arrow marker definition
            svg += `
                <defs>
                    <marker id="stride-arrow" markerWidth="10" markerHeight="10" 
                            refX="5" refY="5" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#FFA05F"/>
                    </marker>
                </defs>
            `;
            
            return svg;
        }
        
        function drawOutputGrid(height, width) {
            let svg = '';
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    const x = j * cellSize + 10;
                    const y = i * cellSize + 10;
                    svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" 
                            fill="#e8f5e9" stroke="#4caf50" stroke-width="1"/>`;
                    svg += `<text x="${x + cellSize/2}" y="${y + cellSize/2}" 
                            text-anchor="middle" dominant-baseline="middle" 
                            font-size="10" fill="#2e7d32">${i},${j}</text>`;
                }
            }
            return svg;
        }
        
        function drawOutputHighlight(outX, outY, height, width) {
            if (outX >= width || outY >= height || outX < 0 || outY < 0) {
                return '';
            }
            
            const x = Math.floor(outX) * cellSize + 10;
            const y = Math.floor(outY) * cellSize + 10;
            
            return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" 
                    fill="rgba(255, 160, 95, 0.5)" stroke="#FFA05F" stroke-width="3" rx="3"/>`;
        }
        
        function animate() {
            const hStride = parseInt(hStrideSlider.value);
            const vStride = parseInt(vStrideSlider.value);
            
            // Move kernel
            currentPosition.x += hStride;
            if (currentPosition.x + kernelSize > inputSize) {
                currentPosition.x = 0;
                currentPosition.y += vStride;
                if (currentPosition.y + kernelSize > inputSize) {
                    currentPosition.y = 0;
                }
            }
            
            createStrideVisualization();
            
            animationId = setTimeout(() => {
                if (animationId) animate();
            }, 1000);
        }
        
        animateBtn.addEventListener('click', function() {
            if (animationId) {
                clearTimeout(animationId);
                animationId = null;
                animateBtn.textContent = 'Animate';
            } else {
                animateBtn.textContent = 'Stop';
                animate();
            }
        });
        
        resetBtn.addEventListener('click', function() {
            if (animationId) {
                clearTimeout(animationId);
                animationId = null;
                animateBtn.textContent = 'Animate';
            }
            currentPosition = { x: 0, y: 0 };
            createStrideVisualization();
        });
        
        hStrideSlider.addEventListener('input', () => {
            currentPosition = { x: 0, y: 0 };
            createStrideVisualization();
        });
        
        vStrideSlider.addEventListener('input', () => {
            currentPosition = { x: 0, y: 0 };
            createStrideVisualization();
        });
        
        // Initial render
        createStrideVisualization();
    }
    
    // Initialize when slide is shown
    Reveal.addEventListener('slidechanged', function(event) {
        const currentSlide = event.currentSlide;
        if (currentSlide.querySelector('#stride-demo')) {
            initStrideDemo();
        }
    });
    
    // Also try to initialize on load
    if (document.getElementById('stride-demo')) {
        initStrideDemo();
    }
});