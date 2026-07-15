// Game State
let gameState = {
    selectedColors: new Set(),
    totalRolls: 0,
    lastRoll: [],
    diceCount: 4,
    isRolling: false
};

// All available colors
const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();
    loadGameState();
});

function initializeGame() {
    // Set up color items
    document.querySelectorAll('.color-item').forEach(item => {
        item.addEventListener('click', function() {
            toggleColor(this.dataset.color);
        });
    });

    // Buttons
    document.getElementById('rollBtn').addEventListener('click', rollDice);
    document.getElementById('megaBtn').addEventListener('click', megaRoll);
    document.getElementById('selectAllBtn').addEventListener('click', selectAllColors);
    document.getElementById('clearAllBtn').addEventListener('click', clearAllColors);
}

function setupEventListeners() {
    // Already set up in initialize
}

// Toggle color selection
function toggleColor(color) {
    const colorItem = document.querySelector(`[data-color="${color}"]`);
    
    if (gameState.selectedColors.has(color)) {
        gameState.selectedColors.delete(color);
        colorItem.classList.remove('selected');
    } else {
        gameState.selectedColors.add(color);
        colorItem.classList.add('selected');
    }
    
    updateStats();
    saveGameState();
    playSound('click');
}

// Select all colors
function selectAllColors() {
    COLORS.forEach(color => {
        gameState.selectedColors.add(color);
        document.querySelector(`[data-color="${color}"]`).classList.add('selected');
    });
    
    updateStats();
    saveGameState();
    playSound('success');
    showMessage('✅ All colors selected!', 'success');
}

