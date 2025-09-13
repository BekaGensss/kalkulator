document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen DOM ---
    const display = document.getElementById('result');
    const buttons = document.querySelectorAll('.btn');
    const themeToggle = document.getElementById('theme-toggle');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    const body = document.body;
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');
    const modeToggle = document.getElementById('mode-toggle');
    const degreeModeDisplay = document.getElementById('degree-mode');
    const clickSound = document.getElementById('click-sound');
    const calculatorPanel = document.getElementById('calculator-panel');
    const historyPanel = document.getElementById('history');
    const progModeBtn = document.getElementById('prog-mode-btn');
    const convModeBtn = document.getElementById('conv-mode-btn');
    const histModeBtn = document.getElementById('hist-mode-btn');
    const programmerPanel = document.getElementById('programmer-panel');
    const conversionPanel = document.getElementById('conversion-panel');
    const copyBtn = document.getElementById('copy-btn');
    const backToCalcBtns = document.querySelectorAll('#back-to-calc, #back-to-calc-conv');
    const convType = document.getElementById('conv-type');
    const convInput = document.getElementById('conv-input');
    const convOutput = document.getElementById('conv-output');

    let currentExpression = '';
    let isDegreeMode = true;
    let memory = 0;
    
    // --- Logika Kalkulator ---
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.dataset.value;
            handleInput(value);
            clickSound.currentTime = 0;
            clickSound.play();
        });
    });

    // Dukungan Keyboard
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key >= '0' && key <= '9' || key === '.' || key === '(' || key === ')') {
            handleInput(key);
        } else if (['+', '-', '*', '/'].includes(key)) {
            handleInput(key);
        } else if (key === 'Enter' || key === '=') {
            handleInput('=');
        } else if (key === 'Backspace') {
            handleInput('←');
        } else if (key === 'c' || key === 'C') {
            handleInput('C');
        } else if (key === '^') {
            handleInput('^');
        }
    });

    function handleInput(value) {
        if (value === 'C') {
            currentExpression = '';
            display.value = '';
        } else if (value === '←') {
            currentExpression = currentExpression.slice(0, -1);
            display.value = currentExpression;
        } else if (value === '=') {
            try {
                let result = evaluateExpression(currentExpression);
                if (result === Infinity || result === -Infinity) {
                    throw new Error("Division by zero");
                }
                addHistory(currentExpression, result);
                display.value = formatResult(result);
                currentExpression = String(result);
            } catch (e) {
                display.value = 'Error';
                currentExpression = '';
            }
        } else if (value === 'MR') {
            currentExpression = String(memory);
            display.value = currentExpression;
        } else if (value === 'MC') {
            memory = 0;
        } else if (value === 'M+') {
            try { memory += parseFloat(evaluateExpression(currentExpression)); } catch(e) {}
        } else if (value === 'M-') {
            try { memory -= parseFloat(evaluateExpression(currentExpression)); } catch(e) {}
        } else if (value === '%') {
             try { 
                currentExpression = String(evaluateExpression(currentExpression) / 100);
                display.value = currentExpression;
            } catch(e) {
                display.value = 'Error';
                currentExpression = '';
            }
        } else if (value === '!') {
            try { 
                currentExpression = String(factorial(evaluateExpression(currentExpression)));
                display.value = currentExpression;
            } catch(e) {
                display.value = 'Error';
                currentExpression = '';
            }
        } else if (['sin', 'cos', 'tan', 'log', 'log2', 'exp', 'sqrt'].includes(value)) {
            if (currentExpression.match(/\d$/)) {
                currentExpression += '*';
            }
            if (value === 'exp') {
                currentExpression += `Math.exp(`;
            } else if (value === 'log2') {
                currentExpression += `Math.log2(`;
            } else {
                currentExpression += `Math.${value}(${isDegreeMode ? 'degToRad(' : ''}`;
            }
            display.value = currentExpression;
        } else if (value === 'pi') {
             if (currentExpression.match(/\d$/)) {
                currentExpression += '*';
            }
            currentExpression += Math.PI;
            display.value = currentExpression;
        } else if (value === '(') {
            if (currentExpression.match(/\d$/)) {
                currentExpression += '*(';
            } else {
                currentExpression += value;
            }
            display.value = currentExpression;
        } else {
            currentExpression += value;
            display.value = currentExpression;
        }
    }

    function factorial(n) {
        if (n < 0) return NaN;
        if (n === 0) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    function evaluateExpression(expr) {
        let result = 0;
        try {
            let cleanedExpr = expr.replace(/\^/g, `**`);
            cleanedExpr = cleanedExpr.replace(/pi/g, `Math.PI`);
            cleanedExpr = cleanedExpr.replace(/e/g, `Math.E`);
            
            result = eval(cleanedExpr);
            
            if (isNaN(result) || !isFinite(result)) {
                throw new Error("Invalid calculation");
            }
            
            return result;
        } catch (e) {
            throw new Error("Syntax Error");
        }
    }

    function degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    function formatResult(num) {
        if (num.toString().length > 15) {
            return num.toExponential(10);
        }
        return num;
    }
    
    // --- Fitur Histori ---
    function addHistory(expression, result) {
        const historyItem = document.createElement('div');
        historyItem.className = 'text-gray-300 border-b border-gray-600 py-1.5 px-1';
        historyItem.innerHTML = `<div class="text-xs text-gray-400">${expression} =</div> <div class="text-sm font-semibold">${formatResult(result)}</div>`;
        historyList.prepend(historyItem);
    }
    
    clearHistoryBtn.addEventListener('click', () => {
        historyList.innerHTML = '';
    });

    // --- Mode Derajat/Radian ---
    modeToggle.addEventListener('click', () => {
        isDegreeMode = !isDegreeMode;
        if (isDegreeMode) {
            modeToggle.textContent = 'Switch to Radian';
            degreeModeDisplay.textContent = 'DEG';
            degreeModeDisplay.classList.remove('hidden');
        } else {
            modeToggle.textContent = 'Switch to Degree';
            degreeModeDisplay.textContent = 'RAD';
        }
    });

    // --- Mode Gelap/Terang ---
    themeToggle.addEventListener('click', () => {
        const isLightMode = body.classList.toggle('light-mode');
        
        moonIcon.classList.toggle('hidden');
        sunIcon.classList.toggle('hidden');
        
        if (isLightMode) {
            calculatorPanel.style.backgroundColor = '#f3f4f6';
            historyPanel.style.backgroundColor = '#e5e7eb';
            programmerPanel.style.backgroundColor = '#f3f4f6';
            conversionPanel.style.backgroundColor = '#f3f4f6';
            particleColor = 'rgba(0, 0, 0, 0.3)';
        } else {
            calculatorPanel.style.backgroundColor = '#1f2937';
            historyPanel.style.backgroundColor = '#374151';
            programmerPanel.style.backgroundColor = '#1f2937';
            conversionPanel.style.backgroundColor = '#1f2937';
            particleColor = 'rgba(255, 255, 255, 0.3)';
        }
        
        initParticles();
    });
    
    // --- Fitur Salin Hasil ---
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(display.value).then(() => {
            alert('Hasil disalin!');
        }).catch(err => {
            console.error('Gagal menyalin: ', err);
        });
    });
    
    // --- Logika Mode (Mobile & Desktop) ---
    function switchMode(mode) {
        const isDesktop = window.matchMedia("(min-width: 768px)").matches;
        
        // Sembunyikan semua panel
        calculatorPanel.classList.add('hidden');
        programmerPanel.classList.add('hidden');
        conversionPanel.classList.add('hidden');
        
        // Di desktop, tampilkan histori
        if (isDesktop) {
            historyPanel.classList.remove('hidden');
            historyPanel.classList.add('md:block');
        } else {
            historyPanel.classList.add('hidden');
            historyPanel.classList.remove('md:block');
        }

        // Tampilkan panel yang dipilih
        if (mode === 'calc') {
            calculatorPanel.classList.remove('hidden');
            if (isDesktop) historyPanel.classList.remove('hidden');
        } else if (mode === 'programmer') {
            programmerPanel.classList.remove('hidden');
        } else if (mode === 'conversion') {
            conversionPanel.classList.remove('hidden');
        } else if (mode === 'history') {
            historyPanel.classList.remove('hidden');
        }
    }

    // Tombol untuk mengaktifkan mode
    progModeBtn.addEventListener('click', () => switchMode('programmer'));
    convModeBtn.addEventListener('click', () => switchMode('conversion'));
    histModeBtn.addEventListener('click', () => switchMode('history'));
    
    backToCalcBtns.forEach(btn => {
        btn.addEventListener('click', () => switchMode('calc'));
    });

    // --- Logika Programmer & Konversi ---
    const programmerButtons = programmerPanel.querySelectorAll('.prog-btn');
    programmerButtons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.dataset.value;
            let num = parseInt(display.value);
            if (isNaN(num)) return;
            
            if (value === 'DEC') { display.value = num.toString(10); }
            else if (value === 'BIN') { display.value = num.toString(2); }
            else if (value === 'OCT') { display.value = num.toString(8); }
            else if (value === 'HEX') { display.value = num.toString(16).toUpperCase(); }
            else if (value === 'LSH') { display.value = num << 1; }
            else if (value === 'RSH') { display.value = num >> 1; }
            else if (value === 'AND') { display.value = num & parseInt(currentExpression); }
            else if (value === 'OR') { display.value = num | parseInt(currentExpression); }
            else if (value === 'XOR') { display.value = num ^ parseInt(currentExpression); }
        });
    });
    
    convInput.addEventListener('input', updateConversion);
    convType.addEventListener('change', updateConversion);

    function updateConversion() {
        const val = parseFloat(convInput.value);
        const type = convType.value;
        let result = '';
        if (isNaN(val)) {
            convOutput.value = '';
            return;
        }

        if (type === 'temp') {
            result = (val * 9/5) + 32;
            convOutput.value = `${result.toFixed(2)} °F`;
        } else if (type === 'mass') {
            result = val / 1000;
            convOutput.value = `${result} Kg`;
        } else if (type === 'length') {
            result = val / 1000;
            convOutput.value = `${result} Km`;
        }
    }


    // --- Latar Belakang Partikel ---
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particleColor = 'rgba(255, 255, 255, 0.3)';

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particlesArray;

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x; this.y = y; this.directionX = directionX;
            this.directionY = directionY; this.size = size; this.color = color;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        update() {
            if (this.x + this.size > canvas.width || this.x - this.size < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y + this.size > canvas.height || this.y - this.size < 0) {
                this.directionY = -this.directionY;
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function initParticles() {
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 15000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 0.5;
            let x = (Math.random() * (innerWidth - size * 2)) + size;
            let y = (Math.random() * (innerHeight - size * 2)) + size;
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            particlesArray.push(new Particle(x, y, directionX, directionY, size, particleColor));
        }
    }

    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) ** 2) + ((particlesArray[a].y - particlesArray[b].y) ** 2);
                
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = particleColor.replace('0.3', opacityValue);
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        requestAnimationFrame(animateParticles);
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
    }

    initParticles();
    animateParticles();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    });
});