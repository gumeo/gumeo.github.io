// AlexNet Visualizations for Modern CNNs Slides

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all AlexNet visualizations
    initializeLeNetAlexNetComparison();
    initializeAlexNetArchitecture();
    initializeActivationComparison();
    initializeDropoutDemo();
    initializeAugmentationDemo();
    initializeArchitectureFlow();
    initializeComputationComparison();
    initializeTrainingCurves();
    initializeFeatureHierarchy();
    initializeMemoryBreakdown();
    initializeFlopBreakdown();
    initializeBottleneckAnalysis();
});

// LeNet vs AlexNet Comparison Visualization
function initializeLeNetAlexNetComparison() {
    const container = document.getElementById('lenet-alexnet-comparison');
    if (!container) return;

    const width = 800;
    const height = 150;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // LeNet Architecture (left side)
    const lenetG = svg.append('g')
        .attr('transform', 'translate(50, 50)');

    lenetG.append('text')
        .attr('x', 50)
        .attr('y', -20)
        .text('LeNet-5 (1998)')
        .style('font-weight', 'bold')
        .style('fill', '#10099F');

    // LeNet layers
    const lenetLayers = [
        {x: 0, width: 30, height: 30, label: '32×32'},
        {x: 50, width: 40, height: 40, label: 'C1'},
        {x: 100, width: 35, height: 35, label: 'P1'},
        {x: 145, width: 45, height: 45, label: 'C2'},
        {x: 200, width: 30, height: 30, label: 'P2'},
        {x: 240, width: 50, height: 20, label: 'FC'},
        {x: 300, width: 20, height: 10, label: '10'}
    ];

    lenetLayers.forEach((layer, i) => {
        lenetG.append('rect')
            .attr('x', layer.x)
            .attr('y', 50 - layer.height/2)
            .attr('width', layer.width)
            .attr('height', layer.height)
            .attr('fill', i % 2 === 0 ? '#2DD2C0' : '#10099F')
            .attr('opacity', 0.7);

        lenetG.append('text')
            .attr('x', layer.x + layer.width/2)
            .attr('y', 90)
            .text(layer.label)
            .style('font-size', '10px')
            .style('text-anchor', 'middle');
    });

    // AlexNet Architecture (right side)
    const alexnetG = svg.append('g')
        .attr('transform', 'translate(400, 50)');

    alexnetG.append('text')
        .attr('x', 50)
        .attr('y', -20)
        .text('AlexNet (2012)')
        .style('font-weight', 'bold')
        .style('fill', '#10099F');

    // AlexNet layers
    const alexnetLayers = [
        {x: 0, width: 40, height: 60, label: '224×224'},
        {x: 50, width: 35, height: 55, label: 'C1'},
        {x: 90, width: 30, height: 45, label: 'P1'},
        {x: 125, width: 35, height: 50, label: 'C2'},
        {x: 165, width: 25, height: 40, label: 'P2'},
        {x: 195, width: 30, height: 45, label: 'C3-5'},
        {x: 230, width: 20, height: 35, label: 'P3'},
        {x: 255, width: 45, height: 25, label: 'FC6-7'},
        {x: 305, width: 25, height: 15, label: '1000'}
    ];

    alexnetLayers.forEach((layer, i) => {
        alexnetG.append('rect')
            .attr('x', layer.x)
            .attr('y', 50 - layer.height/2)
            .attr('width', layer.width)
            .attr('height', layer.height)
            .attr('fill', i % 2 === 0 ? '#FC8484' : '#10099F')
            .attr('opacity', 0.7);

        alexnetG.append('text')
            .attr('x', layer.x + layer.width/2)
            .attr('y', 90)
            .text(layer.label)
            .style('font-size', '10px')
            .style('text-anchor', 'middle');
    });
}

