/**
 * Mouse-Following Tooltip Handler for Reveal.js Presentations
 * Provides tooltips that follow the mouse cursor and avoid z-index issues
 */

(function() {
    'use strict';

    let currentTooltip = null;
    let tooltipContainer = null;
    let mouseX = 0;
    let mouseY = 0;
    let isMouseOverTooltip = false;

    // Create tooltip container at body level to avoid stacking context issues
    function createTooltipContainer() {
        tooltipContainer = document.getElementById('tooltip-container');
        if (!tooltipContainer) {
            tooltipContainer = document.createElement('div');
            tooltipContainer.id = 'tooltip-container';
            tooltipContainer.style.cssText = `
                position: fixed;
                pointer-events: none;
                z-index: 2147483647;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            `;
            document.body.appendChild(tooltipContainer);
        }
    }

    // Create tooltip element
    function createTooltip(text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'mouse-tooltip';
        tooltip.innerHTML = text;
        tooltip.style.cssText = `
            position: absolute;
            background-color: rgba(44, 62, 80, 0.98);
            color: #ecf0f1;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 16px;
            line-height: 1.6;
            max-width: 320px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
            pointer-events: auto;
            font-family: 'Source Sans Pro', Helvetica, sans-serif;
            font-weight: normal;
            text-transform: none;
            text-align: left;
        `;
        
        // Add arrow
        const arrow = document.createElement('div');
        arrow.className = 'tooltip-arrow';
        arrow.style.cssText = `
            position: absolute;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 6px 6px 0 6px;
            border-color: rgba(44, 62, 80, 0.98) transparent transparent transparent;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
        `;
        tooltip.appendChild(arrow);
        
        return tooltip;
    }

    // Position tooltip near mouse
    function positionTooltip(tooltip) {
        const offset = 15;
        const padding = 10;
        const rect = tooltip.getBoundingClientRect();
        
        let x = mouseX + offset;
        let y = mouseY - rect.height - offset;
        
        // Adjust if tooltip goes off right edge
        if (x + rect.width > window.innerWidth - padding) {
            x = mouseX - rect.width - offset;
        }
        
        // Adjust if tooltip goes off left edge
        if (x < padding) {
            x = padding;
        }
        
        // If tooltip would go above viewport, position below cursor
        if (y < padding) {
            y = mouseY + offset;
            // Move arrow to top
            const arrow = tooltip.querySelector('.tooltip-arrow');
            arrow.style.bottom = 'auto';
            arrow.style.top = '-6px';
            arrow.style.borderWidth = '0 6px 6px 6px';
            arrow.style.borderColor = 'transparent transparent rgba(44, 62, 80, 0.98) transparent';
        }
        
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    }

    // Show tooltip
    function showTooltip(text, triggerElement) {
        hideTooltip();
        
        currentTooltip = createTooltip(text);
        tooltipContainer.appendChild(currentTooltip);
        
        // Position and show
        setTimeout(() => {
            positionTooltip(currentTooltip);
            currentTooltip.style.opacity = '1';
        }, 10);
        
        // Track mouse movement
        document.addEventListener('mousemove', onMouseMove);
        
        // Allow interaction with tooltip content (e.g., clicking links)
        currentTooltip.addEventListener('mouseenter', () => {
            isMouseOverTooltip = true;
        });
        
        currentTooltip.addEventListener('mouseleave', () => {
            isMouseOverTooltip = false;
            // Hide tooltip when mouse leaves both trigger and tooltip
            if (!triggerElement.matches(':hover')) {
                hideTooltip();
            }
        });
    }

    // Hide tooltip
    function hideTooltip() {
        if (currentTooltip && !isMouseOverTooltip) {
            currentTooltip.style.opacity = '0';
            setTimeout(() => {
                if (currentTooltip && currentTooltip.parentNode) {
                    currentTooltip.parentNode.removeChild(currentTooltip);
                }
                currentTooltip = null;
            }, 200);
            document.removeEventListener('mousemove', onMouseMove);
        }
    }

    // Update mouse position
    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (currentTooltip) {
            positionTooltip(currentTooltip);
        }
    }

    // Initialize tooltips
    function initTooltips() {
        createTooltipContainer();
        
        // Get all tooltip triggers
        const tooltips = document.querySelectorAll('.reveal .tooltip');
        
        tooltips.forEach(tooltip => {
            const tooltipText = tooltip.querySelector('.tooltiptext');
            if (!tooltipText) return;
            
            // Hide original tooltip
            tooltipText.style.display = 'none';
            
            // Add event listeners
            tooltip.addEventListener('mouseenter', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                showTooltip(tooltipText.innerHTML, tooltip);
            });
            
            tooltip.addEventListener('mouseleave', () => {
                if (!isMouseOverTooltip) {
                    hideTooltip();
                }
            });
        });
    }

    // Initialize when Reveal is ready
    if (typeof Reveal !== 'undefined') {
        Reveal.on('ready', () => {
            initTooltips();
            
            // Reinitialize when slides change or fragments are shown
            Reveal.on('slidechanged', () => {
                hideTooltip();
                setTimeout(initTooltips, 100);
            });
            
            Reveal.on('fragmentshown', initTooltips);
            Reveal.on('fragmenthidden', initTooltips);
        });
    } else {
        // Fallback for non-Reveal environments
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initTooltips);
        } else {
            initTooltips();
        }
    }

    // Export for use in other scripts if needed
    window.TooltipHandler = {
        init: initTooltips,
        hide: hideTooltip
    };

})();