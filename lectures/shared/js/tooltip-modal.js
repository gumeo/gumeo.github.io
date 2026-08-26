/**
 * Click-based Tooltip Modal Handler for Reveal.js Presentations
 * Provides tooltips that appear as modals when clicked (mobile-friendly)
 */

(function() {
    'use strict';

    let currentModal = null;
    let modalContainer = null;

    // Create modal container at body level
    function createModalContainer() {
        modalContainer = document.getElementById('tooltip-modal-container');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'tooltip-modal-container';
            modalContainer.style.cssText = `
                position: fixed;
                z-index: 2147483646;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            `;
            document.body.appendChild(modalContainer);
        }
    }

    // Create modal backdrop
    function createBackdrop() {
        const backdrop = document.createElement('div');
        backdrop.className = 'tooltip-modal-backdrop';
        backdrop.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(3px);
            -webkit-backdrop-filter: blur(3px);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: auto;
        `;
        return backdrop;
    }

    // Create modal element
    function createModal(text, triggerElement) {
        const modal = document.createElement('div');
        modal.className = 'tooltip-modal';
        modal.style.cssText = `
            position: absolute;
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 24px;
            border-radius: 8px;
            font-size: 18px;
            line-height: 1.6;
            max-width: 400px;
            min-width: 280px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            opacity: 0;
            transform: scale(0.9) translateY(10px);
            transition: all 0.3s ease;
            pointer-events: auto;
            font-family: 'Source Sans Pro', Helvetica, sans-serif;
            font-weight: normal;
            text-transform: none;
            text-align: left;
            z-index: 2147483647;
        `;
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'tooltip-modal-close';
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: none;
            border: none;
            color: #bdc3c7;
            font-size: 28px;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s ease;
            line-height: 1;
        `;
        closeBtn.onmouseover = () => closeBtn.style.color = '#ecf0f1';
        closeBtn.onmouseout = () => closeBtn.style.color = '#bdc3c7';
        
        // Content
        const content = document.createElement('div');
        content.className = 'tooltip-modal-content';
        content.innerHTML = text;
        content.style.cssText = `
            margin-right: 24px;
        `;
        
        modal.appendChild(closeBtn);
        modal.appendChild(content);
        
        return modal;
    }

    // Position modal (centered on screen for mobile-friendliness)
    function positionModal(modal, triggerElement) {
        // Get trigger element position
        const triggerRect = triggerElement.getBoundingClientRect();
        const modalRect = modal.getBoundingClientRect();
        
        // Center horizontally
        let x = (window.innerWidth - modalRect.width) / 2;
        
        // Position vertically near the trigger if possible, otherwise center
        let y = triggerRect.bottom + 20;
        
        // Check if modal would go off bottom of screen
        if (y + modalRect.height > window.innerHeight - 20) {
            // Try positioning above the trigger
            y = triggerRect.top - modalRect.height - 20;
            
            // If still doesn't fit, center vertically
            if (y < 20) {
                y = (window.innerHeight - modalRect.height) / 2;
            }
        }
        
        // Ensure modal stays within viewport
        x = Math.max(20, Math.min(x, window.innerWidth - modalRect.width - 20));
        y = Math.max(20, Math.min(y, window.innerHeight - modalRect.height - 20));
        
        modal.style.left = x + 'px';
        modal.style.top = y + 'px';
    }

    // Show modal
    function showModal(text, triggerElement) {
        hideModal();
        
        const backdrop = createBackdrop();
        const modal = createModal(text, triggerElement);
        
        modalContainer.appendChild(backdrop);
        modalContainer.appendChild(modal);
        
        currentModal = { backdrop, modal };
        
        // Position and show
        requestAnimationFrame(() => {
            positionModal(modal, triggerElement);
            backdrop.style.opacity = '1';
            modal.style.opacity = '1';
            modal.style.transform = 'scale(1) translateY(0)';
        });
        
        // Add event listeners
        backdrop.addEventListener('click', hideModal);
        modal.querySelector('.tooltip-modal-close').addEventListener('click', hideModal);
        
        // Close on Escape key
        document.addEventListener('keydown', handleEscapeKey);
    }

    // Hide modal
    function hideModal() {
        if (currentModal) {
            const { backdrop, modal } = currentModal;
            
            backdrop.style.opacity = '0';
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.9) translateY(10px)';
            
            setTimeout(() => {
                if (backdrop.parentNode) {
                    backdrop.parentNode.removeChild(backdrop);
                }
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
            
            currentModal = null;
            document.removeEventListener('keydown', handleEscapeKey);
        }
    }

    // Handle Escape key
    function handleEscapeKey(e) {
        if (e.key === 'Escape') {
            hideModal();
        }
    }

    // Initialize tooltips
    function initTooltips() {
        createModalContainer();
        
        // Get all tooltip triggers
        const tooltips = document.querySelectorAll('.reveal .tooltip');
        
        tooltips.forEach(tooltip => {
            const tooltipText = tooltip.querySelector('.tooltiptext');
            if (!tooltipText) return;
            
            // Hide original tooltip
            tooltipText.style.display = 'none';
            
            // Add click indicator styling
            tooltip.style.cursor = 'pointer';
            tooltip.style.textDecoration = 'underline';
            tooltip.style.textDecorationStyle = 'dotted';
            tooltip.style.textDecorationColor = 'var(--color-accent, #f39c12)';
            tooltip.style.textUnderlineOffset = '2px';
            
            // Remove any existing listeners
            tooltip.removeEventListener('click', tooltip._tooltipClickHandler);
            
            // Add click listener
            tooltip._tooltipClickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                showModal(tooltipText.innerHTML, tooltip);
            };
            tooltip.addEventListener('click', tooltip._tooltipClickHandler);
            
            // Add touch support
            tooltip.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showModal(tooltipText.innerHTML, tooltip);
            });
        });
    }

    // Initialize when Reveal is ready
    if (typeof Reveal !== 'undefined') {
        Reveal.on('ready', () => {
            initTooltips();
            
            // Reinitialize when slides change or fragments are shown
            Reveal.on('slidechanged', () => {
                hideModal();
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
    window.TooltipModal = {
        init: initTooltips,
        hide: hideModal
    };

})();