// AlexNet Architecture Detailed Visualization
function initializeAlexNetArchitecture() {
    const container = document.getElementById('alexnet-architecture-viz');
    if (!container) return;

    const width = 900;
    const height = 200;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Architecture layers with details
    const layers = [
        {name: 'Input', x: 50, width: 60, height: 120, channels: 3, size: '224×224', color: '#FAC55B'},
        {name: 'Conv1', x: 130, width: 55, height: 110, channels: 96, size: '55×55', kernel: '11×11', color: '#FC8484'},
        {name: 'Pool1', x: 200, width: 45, height: 90, channels: 96, size: '27×27', color: '#FFA05F'},
        {name: 'Conv2', x: 260, width: 50, height: 95, channels: 256, size: '27×27', kernel: '5×5', color: '#FC8484'},
        {name: 'Pool2', x: 325, width: 40, height: 75, channels: 256, size: '13×13', color: '#FFA05F'},
        {name: 'Conv3', x: 380, width: 45, height: 80, channels: 384, size: '13×13', kernel: '3×3', color: '#FC8484'},
        {name: 'Conv4', x: 440, width: 45, height: 80, channels: 384, size: '13×13', kernel: '3×3', color: '#FC8484'},
        {name: 'Conv5', x: 500, width: 40, height: 70, channels: 256, size: '13×13', kernel: '3×3', color: '#FC8484'},
        {name: 'Pool3', x: 555, width: 35, height: 55, channels: 256, size: '6×6', color: '#FFA05F'},
        {name: 'FC6', x: 605, width: 70, height: 40, channels: 4096, color: '#2DD2C0'},
        {name: 'FC7', x: 690, width: 70, height: 40, channels: 4096, color: '#2DD2C0'},
        {name: 'FC8', x: 775, width: 50, height: 30, channels: 1000, color: '#10099F'}
    ];

    // Draw layers
    layers.forEach((layer, i) => {
        const g = svg.append('g');

        // Layer rectangle
        g.append('rect')
            .attr('x', layer.x)
            .attr('y', 100 - layer.height/2)
            .attr('width', layer.width)
            .attr('height', layer.height)
            .attr('fill', layer.color)
            .attr('opacity', 0.7)
            .attr('stroke', '#333')
            .attr('stroke-width', 1);

        // Layer name
        g.append('text')
            .attr('x', layer.x + layer.width/2)
            .attr('y', 100 - layer.height/2 - 10)
            .text(layer.name)
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('text-anchor', 'middle');

        // Layer details
        if (layer.channels) {
            g.append('text')
                .attr('x', layer.x + layer.width/2)
                .attr('y', 100)
                .text(layer.channels + ' ch')
                .style('font-size', '10px')
                .style('text-anchor', 'middle')
                .style('fill', 'white');
        }

        if (layer.size) {
            g.append('text')
                .attr('x', layer.x + layer.width/2)
                .attr('y', 100 + layer.height/2 + 15)
                .text(layer.size)
                .style('font-size', '10px')
                .style('text-anchor', 'middle');
        }

        if (layer.kernel) {
            g.append('text')
                .attr('x', layer.x + layer.width/2)
                .attr('y', 100 + layer.height/2 + 28)
                .text('k=' + layer.kernel)
                .style('font-size', '9px')
                .style('text-anchor', 'middle')
                .style('fill', '#666');
        }

        // Draw connections
        if (i > 0) {
            const prevLayer = layers[i-1];
            svg.append('line')
                .attr('x1', prevLayer.x + prevLayer.width)
                .attr('y1', 100)
                .attr('x2', layer.x)
                .attr('y2', 100)
                .attr('stroke', '#999')
                .attr('stroke-width', 2)
                .attr('marker-end', 'url(#arrowhead)');
        }
    });

    // Add arrow marker
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#999');
}

// Activation Function Comparison
function initializeActivationComparison() {
    const container = document.getElementById('activation-viz');
    if (!container) return;

    const width = 700;
    const height = 350;
    const margin = {top: 20, right: 20, bottom: 50, left: 50};

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([-6, 6])
        .range([0, width - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([-1.5, 6])
        .range([height - margin.top - margin.bottom, 0]);

    // Add axes
    g.append('g')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    g.append('g')
        .call(d3.axisLeft(yScale));

    // Generate data points
    const x = d3.range(-6, 6.1, 0.1);

    const sigmoid = x.map(d => ({x: d, y: 1 / (1 + Math.exp(-d))}));
    const tanh = x.map(d => ({x: d, y: Math.tanh(d)}));
    const relu = x.map(d => ({x: d, y: Math.max(0, d)}));

    const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));

    // Draw functions
    const functions = [
        {data: sigmoid, color: '#FC8484', name: 'Sigmoid'},
        {data: tanh, color: '#FFA05F', name: 'Tanh'},
        {data: relu, color: '#10099F', name: 'ReLU'}
    ];

    let currentFunction = 'relu';

    functions.forEach(func => {
        g.append('path')
            .datum(func.data)
            .attr('class', `activation-line ${func.name.toLowerCase()}`)
            .attr('fill', 'none')
            .attr('stroke', func.color)
            .attr('stroke-width', func.name.toLowerCase() === currentFunction ? 3 : 1)
            .attr('opacity', func.name.toLowerCase() === currentFunction ? 1 : 0.3)
            .attr('d', line);
    });

    // Add legend
    const legend = g.append('g')
        .attr('transform', `translate(${width - margin.left - margin.right - 100}, 20)`);

    functions.forEach((func, i) => {
        const item = legend.append('g')
            .attr('transform', `translate(0, ${i * 25})`);

        item.append('line')
            .attr('x1', 0)
            .attr('x2', 20)
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke', func.color)
            .attr('stroke-width', 2);

        item.append('text')
            .attr('x', 25)
            .attr('y', 4)
            .text(func.name)
            .style('font-size', '12px');
    });

    // Handle button clicks
    document.querySelectorAll('.activation-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentFunction = this.dataset.activation;

            // Update button styles
            document.querySelectorAll('.activation-btn').forEach(b => {
                b.style.background = 'white';
                b.style.color = '#10099F';
            });
            this.style.background = '#10099F';
            this.style.color = 'white';

            // Update line styles
            g.selectAll('.activation-line')
                .attr('stroke-width', function() {
                    return d3.select(this).classed(currentFunction) ? 3 : 1;
                })
                .attr('opacity', function() {
                    return d3.select(this).classed(currentFunction) ? 1 : 0.3;
                });
        });
    });
}

