/**
 * CG Algorithm Lab - Canvas Rendering Engine
 * Handles coordinate grid transformation, HiDPI scaling, grid lines,
 * axes, pixel cell rendering, and highlight animations.
 */

class GridCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Grid view transformation parameters
        this.scale = 10; // Pixels per grid unit (cell size)
        this.originX = 0; // Canvas pixel X corresponding to grid (0,0)
        this.originY = 0; // Canvas pixel Y corresponding to grid (0,0)
        
        this.minGridX = -50;
        this.maxGridX = 50;
        this.minGridY = -50;
        this.maxGridY = 50;
        
        this.octantColors = [
            '#ef4444', // Octant 1: Red
            '#f97316', // Octant 2: Orange
            '#eab308', // Octant 3: Yellow
            '#22c55e', // Octant 4: Green
            '#06b6d4', // Octant 5: Cyan
            '#3b82f6', // Octant 6: Blue
            '#a855f7', // Octant 7: Purple
            '#ec4899'  // Octant 8: Pink
        ];
        
        this.initResizeListener();
        this.resize();
    }

    initResizeListener() {
        window.addEventListener('resize', () => {
            this.resize();
            if (this.lastRenderCallback) {
                this.lastRenderCallback();
            }
        });
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.width = rect.width;
        this.height = rect.height;
        
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        
        this.ctx.resetTransform();
        this.ctx.scale(dpr, dpr);
    }

    /**
     * Dynamically calculates bounds and scale so all points fit comfortably on canvas.
     */
    fitBounds(points, marginUnits = 10) {
        if (!points || points.length === 0) {
            this.minGridX = -30;
            this.maxGridX = 100;
            this.minGridY = -30;
            this.maxGridY = 100;
        } else {
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            points.forEach(pt => {
                const x = pt.rounded_x !== undefined ? pt.rounded_x : pt.x;
                const y = pt.rounded_y !== undefined ? pt.rounded_y : pt.y;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            });
            
            // Include origin (0,0) in bounds for clear perspective
            minX = Math.min(minX, 0) - marginUnits;
            maxX = Math.max(maxX, 0) + marginUnits;
            minY = Math.min(minY, 0) - marginUnits;
            maxY = Math.max(maxY, 0) + marginUnits;
            
            this.minGridX = Math.floor(minX);
            this.maxGridX = Math.ceil(maxX);
            this.minGridY = Math.floor(minY);
            this.maxGridY = Math.ceil(maxY);
        }

        const gridWidth = this.maxGridX - this.minGridX;
        const gridHeight = this.maxGridY - this.minGridY;

        const scaleX = (this.width - 60) / gridWidth;
        const scaleY = (this.height - 60) / gridHeight;

        this.scale = Math.max(5, Math.min(scaleX, scaleY, 30));

        // Center origin (0,0) in mathematical Cartesian space (Y points UP)
        this.originX = 30 - (this.minGridX * this.scale);
        this.originY = this.height - 30 + (this.minGridY * this.scale);
    }

    /**
     * Converts mathematical grid coordinate (x,y) to Canvas pixel position.
     */
    toCanvasCoords(gridX, gridY) {
        const cx = this.originX + (gridX * this.scale);
        const cy = this.originY - (gridY * this.scale); // Y inverted for computer graphics
        return { cx, cy };
    }

    /**
     * Converts canvas pixel position back to mathematical grid coordinate.
     */
    toGridCoords(canvasX, canvasY) {
        const gx = Math.round((canvasX - this.originX) / this.scale);
        const gy = Math.round((this.originY - canvasY) / this.scale);
        return { gx, gy };
    }

    /**
     * Clears canvas and renders grid lines and axes.
     */
    drawGrid() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);
        
        ctx.fillStyle = '#060911';
        ctx.fillRect(0, 0, this.width, this.height);

        // Determine grid step interval based on zoom scale
        let step = 1;
        if (this.scale < 6) step = 10;
        else if (this.scale < 12) step = 5;
        else step = 1;

        ctx.lineWidth = 1;

        // Draw Minor Grid Lines
        ctx.strokeStyle = '#1e293b';
        ctx.beginPath();
        for (let gx = Math.floor(this.minGridX); gx <= this.maxGridX; gx += step) {
            const { cx } = this.toCanvasCoords(gx, 0);
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, this.height);
        }
        for (let gy = Math.floor(this.minGridY); gy <= this.maxGridY; gy += step) {
            const { cy } = this.toCanvasCoords(0, gy);
            ctx.moveTo(0, cy);
            ctx.lineTo(this.width, cy);
        }
        ctx.stroke();

        // Draw Axes (X-axis and Y-axis)
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();

        // X-Axis
        const { cy: xAxisY } = this.toCanvasCoords(0, 0);
        ctx.moveTo(0, xAxisY);
        ctx.lineTo(this.width, xAxisY);

        // Y-Axis
        const { cx: yAxisX } = this.toCanvasCoords(0, 0);
        ctx.moveTo(yAxisX, 0);
        ctx.lineTo(yAxisX, this.height);

        ctx.stroke();

        // Axis Labels and Ticks
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        for (let gx = Math.floor(this.minGridX); gx <= this.maxGridX; gx += step * 5) {
            if (gx === 0) continue;
            const { cx } = this.toCanvasCoords(gx, 0);
            if (cx > 10 && cx < this.width - 10) {
                ctx.fillText(gx.toString(), cx, Math.min(Math.max(xAxisY + 4, 10), this.height - 20));
            }
        }

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let gy = Math.floor(this.minGridY); gy <= this.maxGridY; gy += step * 5) {
            if (gy === 0) continue;
            const { cy } = this.toCanvasCoords(0, gy);
            if (cy > 10 && cy < this.height - 10) {
                ctx.fillText(gy.toString(), Math.min(Math.max(yAxisX - 6, 25), this.width - 10), cy);
            }
        }

        // Highlight Origin (0,0)
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(yAxisX, xAxisY, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Renders a single plotted pixel cell on the grid.
     */
    drawPixelCell(gridX, gridY, color = '#38bdf8', isHighlight = false, label = null) {
        const ctx = this.ctx;
        const { cx, cy } = this.toCanvasCoords(gridX, gridY);
        const cellSize = this.scale;

        // Pixel rectangle bounds centered on grid intersection
        const px = cx - cellSize / 2;
        const py = cy - cellSize / 2;

        ctx.fillStyle = color;
        ctx.fillRect(px + 1, py + 1, cellSize - 1, cellSize - 1);

        if (isHighlight) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(px, py, cellSize, cellSize);

            // Glow Effect
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;
            ctx.fillStyle = color;
            ctx.fillRect(px + 1, py + 1, cellSize - 1, cellSize - 1);
            ctx.shadowBlur = 0; // Reset shadow

            if (label) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px "Fira Code", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(label, cx, py - 4);
            }
        }
    }

    /**
     * Draws continuous line path connecting mathematical ideal float points.
     */
    drawIdealLine(x1, y1, x2, y2) {
        const ctx = this.ctx;
        const p1 = this.toCanvasCoords(x1, y1);
        const p2 = this.toCanvasCoords(x2, y2);

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(p1.cx, p1.cy);
        ctx.lineTo(p2.cx, p2.cy);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash
    }
}
