// Enhanced Source Modal System for Reveal.js presentations
// Provides a clean way to display sources without taking up slide space

(function() {
    'use strict';
    
    // Create modal HTML structure
    function createModalStructure() {
        const modalHTML = `
            <div id="source-modal" class="source-modal">
                <div class="source-modal-content">
                    <div class="source-modal-header">
                        <h3>Sources & References</h3>
                        <button class="source-modal-close" aria-label="Close">&times;</button>
                    </div>
                    <div class="source-modal-body">
                        <!-- Sources will be injected here -->
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body if it doesn't exist
        if (!document.getElementById('source-modal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }
    
    // Initialize source icons on slides with data-sources attribute
    function initializeSourceIcons() {
        const slides = document.querySelectorAll('.reveal section[data-sources]');
        
        slides.forEach(slide => {
            // Skip if icon already exists
            if (slide.querySelector('.source-icon-container')) return;
            
            // Create icon container (positioned like Reveal.js controls)
            const iconContainer = document.createElement('div');
            iconContainer.className = 'source-icon-container';
            iconContainer.style.cssText = `
                position: fixed;
                bottom: 12px;
                left: 12px;
                z-index: 31;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            // Create book icon button
            const iconButton = document.createElement('button');
            iconButton.className = 'source-icon-button';
            iconButton.innerHTML = '📚';
            iconButton.setAttribute('aria-label', 'View sources');
            iconButton.style.cssText = `
                background: rgba(0, 0, 0, 0.4);
                border: none;
                border-radius: 4px;
                padding: 8px 12px;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.2s ease;
                color: #ecf0f1;
            `;
            
            // Add hover effect
            iconButton.onmouseover = () => {
                iconButton.style.background = 'rgba(0, 0, 0, 0.6)';
                iconButton.style.transform = 'scale(1.1)';
            };
            iconButton.onmouseout = () => {
                iconButton.style.background = 'rgba(0, 0, 0, 0.4)';
                iconButton.style.transform = 'scale(1)';
            };
            
            // Add click handler
            iconButton.addEventListener('click', (e) => {
                e.stopPropagation();
                showSourceModal(slide.getAttribute('data-sources'));
            });
            
            iconContainer.appendChild(iconButton);
            document.body.appendChild(iconContainer);
            
            // Store reference on slide
            slide._sourceIconContainer = iconContainer;
        });
        
        // Update visibility based on current slide
        updateSourceIconVisibility();
    }
    
    // Update source icon visibility based on current slide
    function updateSourceIconVisibility() {
        // Check if Reveal is initialized and has getCurrentSlide method
        if (!window.Reveal || !Reveal.getCurrentSlide) {
            return;
        }
        const currentSlide = Reveal.getCurrentSlide();
        
        // Hide all source icons
        document.querySelectorAll('.source-icon-container').forEach(container => {
            container.style.opacity = '0';
            container.style.pointerEvents = 'none';
        });
        
        // Show icon for current slide if it has sources
        if (currentSlide && currentSlide._sourceIconContainer) {
            currentSlide._sourceIconContainer.style.opacity = '1';
            currentSlide._sourceIconContainer.style.pointerEvents = 'auto';
        }
    }
    
    // Show modal with sources
    function showSourceModal(sourcesJSON) {
        const modal = document.getElementById('source-modal');
        const modalBody = modal.querySelector('.source-modal-body');
        
        try {
            const sources = JSON.parse(sourcesJSON);
            
            // Clear previous content
            modalBody.innerHTML = '';
            
            // Add sources
            if (Array.isArray(sources)) {
                const ul = document.createElement('ul');
                ul.className = 'source-list';
                
                sources.forEach(source => {
                    const li = document.createElement('li');
                    if (typeof source === 'string') {
                        li.innerHTML = source;
                    } else if (source.text && source.url) {
                        li.innerHTML = `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.text}</a>`;
                    }
                    ul.appendChild(li);
                });
                
                modalBody.appendChild(ul);
            } else if (typeof sources === 'object') {
                // Handle grouped sources
                Object.entries(sources).forEach(([category, items]) => {
                    const section = document.createElement('div');
                    section.className = 'source-section';
                    
                    const heading = document.createElement('h4');
                    heading.textContent = category;
                    section.appendChild(heading);
                    
                    const ul = document.createElement('ul');
                    ul.className = 'source-list';
                    
                    items.forEach(item => {
                        const li = document.createElement('li');
                        if (typeof item === 'string') {
                            li.innerHTML = item;
                        } else if (item.text && item.url) {
                            li.innerHTML = `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.text}</a>`;
                        }
                        ul.appendChild(li);
                    });
                    
                    section.appendChild(ul);
                    modalBody.appendChild(section);
                });
            }
            
            // Show modal
            modal.classList.add('show');
            
        } catch (e) {
            console.error('Error parsing sources:', e);
            modalBody.innerHTML = '<p>Error loading sources.</p>';
        }
    }
    
    // Hide modal
    function hideSourceModal() {
        const modal = document.getElementById('source-modal');
        modal.classList.remove('show');
    }
    
    // Add enhanced CSS styles
    function addEnhancedStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced Source Modal Styles */
            .source-modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .source-modal.show {
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 1;
            }
            
            .source-modal-content {
                background: #2c3e50;
                border-radius: 8px;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .source-modal.show .source-modal-content {
                transform: scale(1);
            }
            
            .source-modal-header {
                background: #34495e;
                padding: 20px 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .source-modal-header h3 {
                margin: 0;
                color: #ecf0f1;
                font-size: 1.4em;
                font-weight: 500;
                font-family: 'Source Sans Pro', Helvetica, sans-serif;
            }
            
            .source-modal-close {
                background: none;
                border: none;
                color: #bdc3c7;
                font-size: 32px;
                cursor: pointer;
                padding: 0;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s ease;
                line-height: 1;
            }
            
            .source-modal-close:hover {
                color: #ecf0f1;
            }
            
            .source-modal-body {
                padding: 24px;
                max-height: calc(80vh - 80px);
                overflow-y: auto;
                font-family: 'Source Sans Pro', Helvetica, sans-serif;
            }
            
            .source-modal-body h4 {
                color: #f39c12;
                margin-top: 20px;
                margin-bottom: 12px;
                font-size: 1.2em;
                font-weight: 500;
            }
            
            .source-modal-body h4:first-child {
                margin-top: 0;
            }
            
            .source-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .source-list li {
                padding: 8px 0;
                line-height: 1.6;
                color: #ecf0f1;
            }
            
            .source-list a {
                color: #3498db;
                text-decoration: none;
                transition: color 0.2s ease;
                position: relative;
            }
            
            .source-list a::after {
                content: " ↗";
                font-size: 0.8em;
                opacity: 0.6;
            }
            
            .source-list a:hover {
                color: #5dade2;
                text-decoration: underline;
            }
            
            .source-section {
                margin-bottom: 24px;
            }
            
            .source-section:last-child {
                margin-bottom: 0;
            }
            
            /* Custom scrollbar for modal */
            .source-modal-body::-webkit-scrollbar {
                width: 8px;
            }
            
            .source-modal-body::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
            }
            
            .source-modal-body::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
            }
            
            .source-modal-body::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            /* Mobile responsiveness */
            @media (max-width: 768px) {
                .source-modal-content {
                    width: 95%;
                    max-height: 90vh;
                }
                
                .source-modal-header {
                    padding: 16px 20px;
                }
                
                .source-modal-body {
                    padding: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize when DOM is ready
    function initialize() {
        addEnhancedStyles();
        createModalStructure();
        initializeSourceIcons();
        
        // Set up close handlers
        const modal = document.getElementById('source-modal');
        const closeBtn = modal.querySelector('.source-modal-close');
        
        closeBtn.addEventListener('click', hideSourceModal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideSourceModal();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                hideSourceModal();
            }
        });
        
        // Re-initialize on slide change
        if (window.Reveal) {
            Reveal.on('slidechanged', () => {
                updateSourceIconVisibility();
            });
            
            // Also handle fragment changes
            Reveal.on('fragmentshown', updateSourceIconVisibility);
            Reveal.on('fragmenthidden', updateSourceIconVisibility);
        }
    }
    
    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Export for use in other scripts if needed
    window.SourceModal = {
        show: showSourceModal,
        hide: hideSourceModal,
        refresh: initializeSourceIcons
    };
    
})();