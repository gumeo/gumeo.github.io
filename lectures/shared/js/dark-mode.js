/**
 * Dark Mode Toggle for Deep Learning Course Presentations
 * University of Iceland
 *
 * This script adds a dark mode toggle button to Reveal.js presentations
 * and persists the user's preference across all presentations.
 */

(function() {
    'use strict';

    // Configuration
    const STORAGE_KEY = 'dl-course-theme';
    const THEME_LIGHT = 'light';
    const THEME_DARK = 'dark';
    const TOGGLE_KEY = 'd'; // Keyboard shortcut

    // State
    let currentTheme = THEME_LIGHT;
    let toggleButton = null;

    /**
     * Get the user's preferred theme from localStorage or system preference
     */
    function getPreferredTheme() {
        // Check localStorage first
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        if (savedTheme === THEME_DARK || savedTheme === THEME_LIGHT) {
            return savedTheme;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return THEME_DARK;
        }

        return THEME_LIGHT;
    }

    /**
     * Apply the theme to the document
     */
    function applyTheme(theme) {
        currentTheme = theme;

        // Set data-theme attribute on the document element
        document.documentElement.setAttribute('data-theme', theme);

        // Update toggle button icon
        if (toggleButton) {
            updateToggleButton();
        }

        // Save preference
        localStorage.setItem(STORAGE_KEY, theme);

        // Dispatch custom event for other components
        const event = new CustomEvent('themeChanged', {
            detail: { theme: theme }
        });
        document.dispatchEvent(event);

        // Log for debugging
        console.log(`Theme changed to: ${theme}`);
    }

    /**
     * Toggle between light and dark themes
     */
    function toggleTheme() {
        const newTheme = currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
        applyTheme(newTheme);

        // Add a subtle animation to the button
        if (toggleButton) {
            toggleButton.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                toggleButton.style.transform = '';
            }, 300);
        }
    }

    /**
     * Update the toggle button icon based on current theme
     */
    function updateToggleButton() {
        if (!toggleButton) return;

        if (currentTheme === THEME_LIGHT) {
            toggleButton.innerHTML = '🌙';
            toggleButton.setAttribute('aria-label', 'Switch to dark mode');
            toggleButton.setAttribute('title', 'Switch to dark mode (press D)');
        } else {
            toggleButton.innerHTML = '☀️';
            toggleButton.setAttribute('aria-label', 'Switch to light mode');
            toggleButton.setAttribute('title', 'Switch to light mode (press D)');
        }
    }

    /**
     * Create the toggle button element
     */
    function createToggleButton() {
        const button = document.createElement('button');
        button.id = 'dark-mode-toggle';
        button.setAttribute('type', 'button');
        button.setAttribute('role', 'switch');
        button.setAttribute('aria-checked', currentTheme === THEME_DARK ? 'true' : 'false');

        // Add click handler
        button.addEventListener('click', () => {
            toggleTheme();
            button.setAttribute('aria-checked', currentTheme === THEME_DARK ? 'true' : 'false');
        });

        // Prevent the button from interfering with Reveal.js navigation
        button.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
            }
        });

        return button;
    }

    /**
     * Set up keyboard shortcut
     */
    function setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            // Only trigger if not in an input field
            if (e.target.tagName === 'INPUT' ||
                e.target.tagName === 'TEXTAREA' ||
                e.target.isContentEditable) {
                return;
            }

            // Check for the toggle key (case-insensitive)
            if (e.key.toLowerCase() === TOGGLE_KEY && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                toggleTheme();
                if (toggleButton) {
                    toggleButton.setAttribute('aria-checked', currentTheme === THEME_DARK ? 'true' : 'false');
                }
            }
        });
    }

    /**
     * Listen for system theme changes
     */
    function setupSystemThemeListener() {
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

            // Use the newer API if available
            if (darkModeQuery.addEventListener) {
                darkModeQuery.addEventListener('change', (e) => {
                    // Only auto-switch if user hasn't set a preference
                    if (!localStorage.getItem(STORAGE_KEY)) {
                        applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
                    }
                });
            } else if (darkModeQuery.addListener) {
                // Fallback for older browsers
                darkModeQuery.addListener((e) => {
                    if (!localStorage.getItem(STORAGE_KEY)) {
                        applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
                    }
                });
            }
        }
    }

    /**
     * Initialize the dark mode system
     */
    function initialize() {
        // Apply the preferred theme immediately to avoid flash
        const preferredTheme = getPreferredTheme();
        applyTheme(preferredTheme);

        // Create and add the toggle button
        toggleButton = createToggleButton();
        updateToggleButton();
        document.body.appendChild(toggleButton);

        // Set up keyboard shortcut
        setupKeyboardShortcut();

        // Listen for system theme changes
        setupSystemThemeListener();

        console.log('Dark mode system initialized');
    }

    /**
     * Wait for DOM to be ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Public API - expose toggle function for external use
    window.DarkMode = {
        toggle: toggleTheme,
        setTheme: applyTheme,
        getTheme: () => currentTheme,
        isEnabled: () => currentTheme === THEME_DARK
    };

})();
