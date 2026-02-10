// Constants
const ACTIONS = ['left', 'center', 'right'];
const STATES = ['left', 'center', 'right', 'start']; // 'start' for the very first move

class RLAgent {
    constructor() {
        this.qTable = {};
        this.learningRate = 0.1; // Alpha
        this.discountFactor = 0.95; // Gamma
        this.epsilon = 0.1; // Exploration rate
        
        // Initialize Q-Table
        STATES.forEach(state => {
            this.qTable[state] = {};
            ACTIONS.forEach(action => {
                this.qTable[state][action] = 0;
            });
        });
    }

    chooseAction(state) {
        // Epsilon-greedy strategy
        if (Math.random() < this.epsilon) {
            // Explore
            const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
            console.log(`Exploiting: ${randomAction} (Random)`);
            return randomAction;
        } else {
            // Exploit
            let bestAction = ACTIONS[0];
            let maxVal = this.qTable[state][bestAction];
            
            for (let action of ACTIONS) {
                if (this.qTable[state][action] > maxVal) {
                    maxVal = this.qTable[state][action];
                    bestAction = action;
                }
            }
            console.log(`Exploiting: ${bestAction} (Q-Value: ${maxVal})`);
            return bestAction;
        }
    }

    learn(state, action, reward, nextState) {
        const currentQ = this.qTable[state][action];
        
        // Find max Q for next state
        let maxNextQ = -Infinity;
        for (let nextAction of ACTIONS) {
            if (this.qTable[nextState][nextAction] > maxNextQ) {
                maxNextQ = this.qTable[nextState][nextAction];
            }
        }
        
        // Q-Learning update rule
        const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
        this.qTable[state][action] = newQ;
        
        return newQ;
    }

