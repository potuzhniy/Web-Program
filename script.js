function updateSystemMetrics() {
    const cpuLoad = (20 + Math.random() * 20).toFixed(1);
    const memoryUsed = (2.5 + Math.random() * 1.5).toFixed(1);
    const networkIO = (80 + Math.random() * 100).toFixed(0);
    const storageUsed = (1.1 + Math.random() * 0.2).toFixed(1);
    
    document.getElementById('cpu-load').textContent = `${cpuLoad}%`;
    document.getElementById('memory-usage').textContent = `${memoryUsed}/16GB`;
    document.getElementById('network-io').textContent = `${networkIO} Mbps`;
    document.getElementById('storage').textContent = `${storageUsed}/2TB`;
}

setInterval(updateSystemMetrics, 2000);

const realtimeCtx = document.getElementById('realtimeChart').getContext('2d');
const realtimeChart = new Chart(realtimeCtx, {
    type: 'line',
    data: {
        labels: Array(20).fill(''),
        datasets: [{
            label: 'Data Stream',
            data: Array(20).fill(0),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: { display: false },
            y: {
                min: 0,
                max: 100,
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
        }
    }
});

let realtimeData = Array(20).fill(50);
setInterval(() => {
    realtimeData.push(50 + Math.random() * 50 - 25);
    realtimeData.shift();
    realtimeChart.data.datasets[0].data = realtimeData;
    realtimeChart.update();
}, 500);

class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.animationId = null;
        this.isRunning = false;
        
        this.particleCount = 300;
        this.particleSpeed = 3;
        this.particleSize = 3;
        
        this.initControls();
        this.reset();
    }
    
    initControls() {
        document.getElementById('particle-count').addEventListener('input', (e) => {
            this.particleCount = parseInt(e.target.value);
            this.reset();
        });
        
        document.getElementById('particle-speed').addEventListener('input', (e) => {
            this.particleSpeed = parseInt(e.target.value);
        });
        
        document.getElementById('particle-size').addEventListener('input', (e) => {
            this.particleSize = parseInt(e.target.value);
            this.updateParticleSizes();
        });
        
        document.getElementById('start-simulation').addEventListener('click', () => {
            if (this.isRunning) {
                this.stop();
                document.getElementById('start-simulation').textContent = 'Start';
            } else {
                this.start();
                document.getElementById('start-simulation').textContent = 'Pause';
            }
        });
        
        document.getElementById('reset-simulation').addEventListener('click', () => {
            this.reset();
        });
    }
    
    createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * this.particleSize + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.backgroundColor = color;
        
        particle.x = Math.random() * this.container.clientWidth;
        particle.y = Math.random() * this.container.clientHeight;
        particle.vx = (Math.random() - 0.5) * this.particleSpeed;
        particle.vy = (Math.random() - 0.5) * this.particleSpeed;
        
        particle.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
        particle.style.opacity = Math.random() * 0.5 + 0.5;
        
        this.container.appendChild(particle);
        return particle;
    }
    
    updateParticleSizes() {
        this.particles.forEach(particle => {
            const size = Math.random() * this.particleSize + 1;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
        });
    }
    
    reset() {
        this.stop();
        this.container.innerHTML = '';
        this.particles = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
        
        this.start();
        document.getElementById('start-simulation').textContent = 'Pause';
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x <= 0 || particle.x >= this.container.clientWidth) {
                particle.vx *= -1;
            }
            
            if (particle.y <= 0 || particle.y >= this.container.clientHeight) {
                particle.vy *= -1;
            }
            
            const centerX = this.container.clientWidth / 2;
            const centerY = this.container.clientHeight / 2;
            const dx = centerX - particle.x;
            const dy = centerY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 10) {
                const force = 0.1;
                particle.vx += dx / distance * force;
                particle.vy += dy / distance * force;
            }
            
            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            const maxSpeed = this.particleSpeed * 2;
            if (speed > maxSpeed) {
                particle.vx = particle.vx / speed * maxSpeed;
                particle.vy = particle.vy / speed * maxSpeed;
            }
            
            particle.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

const particleSystem = new ParticleSystem(document.getElementById('particles'));

const glCanvas = document.getElementById('glCanvas');
const gl = glCanvas.getContext('webgl');

