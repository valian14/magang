

class CodingGame {
    constructor() {
        this.currentLevel = 1;
        this.score = 0;
        this.carPosition = { x: 0, y: 9 };
        this.currentLanguage = 'python';
        this.currentMode = 'code'; // 'code' or 'text'
        this.isRunning = false;
        this.levels = this.generateLevels();
        this.initializeGame();
        this.setupEventListeners();
    }

    generateLevels() {
        const levels = [];
        
        // Level 1 - mudah, finish tetap
        levels.push({
            obstacles: [
                {x: 2, y: 8}, {x: 3, y: 6}, {x: 5, y: 7}, {x: 6, y: 4}
            ],
            finish: {x: 9, y: 0}
        });

        // Level 2-10 dengan finish dan obstacles random
        for (let i = 2; i <= 10; i++) {
            const numObstacles = Math.min(5 + i, 15);
            const obstacles = [];
            const finish = {
                x: Math.floor(Math.random() * 10),
                y: Math.floor(Math.random() * 8)
            };

            // Generate obstacles
            while (obstacles.length < numObstacles) {
                const obstacle = {
                    x: Math.floor(Math.random() * 10),
                    y: Math.floor(Math.random() * 10)
                };

                // Pastikan tidak di posisi start atau finish
                if ((obstacle.x !== 0 || obstacle.y !== 9) && 
                    (obstacle.x !== finish.x || obstacle.y !== finish.y) &&
                    !obstacles.some(obs => obs.x === obstacle.x && obs.y === obstacle.y)) {
                    obstacles.push(obstacle);
                }
            }

            levels.push({ obstacles, finish });
        }

        return levels;
    }

    initializeGame() {
        this.createGrid();
        this.loadLevel(this.currentLevel);
        this.updateDisplay();
    }

