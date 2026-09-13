// Edge Detection Interactive Demo
(function() {
    'use strict';

    // Initialize when Reveal is ready
    if (typeof Reveal !== 'undefined') {
        Reveal.on('ready', init);
        Reveal.on('slidechanged', event => {
            if (event.currentSlide.querySelector('#edge-detection-interactive')) {
                init();
            }
        });
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

    function init() {
        const demo = document.getElementById('edge-detection-interactive');
        if (!demo) return;

        // Test patterns
        const patterns = {
            vertical: {
                data: [
                    [1, 1, 0, 0, 0, 0, 1, 1],
                    [1, 1, 0, 0, 0, 0, 1, 1],
                    [1, 1, 0, 0, 0, 0, 1, 1],
                    [1, 1, 0, 0, 0, 0, 1, 1],
                    [1, 1, 0, 0, 0, 0, 1, 1],
                    [1, 1, 0, 0, 0, 0, 1, 1]
                ],
                kernel: [[1, -1]],
                description: "Vertical edges: transitions from light to dark"
            },
            horizontal: {
                data: [
                    [1, 1, 1, 1, 1, 1, 1, 1],
                    [1, 1, 1, 1, 1, 1, 1, 1],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 1, 1, 1, 1, 1, 1, 1],
                    [1, 1, 1, 1, 1, 1, 1, 1]
                ],
                kernel: [[1], [-1]],
                description: "Horizontal edges: transitions from top to bottom"
            },
            custom: {
                data: [
                    [1, 0, 1, 0, 1, 0, 1, 0],
                    [0, 1, 0, 1, 0, 1, 0, 1],
                    [1, 0, 1, 0, 1, 0, 1, 0],
                    [0, 1, 0, 1, 0, 1, 0, 1],
                    [1, 0, 1, 0, 1, 0, 1, 0],
                    [0, 1, 0, 1, 0, 1, 0, 1]
                ],
                kernel: [[1, -1]],
                description: "Checkerboard pattern: many transitions"
            }
        };

        let currentPattern = 'vertical';

        // Draw image on canvas
        function drawImage(canvas, data) {
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const cellSize = Math.min(
                canvas.width / data[0].length,
                canvas.height / data.length
            );
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            data.forEach((row, i) => {
                row.forEach((val, j) => {
                    const intensity = Math.floor(val * 255);
                    ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
                    ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                    
                    // Add grid lines
                    ctx.strokeStyle = '#ccc';
                    ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
                });
            });
        }

        // Display kernel
        function displayKernel(kernel) {
            const display = document.getElementById('edge-kernel-display');
            if (!display) return;
            
            let html = '<table style="margin: 0 auto; border-collapse: collapse;">';
            kernel.forEach(row => {
                html += '<tr>';
                row.forEach(val => {
                    const color = val > 0 ? '#10099F' : (val < 0 ? '#FC8484' : '#ccc');
                    html += `<td style="border: 2px solid ${color}; padding: 15px; 
                             width: 40px; text-align: center; font-weight: bold;
                             background-color: ${color}20;">
                             ${val > 0 ? '+' : ''}${val}
                         </td>`;
                });
                html += '</tr>';
            });
            html += '</table>';
            
            display.innerHTML = html;
        }

        // Perform convolution
        function convolve(input, kernel) {
            const kh = kernel.length;
            const kw = kernel[0].length;
            const oh = input.length - kh + 1;
            const ow = input[0].length - kw + 1;
            const output = [];
            
            for (let i = 0; i < oh; i++) {
                output[i] = [];
                for (let j = 0; j < ow; j++) {
                    let sum = 0;
                    for (let ki = 0; ki < kh; ki++) {
                        for (let kj = 0; kj < kw; kj++) {
                            sum += input[i + ki][j + kj] * kernel[ki][kj];
                        }
                    }
                    output[i][j] = sum;
                }
            }
            
            return output;
        }

        // Draw output with color coding
        function drawOutput(canvas, data) {
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const cellSize = Math.min(
                canvas.width / data[0].length,
                canvas.height / data.length
            );
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Find min and max for normalization
            let min = Infinity, max = -Infinity;
            data.forEach(row => {
                row.forEach(val => {
                    min = Math.min(min, val);
                    max = Math.max(max, val);
                });
            });
            
            data.forEach((row, i) => {
                row.forEach((val, j) => {
                    // Color code: blue for positive, red for negative, gray for zero
                    if (Math.abs(val) < 0.01) {
                        ctx.fillStyle = '#888';
                    } else if (val > 0) {
                        const intensity = (val / max) * 255;
                        ctx.fillStyle = `rgba(16, 9, 159, ${intensity / 255})`;
                    } else {
                        const intensity = (Math.abs(val) / Math.abs(min)) * 255;
                        ctx.fillStyle = `rgba(252, 132, 132, ${intensity / 255})`;
                    }
                    
                    ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                    
                    // Add value text
                    ctx.fillStyle = Math.abs(val) > 0.5 ? 'white' : 'black';
                    ctx.font = '12px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(val.toFixed(0), 
                        j * cellSize + cellSize / 2, 
                        i * cellSize + cellSize / 2);
                    
                    // Add grid
                    ctx.strokeStyle = '#ccc';
                    ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
                });
            });
        }

        // Apply pattern
        function applyPattern(type) {
            currentPattern = type;
            const pattern = patterns[type];
            
            // Draw input
            const inputCanvas = document.getElementById('edge-input-canvas');
            drawImage(inputCanvas, pattern.data);
            
            // Display kernel
            displayKernel(pattern.kernel);
            
            // Compute and draw output
            const output = convolve(pattern.data, pattern.kernel);
            const outputCanvas = document.getElementById('edge-output-canvas');
            drawOutput(outputCanvas, output);
            
            // Update explanation
            const explanation = document.getElementById('edge-explanation');
            if (explanation) {
                explanation.innerHTML = `<strong>${pattern.description}</strong><br>
                    Blue = positive edge (white→black), Red = negative edge (black→white), Gray = no edge`;
            }
        }

        // Set up event listeners
        document.getElementById('apply-horizontal')?.addEventListener('click', 
            () => applyPattern('horizontal'));
        document.getElementById('apply-vertical')?.addEventListener('click', 
            () => applyPattern('vertical'));
        document.getElementById('apply-custom')?.addEventListener('click', 
            () => applyPattern('custom'));
        document.getElementById('reset-edge')?.addEventListener('click', 
            () => applyPattern('vertical'));

        // Initial display
        applyPattern('vertical');
    }
})();