if (gl) {
    const vsSource = `
        attribute vec4 aVertexPosition;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        }
    `;
    
    const fsSource = `
        precision mediump float;
        uniform vec4 uColor;
        void main() {
            gl_FragColor = uColor;
        }
    `;
    
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);
    
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);
    
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
    
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI/4, glCanvas.width/glCanvas.height, 0.1, 100.0);
    
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
    
    const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(vertexPosition);
    
    const uProjectionMatrix = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    const uModelViewMatrix = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
    const uColor = gl.getUniformLocation(shaderProgram, 'uColor');
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    function createGrid(size, divisions) {
        const vertices = [];
        const halfSize = size / 2;
        const step = size / divisions;
        
        for (let i = 0; i <= divisions; i++) {
            const y = -halfSize + i * step;
            vertices.push(-halfSize, y, 0);
            vertices.push(halfSize, y, 0);
        }
        
        for (let i = 0; i <= divisions; i++) {
            const x = -halfSize + i * step;
            vertices.push(x, -halfSize, 0);
            vertices.push(x, halfSize, 0);
        }
        
        return vertices;
    }
    
    const gridVertices = createGrid(10, 10);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridVertices), gl.STATIC_DRAW);
    
    gl.clearColor(0.1, 0.1, 0.15, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    function render() {
        gl.viewport(0, 0, glCanvas.width, glCanvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        mat4.rotate(modelViewMatrix, modelViewMatrix, 0.01, [0, 1, 0]);
        
        gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.uniform4f(uColor, 0.4, 0.4, 0.6, 1.0);
        gl.drawArrays(gl.LINES, 0, gridVertices.length / 3);
        
        requestAnimationFrame(render);
    }
    
    render();
    
    window.addEventListener('resize', () => {
        glCanvas.width = glCanvas.clientWidth;
        glCanvas.height = glCanvas.clientHeight;
        mat4.perspective(projectionMatrix, Math.PI/4, glCanvas.width/glCanvas.height, 0.1, 100.0);
        gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    });
    
    glCanvas.width = glCanvas.clientWidth;
    glCanvas.height = glCanvas.clientHeight;
    mat4.perspective(projectionMatrix, Math.PI/4, glCanvas.width/glCanvas.height, 0.1, 100.0);
} else {
    console.error('WebGL не підтримується');
    glCanvas.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">WebGL не підтримується вашим браузером</p>';
}

async function runMLDemo() {
    const xs = tf.linspace(0, 1, 100);
    const noise = tf.randomNormal([100], 0, 0.1);
    const ys = xs.mul(0.8).add(0.1).add(noise);
    
    const model = tf.sequential();
    model.add(tf.layers.dense({units: 10, activation: 'relu', inputShape: [1]}));
    model.add(tf.layers.dense({units: 1}));
    
    model.compile({
        optimizer: 'sgd',
        loss: 'meanSquaredError'
    });
    
    await model.fit(xs, ys, {
        epochs: 100,
        batchSize: 32,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
            }
        }
    });
    
    const testXs = tf.linspace(0, 1, 20);
    const predYs = model.predict(testXs);
    
    const xData = xs.arraySync();
    const yData = ys.arraySync();
    const testXData = testXs.arraySync();
    const predYData = predYs.arraySync();
    
    const mlCtx = document.getElementById('mlChart').getContext('2d');
    const mlChart = new Chart(mlCtx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Training Data',
                    data: xData.map((x, i) => ({x, y: yData[i]})),
                    backgroundColor: 'rgba(99, 102, 241, 0.5)',
                    pointRadius: 4
                },
                {
                    label: 'Predictions',
                    data: testXData.map((x, i) => ({x, y: predYData[i]})),
                    backgroundColor: 'rgba(236, 72, 153, 0.8)',
                    pointRadius: 6,
                    showLine: true,
                    borderColor: 'rgba(236, 72, 153, 0.5)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Input Feature'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Target Value'
                    }
                }
            }
        }
    });
}

runMLDemo().catch(console.error);

if (window.Worker) {
    const worker = new Worker(URL.createObjectURL(new Blob([`
        self.onmessage = function(e) {
            const { type, data } = e.data;
            
            if (type === 'process') {
                const start = performance.now();
                let result = 0;
                for (let i = 0; i < data.length; i++) {
                    result += Math.sqrt(Math.abs(Math.sin(data[i]) * Math.cos(data[i])));
                }
                const time = performance.now() - start;
                
                self.postMessage({
                    type: 'result',
                    result: result / data.length,
                    time: time
                });
            }
        };
    `], {type: 'application/javascript'})));
    
    worker.onmessage = function(e) {
        if (e.data.type === 'result') {
            console.log(`Worker result: ${e.data.result.toFixed(4)} (${e.data.time.toFixed(2)}ms)`);
        }
    };
    
    setInterval(() => {
        const data = new Float32Array(1000000);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * Math.PI * 2;
        }
        
        worker.postMessage({
            type: 'process',
            data: data
        });
    }, 5000);
}

function simulateWebSocket() {
    setInterval(() => {
        const event = new CustomEvent('websocketMessage', {
            detail: {
                timestamp: new Date().toISOString(),
                value: Math.random() * 100
            }
        });
        window.dispatchEvent(event);
    }, 100);
}

simulateWebSocket();