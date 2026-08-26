/**
 * Title Handler - Automatically adjusts font size to fit titles in one line
 * No interaction needed - titles automatically resize to fit
 */

class TitleHandler {
    constructor(options = {}) {
        this.options = {
            selector: '.truncate-title',
            minFontSize: 0.6, // Minimum font size as a ratio of original
            maxFontSize: 1.0, // Maximum font size as a ratio of original
            step: 0.05, // Step size for font size reduction
            ...options
        };
        
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupTitles());
        } else {
            this.setupTitles();
        }
        
        // Re-check on window resize
        window.addEventListener('resize', () => this.adjustAllTitles());
        
        // Re-check when Reveal.js changes slides
        if (typeof Reveal !== 'undefined') {
            Reveal.on('slidechanged', () => {
                // Use requestAnimationFrame for better timing
                requestAnimationFrame(() => {
                    this.adjustCurrentSlideTitles();
                });
            });
            
            // Also handle the ready event
            Reveal.on('ready', () => {
                requestAnimationFrame(() => {
                    this.setupTitles();
                    this.adjustCurrentSlideTitles();
                });
            });
        }
    }

    setupTitles() {
        const titles = document.querySelectorAll(this.options.selector);
        titles.forEach(title => this.setupTitle(title));
        this.adjustAllTitles();
    }

    setupTitle(element, forceReset = false) {
        // Allow re-processing if forceReset is true
        if (element.hasAttribute('data-title-handler') && !forceReset) return;
        
        element.setAttribute('data-title-handler', 'true');
        
        // Store original font size
        const computedStyle = window.getComputedStyle(element);
        const originalFontSize = parseFloat(computedStyle.fontSize);
        element.setAttribute('data-original-font-size', originalFontSize);
        
        // Remove any cursor styling - no interaction needed
        element.style.cursor = 'inherit';
        
        // Store original text for reference
        element.setAttribute('data-full-text', element.textContent);
    }

    adjustCurrentSlideTitles() {
        // Only adjust titles in the current slide for better performance
        if (typeof Reveal !== 'undefined' && Reveal.getCurrentSlide) {
            const currentSlide = Reveal.getCurrentSlide();
            if (currentSlide) {
                const titles = currentSlide.querySelectorAll(this.options.selector);
                titles.forEach(title => {
                    // Re-setup to ensure we have fresh measurements
                    this.setupTitle(title, true);
                    this.adjustFontSize(title);
                });
            }
        }
    }

    adjustAllTitles() {
        const titles = document.querySelectorAll(this.options.selector);
        titles.forEach(title => this.adjustFontSize(title));
    }

    isElementVisible(element) {
        // Check if element is visible
        if (!element) return false;
        
        // Check if element has dimensions
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        
        // Check offsetParent (null means hidden)
        if (element.offsetParent === null) {
            // Exception for fixed positioned elements
            const style = window.getComputedStyle(element);
            if (style.position !== 'fixed') return false;
        }
        
        return true;
    }

    adjustFontSize(element) {
        // Skip if element is not visible
        if (!this.isElementVisible(element)) {
            // Defer adjustment for hidden elements
            requestAnimationFrame(() => {
                if (this.isElementVisible(element)) {
                    this.adjustFontSize(element);
                }
            });
            return;
        }
        
        const originalFontSize = parseFloat(element.getAttribute('data-original-font-size'));
        if (!originalFontSize) {
            // Try to set it up if missing
            this.setupTitle(element, true);
            return;
        }
        
        // Start with original font size
        let currentRatio = this.options.maxFontSize;
        let fontSize = originalFontSize * currentRatio;
        
        // Reset to original size first
        element.style.fontSize = fontSize + 'px';
        
        // Force browser to recalculate layout
        void element.offsetWidth;
        
        // Check if text overflows and reduce size if needed
        while (element.scrollWidth > element.clientWidth && currentRatio > this.options.minFontSize) {
            currentRatio -= this.options.step;
            fontSize = originalFontSize * currentRatio;
            element.style.fontSize = fontSize + 'px';
            // Force recalculation
            void element.offsetWidth;
        }
        
        // Add a data attribute to indicate if font was reduced
        if (currentRatio < this.options.maxFontSize) {
            element.setAttribute('data-font-reduced', 'true');
            element.setAttribute('data-font-ratio', currentRatio.toFixed(2));
        } else {
            element.removeAttribute('data-font-reduced');
            element.removeAttribute('data-font-ratio');
        }
    }
}

// Auto-initialize with default settings
const titleHandler = new TitleHandler();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TitleHandler;
}