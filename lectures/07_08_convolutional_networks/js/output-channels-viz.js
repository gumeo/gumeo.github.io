// Output Channels Visualization
// Shows how multiple output channels are generated with different kernels

(function() {
    'use strict';

    function initOutputChannelsViz() {
        const container = document.getElementById('output-channels-demo');
        if (!container) return;

        const svg = d3.select('#output-channels-svg');
        const width = 800;
        const height = 350;
        
        // Configuration
        let numOutputChannels = 2;
        let kernelType = 'edge';
        const inputChannels = 3; // RGB
        const imageSize = 5;
        const cellSize = 16;
        
        // Clear previous content
        svg.selectAll('*').remove();

        // Generate sample RGB image data
        function generateImageData() {
            const data = [];
            for (let c = 0; c < inputChannels; c++) {
                const channel = [];
                for (let i = 0; i < imageSize; i++) {
                    const row = [];
                    for (let j = 0; j < imageSize; j++) {
                        // Create a pattern for demonstration
                        if (c === 0) { // Red channel
                            row.push(Math.floor((i + j) * 255 / (imageSize * 2)));
                        } else if (c === 1) { // Green channel
                            row.push(Math.floor(Math.abs(i - j) * 255 / imageSize));
                        } else { // Blue channel
                            row.push(Math.floor((i * j) * 255 / (imageSize * imageSize)));
                        }
                    }
                    channel.push(row);
                }
                data.push(channel);
            }
            return data;
        }

        // Generate kernels based on type
        function generateKernels(type, numOutputs) {
            const kernels = [];
            
            for (let o = 0; o < numOutputs; o++) {
                const outputKernel = [];
                for (let c = 0; c < inputChannels; c++) {
                    let kernel;
                    
                    switch(type) {
                        case 'edge':
                            // Different edge detection kernels for each output
                            if (o === 0) {
                                kernel = [[-1, -1, -1], [0, 0, 0], [1, 1, 1]]; // Horizontal
                            } else if (o === 1) {
                                kernel = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]; // Vertical
                            } else if (o === 2) {
                                kernel = [[-1, -1, 0], [-1, 0, 1], [0, 1, 1]]; // Diagonal
                            } else {
                                kernel = [[0, -1, 0], [-1, 4, -1], [0, -1, 0]]; // Laplacian
                            }
                            break;
                        
                        case 'blur':
                            // Gaussian blur kernels with different sigmas
                            const sigma = 1 + o * 0.5;
                            kernel = [[1, 2, 1], [2, 4, 2], [1, 2, 1]];
                            const sum = 16;
                            kernel = kernel.map(row => row.map(val => val / sum));
                            break;
                        
                        case 'sharpen':
                            // Different sharpening intensities
                            const intensity = 1 + o * 0.5;
                            kernel = [[0, -intensity, 0], 
                                     [-intensity, 1 + 4*intensity, -intensity], 
                                     [0, -intensity, 0]];
                            break;
                        
                        case 'random':
                        default:
                            // Random kernels
                            kernel = [];
                            for (let i = 0; i < 3; i++) {
                                const row = [];
                                for (let j = 0; j < 3; j++) {
                                    row.push((Math.random() - 0.5) * 2);
                                }
                                kernel.push(row);
                            }
                            break;
                    }
                    
                    outputKernel.push(kernel);
                }
                kernels.push(outputKernel);
            }
            
            return kernels;
        }

        // Apply convolution
        function applyConvolution(input, kernels) {
            const outputs = [];
            const kernelSize = 3;
            const outputSize = imageSize - kernelSize + 1;
            
            for (let o = 0; o < kernels.length; o++) {
                const output = [];
                for (let i = 0; i < outputSize; i++) {
                    const row = [];
                    for (let j = 0; j < outputSize; j++) {
                        let sum = 0;
                        
                        // Sum across all input channels
                        for (let c = 0; c < inputChannels; c++) {
                            // Apply kernel
                            for (let ki = 0; ki < kernelSize; ki++) {
                                for (let kj = 0; kj < kernelSize; kj++) {
                                    sum += input[c][i + ki][j + kj] * kernels[o][c][ki][kj];
                                }
                            }
                        }
                        
                        // Normalize to 0-255 range
                        sum = Math.max(0, Math.min(255, Math.floor(sum)));
                        row.push(sum);
                    }
                    output.push(row);
                }
                outputs.push(output);
            }
            
            return outputs;
        }

        // Draw feature map
        function drawFeatureMap(group, data, title, x, y) {
            const g = group.append('g')
                .attr('transform', `translate(${x}, ${y})`);
            
            // Title
            g.append('text')
                .attr('x', data[0].length * cellSize / 2)
                .attr('y', -10)
                .attr('text-anchor', 'middle')
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .text(title);
            
            // Draw cells
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[0].length; j++) {
                    const value = data[i][j];
                    const normalizedValue = value / 255;
                    
                    g.append('rect')
                        .attr('x', j * cellSize)
                        .attr('y', i * cellSize)
                        .attr('width', cellSize - 1)
                        .attr('height', cellSize - 1)
                        .attr('fill', d3.interpolateViridis(normalizedValue))
                        .attr('stroke', '#333')
                        .attr('stroke-width', 0.5);
                    
                    // Add value text for small grids
                    if (data.length <= 5) {
                        g.append('text')
                            .attr('x', j * cellSize + cellSize / 2)
                            .attr('y', i * cellSize + cellSize / 2)
                            .attr('text-anchor', 'middle')
                            .attr('dominant-baseline', 'middle')
                            .style('font-size', '9px')
                            .style('fill', normalizedValue > 0.5 ? 'white' : 'black')
                            .text(Math.floor(value));
                    }
                }
            }
        }

        // Main visualization function
        function visualize() {
            svg.selectAll('*').remove();
            
            const inputData = generateImageData();
            const kernels = generateKernels(kernelType, numOutputChannels);
            const outputData = applyConvolution(inputData, kernels);
            
            // Draw input channels
            const inputGroup = svg.append('g');
            const channelNames = ['Red', 'Green', 'Blue'];
            
            for (let c = 0; c < inputChannels; c++) {
                drawFeatureMap(inputGroup, inputData[c], channelNames[c],
                              50, 40 + c * (imageSize * cellSize + 25));
            }
            
            // Draw arrow
            svg.append('path')
                .attr('d', 'M 200 150 L 250 150')
                .attr('stroke', '#666')
                .attr('stroke-width', 2)
                .attr('marker-end', 'url(#arrowhead)');
            
            // Define arrowhead marker
            svg.append('defs').append('marker')
                .attr('id', 'arrowhead')
                .attr('viewBox', '0 0 10 10')
                .attr('refX', 8)
                .attr('refY', 5)
                .attr('markerWidth', 6)
                .attr('markerHeight', 6)
                .attr('orient', 'auto')
                .append('path')
                .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
                .attr('fill', '#666');
            
            // Draw kernel indicator
            const kernelGroup = svg.append('g')
                .attr('transform', 'translate(260, 100)');
            
            kernelGroup.append('rect')
                .attr('width', 80)
                .attr('height', 100)
                .attr('fill', '#f0f0f0')
                .attr('stroke', '#999')
                .attr('rx', 5);
            
            kernelGroup.append('text')
                .attr('x', 40)
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .text('Kernels');
            
            kernelGroup.append('text')
                .attr('x', 40)
                .attr('y', 40)
                .attr('text-anchor', 'middle')
                .style('font-size', '10px')
                .text(`Type: ${kernelType}`);
            
            kernelGroup.append('text')
                .attr('x', 40)
                .attr('y', 60)
                .attr('text-anchor', 'middle')
                .style('font-size', '10px')
                .text(`${numOutputChannels}×${inputChannels}×3×3`);
            
            // Draw arrow to output
            svg.append('path')
                .attr('d', 'M 350 150 L 400 150')
                .attr('stroke', '#666')
                .attr('stroke-width', 2)
                .attr('marker-end', 'url(#arrowhead)');
            
            // Draw output feature maps
            const outputGroup = svg.append('g');
            const outputSize = imageSize - 2; // 3x3 kernel reduces size by 2
            
            for (let o = 0; o < numOutputChannels; o++) {
                const yPos = 40 + o * (outputSize * cellSize + 25);
                drawFeatureMap(outputGroup, outputData[o], `Output ${o + 1}`, 420, yPos);
            }
            
            // Add legend
            const legendGroup = svg.append('g')
                .attr('transform', 'translate(600, 50)');
            
            legendGroup.append('text')
                .attr('x', 0)
                .attr('y', 0)
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .text('Feature Maps');
            
            legendGroup.append('text')
                .attr('x', 0)
                .attr('y', 20)
                .style('font-size', '10px')
                .text(`Input: ${inputChannels} channels`);
            
            legendGroup.append('text')
                .attr('x', 0)
                .attr('y', 35)
                .style('font-size', '10px')
                .text(`Output: ${numOutputChannels} channels`);
        }

        // Initial visualization
        visualize();

        // Event listeners
        const outputSlider = document.getElementById('output-channels-slider');
        const outputValue = document.getElementById('output-channels-value');
        const kernelSelect = document.getElementById('kernel-type');
        const generateBtn = document.getElementById('generate-outputs');

        if (outputSlider) {
            outputSlider.addEventListener('input', function() {
                numOutputChannels = parseInt(this.value);
                outputValue.textContent = numOutputChannels;
            });
        }

        if (kernelSelect) {
            kernelSelect.addEventListener('change', function() {
                kernelType = this.value;
            });
        }

        if (generateBtn) {
            generateBtn.addEventListener('click', visualize);
        }
    }

    // Initialize when Reveal is ready
    if (typeof Reveal !== 'undefined') {
        Reveal.on('ready', initOutputChannelsViz);
        Reveal.on('slidechanged', function(event) {
            if (event.currentSlide.querySelector('#output-channels-demo')) {
                initOutputChannelsViz();
            }
        });
    } else {
        document.addEventListener('DOMContentLoaded', initOutputChannelsViz);
    }
})();