    createGrid() {
        const board = document.getElementById('gameBoard');
        // Membersihkan grid lama
        const oldCells = board.querySelectorAll('.grid-cell');
        oldCells.forEach(cell => cell.remove());

        const boardRect = board.getBoundingClientRect();
        const cellSize = Math.min(boardRect.width, boardRect.height) / 10;

        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                if (window.innerWidth <= 768) {
                    // Mobile responsive positioning
                    cell.style.left = `${col * (boardRect.width / 10)}px`;
                    cell.style.top = `${row * (boardRect.height / 10)}px`;
                    cell.style.width = `${boardRect.width / 10 - 1}px`;
                    cell.style.height = `${boardRect.height / 10 - 1}px`;
                } else {
                    // Desktop positioning
                    cell.style.left = `${col * 50 + 5}px`;
                    cell.style.top = `${row * 50 + 5}px`;
                }
                
                board.appendChild(cell);
            }
        }
    }

    loadLevel(level) {
        const board = document.getElementById('gameBoard');
        
        // Hapus obstacles dan finish lama
        board.querySelectorAll('.obstacle, .finish').forEach(el => el.remove());

        const levelData = this.levels[level - 1];
        const boardRect = board.getBoundingClientRect();
        const isMobile = window.innerWidth <= 768;
        
        // Tambahkan obstacles
        levelData.obstacles.forEach(obs => {
            const obstacle = document.createElement('div');
            obstacle.className = 'obstacle';
            
            if (isMobile) {
                obstacle.style.left = `${obs.x * (boardRect.width / 10) + 2}px`;
                obstacle.style.top = `${obs.y * (boardRect.height / 10) + 2}px`;
                obstacle.style.width = `${boardRect.width / 10 - 4}px`;
                obstacle.style.height = `${boardRect.height / 10 - 4}px`;
            } else {
                obstacle.style.left = `${obs.x * 50 + 10}px`;
                obstacle.style.top = `${obs.y * 50 + 10}px`;
            }
            
            board.appendChild(obstacle);
        });

        // Tambahkan finish
        const finish = document.createElement('div');
        finish.className = 'finish';
        
        if (isMobile) {
            finish.style.left = `${levelData.finish.x * (boardRect.width / 10) + 2}px`;
            finish.style.top = `${levelData.finish.y * (boardRect.height / 10) + 2}px`;
            finish.style.width = `${boardRect.width / 10 - 4}px`;
            finish.style.height = `${boardRect.height / 10 - 4}px`;
        } else {
            finish.style.left = `${levelData.finish.x * 50 + 10}px`;
            finish.style.top = `${levelData.finish.y * 50 + 10}px`;
        }
        
        board.appendChild(finish);

        // Reset posisi mobil
        this.carPosition = { x: 0, y: 9 };
        this.updateCarPosition();
    }

    updateCarPosition() {
        const car = document.getElementById('car');
        const board = document.getElementById('gameBoard');
        const boardRect = board.getBoundingClientRect();
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            car.style.left = `${this.carPosition.x * (boardRect.width / 10) + 2}px`;
            car.style.top = `${this.carPosition.y * (boardRect.height / 10) + 2}px`;
            car.style.width = `${boardRect.width / 10 - 4}px`;
            car.style.height = `${boardRect.height / 10 - 4}px`;
        } else {
            car.style.left = `${this.carPosition.x * 50 + 10}px`;
            car.style.top = `${this.carPosition.y * 50 + 10}px`;
        }
    }

    updateDisplay() {
        document.getElementById('level').textContent = this.currentLevel;
        document.getElementById('score').textContent = this.score;
    }

    parseCode(code) {
        const commands = [];
        const lines = code.trim().split('\n');

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            let match;
            
            if (this.currentMode === 'text') {
                // Text to Code mode: "up 2" or "right 3"
                match = line.match(/(\w+)\s+(\d+)/);
                if (match) {
                    const direction = match[1].toLowerCase();
                    const steps = parseInt(match[2]);
                    
                    if (['up', 'down', 'left', 'right'].includes(direction)) {
                        commands.push({ direction, steps });
                    }
                }
            } else {
                // Code to Text mode
                if (this.currentLanguage === 'python') {
                    match = line.match(/print\s*\(\s*["'](\w+)["']\s*,\s*(\d+)\s*\)/);
                } else if (this.currentLanguage === 'javascript') {
                    match = line.match(/console\.log\s*\(\s*["'](\w+)["']\s*,\s*(\d+)\s*\)/);
                } else if (this.currentLanguage === 'java') {
                    match = line.match(/System\.out\.println\s*\(\s*["'](\w+)["']\s*,\s*(\d+)\s*\)/);
                } else if (this.currentLanguage === 'cpp') {
                    match = line.match(/cout\s*<<\s*["'](\w+)["']\s*<<\s*["'],["']\s*<<\s*(\d+)/);
                }

                if (match) {
                    const direction = match[1].toLowerCase();
                    const steps = parseInt(match[2]);
                    
                    if (['up', 'down', 'left', 'right'].includes(direction)) {
                        commands.push({ direction, steps });
                    }
                }
            }
        }

        return commands;
    }

    async executeCommands(commands) {
        this.isRunning = true;
        
        for (let command of commands) {
            await this.movecar(command.direction, command.steps);
            
            if (this.checkCollision()) {
                this.showModal('loseModal');
                this.isRunning = false;
                return;
            }

            if (this.checkWin()) {
                this.handleWin();
                this.isRunning = false;
                return;
            }
        }
        
        this.isRunning = false;
    }

    async movecar(direction, steps) {
        for (let i = 0; i < steps; i++) {
            const newPosition = { ...this.carPosition };

            switch (direction) {
                case 'up':
                    newPosition.y = Math.max(0, newPosition.y - 1);
                    break;
                case 'down':
                    newPosition.y = Math.min(9, newPosition.y + 1);
                    break;
                case 'left':
                    newPosition.x = Math.max(0, newPosition.x - 1);
                    break;
                case 'right':
                    newPosition.x = Math.min(9, newPosition.x + 1);
                    break;
            }

            this.carPosition = newPosition;
            this.updateCarPosition();

            await new Promise(resolve => setTimeout(resolve, 500));

            if (this.checkCollision() || this.checkWin()) {
                break;
            }
        }
    }

    checkCollision() {
        const levelData = this.levels[this.currentLevel - 1];
        return levelData.obstacles.some(obs => 
            obs.x === this.carPosition.x && obs.y === this.carPosition.y
        );
    }

    checkWin() {
        const levelData = this.levels[this.currentLevel - 1];
        return levelData.finish.x === this.carPosition.x && 
               levelData.finish.y === this.carPosition.y;
    }

    handleWin() {
        this.score += this.currentLevel * 100;
        this.updateDisplay();
        this.createCelebration();
        
        document.getElementById('winTitle').textContent = `🎉 Level ${this.currentLevel} Success!`;
        document.getElementById('finalScore').textContent = this.score;
        
        setTimeout(() => {
            this.showModal('winModal');
        }, 1000);
    }

    createCelebration() {
        const celebration = document.getElementById('celebration');
        celebration.innerHTML = '';

        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            celebration.appendChild(confetti);
        }

        setTimeout(() => {
            celebration.innerHTML = '';
        }, 3000);
    }

    nextLevel() {
        if (this.currentLevel < 10) {
            this.currentLevel++;
            this.loadLevel(this.currentLevel);
            this.updateDisplay();
            this.closeModal('winModal');
            
            // Clear code panel when advancing to next level
            document.getElementById('codeInput').value = '';
        } else {
            alert('Selamat! Anda telah menyelesaikan semua level!');
            this.restartGame();
        }
    }

    restartLevel() {
        this.loadLevel(this.currentLevel);
        this.closeModal('loseModal');
    }

    restartGame() {
        this.currentLevel = 1;
        this.score = 0;
        this.loadLevel(this.currentLevel);
        this.updateDisplay();
        this.closeModal('winModal');
    }

    switchMode(mode) {
        this.currentMode = mode;
        const codeBtn = document.getElementById('mode-code');
        const textBtn = document.getElementById('mode-text');
        const languageButtons = document.getElementById('language-buttons');
        const textTemplates = document.getElementById('textTemplates');
        const display = document.getElementById('language-display');
        const codeInput = document.getElementById('codeInput');

        if (mode === 'code') {
            codeBtn.classList.add('active');
            textBtn.classList.remove('active');
            languageButtons.style.display = 'flex';
            textTemplates.classList.remove('show');
            
            this.updateCodePlaceholder();
            display.textContent = this.getLanguageName() + ' (Code to Text)';
        } else {
            textBtn.classList.add('active');
            codeBtn.classList.remove('active');
            languageButtons.style.display = 'none';
            textTemplates.classList.add('show');
            
            codeInput.placeholder = `Masukkan perintah di sini...
Contoh:
up 2
right 3
down 1

Atau klik template di atas!`;
            display.textContent = 'Text to Code';
        }

        // Clear input when switching modes
        codeInput.value = '';
    }

    getLanguageName() {
        switch(this.currentLanguage) {
            case 'python': return 'Python';
            case 'javascript': return 'JavaScript';
            case 'java': return 'Java';
            case 'cpp': return 'C++';
            default: return 'Python';
        }
    }

    updateCodePlaceholder() {
        const codeInput = document.getElementById('codeInput');
        
        switch(this.currentLanguage) {
            case 'python':
                codeInput.placeholder = `Masukkan kode di sini...
Contoh:
print('up', 2)
print('right', 3)
print('down', 1)`;
                break;
            case 'javascript':
                codeInput.placeholder = `Masukkan kode di sini...
Contoh:
console.log('up', 2)
console.log('right', 3)
console.log('down', 1)`;
                break;
            case 'java':
                codeInput.placeholder = `Masukkan kode di sini...
Contoh:
System.out.println('up', 2)
System.out.println('right', 3)
System.out.println('down', 1)`;
                break;
            case 'cpp':
                codeInput.placeholder = `Masukkan kode di sini...
Contoh:
cout << 'up' << ',' << 2
cout << 'right' << ',' << 3
cout << 'down' << ',' << 1`;
                break;
        }
    }

    switchLanguage(language) {
        if (this.currentMode === 'text') return; // Don't switch language in text mode
        
        this.currentLanguage = language;
        
        // Update active button
        document.querySelectorAll('[id^="lang-"]').forEach(btn => btn.classList.remove('active'));
        document.getElementById('lang-' + language).classList.add('active');
        
        const display = document.getElementById('language-display');
        display.textContent = this.getLanguageName() + ' (Code to Text)';
        
        this.updateCodePlaceholder();
        this.updateModalContent();
    }

    updateModalContent() {
        const helpSyntax = document.getElementById('help-syntax');
        const example1 = document.getElementById('example1');
        const example2 = document.getElementById('example2');
        const example3 = document.getElementById('example3');

        if (this.currentMode === 'text') {
            helpSyntax.textContent = 'up jumlah_langkah';
            example1.innerHTML = 'right 3<br>up 2';
            example2.innerHTML = 'up 1<br>right 2<br>down 1<br>right 2';
            example3.innerHTML = 'right 1<br>up 3<br>right 2<br>down 1';
        } else {
            switch(this.currentLanguage) {
                case 'python':
                    helpSyntax.textContent = 'print("up", jumlah_langkah)';
                    example1.innerHTML = 'print("right", 3)<br>print("up", 2)';
                    example2.innerHTML = 'print("up", 1)<br>print("right", 2)<br>print("down", 1)<br>print("right", 2)';
                    example3.innerHTML = 'print("right", 1)<br>print("up", 3)<br>print("right", 2)<br>print("down", 1)';
                    break;
                case 'javascript':
                    helpSyntax.textContent = 'console.log("up", jumlah_langkah)';
                    example1.innerHTML = 'console.log("right", 3)<br>console.log("up", 2)';
                    example2.innerHTML = 'console.log("up", 1)<br>console.log("right", 2)<br>console.log("down", 1)<br>console.log("right", 2)';
                    example3.innerHTML = 'console.log("right", 1)<br>console.log("up", 3)<br>console.log("right", 2)<br>console.log("down", 1)';
                    break;
                case 'java':
                    helpSyntax.textContent = 'System.out.println("up", jumlah_langkah)';
                    example1.innerHTML = 'System.out.println("right", 3)<br>System.out.println("up", 2)';
                    example2.innerHTML = 'System.out.println("up", 1)<br>System.out.println("right", 2)<br>System.out.println("down", 1)<br>System.out.println("right", 2)';
                    example3.innerHTML = 'System.out.println("right", 1)<br>System.out.println("up", 3)<br>System.out.println("right", 2)<br>System.out.println("down", 1)';
                    break;
                case 'cpp':
                    helpSyntax.textContent = 'cout << "up" << "," << jumlah_langkah';
                    example1.innerHTML = 'cout << "right" << "," << 3<br>cout << "up" << "," << 2';
                    example2.innerHTML = 'cout << "up" << "," << 1<br>cout << "right" << "," << 2<br>cout << "down" << "," << 1<br>cout << "right" << "," << 2';
                    example3.innerHTML = 'cout << "right" << "," << 1<br>cout << "up" << "," << 3<br>cout << "right" << "," << 2<br>cout << "down" << "," << 1';
                    break;
            }
        }
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    setupEventListeners() {
        document.getElementById('runBtn').addEventListener('click', () => {
            if (this.isRunning) return;
            
            const code = document.getElementById('codeInput').value;
            const commands = this.parseCode(code);
            
            if (commands.length === 0) {
                alert('Kode tidak valid! Pastikan format kode benar.');
                return;
            }
            
            this.executeCommands(commands);
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            if (this.isRunning) return;
            this.carPosition = { x: 0, y: 9 };
            this.updateCarPosition();
        });

        document.getElementById('helpBtn').addEventListener('click', () => {
            this.showModal('helpModal');
        });

        document.getElementById('examplesBtn').addEventListener('click', () => {
            this.showModal('examplesModal');
        });

        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            this.nextLevel();
        });

        // Mode switches
        document.getElementById('mode-code').addEventListener('click', () => {
            this.switchMode('code');
        });

        document.getElementById('mode-text').addEventListener('click', () => {
            this.switchMode('text');
        });

        // Language switches
        document.getElementById('lang-python').addEventListener('click', () => {
            this.switchLanguage('python');
        });

        document.getElementById('lang-javascript').addEventListener('click', () => {
            this.switchLanguage('javascript');
        });

        document.getElementById('lang-java').addEventListener('click', () => {
            this.switchLanguage('java');
        });

        document.getElementById('lang-cpp').addEventListener('click', () => {
            this.switchLanguage('cpp');
        });

        // Template button event listeners
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const direction = btn.getAttribute('data-direction');
                this.addTextCommand(direction);
            });
        });

        // Handle window resize for responsive design
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        // Recreate grid and reposition elements on resize
        setTimeout(() => {
            this.createGrid();
            this.loadLevel(this.currentLevel);
        }, 100);
    }

    addTextCommand(direction) {
        const codeInput = document.getElementById('codeInput');
        const steps = prompt(`Berapa langkah untuk bergerak ${direction}?`, '1');
        
        if (steps && !isNaN(steps) && parseInt(steps) > 0) {
            const command = `${direction} ${steps}\n`;
            codeInput.value += command;
            codeInput.focus();
            // Move cursor to end
            codeInput.setSelectionRange(codeInput.value.length, codeInput.value.length);
        }
    }
}

// Global functions
function startGame() {
    document.getElementById('welcomeModal').style.display = 'none';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function restartLevel() {
    game.restartLevel();
}

function addTextCommand(direction) {
    // This function is now handled by the class method
    // Keeping this for backward compatibility but it won't be used
    if (window.game) {
        window.game.addTextCommand(direction);
    }
}

// Initialize game
let game;
window.addEventListener('load', () => {
    game = new CodingGame();
    window.game = game; // Make game accessible globally for template buttons
});