// Clear all colors
function clearAllColors() {
    gameState.selectedColors.clear();
    document.querySelectorAll('.color-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    updateStats();
    saveGameState();
    playSound('click');
    showMessage('🔄 All colors cleared!', 'warning');
}

// Get available colors (not owned)
function getAvailableColors() {
    return COLORS.filter(color => !gameState.selectedColors.has(color));
}

// Roll dice
function rollDice() {
    if (gameState.isRolling) return;
    
    gameState.isRolling = true;
    document.getElementById('rollBtn').disabled = true;
    document.getElementById('megaBtn').disabled = true;
    
    const availableColors = getAvailableColors();
    
    if (availableColors.length === 0) {
        showMessage('⚠️ You own all colors! Nothing to roll!', 'warning');
        gameState.isRolling = false;
        document.getElementById('rollBtn').disabled = false;
        document.getElementById('megaBtn').disabled = false;
        return;
    }
    
    // Animate rolling
    const diceElements = document.querySelectorAll('.dice');
    const rollDuration = 600;
    const startTime = Date.now();
    
    // Animate dice spinning
    const spinInterval = setInterval(() => {
        diceElements.forEach(dice => {
            const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
            dice.setAttribute('data-color', randomColor);
        });
    }, 50);
    
    setTimeout(() => {
        clearInterval(spinInterval);
        
        // Get final results
        gameState.lastRoll = [];
        diceElements.forEach((dice, index) => {
            const availableColors = getAvailableColors();
            const finalColor = availableColors[Math.floor(Math.random() * availableColors.length)];
            dice.setAttribute('data-color', finalColor);
            dice.classList.add('pop');
            gameState.lastRoll.push(finalColor);
            
            setTimeout(() => {
                dice.classList.remove('pop');
            }, 400);
        });
        
        gameState.totalRolls++;
        updateStats();
        saveGameState();
        playSound('roll');
        
        gameState.isRolling = false;
        document.getElementById('rollBtn').disabled = false;
        document.getElementById('megaBtn').disabled = false;
        
        // Show result
        displayRollResult();
    }, rollDuration);
}

// Mega roll with more dice and effects
function megaRoll() {
    if (gameState.isRolling) return;
    
    gameState.isRolling = true;
    document.getElementById('rollBtn').disabled = true;
    document.getElementById('megaBtn').disabled = true;
    
    const availableColors = getAvailableColors();
    
    if (availableColors.length === 0) {
        showMessage('⚠️ You own all colors! Nothing to roll!', 'warning');
        gameState.isRolling = false;
        document.getElementById('rollBtn').disabled = false;
        document.getElementById('megaBtn').disabled = false;
        return;
    }
    
    showMessage('⚡ MEGA ROLL! ⚡', 'success');
    playSound('mega');
    
    const diceElements = document.querySelectorAll('.dice');
    const rollDuration = 1000;
    const startTime = Date.now();
    
    // More intense spinning
    const spinInterval = setInterval(() => {
        diceElements.forEach(dice => {
            const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
            dice.setAttribute('data-color', randomColor);
            dice.style.transform = `rotate(${Math.random() * 360}deg) scale(${1 + Math.random() * 0.2})`;
        });
    }, 30);
    
    setTimeout(() => {
        clearInterval(spinInterval);
        
        // Get final results
        gameState.lastRoll = [];
        diceElements.forEach((dice, index) => {
            const availableColors = getAvailableColors();
            const finalColor = availableColors[Math.floor(Math.random() * availableColors.length)];
            dice.setAttribute('data-color', finalColor);
            dice.style.transform = 'rotate(0deg) scale(1)';
            dice.classList.add('pop');
            gameState.lastRoll.push(finalColor);
            
            // Create particle effect
            createParticles(dice);
            
            setTimeout(() => {
                dice.classList.remove('pop');
            }, 400);
        });
        
        gameState.totalRolls++;
        updateStats();
        saveGameState();
        playSound('mega-end');
        
        gameState.isRolling = false;
        document.getElementById('rollBtn').disabled = false;
        document.getElementById('megaBtn').disabled = false;
        
        // Show result
        displayRollResult();
    }, rollDuration);
}

// Display roll result
function displayRollResult() {
    if (gameState.lastRoll.length === 0) return;
    
    const colorEmojis = {
        red: '🔴',
        orange: '🟠',
        yellow: '🟡',
        green: '🟢',
        blue: '🔵',
        purple: '🟣'
    };
    
    const rollDisplay = gameState.lastRoll.map(c => colorEmojis[c]).join(' ');
    showMessage(`🎲 Rolled: ${rollDisplay}`, 'success');
}

// Create particle effects
function createParticles(element) {
    const rect = element.getBoundingClientRect();
    const colors = ['#ff1744', '#ff6d00', '#ffea00', '#00e676', '#2979ff', '#d500f9'];
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '50%';
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 8;
        const velocity = 5;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let x = parseFloat(particle.style.left);
        let y = parseFloat(particle.style.top);
        let life = 1;
        
        const animate = () => {
            x += vx;
            y += vy;
            life -= 0.05;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = life;
            
            if (life > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        animate();
    }
}

// Update statistics
function updateStats() {
    document.getElementById('totalRolls').textContent = gameState.totalRolls;
    document.getElementById('selectedCount').textContent = gameState.selectedColors.size + '/6';
    
    const colorEmojis = {
        red: '🔴',
        orange: '🟠',
        yellow: '🟡',
        green: '🟢',
        blue: '🔵',
        purple: '🟣'
    };
    
    if (gameState.lastRoll.length > 0) {
        const lastRollDisplay = gameState.lastRoll.map(c => colorEmojis[c]).join(' ');
        document.getElementById('lastRoll').textContent = lastRollDisplay;
    } else {
        document.getElementById('lastRoll').textContent = '—';
    }
}

// Show message
function showMessage(message, type = 'success') {
    const msgElement = document.getElementById('resultMsg');
    msgElement.textContent = message;
    msgElement.className = `result-msg show ${type}`;
    
    setTimeout(() => {
        msgElement.classList.remove('show');
    }, 3000);
}

// Play sound (simple beep)
function playSound(type = 'click') {
    // Create audio context if not exists
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    
    const now = audioContext.currentTime;
    
    if (type === 'click') {
        oscillator.frequency.setValueAtTime(400, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    } else if (type === 'success') {
        oscillator.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
    } else if (type === 'roll') {
        oscillator.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    } else if (type === 'mega') {
        // Multi-tone for mega
        oscillator.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
    } else if (type === 'mega-end') {
        oscillator.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        oscillator.start(now);
        oscillator.stop(now + 0.4);
    }
}

// Save game state to localStorage
function saveGameState() {
    const state = {
        selectedColors: Array.from(gameState.selectedColors),
        totalRolls: gameState.totalRolls,
        lastRoll: gameState.lastRoll
    };
    localStorage.setItem('colorDiceGameState', JSON.stringify(state));
}

// Load game state from localStorage
function loadGameState() {
    const saved = localStorage.getItem('colorDiceGameState');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            gameState.selectedColors = new Set(state.selectedColors || []);
            gameState.totalRolls = state.totalRolls || 0;
            gameState.lastRoll = state.lastRoll || [];
            
            // Update UI
            gameState.selectedColors.forEach(color => {
                document.querySelector(`[data-color="${color}"]`).classList.add('selected');
            });
            
            updateStats();
        } catch (e) {
            console.error('Error loading game state:', e);
        }
    }
}
