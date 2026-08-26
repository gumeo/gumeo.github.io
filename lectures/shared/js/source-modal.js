// Source Modal System for Reveal.js presentations
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
                        <span class="source-modal-close">&times;</span>
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
            if (slide.querySelector('.source-icon')) return;
            
            // Create book icon
            const icon = document.createElement('div');
            icon.className = 'source-icon';
            icon.innerHTML = '📚';
            icon.title = 'View sources';
            
            // Add click handler
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                showSourceModal(slide.getAttribute('data-sources'));
            });
            
            slide.appendChild(icon);
        });
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
                        li.innerHTML = `<a href="${source.url}" target="_blank">${source.text}</a>`;
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
                            li.innerHTML = `<a href="${item.url}" target="_blank">${item.text}</a>`;
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
    
    // Initialize when DOM is ready
    function initialize() {
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
        
        // Re-initialize on slide change (for dynamically loaded content)
        if (window.Reveal) {
            Reveal.on('slidechanged', () => {
                setTimeout(initializeSourceIcons, 100);
            });
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