    getQValue(state, action) {
        return this.qTable[state][action];
    }
}

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Load or create assets (simple shapes for now)
        this.goalColor = '#333';
        this.netColor = '#444';
    }

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawField() {
        const { width, height } = this.canvas;
        
        // Draw Grass (Dark artificial turf)
        this.ctx.fillStyle = '#111812';
        this.ctx.fillRect(0, height * 0.4, width, height * 0.6);
        
        // Draw Field Lines
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(width * 0.1, height * 0.4);
        this.ctx.lineTo(width * 0.9, height * 0.4);
        this.ctx.lineTo(width * 0.8, height);
        this.ctx.lineTo(width * 0.2, height);
        this.ctx.closePath();
        this.ctx.stroke();

        // Draw Goal Post
        const goalWidth = width * 0.4;
        const goalHeight = height * 0.25;
        const goalX = (width - goalWidth) / 2;
        const goalY = height * 0.15; // Raised a bit

        this.ctx.strokeStyle = '#00f3ff';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(goalX, goalY, goalWidth, goalHeight);
        
        // Net pattern
        this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = goalX; i <= goalX + goalWidth; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, goalY);
            this.ctx.lineTo(i, goalY + goalHeight);
            this.ctx.stroke();
        }
        for (let i = goalY; i <= goalY + goalHeight; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(goalX, i);
            this.ctx.lineTo(goalX + goalWidth, i);
            this.ctx.stroke();
        }
    }

    drawKeeper(x, y, color = '#ff00ff') {
        // Simple circle keeper for now
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Glow
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 15;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    drawBall(x, y) {
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.agent = new RLAgent();
        this.renderer = new Renderer(this.canvas);
        
        this.score = 0;
        this.episodes = 0;
        this.saves = 0;
        this.prevState = 'start';
        
        this.isAnimating = false;
        
        this.initUI();
        this.updateStats();
        
        // Initial render
        requestAnimationFrame(() => this.loop());
    }

    initUI() {
        document.querySelectorAll('.shoot-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.isAnimating) return;
                const dir = e.currentTarget.dataset.dir;
                this.playRound(dir);
            });
        });
    }

    async playRound(playerAction) {
        this.isAnimating = true;
        this.episodes++;
        
        // Agent decides where to dive based on PREVIOUS state
        const agentAction = this.agent.chooseAction(this.prevState);
        
        // Animate Shot & Dive
        await this.animateMove(playerAction, agentAction);
        
        // Determine Outcome
        // If directions match -> Save (Reward 1)
        // If distinct -> Goal (Penalty -1)
        // NOTE: In this simplified game, "left" player shot means shooting to the left side of the goal.
        // "left" keeper dive means diving to that same side to block.
        let reward = 0;
        let resultText = "";
        
        if (playerAction === agentAction) {
            // SAVE
            reward = 1;
            this.saves++;
            resultText = "SAVED!";
            this.showOverlay(resultText, '#ff00ff');
        } else {
            // GOAL
            reward = -1;
            this.score++;
            resultText = "GOAL!";
            this.showOverlay(resultText, '#00ff66');
        }
        
        // Update Agent Learning
        // Current State: this.prevState
        // Action Taken: agentAction
        // Reward: reward
        // Next State: playerAction (The player's move becomes the new state context)
        this.agent.learn(this.prevState, agentAction, reward, playerAction);
        
        // Update UI
        this.updateStats();
        this.updateQTableViz();
        
        // Update State for next round
        this.prevState = playerAction;
        
        this.isAnimating = false;
    }

    animateMove(playerDir, agentDir) {
        return new Promise(resolve => {
            let progress = 0;
            const startBallY = this.canvas.height * 0.8;
            const endBallY = this.canvas.height * 0.25; // Goal line
            
            const startBallX = this.canvas.width * 0.5;
            let endBallX = startBallX;
            
            if (playerDir === 'left') endBallX = this.canvas.width * 0.35;
            if (playerDir === 'right') endBallX = this.canvas.width * 0.65;
            
            // Agent position logic
            const keeperY = this.canvas.height * 0.25;
            const startKeeperX = this.canvas.width * 0.5;
            let endKeeperX = startKeeperX;
             if (agentDir === 'left') endKeeperX = this.canvas.width * 0.35;
            if (agentDir === 'right') endKeeperX = this.canvas.width * 0.65;

            const animate = () => {
                progress += 0.05;
                if (progress > 1) {
                    resolve();
                    return;
                }
                
                this.renderer.clear();
                this.renderer.drawField();
                
                // Interpolate Ball
                const currBallX = startBallX + (endBallX - startBallX) * progress;
                const currBallY = startBallY + (endBallY - startBallY) * progress;
                
                // Interpolate Keeper
                const currKeeperX = startKeeperX + (endKeeperX - startKeeperX) * progress;
                
                this.renderer.drawKeeper(currKeeperX, keeperY);
                this.renderer.drawBall(currBallX, currBallY);
                
                requestAnimationFrame(animate);
            };
            animate();
        });
    }

    showOverlay(text, color) {
        const overlay = document.getElementById('messageOverlay');
        const title = document.getElementById('roundResult');
        title.textContent = text;
        title.style.color = color;
        
        overlay.classList.add('visible');
        setTimeout(() => {
            overlay.classList.remove('visible');
        }, 1000);
    }

    updateStats() {
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('episodeDisplay').textContent = this.episodes;
        
        const rate = this.episodes > 0 ? ((this.saves / this.episodes) * 100).toFixed(1) : 0;
        document.getElementById('saveRateDisplay').textContent = `${rate}%`;
        
        document.getElementById('currentStateDisplay').textContent = this.prevState.toUpperCase();
        document.getElementById('epsilonDisplay').textContent = this.agent.epsilon;
    }

    updateQTableViz() {
        STATES.forEach(state => {
            if (state === 'start') return; // skip start row for simplicity or add it if needed
            
            ACTIONS.forEach(action => {
                const val = this.agent.getQValue(state, action).toFixed(2);
                let idCharState = state.charAt(0).toUpperCase();
                let idCharAction = action.charAt(0).toUpperCase();
                
                const cell = document.getElementById(`q-${idCharState}-${idCharAction}`);
                if (cell) {
                    cell.textContent = val;
                    
                    // Colorize based on value
                    const v = parseFloat(val);
                    if (v > 0) cell.style.background = `rgba(0, 243, 255, ${Math.min(v, 1)})`; // Blue for good
                    else if (v < 0) cell.style.background = `rgba(255, 0, 100, ${Math.min(Math.abs(v), 1)})`; // Red for bad
                    else cell.style.background = '#0f1018';
                }
            });
        });
    }

    loop() {
        if (!this.isAnimating) {
            this.renderer.clear();
            this.renderer.drawField();
            // Draw idle keeper
            this.renderer.drawKeeper(this.canvas.width * 0.5, this.canvas.height * 0.25);
            // Draw ball at start
            this.renderer.drawBall(this.canvas.width * 0.5, this.canvas.height * 0.8);
        }
        requestAnimationFrame(() => this.loop());
    }
}

// Start Game
window.onload = () => {
    new Game();
};