// Dropout Demonstration
function initializeDropoutDemo() {
    const container = document.getElementById('dropout-viz');
    if (!container) return;

    const width = 600;
    const height = 300;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create a simple neural network
    const layers = [
        {neurons: 4, x: 100},
        {neurons: 6, x: 250},
        {neurons: 6, x: 400},
        {neurons: 3, x: 550}
    ];

    const neurons = [];
    const connections = [];

    // Create neurons
    layers.forEach((layer, layerIdx) => {
        for (let i = 0; i < layer.neurons; i++) {
            const y = (height / (layer.neurons + 1)) * (i + 1);
            neurons.push({
                x: layer.x,
                y: y,
                layer: layerIdx,
                index: i,
                active: true
            });
        }
    });

    // Create connections
    for (let l = 0; l < layers.length - 1; l++) {
        const currentLayer = neurons.filter(n => n.layer === l);
        const nextLayer = neurons.filter(n => n.layer === l + 1);

        currentLayer.forEach(n1 => {
            nextLayer.forEach(n2 => {
                connections.push({
                    source: n1,
                    target: n2,
                    active: true
                });
            });
        });
    }

    // Draw connections
    const lines = svg.selectAll('.connection')
        .data(connections)
        .enter().append('line')
        .attr('class', 'connection')
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)
        .attr('stroke', '#999')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);

    // Draw neurons
    const circles = svg.selectAll('.neuron')
        .data(neurons)
        .enter().append('circle')
        .attr('class', 'neuron')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 12)
        .attr('fill', '#10099F')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

    // Dropout controls
    const dropoutSlider = document.getElementById('dropout-rate');
    const dropoutValue = document.getElementById('dropout-value');
    const applyDropoutBtn = document.getElementById('apply-dropout');
    const resetBtn = document.getElementById('reset-network');

    if (dropoutSlider) {
        dropoutSlider.addEventListener('input', function() {
            dropoutValue.textContent = (this.value / 100).toFixed(2);
        });
    }

    if (applyDropoutBtn) {
        applyDropoutBtn.addEventListener('click', function() {
            const dropoutRate = dropoutSlider.value / 100;

            // Apply dropout to middle layers only
            neurons.forEach(n => {
                if (n.layer === 1 || n.layer === 2) {
                    n.active = Math.random() > dropoutRate;
                } else {
                    n.active = true;
                }
            });

            // Update connections
            connections.forEach(c => {
                c.active = c.source.active && c.target.active;
            });

            // Update visualization
            circles
                .attr('fill', d => d.active ? '#10099F' : '#ccc')
                .attr('opacity', d => d.active ? 1 : 0.3);

            lines
                .attr('opacity', d => d.active ? 0.5 : 0.1);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            neurons.forEach(n => n.active = true);
            connections.forEach(c => c.active = true);

            circles
                .attr('fill', '#10099F')
                .attr('opacity', 1);

            lines
                .attr('opacity', 0.5);
        });
    }
}

