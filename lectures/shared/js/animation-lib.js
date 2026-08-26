// Animation library for Deep Learning course presentations

const animationLib = {
  // Fade in animation
  fadeIn: function(element, duration = 300, delay = 0) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) {
      console.warn('animationLib.fadeIn: Element not found');
      return Promise.resolve();
    }
    
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    
    setTimeout(() => {
      element.style.opacity = '1';
    }, delay);
    
    return new Promise(resolve => {
      setTimeout(resolve, duration + delay);
    });
  },

  // Slide in animation from direction
  slideIn: function(element, direction = 'left', duration = 300, delay = 0) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) {
      console.warn('animationLib.slideIn: Element not found');
      return Promise.resolve();
    }
    
    const transforms = {
      left: 'translateX(-50px)',
      right: 'translateX(50px)',
      top: 'translateY(-50px)',
      bottom: 'translateY(50px)'
    };
    
    element.style.opacity = '0';
    element.style.transform = transforms[direction];
    element.style.transition = `all ${duration}ms ease-out`;
    
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translate(0)';
    }, delay);
    
    return new Promise(resolve => {
      setTimeout(resolve, duration + delay);
    });
  },

  // Pulse animation
  pulseAnimation: function(element, duration = 1000, scale = 1.1) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) {
      console.warn('animationLib.pulseAnimation: Element not found');
      return Promise.resolve();
    }
    
    element.style.transition = `transform ${duration/2}ms ease-in-out`;
    element.style.transform = `scale(${scale})`;
    
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, duration/2);
    
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  },

  // Stagger animation for multiple elements
  staggerAnimation: function(elements, animationFn, staggerDelay = 100) {
    const promises = [];
    
    elements.forEach((element, index) => {
      const delay = index * staggerDelay;
      const promise = animationFn(element, delay);
      promises.push(promise);
    });
    
    return Promise.all(promises);
  },

  // Type writer effect
  typeWriter: function(element, text, speed = 50) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    element.innerHTML = '';
    let i = 0;
    
    return new Promise(resolve => {
      const timer = setInterval(() => {
        if (i < text.length) {
          element.innerHTML += text.charAt(i);
          i++;
        } else {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  },

  // Counter animation
  countUp: function(element, start = 0, end = 100, duration = 1000) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;
    
    return new Promise(resolve => {
      const timer = setInterval(() => {
        current += increment;
        
        if (current >= end) {
          element.textContent = end;
          clearInterval(timer);
          resolve();
        } else {
          element.textContent = Math.floor(current);
        }
      }, 16);
    });
  },

  // Highlight element with glow
  highlight: function(element, color = '#3498db', duration = 500) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    const originalBoxShadow = element.style.boxShadow;
    element.style.transition = `box-shadow ${duration}ms ease-in-out`;
    element.style.boxShadow = `0 0 20px ${color}`;
    
    return new Promise(resolve => {
      setTimeout(() => {
        element.style.boxShadow = originalBoxShadow;
        setTimeout(resolve, duration);
      }, duration);
    });
  },

  // Shake animation
  shake: function(element, intensity = 5, duration = 300) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    const originalTransform = element.style.transform;
    const shakes = 4;
    const interval = duration / shakes;
    
    let count = 0;
    
    return new Promise(resolve => {
      const timer = setInterval(() => {
        if (count < shakes) {
          const x = (Math.random() - 0.5) * intensity * 2;
          const y = (Math.random() - 0.5) * intensity * 2;
          element.style.transform = `translate(${x}px, ${y}px)`;
          count++;
        } else {
          element.style.transform = originalTransform;
          clearInterval(timer);
          resolve();
        }
      }, interval);
    });
  },

  // Morph between two states
  morph: function(element, fromState, toState, duration = 500) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    // Apply from state
    Object.assign(element.style, fromState);
    
    // Prepare transition
    const properties = Object.keys(toState).join(', ');
    element.style.transition = `${properties} ${duration}ms ease-in-out`;
    
    // Apply to state
    return new Promise(resolve => {
      setTimeout(() => {
        Object.assign(element.style, toState);
        setTimeout(resolve, duration);
      }, 10);
    });
  },

  // Create particle effect
  createParticles: function(container, count = 20, options = {}) {
    const defaults = {
      color: '#3498db',
      size: 4,
      spread: 100,
      duration: 1000,
      gravity: 0.5
    };
    
    const config = { ...defaults, ...options };
    
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    
    const particles = [];
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = config.size + 'px';
      particle.style.height = config.size + 'px';
      particle.style.backgroundColor = config.color;
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      
      const angle = (Math.PI * 2 * i) / count;
      const velocity = {
        x: Math.cos(angle) * config.spread,
        y: Math.sin(angle) * config.spread
      };
      
      container.appendChild(particle);
      particles.push({ element: particle, velocity });
    }
    
    // Animate particles
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / config.duration;
      
      if (progress < 1) {
        particles.forEach(p => {
          const x = p.velocity.x * progress;
          const y = p.velocity.y * progress + (config.gravity * progress * progress * 100);
          const opacity = 1 - progress;
          
          p.element.style.transform = `translate(${x}px, ${y}px)`;
          p.element.style.opacity = opacity;
        });
        
        requestAnimationFrame(animate);
      } else {
        particles.forEach(p => p.element.remove());
      }
    };
    
    animate();
  },

  // Sequential reveal
  sequentialReveal: function(selector, delay = 100) {
    const elements = document.querySelectorAll(selector);
    const promises = [];
    
    elements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      
      const promise = new Promise(resolve => {
        setTimeout(() => {
          element.style.transition = 'all 300ms ease-out';
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
          setTimeout(resolve, 300);
        }, index * delay);
      });
      
      promises.push(promise);
    });
    
    return Promise.all(promises);
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = animationLib;
}