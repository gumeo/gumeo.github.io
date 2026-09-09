// 3D Synthetic Data Visualization using Three.js

function initDataGeneration3D() {
    const container = d3.select('#data-generation-3d');
    if (container.empty() || !container.node()) return;

    // This demo runs a continuous requestAnimationFrame loop (for OrbitControls).
    // Re-running init on every 'slidechanged' visit to this slide (as the central
    // dispatcher does) would spawn a new render loop + resize listener each time
    // without ever tearing down the previous one. Guard so it initializes once and
    // keeps running quietly in the background afterward, like the deck's other demos.
    if (container.node().hasAttribute('data-initialized')) return;
    container.node().setAttribute('data-initialized', 'true');

    // Clear existing content
    container.selectAll("*").remove();
    
    // Get container width and constrain it
    const containerWidth = container.node().getBoundingClientRect().width;
    const width = Math.min(containerWidth || 700, 900); // Max width to prevent overflow
    const height = 400;
    
    // Create canvas container with overflow handling
    const canvasContainer = container.append('div')
        .attr('id', 'threejs-canvas')
        .style('width', '100%')
        .style('max-width', width + 'px')
        .style('height', height + 'px')
        .style('position', 'relative')
        .style('margin', '0 auto')  // Center the canvas
        .style('overflow', 'hidden');  // Prevent overflow
    
    // Three.js setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
        45,
        width / height,
        0.1,
        1000
    );
    camera.position.set(15, 10, 15);
    camera.lookAt(0, 0, 0);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.node().appendChild(renderer.domElement);
    
    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    
    // True parameters
    const w1 = 2;
    const w2 = -3.4;
    const b = 4.2;
    
    // Create axes
    function createAxes() {
        const axesGroup = new THREE.Group();
        
        // Axis lines
        const axisLength = 8;
        const axisMaterial = new THREE.LineBasicMaterial({ color: 0x262626 });
        
        // X1 axis (red)
        const x1Points = [
            new THREE.Vector3(-axisLength/2, 0, 0),
            new THREE.Vector3(axisLength/2, 0, 0)
        ];
        const x1Geometry = new THREE.BufferGeometry().setFromPoints(x1Points);
        const x1Line = new THREE.Line(x1Geometry, new THREE.LineBasicMaterial({ color: 0xff0000 }));
        axesGroup.add(x1Line);
        
        // X2 axis (green)
        const x2Points = [
            new THREE.Vector3(0, 0, -axisLength/2),
            new THREE.Vector3(0, 0, axisLength/2)
        ];
        const x2Geometry = new THREE.BufferGeometry().setFromPoints(x2Points);
        const x2Line = new THREE.Line(x2Geometry, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
        axesGroup.add(x2Line);
        
        // Y axis (blue) - only show positive part to avoid confusing line in X1-X2 plane
        const yPoints = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, axisLength/2, 0)
        ];
        const yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
        const yLine = new THREE.Line(yGeometry, new THREE.LineBasicMaterial({ color: 0x0000ff }));
        axesGroup.add(yLine);
        
        // Add axis labels using sprites
        const loader = new THREE.FontLoader();
        
        // Create text sprites for labels
        function makeTextSprite(message, parameters) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 128;
            
            context.font = "Bold 40px Arial";
            context.fillStyle = parameters.fontColor || '#262626';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(message, 128, 64);
            
            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(2, 1, 1);
            
            return sprite;
        }
        
        // Add labels
        const x1Label = makeTextSprite('X₁', { fontColor: '#ff0000' });
        x1Label.position.set(axisLength/2 + 1, 0, 0);
        axesGroup.add(x1Label);
        
        const x2Label = makeTextSprite('X₂', { fontColor: '#00ff00' });
        x2Label.position.set(0, 0, axisLength/2 + 1);
        axesGroup.add(x2Label);
        
        const yLabel = makeTextSprite('Y', { fontColor: '#0000ff' });
        yLabel.position.set(0, axisLength/2 + 1, 0);
        axesGroup.add(yLabel);
        
        return axesGroup;
    }
    
    scene.add(createAxes());
    
    // Data points group
    let dataPointsGroup = new THREE.Group();
    scene.add(dataPointsGroup);
    
    // Regression plane group
    let planeGroup = new THREE.Group();
    scene.add(planeGroup);
    
    // Generate and plot data
    function generateAndPlot3D() {
        // Check if controls exist
        const noiseLevelInput = d3.select('#noise-level-3d');
        const numSamplesInput = d3.select('#num-samples-3d');
        
        if (noiseLevelInput.empty() || numSamplesInput.empty()) {
            console.warn('Controls not found, using defaults');
            var noiseLevel = 0.01;
            var numSamples = 50;
        } else {
            var noiseLevel = parseFloat(noiseLevelInput.property('value'));
            var numSamples = parseInt(numSamplesInput.property('value'));
        }
        
        // Update display values if they exist
        const noiseValueSpan = d3.select('#noise-value-3d');
        const samplesValueSpan = d3.select('#samples-value-3d');
        
        if (!noiseValueSpan.empty()) {
            noiseValueSpan.text(noiseLevel.toFixed(2));
        }
        if (!samplesValueSpan.empty()) {
            samplesValueSpan.text(numSamples);
        }
        
        // Clear existing data points
        while (dataPointsGroup.children.length > 0) {
            dataPointsGroup.remove(dataPointsGroup.children[0]);
        }
        
        // Clear existing plane
        while (planeGroup.children.length > 0) {
            planeGroup.remove(planeGroup.children[0]);
        }
        
        // Generate data points
        const data = [];
        for (let i = 0; i < numSamples; i++) {
            const x1 = (Math.random() - 0.5) * 6;
            const x2 = (Math.random() - 0.5) * 6;
            const yClean = w1 * x1 + w2 * x2 + b;
            const noise = (Math.random() - 0.5) * 2 * noiseLevel * 10;
            const y = yClean + noise;
            data.push({ x1, x2, y, yClean, noise: Math.abs(noise) });
        }
        
        // Create data point spheres
        const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        
        data.forEach(point => {
            // Color based on distance from true plane (noise level)
            const normalizedNoise = Math.min(point.noise / (noiseLevel * 10), 1);
            const color = new THREE.Color();
            color.setHSL(0.5 - normalizedNoise * 0.3, 0.8, 0.5); // From cyan to green
            
            const material = new THREE.MeshPhongMaterial({ 
                color: color,
                emissive: color,
                emissiveIntensity: 0.2
            });
            
            const sphere = new THREE.Mesh(sphereGeometry, material);
            sphere.position.set(point.x1, point.y / 3, point.x2); // Scale Y for better visualization
            dataPointsGroup.add(sphere);
        });
        
        // Create regression plane
        const planeSize = 6;
        const planeSegments = 20;
        const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize, planeSegments, planeSegments);
        
        // Update plane vertices to match regression equation
        const positions = planeGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x1 = positions.getX(i);
            const x2 = positions.getZ(i);
            const y = (w1 * x1 + w2 * x2 + b) / 3; // Scale Y
            positions.setY(i, y);
        }
        positions.needsUpdate = true;
        planeGeometry.computeVertexNormals();
        
        const planeMaterial = new THREE.MeshPhongMaterial({
            color: 0x10099f,
            transparent: true,
            opacity: 0.15,  // More transparent
            side: THREE.DoubleSide,
            wireframe: false,
            depthWrite: false  // Prevents z-fighting issues
        });
        
        const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        planeMesh.rotateX(-Math.PI / 2); // Rotate to align with axes
        planeMesh.position.y = 0.01;  // Slight offset to avoid intersection with X1-X2 plane
        planeGroup.add(planeMesh);
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        
        // Rotate data points slightly for visual effect
        dataPointsGroup.rotation.y += 0.001;
        
        renderer.render(scene, camera);
    }
    
    // Handle window resize
    function handleResize() {
        const containerWidth = container.node().getBoundingClientRect().width;
        const newWidth = Math.min(containerWidth || 700, 900);
        camera.aspect = newWidth / height;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, height);
    }
    window.addEventListener('resize', handleResize);
    
    // Event listeners (add after DOM is ready)
    setTimeout(() => {
        const noiseControl = d3.select('#noise-level-3d');
        const samplesControl = d3.select('#num-samples-3d');
        const regenerateBtn = d3.select('#regenerate-data-3d');
        
        if (!noiseControl.empty()) {
            noiseControl.on('input', generateAndPlot3D);
        }
        if (!samplesControl.empty()) {
            samplesControl.on('input', generateAndPlot3D);
        }
        if (!regenerateBtn.empty()) {
            regenerateBtn.on('click', generateAndPlot3D);
        }
    }, 100);
    
    // Initial plot
    generateAndPlot3D();
    animate();
    
    // Store cleanup function
    if (!window.threeJSCleanup) {
        window.threeJSCleanup = [];
    }
    window.threeJSCleanup.push(() => {
        window.removeEventListener('resize', handleResize);
        controls.dispose();
        renderer.dispose();
    });
}

// Export for use in main script
if (typeof window !== 'undefined') {
    window.initDataGeneration3D = initDataGeneration3D;
}