// Data Augmentation Demo
function initializeAugmentationDemo() {
    const container = document.getElementById('augmentation-viz');
    if (!container) return;

    // Create a canvas for image manipulation
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    canvas.style.border = '1px solid #ccc';
    canvas.style.borderRadius = '5px';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Draw a simple sample image
    function drawSampleImage() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Simple cat face
        ctx.fillStyle = '#FFA05F';
        ctx.beginPath();
        ctx.arc(112, 112, 60, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(90, 100, 8, 0, Math.PI * 2);
        ctx.arc(134, 100, 8, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#FC8484';
        ctx.beginPath();
        ctx.moveTo(112, 115);
        ctx.lineTo(105, 125);
        ctx.lineTo(119, 125);
        ctx.closePath();
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(100, 125, 12, 0, Math.PI);
        ctx.arc(124, 125, 12, 0, Math.PI);
        ctx.stroke();

        // Ears
        ctx.fillStyle = '#FFA05F';
        ctx.beginPath();
        ctx.moveTo(70, 70);
        ctx.lineTo(60, 50);
        ctx.lineTo(85, 60);
        ctx.closePath();
        ctx.moveTo(154, 70);
        ctx.lineTo(164, 50);
        ctx.lineTo(139, 60);
        ctx.closePath();
        ctx.fill();
    }

    // Initial draw
    drawSampleImage();

    // Augmentation functions
    const augmentations = {
        original: drawSampleImage,

        flip: function() {
            ctx.save();
            ctx.scale(1, -1);
            ctx.translate(0, -canvas.height);
            drawSampleImage();
            ctx.restore();
        },

        crop: function() {
            drawSampleImage();
            const cropSize = 180;
            const x = Math.random() * (canvas.width - cropSize);
            const y = Math.random() * (canvas.height - cropSize);
            const imageData = ctx.getImageData(x, y, cropSize, cropSize);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.putImageData(imageData, 0, 0);

            // Scale up
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = cropSize;
            tempCanvas.height = cropSize;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(imageData, 0, 0);

            ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
        },

        color: function() {
            drawSampleImage();
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            const rShift = (Math.random() - 0.5) * 50;
            const gShift = (Math.random() - 0.5) * 50;
            const bShift = (Math.random() - 0.5) * 50;

            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.max(0, Math.min(255, data[i] + rShift));
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + gShift));
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + bShift));
            }

            ctx.putImageData(imageData, 0, 0);
        },

        pca: function() {
            drawSampleImage();
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Simulate PCA color augmentation with principal components
            // These are approximated eigenvectors from ImageNet statistics
            const pc1 = [0.2175, -0.0188, 0.0045];
            const pc2 = [-0.0045, -0.0168, -0.2803];
            const pc3 = [0.0330, -0.2196, 0.0297];
            
            // Random coefficients for each principal component
            const alpha1 = (Math.random() - 0.5) * 0.1;
            const alpha2 = (Math.random() - 0.5) * 0.1;
            const alpha3 = (Math.random() - 0.5) * 0.1;

            // Calculate color shifts based on principal components
            const rShift = alpha1 * pc1[0] + alpha2 * pc2[0] + alpha3 * pc3[0];
            const gShift = alpha1 * pc1[1] + alpha2 * pc2[1] + alpha3 * pc3[1];
            const bShift = alpha1 * pc1[2] + alpha2 * pc2[2] + alpha3 * pc3[2];

            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.max(0, Math.min(255, data[i] + rShift * 255));
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + gShift * 255));
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + bShift * 255));
            }

            ctx.putImageData(imageData, 0, 0);
        }
    };

    // Handle button clicks
    document.querySelectorAll('.aug-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const augType = this.dataset.aug;

            // Update button styles
            document.querySelectorAll('.aug-btn').forEach(b => {
                b.style.background = 'white';
                b.style.color = '#10099F';
            });
            this.style.background = '#10099F';
            this.style.color = 'white';

            // Apply augmentation
            if (augmentations[augType]) {
                augmentations[augType]();
            }
        });
    });
}

