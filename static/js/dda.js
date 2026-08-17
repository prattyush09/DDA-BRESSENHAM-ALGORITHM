/**
 * CG Algorithm Lab - DDA Line Controller & Animation Engine
 */

class DdaController {
    constructor() {
        this.gridCanvas = new GridCanvas('ddaCanvas');
        this.stepsData = [];
        this.details = null;
        this.currentStep = 0;
        this.isPlaying = false;
        this.timer = null;
        this.speedMs = 200;

        this.initUIElements();
        this.bindEvents();
        this.initMouseTracker();
    }

    initUIElements() {
        this.form = document.getElementById('ddaForm');
        this.submitBtn = document.getElementById('ddaSubmitBtn');
        this.playBtn = document.getElementById('ddaPlayBtn');
        this.pauseBtn = document.getElementById('ddaPauseBtn');
        this.stepBtn = document.getElementById('ddaStepBtn');
        this.resetBtn = document.getElementById('ddaResetBtn');
        this.speedSlider = document.getElementById('ddaSpeedSlider');
        this.speedValueLabel = document.getElementById('ddaSpeedValue');
        this.errorBadge = document.getElementById('ddaError');
        this.tableBody = document.querySelector('#ddaTable tbody');
        this.tableCount = document.getElementById('ddaTableCount');
        this.mouseCoords = document.getElementById('ddaMouseCoords');
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.loadDdaData();
        });

        this.playBtn.addEventListener('click', () => this.play());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.stepBtn.addEventListener('click', () => this.nextStep());
        this.resetBtn.addEventListener('click', () => this.reset());

        this.speedSlider.addEventListener('input', (e) => {
            this.speedMs = parseInt(e.target.value);
            this.speedValueLabel.textContent = `${this.speedMs}ms`;
            if (this.isPlaying) {
                this.pause();
                this.play();
            }
        });
    }

    initMouseTracker() {
        const canvas = this.gridCanvas.canvas;
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const { gx, gy } = this.gridCanvas.toGridCoords(mouseX, mouseY);
            this.mouseCoords.textContent = `Hover X: ${gx}, Y: ${gy}`;
        });
    }

    async loadDdaData() {
        this.pause();
        this.hideError();

        const x1 = parseFloat(document.getElementById('dda_x1').value);
        const y1 = parseFloat(document.getElementById('dda_y1').value);
        const x2 = parseFloat(document.getElementById('dda_x2').value);
        const y2 = parseFloat(document.getElementById('dda_y2').value);

        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            this.showError("Please enter valid numeric coordinates.");
            return;
        }

        this.submitBtn.disabled = true;
        this.submitBtn.textContent = "Calculating...";

        try {
            const response = await fetch('/api/dda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ x1, y1, x2, y2 })
            });

            const data = await response.json();

            if (!data.success) {
                this.showError(data.error || "Failed to calculate DDA line.");
                return;
            }

            this.stepsData = data.steps;
            this.details = data.details;

            this.updateSummaryPanel();
            this.renderTable();
            
            // Adjust canvas bounds to encompass generated line
            this.gridCanvas.fitBounds(this.stepsData);
            this.reset();
            this.enableControls();

            document.getElementById('ddaCanvasSub').textContent = 
                `Line from (${x1}, ${y1}) to (${x2}, ${y2}) • ${this.stepsData.length} Pixels`;

        } catch (err) {
            this.showError("Network error. Could not connect to Flask API server.");
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = "Calculate & Load DDA";
        }
    }

    showError(msg) {
        this.errorBadge.textContent = msg;
        this.errorBadge.classList.remove('hidden');
    }

    hideError() {
        this.errorBadge.classList.add('hidden');
    }

    enableControls() {
        this.playBtn.disabled = false;
        this.stepBtn.disabled = false;
        this.resetBtn.disabled = false;
    }

    updateSummaryPanel() {
        if (!this.details) return;
        document.getElementById('ddaSumDx').textContent = this.details.dx;
        document.getElementById('ddaSumDy').textContent = this.details.dy;
        document.getElementById('ddaSumSteps').textContent = this.details.steps;
        document.getElementById('ddaSumXInc').textContent = this.details.x_increment;
        document.getElementById('ddaSumYInc').textContent = this.details.y_increment;
        document.getElementById('ddaSumSlope').textContent = this.details.slope;
    }

    renderTable() {
        this.tableBody.innerHTML = '';
        this.tableCount.textContent = `${this.stepsData.length} steps`;

        this.stepsData.forEach((st, idx) => {
            const tr = document.createElement('tr');
            tr.id = `dda-row-${idx}`;
            tr.innerHTML = `
                <td>${st.step}</td>
                <td>${st.x.toFixed(2)}</td>
                <td>${st.y.toFixed(2)}</td>
                <td style="color:var(--sky-400)">${st.rounded_x}</td>
                <td style="color:var(--sky-400)">${st.rounded_y}</td>
                <td>${st.calculation}</td>
            `;
            tr.addEventListener('click', () => {
                this.pause();
                this.currentStep = idx;
                this.updateUI();
            });
            this.tableBody.appendChild(tr);
        });
    }

    play() {
        if (this.currentStep >= this.stepsData.length - 1) {
            this.currentStep = 0; // Loop back if at end
        }
        this.isPlaying = true;
        this.playBtn.disabled = true;
        this.pauseBtn.disabled = false;

        this.timer = setInterval(() => {
            if (this.currentStep < this.stepsData.length - 1) {
                this.currentStep++;
                this.updateUI();
            } else {
                this.pause();
            }
        }, this.speedMs);
    }

    pause() {
        this.isPlaying = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.playBtn.disabled = false;
        this.pauseBtn.disabled = true;
    }

    nextStep() {
        this.pause();
        if (this.currentStep < this.stepsData.length - 1) {
            this.currentStep++;
            this.updateUI();
        }
    }

    reset() {
        this.pause();
        this.currentStep = 0;
        this.updateUI();
    }

    updateUI() {
        if (!this.stepsData || this.stepsData.length === 0) return;

        const curr = this.stepsData[this.currentStep];

        // Update Calculation Breakdown Panel
        document.getElementById('ddaCurrStep').textContent = `${this.currentStep + 1} / ${this.stepsData.length}`;
        document.getElementById('ddaCurrFloat').textContent = `(${curr.x.toFixed(2)}, ${curr.y.toFixed(2)})`;
        document.getElementById('ddaCurrPixel').textContent = `(${curr.rounded_x}, ${curr.rounded_y})`;
        document.getElementById('ddaCurrDetail').textContent = curr.calculation;

        // Highlight table row
        document.querySelectorAll('#ddaTable tbody tr').forEach(row => row.classList.remove('active-row'));
        const activeRow = document.getElementById(`dda-row-${this.currentStep}`);
        if (activeRow) {
            activeRow.classList.add('active-row');
            const container = activeRow.closest('.table-scroll');
            if (container) {
                const rowTop = activeRow.offsetTop;
                const rowHeight = activeRow.offsetHeight;
                const containerHeight = container.clientHeight;
                const currentScroll = container.scrollTop;
                if (rowTop < currentScroll || rowTop + rowHeight > currentScroll + containerHeight) {
                    container.scrollTop = rowTop - containerHeight / 2 + rowHeight / 2;
                }
            }
        }

        // Render Canvas
        this.renderCanvas();
    }

    renderCanvas() {
        const gc = this.gridCanvas;
        gc.drawGrid();

        if (this.details) {
            gc.drawIdealLine(this.details.x1, this.details.y1, this.details.x2, this.details.y2);
        }

        // Draw all plotted pixels up to current step
        for (let i = 0; i <= this.currentStep; i++) {
            const st = this.stepsData[i];
            const isLatest = (i === this.currentStep);
            const color = isLatest ? '#38bdf8' : '#0ea5e9';
            const label = isLatest ? `Step ${st.step}: (${st.rounded_x}, ${st.rounded_y})` : null;

            gc.drawPixelCell(st.rounded_x, st.rounded_y, color, isLatest, label);
        }

        gc.lastRenderCallback = () => this.renderCanvas();
    }
}

// Preset Loader helper
function loadDdaPreset(x1, y1, x2, y2) {
    document.getElementById('dda_x1').value = x1;
    document.getElementById('dda_y1').value = y1;
    document.getElementById('dda_x2').value = x2;
    document.getElementById('dda_y2').value = y2;
    if (window.ddaController) {
        window.ddaController.loadDdaData();
    }
}
