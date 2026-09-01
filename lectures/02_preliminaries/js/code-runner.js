// Interactive code runner for tensor operations examples

class CodeRunner {
    constructor() {
        this.frameworks = {
            pytorch: {
                name: 'PyTorch',
                import: 'import torch',
                arange: 'torch.arange',
                zeros: 'torch.zeros',
                ones: 'torch.ones',
                randn: 'torch.randn',
                tensor: 'torch.tensor',
                reshape: '.reshape',
                cat: 'torch.cat',
                exp: 'torch.exp',
                sum: '.sum()',
                numel: '.numel()',
                numpy: '.numpy()',
                from_numpy: 'torch.from_numpy',
                dtype: 'dtype=torch.float32'
            },
            tensorflow: {
                name: 'TensorFlow',
                import: 'import tensorflow as tf',
                arange: 'tf.range',
                zeros: 'tf.zeros',
                ones: 'tf.ones',
                randn: 'tf.random.normal',
                tensor: 'tf.constant',
                reshape: 'tf.reshape',
                cat: 'tf.concat',
                exp: 'tf.exp',
                sum: 'tf.reduce_sum',
                numel: 'tf.size',
                numpy: '.numpy()',
                from_numpy: 'tf.constant',
                dtype: 'dtype=tf.float32'
            },
            mxnet: {
                name: 'MXNet',
                import: 'from mxnet import np, npx\nnpx.set_np()',
                arange: 'np.arange',
                zeros: 'np.zeros',
                ones: 'np.ones',
                randn: 'np.random.normal',
                tensor: 'np.array',
                reshape: '.reshape',
                cat: 'np.concatenate',
                exp: 'np.exp',
                sum: '.sum()',
                numel: '.size',
                numpy: '.asnumpy()',
                from_numpy: 'np.array',
                dtype: ''
            },
            jax: {
                name: 'JAX',
                import: 'import jax\nfrom jax import numpy as jnp',
                arange: 'jnp.arange',
                zeros: 'jnp.zeros',
                ones: 'jnp.ones',
                randn: 'jax.random.normal',
                tensor: 'jnp.array',
                reshape: '.reshape',
                cat: 'jnp.concatenate',
                exp: 'jnp.exp',
                sum: '.sum()',
                numel: '.size',
                numpy: 'jax.device_get',
                from_numpy: 'jax.device_put',
                dtype: 'dtype=jnp.float32'
            }
        };
        
        this.currentFramework = 'pytorch';
        this.initializeSelectors();
        this.initializeCodeBlocks();
    }

    initializeSelectors() {
        // Find or create framework selector
        const selectors = document.querySelectorAll('.framework-selector');
        
        selectors.forEach(selector => {
            if (!selector.dataset.initialized) {
                selector.dataset.initialized = 'true';
                
                // Create buttons for each framework
                Object.keys(this.frameworks).forEach(key => {
                    const btn = document.createElement('button');
                    btn.className = 'framework-btn';
                    btn.dataset.framework = key;
                    btn.textContent = this.frameworks[key].name;
                    
                    if (key === this.currentFramework) {
                        btn.classList.add('active');
                    }
                    
                    btn.addEventListener('click', () => {
                        this.switchFramework(key);
                    });
                    
                    selector.appendChild(btn);
                });
            }
        });
    }