// Architecture Flow Visualization
function initializeArchitectureFlow() {
    const container = document.getElementById('architecture-flow');
    const infoDiv = document.getElementById('selected-layer-info');
    if (!container) return;

    const width = 850;
    const height = 350;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Layer information
    const layerInfo = {
        'Input': {
            params: 0,
            flops: 0,
            description: 'RGB image input, 224×224×3 = 150,528 values'
        },
        'Conv1': {
            params: '11×11×3×96 = 34,848',
            flops: '105M',
            description: 'First convolution extracts low-level features like edges and colors'
        },
        'Pool1': {
            params: 0,
            flops: '2M',
            description: 'Max pooling reduces spatial dimensions and provides translation invariance'
        },
        'Conv2': {
            params: '5×5×96×256 = 614,400',
            flops: '448M',
            description: 'Second convolution combines features into more complex patterns'
        },
        'Pool2': {
            params: 0,
            flops: '1M',
            description: 'Further spatial reduction'
        },
        'Conv3': {
            params: '3×3×256×384 = 884,736',
            flops: '150M',
            description: 'Deeper features emerge - textures and object parts'
        },
        'Conv4': {
            params: '3×3×384×384 = 1,327,104',
            flops: '224M',
            description: 'Complex feature combinations'
        },
        'Conv5': {
            params: '3×3×384×256 = 884,736',
            flops: '150M',
            description: 'High-level features before classification'
        },
        'Pool3': {
            params: 0,
            flops: '0.5M',
            description: 'Final spatial pooling before fully connected layers'
        },
        'FC6': {
            params: '6400×4096 = 26,214,400',
            flops: '26M',
            description: 'First fully connected layer - learns complex feature combinations'
        },
        'FC7': {
            params: '4096×4096 = 16,777,216',
            flops: '17M',
            description: 'Second fully connected layer - high-level reasoning'
        },
        'FC8': {
            params: '4096×1000 = 4,096,000',
            flops: '4M',
            description: 'Output layer - class probabilities for 1000 ImageNet categories'
        }
    };

    // Interactive layers
    const layers = [
        {name: 'Input', x: 30, y: 175, width: 50, height: 80},
        {name: 'Conv1', x: 100, y: 175, width: 45, height: 75},
        {name: 'Pool1', x: 160, y: 175, width: 35, height: 60},
        {name: 'Conv2', x: 210, y: 175, width: 40, height: 65},
        {name: 'Pool2', x: 265, y: 175, width: 30, height: 50},
        {name: 'Conv3', x: 310, y: 175, width: 35, height: 55},
        {name: 'Conv4', x: 360, y: 175, width: 35, height: 55},
        {name: 'Conv5', x: 410, y: 175, width: 35, height: 50},
        {name: 'Pool3', x: 460, y: 175, width: 25, height: 40},
        {name: 'FC6', x: 500, y: 175, width: 60, height: 30},
        {name: 'FC7', x: 575, y: 175, width: 60, height: 30},
        {name: 'FC8', x: 650, y: 175, width: 40, height: 20}
    ];

    // Draw layers
    layers.forEach((layer, i) => {
        const rect = svg.append('rect')
            .attr('x', layer.x)
            .attr('y', layer.y - layer.height/2)
            .attr('width', layer.width)
            .attr('height', layer.height)
            .attr('fill', layer.name.includes('Conv') ? '#FC8484' :
                         layer.name.includes('Pool') ? '#FFA05F' :
                         layer.name.includes('FC') ? '#2DD2C0' : '#FAC55B')
            .attr('opacity', 0.7)
            .attr('stroke', '#333')
            .attr('stroke-width', 1)
            .style('cursor', 'pointer');

        const text = svg.append('text')
            .attr('x', layer.x + layer.width/2)
            .attr('y', layer.y - layer.height/2 - 5)
            .text(layer.name)
            .style('font-size', '11px')
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold');

        // Click handler
        rect.on('click', function() {
            const info = layerInfo[layer.name];
            if (info && infoDiv) {
                infoDiv.innerHTML = `
                    <h5 style="color: #10099F; margin-bottom: 10px;">${layer.name}</h5>
                    <p style="margin: 5px 0;"><strong>Parameters:</strong> ${info.params || '0'}</p>
                    <p style="margin: 5px 0;"><strong>FLOPs:</strong> ${info.flops || '0'}</p>
                    <p style="margin: 5px 0;">${info.description}</p>
                `;
            }

            // Highlight selected layer
            svg.selectAll('rect').attr('stroke-width', 1);
            d3.select(this).attr('stroke-width', 3);
        });

        // Draw connections
        if (i > 0) {
            const prevLayer = layers[i-1];
            svg.append('line')
                .attr('x1', prevLayer.x + prevLayer.width)
                .attr('y1', prevLayer.y)
                .attr('x2', layer.x)
                .attr('y2', layer.y)
                .attr('stroke', '#999')
                .attr('stroke-width', 1.5)
                .attr('marker-end', 'url(#arrow)');
        }
    });

    // Arrow marker
    svg.append('defs').append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#999');

    // Trace forward button
    const traceBtn = document.getElementById('trace-forward');
    if (traceBtn) {
        traceBtn.addEventListener('click', function() {
            let delay = 0;
            layers.forEach((layer, i) => {
                setTimeout(() => {
                    svg.selectAll('rect').attr('stroke-width', 1);
                    svg.selectAll('rect')
                        .filter(function(d, idx) { return idx === i; })
                        .attr('stroke-width', 3)
                        .attr('stroke', '#10099F');
                }, delay);
                delay += 200;
            });
        });
    }
}

