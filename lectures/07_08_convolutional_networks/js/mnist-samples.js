// MNIST Sample Visualization
(function() {
    const canvas = document.getElementById('mnist-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = 280;
    const height = 280;
    
    // Sample MNIST-like digits (simplified representations)
    const samples = [
        // Digit 0
        [
            [0,0,0,1,1,1,0,0],
            [0,0,1,1,1,1,1,0],
            [0,1,1,0,0,0,1,1],
            [0,1,0,0,0,0,0,1],
            [0,1,0,0,0,0,0,1],
            [0,1,1,0,0,0,1,1],
            [0,0,1,1,1,1,1,0],
            [0,0,0,1,1,1,0,0]
        ],
        // Digit 1
        [
            [0,0,0,0,1,0,0,0],
            [0,0,0,1,1,0,0,0],
            [0,0,1,1,1,0,0,0],
            [0,0,0,1,1,0,0,0],
            [0,0,0,1,1,0,0,0],
            [0,0,0,1,1,0,0,0],
            [0,0,0,1,1,0,0,0],
            [0,1,1,1,1,1,1,0]
        ],
        // Digit 7
        [
            [0,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,0],
            [0,0,0,0,0,1,1,0],
            [0,0,0,0,1,1,0,0],
            [0,0,0,1,1,0,0,0],
            [0,0,1,1,0,0,0,0],
            [0,0,1,1,0,0,0,0],
            [0,0,1,1,0,0,0,0]
        ],
        // Digit 4
        [
            [0,0,0,0,1,1,0,0],
            [0,0,0,1,1,1,0,0],
            [0,0,1,0,1,1,0,0],
            [0,1,0,0,1,1,0,0],
            [0,1,1,1,1,1,1,0],
            [0,0,0,0,1,1,0,0],
            [0,0,0,0,1,1,0,0],
            [0,0,0,0,1,1,0,0]
        ]
    ];
    
    let currentSample = 0;
    
    function drawDigit(digitArray) {
        // Clear canvas
        ctx.fillStyle = '#F5F5F5';
        ctx.fillRect(0, 0, width, height);
        
        const cellSize = width / 8;
        
        // Add some random variation for realism
        const noise = () => Math.random() * 0.3 - 0.15;
        
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const value = digitArray[i][j];
                if (value > 0) {
                    // Add variation to make it look hand-drawn
                    const intensity = Math.min(1, value + noise());
                    ctx.fillStyle = `rgba(38, 38, 38, ${intensity})`;
                    
                    // Slightly randomize position and size for hand-drawn effect
                    const x = j * cellSize + Math.random() * 4 - 2;
                    const y = i * cellSize + Math.random() * 4 - 2;
                    const size = cellSize + Math.random() * 4 - 2;
                    
                    // Draw with slight blur effect
                    ctx.beginPath();
                    ctx.arc(x + size/2, y + size/2, size/2.5, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }
        
        // Add slight noise to entire image
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 20 - 10;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
            data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
        }
        ctx.putImageData(imageData, 0, 0);
    }
    
    function animateSamples() {
        drawDigit(samples[currentSample]);
        currentSample = (currentSample + 1) % samples.length;
    }
    
    // Initialize and animate
    function init() {
        if (canvas) {
            animateSamples();
            setInterval(animateSamples, 2000);
        }
    }
    
    // Initialize when slide is shown
    Reveal.on('slidechanged', event => {
        if (event.currentSlide.querySelector('#mnist-canvas')) {
            init();
        }
    });
    
    // Initial check
    if (document.querySelector('#mnist-canvas')) {
        init();
    }
})();