    switchFramework(framework) {
        this.currentFramework = framework;
        
        // Update button states
        document.querySelectorAll('.framework-btn').forEach(btn => {
            if (btn.dataset.framework === framework) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update code blocks
        this.updateCodeBlocks();
    }

    initializeCodeBlocks() {
        // Find all code blocks with framework switching
        const codeBlocks = document.querySelectorAll('[data-framework-code]');
        
        codeBlocks.forEach(block => {
            const config = JSON.parse(block.dataset.frameworkCode);
            this.createFrameworkSpecificCode(block, config);
        });
        
        // Initialize interactive code runners
        const runners = document.querySelectorAll('[data-code-runner]');
        runners.forEach(runner => {
            this.createInteractiveRunner(runner);
        });
    }

    createFrameworkSpecificCode(container, config) {
        const fw = this.frameworks[this.currentFramework];
        let code = '';
        
        switch (config.type) {
            case 'import':
                code = fw.import;
                break;
                
            case 'create_tensor':
                if (config.method === 'arange') {
                    code = `x = ${fw.arange}(${config.args || '12'}, ${fw.dtype})`;
                } else if (config.method === 'zeros') {
                    code = `zeros = ${fw.zeros}((${config.shape || '2, 3, 4'}))`;
                } else if (config.method === 'ones') {
                    code = `ones = ${fw.ones}((${config.shape || '2, 3, 4'}))`;
                } else if (config.method === 'randn') {
                    if (this.currentFramework === 'jax') {
                        code = `randn = ${fw.randn}(jax.random.PRNGKey(0), (${config.shape || '3, 4'}))`;
                    } else if (this.currentFramework === 'tensorflow') {
                        code = `randn = ${fw.randn}(shape=[${config.shape || '3, 4'}])`;
                    } else if (this.currentFramework === 'mxnet') {
                        code = `randn = ${fw.randn}(0, 1, size=(${config.shape || '3, 4'}))`;
                    } else {
                        code = `randn = ${fw.randn}(${config.shape || '3, 4'})`;
                    }
                }
                break;
                
            case 'reshape':
                code = `X = x${fw.reshape}(${config.shape || '3, 4'})`;
                if (this.currentFramework === 'tensorflow') {
                    code = `X = ${fw.reshape}(x, (${config.shape || '3, 4'}))`;
                }
                break;
                
            case 'operations':
                code = `# Element-wise operations
x + y, x - y, x * y, x / y, x ** y`;
                break;
                
            case 'concatenate':
                if (this.currentFramework === 'pytorch') {
                    code = `${fw.cat}((X, Y), dim=${config.axis || '0'})`;
                } else if (this.currentFramework === 'tensorflow') {
                    code = `${fw.cat}([X, Y], axis=${config.axis || '0'})`;
                } else {
                    code = `${fw.cat}([X, Y], axis=${config.axis || '0'})`;
                }
                break;
                
            case 'broadcast':
                code = `a = ${fw.arange}(3)${fw.reshape}((3, 1))
b = ${fw.arange}(2)${fw.reshape}((1, 2))
result = a + b  # Broadcasting happens automatically`;
                break;
                
            case 'memory':
                if (this.currentFramework === 'pytorch' || this.currentFramework === 'mxnet') {
                    code = `# In-place operation
X[:] = X + Y  # Modifies X without new allocation
X += Y        # Alternative syntax`;
                } else if (this.currentFramework === 'jax') {
                    code = `# JAX arrays are immutable
X_new = X.at[:].set(X + Y)  # Creates new array`;
                } else {
                    code = `# TensorFlow uses Variables for mutability
X_var = tf.Variable(X)
X_var.assign(X + Y)  # Modifies variable in-place`;
                }
                break;
                
            case 'conversion':
                if (this.currentFramework === 'pytorch') {
                    code = `# To NumPy
A = X${fw.numpy}()
# From NumPy
B = ${fw.from_numpy}(A)`;
                } else if (this.currentFramework === 'jax') {
                    code = `# To NumPy
A = ${fw.numpy}(X)
# From NumPy
B = ${fw.from_numpy}(A)`;
                } else {
                    code = `# To NumPy
A = X${fw.numpy}()
# From NumPy
B = ${fw.from_numpy}(A)`;
                }
                break;
                
            default:
                code = config.code || '# Code example';
        }
        
        // Update the container with formatted code
        const pre = document.createElement('pre');
        const codeEl = document.createElement('code');
        codeEl.className = 'python';
        codeEl.textContent = code;
        pre.appendChild(codeEl);
        
        container.innerHTML = '';
        container.appendChild(pre);
        
        // Re-highlight if Highlight.js is available
        if (typeof hljs !== 'undefined') {
            hljs.highlightElement(codeEl);
        }
    }

    createInteractiveRunner(container) {
        const config = JSON.parse(container.dataset.codeRunner || '{}');
        
        // Create UI
        const runnerUI = document.createElement('div');
        runnerUI.className = 'interactive-demo';
        
        // Code editor area
        const editorArea = document.createElement('div');
        editorArea.className = 'code-editor';
        editorArea.style.marginBottom = '15px';
        
        const textarea = document.createElement('textarea');
        textarea.style.width = '100%';
        textarea.style.minHeight = '150px';
        textarea.style.fontFamily = 'Source Code Pro, monospace';
        textarea.style.fontSize = '0.9em';
        textarea.style.padding = '10px';
        textarea.style.border = '1px solid var(--color-border)';
        textarea.style.borderRadius = '4px';
        textarea.value = config.initialCode || this.getExampleCode(config.example);
        
        editorArea.appendChild(textarea);
        
        // Controls
        const controls = document.createElement('div');
        controls.className = 'demo-controls';
        
        const runBtn = document.createElement('button');
        runBtn.className = 'demo-btn';
        runBtn.textContent = '▶ Run Code';
        
        const resetBtn = document.createElement('button');
        resetBtn.className = 'demo-btn';
        resetBtn.textContent = '↺ Reset';
        
        controls.appendChild(runBtn);
        controls.appendChild(resetBtn);
        
        // Output area
        const output = document.createElement('div');
        output.className = 'demo-output';
        output.style.marginTop = '15px';
        output.innerHTML = '<em>Output will appear here...</em>';
        
        // Assemble UI
        runnerUI.appendChild(editorArea);
        runnerUI.appendChild(controls);
        runnerUI.appendChild(output);
        
        container.appendChild(runnerUI);
        
        // Event handlers
        runBtn.addEventListener('click', () => {
            this.runCode(textarea.value, output);
        });
        
        resetBtn.addEventListener('click', () => {
            textarea.value = config.initialCode || this.getExampleCode(config.example);
            output.innerHTML = '<em>Output will appear here...</em>';
        });
    }

    getExampleCode(example) {
        const fw = this.frameworks[this.currentFramework];
        
        const examples = {
            'basic': `${fw.import}

# Create a tensor
x = ${fw.arange}(12, ${fw.dtype})
print(x)

# Check shape
print(x.shape)

# Reshape
X = x${fw.reshape}(3, 4)
print(X)`,
            
            'operations': `${fw.import}

x = ${fw.tensor}([1.0, 2, 4, 8])
y = ${fw.tensor}([2, 2, 2, 2])

print("x + y =", x + y)
print("x * y =", x * y)
print("x / y =", x / y)`,
            
            'broadcasting': `${fw.import}

a = ${fw.arange}(3)${fw.reshape}((3, 1))
b = ${fw.arange}(2)${fw.reshape}((1, 2))

print("a shape:", a.shape)
print("b shape:", b.shape)
print("a + b shape:", (a + b).shape)
print("Result:\\n", a + b)`
        };
        
        return examples[example] || examples['basic'];
    }

    runCode(code, outputElement) {
        // Simulate code execution (in real implementation, would use a backend)
        outputElement.innerHTML = '<div style="color: var(--color-primary);">Running...</div>';
        
        setTimeout(() => {
            // Parse and simulate output based on code patterns
            const output = this.simulateOutput(code);
            outputElement.innerHTML = `<pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${output}</pre>`;
        }, 500);
    }

    simulateOutput(code) {
        // Simple pattern matching for demonstration
        if (code.includes('arange(12')) {
            return 'tensor([ 0.,  1.,  2.,  3.,  4.,  5.,  6.,  7.,  8.,  9., 10., 11.])';
        } else if (code.includes('reshape(3, 4)')) {
            return `tensor([[ 0.,  1.,  2.,  3.],
        [ 4.,  5.,  6.,  7.],
        [ 8.,  9., 10., 11.]])`;
        } else if (code.includes('x + y')) {
            return `x + y = tensor([ 3.,  4.,  8., 16.])
x * y = tensor([ 2.,  4.,  8., 16.])
x / y = tensor([0.5, 1.0, 2.0, 4.0])`;
        } else if (code.includes('broadcasting')) {
            return `a shape: (3, 1)
b shape: (1, 2)
a + b shape: (3, 2)
Result:
tensor([[0, 1],
        [1, 2],
        [2, 3]])`;
        } else {
            return 'Code executed successfully!';
        }
    }

    updateCodeBlocks() {
        // Update all framework-specific code blocks
        const codeBlocks = document.querySelectorAll('[data-framework-code]');
        codeBlocks.forEach(block => {
            const config = JSON.parse(block.dataset.frameworkCode);
            this.createFrameworkSpecificCode(block, config);
        });
    }
}

// Initialize code runner when document is ready
document.addEventListener('DOMContentLoaded', () => {
    const codeRunner = new CodeRunner();
    
    // Listen for slide changes to initialize code on new slides
    if (typeof Reveal !== 'undefined') {
        Reveal.on('slidechanged', event => {
            // Re-initialize any new code blocks on the current slide
            const currentSlide = event.currentSlide;
            const newSelectors = currentSlide.querySelectorAll('.framework-selector:not([data-initialized])');
            if (newSelectors.length > 0) {
                codeRunner.initializeSelectors();
            }
            
            const newRunners = currentSlide.querySelectorAll('[data-code-runner]:not([data-initialized])');
            newRunners.forEach(runner => {
                runner.dataset.initialized = 'true';
                codeRunner.createInteractiveRunner(runner);
            });
        });
    }
});