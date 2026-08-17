/**
 * CG Algorithm Lab - Bresenham Circle Controller & 8-Way Symmetry Engine
 */

class BresenhamController {
    constructor() {
        this.gridCanvas = new GridCanvas('bresenhamCanvas');
        this.stepsData = [];
        this.details = null;
        this.currentStep = 0;
        this.isPlaying = false;
        this.timer = null;
        this.speedMs = 200;

        this.initUIElements();
        this.bindEvents();
    }

    initUIElements() {
        this.form = document.getElementById('bresenhamForm');
        this.submitBtn = document.getElementById('bresSubmitBtn');
        this.playBtn = document.getElementById('bresPlayBtn');
        this.pauseBtn = document.getElementById('bresPauseBtn');
        this.stepBtn = document.getElementById('bresStepBtn');
        this.resetBtn = document.getElementById('bresResetBtn');
        this.speedSlider = document.getElementById('bresSpeedSlider');
        this.speedValueLabel = document.getElementById('bresSpeedValue');
        this.errorBadge = document.getElementById('bresError');
        this.tableBody = document.querySelector('#bresTable tbody');
        this.tableCount = document.getElementById('bresTableCount');
        this.symmetryChipsContainer = document.getElementById('bresSymmetryChips');
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.loadBresenhamData();
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

    async loadBresenhamData() {
        this.pause();
        this.hideError();

        const center_x = parseFloat(document.getElementById('bres_xc').value);
        const center_y = parseFloat(document.getElementById('bres_yc').value);
        const radius = parseFloat(document.getElementById('bres_r').value);

        if (isNaN(center_x) || isNaN(center_y) || isNaN(radius) || radius <= 0) {
            this.showError("Please enter a valid center coordinate and a positive radius (>0).");
            return;
        }

        this.submitBtn.disabled = true;
        this.submitBtn.textContent = "Calculating...";

        try {
            const response = await fetch('/api/bresenham-circle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ center_x, center_y, radius })
            });

            const data = await response.json();

            if (!data.success) {
                this.showError(data.error || "Failed to calculate Bresenham circle.");
                return;
            }

            this.stepsData = data.steps;
            this.details = data.details;

            this.updateSummaryPanel();
            this.renderTable();

            // Collect all symmetric points to calculate proper canvas bounds
            const allPoints = [];
            this.stepsData.forEach(st => {
                st.points.forEach(pt => allPoints.push(pt));
            });

            this.gridCanvas.fitBounds(allPoints, 8);
            this.reset();
            this.enableControls();

            document.getElementById('bresCanvasSub').textContent = 
                `Circle at (${center_x}, ${center_y}), Radius R=${radius} • ${this.details.total_unique_pixels} Total Pixels`;

        } catch (err) {
            this.showError("Network error. Could not connect to Flask API server.");
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = "Calculate & Load Circle";
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
        document.getElementById('bresSumCenter').textContent = `(${this.details.center_x}, ${this.details.center_y})`;
        document.getElementById('bresSumRadius').textContent = `R = ${this.details.radius}`;
        document.getElementById('bresSumStart').textContent = `(0, ${this.details.radius})`;
        document.getElementById('bresSumP0').textContent = `P0 = ${this.details.initial_p}`;
        document.getElementById('bresSumIterations').textContent = `${this.details.total_iterations} Iterations`;
    }

    renderTable() {
        this.tableBody.innerHTML = '';
        this.tableCount.textContent = `${this.stepsData.length} iterations`;

        this.stepsData.forEach((st, idx) => {
            const tr = document.createElement('tr');
            tr.id = `bres-row-${idx}`;

            // Format symmetric points list string
            const pointsStr = st.points.map(p => `(${p.x},${p.y})`).join(', ');

            tr.innerHTML = `
                <td>${st.step}</td>
                <td>${st.x}</td>
                <td>${st.y}</td>
                <td style="color:var(--purple-400)">P = ${st.decision_parameter}</td>
                <td style="font-size:0.75rem">${st.choice}</td>
                <td style="color:var(--sky-400)">${st.next_p}</td>
                <td style="font-size:0.72rem; color:var(--text-muted)">${pointsStr}</td>
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
            this.currentStep = 0;
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
        document.getElementById('bresCurrStep').textContent = `${this.currentStep + 1} / ${this.stepsData.length}`;
        document.getElementById('bresCurrXY').textContent = `(${curr.x}, ${curr.y})`;
        document.getElementById('bresCurrP').textContent = `P = ${curr.decision_parameter}`;
        document.getElementById('bresCurrChoice').textContent = curr.choice;

        // Render 8 Symmetry Point Chips
        this.symmetryChipsContainer.innerHTML = '';
        curr.all_symmetric.forEach(pt => {
            const chip = document.createElement('span');
            chip.className = 'chip-item';
            const color = this.gridCanvas.octantColors[pt.octant - 1];
            chip.style.borderColor = color;
            chip.style.color = color;
            chip.textContent = `Oct ${pt.octant}: (${pt.x}, ${pt.y})`;
            this.symmetryChipsContainer.appendChild(chip);
        });

        // Highlight active table row
        document.querySelectorAll('#bresTable tbody tr').forEach(row => row.classList.remove('active-row-purple'));
        const activeRow = document.getElementById(`bres-row-${this.currentStep}`);
        if (activeRow) {
            activeRow.classList.add('active-row-purple');
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

        // Draw center point marker
        if (this.details) {
            gc.drawPixelCell(this.details.center_x, this.details.center_y, '#ffffff', true, `Center (${this.details.center_x}, ${this.details.center_y})`);
        }

        // Draw all symmetric points up to current iteration step
        for (let i = 0; i <= this.currentStep; i++) {
            const stepItem = this.stepsData[i];
            const isLatest = (i === this.currentStep);

            stepItem.all_symmetric.forEach(pt => {
                const color = gc.octantColors[pt.octant - 1];
                gc.drawPixelCell(pt.x, pt.y, color, isLatest, isLatest ? `(${pt.x}, ${pt.y})` : null);
            });
        }

        gc.lastRenderCallback = () => this.renderCanvas();
    }
}

// Preset Loader helper
function loadBresenhamPreset(xc, yc, r) {
    document.getElementById('bres_xc').value = xc;
    document.getElementById('bres_yc').value = yc;
    document.getElementById('bres_r').value = r;
    if (window.bresenhamController) {
        window.bresenhamController.loadBresenhamData();
    }
}