// CPU vs GPU Computation Comparison
function initializeComputationComparison() {
    const container = document.getElementById('computation-viz');
    if (!container) return;

    const width = 700;
    const height = 250;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Initial setup
    let matrixSize = 1000;
    const cpuFlops = 1e12; // 1 TFLOP
    const gpuFlops = 300e12; // 300 TFLOPs

    function updateVisualization(size) {
        svg.selectAll('*').remove();

        const flops = 2 * Math.pow(size, 3);
        const cpuTime = flops / cpuFlops * 1000; // in ms
        const gpuTime = flops / gpuFlops * 1000; // in ms

        // Bar chart
        const barWidth = 150;
        const barMaxHeight = 150;

        // CPU Bar
        const cpuHeight = Math.min(barMaxHeight, cpuTime * 10);
        svg.append('rect')
            .attr('x', 150)
            .attr('y', 200 - cpuHeight)
            .attr('width', barWidth)
            .attr('height', cpuHeight)
            .attr('fill', '#666');

        svg.append('text')
            .attr('x', 225)
            .attr('y', 195 - cpuHeight)
            .text(`${cpuTime.toFixed(2)} ms`)
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('font-size', '12px');

        svg.append('text')
            .attr('x', 225)
            .attr('y', 220)
            .text('CPU (1 TFLOP)')
            .style('text-anchor', 'middle')
            .style('font-size', '12px');

        // GPU Bar
        const gpuHeight = Math.min(barMaxHeight, gpuTime * 10);
        svg.append('rect')
            .attr('x', 400)
            .attr('y', 200 - gpuHeight)
            .attr('width', barWidth)
            .attr('height', gpuHeight)
            .attr('fill', '#10099F');

        svg.append('text')
            .attr('x', 475)
            .attr('y', 195 - gpuHeight)
            .text(`${gpuTime.toFixed(3)} ms`)
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('font-size', '12px');

        svg.append('text')
            .attr('x', 475)
            .attr('y', 220)
            .text('GPU (300 TFLOP)')
            .style('text-anchor', 'middle')
            .style('font-size', '12px');

        // Speedup
        const speedup = cpuTime / gpuTime;
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', 30)
            .text(`GPU Speedup: ${speedup.toFixed(0)}×`)
            .style('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .style('fill', '#10099F');
    }

    // Initial visualization
    updateVisualization(matrixSize);

    // Handle slider
    const slider = document.getElementById('matrix-size');
    const sizeValue = document.getElementById('matrix-size-value');
    const runBtn = document.getElementById('run-computation');

    if (slider) {
        slider.addEventListener('input', function() {
            matrixSize = parseInt(this.value);
            sizeValue.textContent = matrixSize;
        });
    }

    if (runBtn) {
        runBtn.addEventListener('click', function() {
            updateVisualization(matrixSize);
        });
    }
}

// Training Curves Visualization
function initializeTrainingCurves() {
    const container = document.getElementById('training-curves');
    if (!container) return;

    const width = 700;
    const height = 300;
    const margin = {top: 20, right: 80, bottom: 50, left: 50};

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Simulated training data
    const epochs = d3.range(0, 91, 1);

    const trainingLoss = epochs.map(e => ({
        epoch: e,
        value: 5 * Math.exp(-e/20) + 0.2 + Math.random() * 0.1
    }));

    const validationLoss = epochs.map(e => ({
        epoch: e,
        value: 5 * Math.exp(-e/25) + 0.3 + Math.random() * 0.15
    }));

    const trainingAcc = epochs.map(e => ({
        epoch: e,
        value: Math.min(0.98, 1 - Math.exp(-e/15)) + Math.random() * 0.02
    }));

    const validationAcc = epochs.map(e => ({
        epoch: e,
        value: Math.min(0.92, 1 - Math.exp(-e/20)) + Math.random() * 0.03
    }));

    const learningRate = epochs.map(e => ({
        epoch: e,
        value: e < 30 ? 0.01 : e < 60 ? 0.001 : 0.0001
    }));

    // Scales
    const xScale = d3.scaleLinear()
        .domain([0, 90])
        .range([0, width - margin.left - margin.right]);

    const yScaleLoss = d3.scaleLinear()
        .domain([0, 6])
        .range([height - margin.top - margin.bottom, 0]);

    const yScaleAcc = d3.scaleLinear()
        .domain([0, 1])
        .range([height - margin.top - margin.bottom, 0]);

    const yScaleLR = d3.scaleLog()
        .domain([0.0001, 0.01])
        .range([height - margin.top - margin.bottom, 0]);

    // Line generators
    const line = d3.line()
        .x(d => xScale(d.epoch));

    const lineLoss = line.y(d => yScaleLoss(d.value));
    const lineAcc = line.y(d => yScaleAcc(d.value));
    const lineLR = line.y(d => yScaleLR(d.value));

    // Axes
    g.append('g')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .append('text')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', 40)
        .attr('fill', 'black')
        .style('text-anchor', 'middle')
        .text('Epoch');

    const yAxis = g.append('g')
        .call(d3.axisLeft(yScaleLoss));

    // Default: show loss
    let currentMetric = 'loss';

    // Draw lines
    const trainLine = g.append('path')
        .datum(trainingLoss)
        .attr('fill', 'none')
        .attr('stroke', '#10099F')
        .attr('stroke-width', 2)
        .attr('d', lineLoss);

    const valLine = g.append('path')
        .datum(validationLoss)
        .attr('fill', 'none')
        .attr('stroke', '#FC8484')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', lineLoss);

    // Legend
    const legend = g.append('g')
        .attr('transform', `translate(${width - margin.left - margin.right - 100}, 20)`);

    legend.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('stroke', '#10099F')
        .attr('stroke-width', 2);

    legend.append('text')
        .attr('x', 25)
        .attr('y', 4)
        .text('Training')
        .style('font-size', '12px');

    legend.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 20)
        .attr('y2', 20)
        .attr('stroke', '#FC8484')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

    legend.append('text')
        .attr('x', 25)
        .attr('y', 24)
        .text('Validation')
        .style('font-size', '12px');

    // Handle metric buttons
    document.querySelectorAll('.metric-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentMetric = this.dataset.metric;

            // Update button styles
            document.querySelectorAll('.metric-btn').forEach(b => {
                b.style.background = 'white';
                b.style.color = '#10099F';
            });
            this.style.background = '#10099F';
            this.style.color = 'white';

            // Update visualization
            if (currentMetric === 'loss') {
                yAxis.call(d3.axisLeft(yScaleLoss));
                trainLine.datum(trainingLoss).attr('d', lineLoss);
                valLine.datum(validationLoss).attr('d', lineLoss);
                valLine.style('display', 'block');
            } else if (currentMetric === 'accuracy') {
                yAxis.call(d3.axisLeft(yScaleAcc));
                trainLine.datum(trainingAcc).attr('d', lineAcc);
                valLine.datum(validationAcc).attr('d', lineAcc);
                valLine.style('display', 'block');
            } else if (currentMetric === 'lr') {
                yAxis.call(d3.axisLeft(yScaleLR));
                trainLine.datum(learningRate).attr('d', lineLR);
                valLine.style('display', 'none');
            }
        });
    });
}

