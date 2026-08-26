/**
 * Multiple Choice Question System for Reveal.js Presentations
 * University of Iceland - Introduction to Deep Learning Course
 * 
 * Features:
 * - Interactive multiple-choice questions with explanations
 * - Visual feedback for correct/incorrect answers
 * - Smooth animations and transitions
 * - Mobile-responsive design
 * - Accessibility support
 */

(function() {
    'use strict';

    class MultipleChoiceQuestion {
        constructor(container, config) {
            this.container = container;
            this.config = config;
            this.selectedAnswers = new Set();
            this.isAnswered = false;
            this.isMultiple = config.type === 'multiple';
            
            // Create shuffled options with index mapping
            this.shuffleOptions();
            
            this.init();
        }

        // Fisher-Yates shuffle algorithm
        shuffleArray(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        shuffleOptions() {
            // Create an array of indices
            const indices = Array.from({length: this.config.options.length}, (_, i) => i);
            
            // Shuffle the indices
            this.shuffledIndices = this.shuffleArray(indices);
            
            // Create shuffled options array
            this.shuffledOptions = this.shuffledIndices.map(index => ({
                ...this.config.options[index],
                originalIndex: index
            }));
        }

        init() {
            this.render();
            this.attachEventListeners();
        }

        render() {
            // TODO ADDRESSED: Updated container structure for better scrolling with fixed height wrapper
            const questionHTML = `
                <div class="mcq-wrapper">
                    <div class="mcq-container">
                        <div class="mcq-header">
                            ${this.config.question ? `<p class="mcq-question">${this.config.question}</p>` : ''}
                        </div>
                        <div class="mcq-scroll-content">
                            <div class="mcq-options">
                                ${this.renderOptions()}
                            </div>
                        </div>
                        <div class="mcq-footer">
                            <button class="mcq-submit-btn" disabled>Submit Answer</button>
                            <button class="mcq-reset-btn" style="display: none;">Try Again</button>
                            <div class="mcq-feedback" style="display: none;">
                                <div class="mcq-feedback-content"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            this.container.innerHTML = questionHTML;
            
            // Cache DOM elements
            this.submitBtn = this.container.querySelector('.mcq-submit-btn');
            this.resetBtn = this.container.querySelector('.mcq-reset-btn');
            this.feedbackEl = this.container.querySelector('.mcq-feedback');
            this.feedbackContent = this.container.querySelector('.mcq-feedback-content');
            this.optionsContainer = this.container.querySelector('.mcq-options');
        }

        renderOptions() {
            return this.shuffledOptions.map((option, displayIndex) => {
                const optionId = `option-${Date.now()}-${displayIndex}`;
                const inputType = this.isMultiple ? 'checkbox' : 'radio';
                const inputName = this.isMultiple ? `mcq-${Date.now()}-${displayIndex}` : `mcq-${Date.now()}`;
                
                return `
                    <div class="mcq-option" data-index="${displayIndex}" data-original-index="${option.originalIndex}">
                        <input type="${inputType}" 
                               id="${optionId}" 
                               name="${inputName}" 
                               class="mcq-option-input"
                               value="${option.originalIndex}">
                        <label for="${optionId}" class="mcq-option-label">
                            <span class="mcq-option-indicator"></span>
                            <span class="mcq-option-text">${option.text}</span>
                        </label>
                        <div class="mcq-option-explanation" style="display: none;">
                            <div class="mcq-explanation-icon"></div>
                            <div class="mcq-explanation-text">${option.explanation || ''}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        attachEventListeners() {
            // Option selection
            const options = this.container.querySelectorAll('.mcq-option-input');
            options.forEach(option => {
                option.addEventListener('change', (e) => this.handleOptionChange(e));
            });

            // Submit button
            this.submitBtn.addEventListener('click', () => this.handleSubmit());

            // Reset button
            this.resetBtn.addEventListener('click', () => this.handleReset());

            // Prevent form submission on enter
            this.container.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !this.isAnswered && this.selectedAnswers.size > 0) {
                    this.handleSubmit();
                }
            });
        }

        handleOptionChange(event) {
            const index = parseInt(event.target.value);
            
            if (this.isMultiple) {
                if (event.target.checked) {
                    this.selectedAnswers.add(index);
                } else {
                    this.selectedAnswers.delete(index);
                }
            } else {
                this.selectedAnswers.clear();
                if (event.target.checked) {
                    this.selectedAnswers.add(index);
                }
            }

            // Enable/disable submit button
            this.submitBtn.disabled = this.selectedAnswers.size === 0;
        }

        handleSubmit() {
            if (this.isAnswered || this.selectedAnswers.size === 0) return;
            
            this.isAnswered = true;
            this.submitBtn.style.display = 'none';
            this.resetBtn.style.display = 'inline-block';

            // Disable all inputs
            const inputs = this.container.querySelectorAll('.mcq-option-input');
            inputs.forEach(input => input.disabled = true);

            // Check answers and show feedback
            let allCorrect = true;
            const correctAnswers = new Set();
            
            this.config.options.forEach((option, index) => {
                if (option.correct) {
                    correctAnswers.add(index);
                }
            });

            // Check if selected answers match correct answers
            if (this.selectedAnswers.size !== correctAnswers.size) {
                allCorrect = false;
            } else {
                for (let answer of this.selectedAnswers) {
                    if (!correctAnswers.has(answer)) {
                        allCorrect = false;
                        break;
                    }
                }
            }

            // Show individual option feedback
            this.shuffledOptions.forEach((option, displayIndex) => {
                const originalIndex = option.originalIndex;
                const optionEl = this.container.querySelector(`.mcq-option[data-index="${displayIndex}"]`);
                const explanationEl = optionEl.querySelector('.mcq-option-explanation');
                const iconEl = optionEl.querySelector('.mcq-explanation-icon');
                
                const isSelected = this.selectedAnswers.has(originalIndex);
                const isCorrect = option.correct;
                
                // Add visual feedback classes
                if (isCorrect) {
                    optionEl.classList.add('mcq-correct');
                    iconEl.innerHTML = '✓';
                    iconEl.className = 'mcq-explanation-icon mcq-icon-correct';
                } else if (isSelected) {
                    optionEl.classList.add('mcq-incorrect');
                    iconEl.innerHTML = '✗';
                    iconEl.className = 'mcq-explanation-icon mcq-icon-incorrect';
                }
                
                // Show explanation for selected or correct options
                if (isSelected || isCorrect) {
                    explanationEl.style.display = 'block';
                    setTimeout(() => {
                        explanationEl.classList.add('show');
                    }, 100 * displayIndex);
                }
            });

            // Show overall feedback
            this.showOverallFeedback(allCorrect);
        }

        showOverallFeedback(isCorrect) {
            const feedbackMessage = isCorrect 
                ? '<span class="mcq-success">🎉 Excellent! All answers are correct.</span>'
                : '<span class="mcq-error">Not quite. Review the explanations above.</span>';
            
            this.feedbackContent.innerHTML = feedbackMessage;
            this.feedbackEl.style.display = 'block';
            
            setTimeout(() => {
                this.feedbackEl.classList.add('show');
            }, 100);
        }

        handleReset() {
            // Reset state
            this.isAnswered = false;
            this.selectedAnswers.clear();
            
            // Reshuffle options for a fresh experience
            this.shuffleOptions();
            
            // Re-render the entire question with new shuffle
            this.render();
            this.attachEventListeners();
        }
    }

    // Initialize questions when DOM is ready
    function initializeQuestions() {
        // Only initialize questions on the current slide (or all if Reveal isn't loaded)
        let questionContainers;
        
        if (typeof Reveal !== 'undefined' && Reveal.getCurrentSlide) {
            const currentSlide = Reveal.getCurrentSlide();
            questionContainers = currentSlide.querySelectorAll('[data-mcq]:not([data-mcq-initialized])');
        } else {
            questionContainers = document.querySelectorAll('[data-mcq]:not([data-mcq-initialized])');
        }
        
        questionContainers.forEach(container => {
            try {
                const config = JSON.parse(container.getAttribute('data-mcq'));
                new MultipleChoiceQuestion(container, config);
                // Mark as initialized to prevent re-initialization
                container.setAttribute('data-mcq-initialized', 'true');
                console.log('Initialized MCQ:', config.question || 'Question');
                
                // Force a reflow to ensure proper positioning on vertical slides
                if (typeof Reveal !== 'undefined') {
                    // Trigger Reveal.js to recalculate slide layout
                    setTimeout(() => {
                        Reveal.layout();
                    }, 50);
                }
            } catch (error) {
                console.error('Error initializing multiple choice question:', error);
                console.error('Container:', container);
                console.error('data-mcq attribute:', container.getAttribute('data-mcq'));
            }
        });
    }

    // Auto-initialize on DOM ready and Reveal ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeQuestions);
    } else {
        // Small delay to ensure Reveal is fully loaded
        setTimeout(initializeQuestions, 200);
    }

    // Initialize when Reveal.js is ready and when slides change
    if (typeof Reveal !== 'undefined') {
        // Initialize on Reveal ready
        Reveal.on('ready', () => {
            console.log('Reveal ready - initializing MCQs');
            initializeQuestions();
        });
        
        // Initialize new questions when changing slides
        Reveal.on('slidechanged', () => {
            // Use a slightly longer timeout to ensure slide transition is complete
            setTimeout(() => {
                console.log('Slide changed - checking for new MCQs');
                initializeQuestions();
            }, 300);
        });
    }

    // Export for manual initialization if needed
    window.MultipleChoiceQuestion = MultipleChoiceQuestion;
    window.initializeMultipleChoice = initializeQuestions;

})();