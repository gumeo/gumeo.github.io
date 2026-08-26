// Introduction slide specific animations

// Animate title slide on load
Reveal.on('ready', event => {
  if (event.currentSlide.classList.contains('title-slide')) {
    animateTitleSlide();
  }
});

// Animate when slides change
Reveal.on('slidechanged', event => {
  // Reset animations on previous slide
  if (event.previousSlide) {
    resetSlideAnimations(event.previousSlide);
  }
  
  // Trigger animations for current slide
  const slideId = event.currentSlide.getAttribute('id');
  
  switch(slideId) {
    case 'title-slide':
      animateTitleSlide();
      break;
    case 'revolution-slide':
      animateRevolutionSlide();
      break;
    case 'structure-slide':
      animateCourseStructure();
      break;
  }
});

// Title slide animation
function animateTitleSlide() {
  const slide = document.querySelector('.title-slide');
  if (!slide) return;
  
  // Animate main title
  animationLib.fadeIn(slide.querySelector('h1'), 500, 0);
  
  // Animate all paragraphs (including subtitle)
  const paragraphs = slide.querySelectorAll('p');
  paragraphs.forEach((p, index) => {
    if (index === 0) {
      // First paragraph (subtitle) slides in from bottom
      animationLib.slideIn(p, 'bottom', 500, 300);
    } else {
      // Other paragraphs fade in
      animationLib.fadeIn(p, 400, 600 + index * 200);
    }
  });
}

// Revolution slide timeline animation
function animateRevolutionSlide() {
  if (!Reveal.getCurrentSlide) return;
  const slide = Reveal.getCurrentSlide();
  if (!slide || !slide.querySelector('.timeline')) return;
  
  // Create timeline visualization
  const timeline = slide.querySelector('.timeline');
  
  // Animate timeline points
  animationLib.sequentialReveal('.timeline-point', 200);
}

// Course structure animation
function animateCourseStructure() {
  if (!Reveal.getCurrentSlide) return;
  const slide = Reveal.getCurrentSlide();
  if (!slide) return;
  
  const parts = slide.querySelectorAll('.course-roadmap > div');
  
  parts.forEach((part, index) => {
    animationLib.slideIn(part, 'left', 400, index * 200);
  });
}

// Reset animations when leaving a slide
function resetSlideAnimations(slide) {
  // Reset opacity and transforms
  const elements = slide.querySelectorAll('*');
  elements.forEach(el => {
    if (el.style.opacity !== undefined) {
      el.style.opacity = '';
    }
    if (el.style.transform !== undefined) {
      el.style.transform = '';
    }
  });
}

// Add particle effect to emphasis boxes on hover
document.addEventListener('DOMContentLoaded', () => {
  const emphasisBoxes = document.querySelectorAll('.emphasis-box');
  
  emphasisBoxes.forEach(box => {
    box.addEventListener('mouseenter', (e) => {
      animationLib.createParticles(box, 10, {
        color: '#3498db',
        size: 3,
        spread: 50,
        duration: 800
      });
    });
  });
});

// Animate learning objectives when they appear
Reveal.on('fragmentshown', event => {
  if (event.fragment.closest('.learning-objectives')) {
    animationLib.highlight(event.fragment, '#2ecc71', 300);
  }
});

// Removed unused hover effects - now using inline HTML tooltips instead

// Counter animation for statistics
function animateStatistics() {
  const stats = document.querySelectorAll('.stat-number');
  
  stats.forEach(stat => {
    const endValue = parseInt(stat.getAttribute('data-value'));
    animationLib.countUp(stat, 0, endValue, 1500);
  });
}

// Create a visual effect when error gets very low
let hasAchievedPerfect = false;
setInterval(() => {
  const errorElement = document.getElementById('error-value');
  if (errorElement && errorElement.textContent.includes('Perfect') && !hasAchievedPerfect) {
    hasAchievedPerfect = true;
    const container = document.querySelector('#tuner-container');
    if (container) {
      // Create particle celebration
      animationLib.createParticles(container, 30, {
        color: '#2ecc71',
        size: 6,
        spread: 200,
        duration: 2000,
        gravity: 0.2
      });
      
      // Flash success message
      const successMsg = document.createElement('div');
      successMsg.textContent = 'Perfect Match! 🎯';
      successMsg.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 2.5em;
        color: var(--color-success);
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 0 0 20px var(--color-success);
      `;
      container.appendChild(successMsg);
      
      animationLib.fadeIn(successMsg, 300).then(() => {
        setTimeout(() => {
          successMsg.style.transition = 'opacity 300ms';
          successMsg.style.opacity = '0';
          setTimeout(() => successMsg.remove(), 300);
        }, 2000);
      });
    }
  } else if (errorElement && !errorElement.textContent.includes('Perfect')) {
    hasAchievedPerfect = false;
  }
}, 100);