// Feature Hierarchy Visualization
function initializeFeatureHierarchy() {
    const container = document.getElementById('feature-hierarchy');
    if (!container) return;

    const width = 700;
    const height = 250;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Feature examples for each layer
    const features = {
        1: ['Edges', 'Colors', 'Textures', 'Gradients'],
        2: ['Corners', 'Curves', 'Simple patterns', 'Color blobs'],
        3: ['Grids', 'Honeycombs', 'Text patterns', 'Repeated textures'],
        4: ['Eyes', 'Wheels', 'Windows', 'Face parts'],
        5: ['Faces', 'Cars', 'Animals', 'Objects']
    };

    let currentLayer = 1;

    function showLayer(layer) {
        svg.selectAll('*').remove();

        const layerFeatures = features[layer];
        const boxWidth = 150;
        const boxHeight = 60;
        const spacing = 20;

        layerFeatures.forEach((feature, i) => {
            const x = spacing + i * (boxWidth + spacing);
            const y = height / 2 - boxHeight / 2;

            const g = svg.append('g');

            g.append('rect')
                .attr('x', x)
                .attr('y', y)
                .attr('width', boxWidth)
                .attr('height', boxHeight)
                .attr('fill', '#10099F')
                .attr('opacity', 0.1 + layer * 0.15)
                .attr('stroke', '#10099F')
                .attr('stroke-width', 2)
                .attr('rx', 5);

            g.append('text')
                .attr('x', x + boxWidth / 2)
                .attr('y', y + boxHeight / 2 + 5)
                .text(feature)
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .style('fill', '#10099F');
        });

        // Layer title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', 30)
            .text(`Layer ${layer} Features`)
            .style('text-anchor', 'middle')
            .style('font-size', '18px')
            .style('font-weight', 'bold')
            .style('fill', '#10099F');

        // Complexity indicator
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height - 20)
            .text(`Complexity: ${'★'.repeat(layer)}${'☆'.repeat(5-layer)}`)
            .style('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('fill', '#666');
    }

    // Initial display
    showLayer(currentLayer);

    // Handle layer buttons
    document.querySelectorAll('.layer-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentLayer = parseInt(this.dataset.layer);

            // Update button styles
            document.querySelectorAll('.layer-btn').forEach(b => {
                b.style.background = 'white';
                b.style.color = '#10099F';
            });
            this.style.background = '#10099F';
            this.style.color = 'white';

            showLayer(currentLayer);
        });
    });
}

// Memory Breakdown Visualization
function initializeMemoryBreakdown() {
    const container = document.getElementById('memory-breakdown-viz');
    if (!container) return;

    const width = 700;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 40;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

    // Data
    const data = [
        {layer: 'Conv1-5', value: 3.7, color: '#FC8484'},
        {layer: 'FC6', value: 26.2, color: '#2DD2C0'},
        {layer: 'FC7', value: 16.8, color: '#00FFBA'},
        {layer: 'FC8', value: 4.1, color: '#10099F'}
    ];

    const total = d3.sum(data, d => d.value);

    // Pie layout
    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // Draw pie
    const arcs = g.selectAll('.arc')
        .data(pie(data))
        .enter().append('g')
        .attr('class', 'arc');

    arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => d.data.color)
        .attr('stroke', 'white')
        .attr('stroke-width', 2);

    // Labels
    arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('dy', '0.35em')
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .style('fill', 'white')
        .text(d => `${d.data.layer}\n${(d.data.value / total * 100).toFixed(1)}%`);

    // Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .text('Parameter Distribution (60M total)')
        .style('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold');
}

// FLOP Breakdown Visualization
function initializeFlopBreakdown() {
    const container = document.getElementById('flop-breakdown-viz');
    if (!container) return;

    const width = 700;
    const height = 200;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Data
    const convFlops = 1100; // Million FLOPs
    const fcFlops = 50; // Million FLOPs
    const total = convFlops + fcFlops;

    // Bar visualization
    const barHeight = 60;
    const barY = 80;

    // Conv bar
    svg.append('rect')
        .attr('x', 50)
        .attr('y', barY)
        .attr('width', (convFlops / total) * 600)
        .attr('height', barHeight)
        .attr('fill', '#10099F');

    svg.append('text')
        .attr('x', 50 + (convFlops / total) * 600 / 2)
        .attr('y', barY + barHeight / 2 + 5)
        .text(`Conv Layers: ${convFlops}M FLOPs (95%)`)
        .style('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-weight', 'bold');

    // FC bar
    svg.append('rect')
        .attr('x', 50 + (convFlops / total) * 600)
        .attr('y', barY)
        .attr('width', (fcFlops / total) * 600)
        .attr('height', barHeight)
        .attr('fill', '#2DD2C0');

    svg.append('text')
        .attr('x', 50 + (convFlops / total) * 600 + (fcFlops / total) * 600 / 2)
        .attr('y', barY + barHeight / 2 + 5)
        .text(`FC: 5%`)
        .style('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-weight', 'bold');

    // Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .text('Computational Distribution (FLOPs)')
        .style('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold');
}

// Bottleneck Analysis
function initializeBottleneckAnalysis() {
    const container = document.getElementById('bottleneck-chart');
    if (!container) return;

    const width = 700;
    const height = 250;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const analyses = {
        forward: {
            title: 'Forward Pass Time Distribution',
            data: [
                {layer: 'Conv1', time: 15, type: 'memory'},
                {layer: 'Conv2', time: 25, type: 'compute'},
                {layer: 'Conv3-5', time: 45, type: 'compute'},
                {layer: 'FC6-8', time: 15, type: 'memory'}
            ]
        },
        backward: {
            title: 'Backward Pass Time Distribution',
            data: [
                {layer: 'Conv1', time: 20, type: 'memory'},
                {layer: 'Conv2', time: 30, type: 'compute'},
                {layer: 'Conv3-5', time: 55, type: 'compute'},
                {layer: 'FC6-8', time: 25, type: 'memory'}
            ]
        },
        update: {
            title: 'Weight Update Time Distribution',
            data: [
                {layer: 'Conv layers', time: 20, type: 'compute'},
                {layer: 'FC layers', time: 80, type: 'memory'}
            ]
        }
    };

    let currentAnalysis = 'forward';

    function showAnalysis(type) {
        svg.selectAll('*').remove();

        const analysis = analyses[type];
        const data = analysis.data;

        // Title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', 30)
            .text(analysis.title)
            .style('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold');

        // Bars
        const barWidth = 100;
        const maxHeight = 120;
        const startX = (width - data.length * (barWidth + 20)) / 2;

        data.forEach((d, i) => {
            const x = startX + i * (barWidth + 20);
            const height = (d.time / 100) * maxHeight;

            svg.append('rect')
                .attr('x', x)
                .attr('y', 180 - height)
                .attr('width', barWidth)
                .attr('height', height)
                .attr('fill', d.type === 'compute' ? '#10099F' : '#FC8484');

            svg.append('text')
                .attr('x', x + barWidth / 2)
                .attr('y', 175 - height)
                .text(`${d.time}%`)
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold');

            svg.append('text')
                .attr('x', x + barWidth / 2)
                .attr('y', 200)
                .text(d.layer)
                .style('text-anchor', 'middle')
                .style('font-size', '11px');
        });

        // Legend
        const legend = svg.append('g')
            .attr('transform', 'translate(550, 80)');

        legend.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', '#10099F');

        legend.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .text('Compute-bound')
            .style('font-size', '12px');

        legend.append('rect')
            .attr('y', 20)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', '#FC8484');

        legend.append('text')
            .attr('x', 20)
            .attr('y', 32)
            .text('Memory-bound')
            .style('font-size', '12px');
    }

    // Initial display
    showAnalysis(currentAnalysis);

    // Handle analysis buttons
    document.querySelectorAll('.analysis-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentAnalysis = this.dataset.analysis;

            // Update button styles
            document.querySelectorAll('.analysis-btn').forEach(b => {
                b.style.background = 'white';
                b.style.color = '#10099F';
            });
            this.style.background = '#10099F';
            this.style.color = 'white';

            showAnalysis(currentAnalysis);
        });
    });
}