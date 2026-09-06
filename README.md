# CG Algorithm Lab — DDA Line & Bresenham Circle Visualizer

> **MSBTE Diploma Computer Graphics Microproject**
> An educational, interactive web application to demonstrate line and circle rasterization algorithms step-by-step using Python Flask and HTML5 Canvas.

---

## 🌟 Key Features

1. **Pure Python Educational Algorithms**:
   - **DDA Line Drawing Algorithm**: Calculates intermediate floating-point coordinates, step increments ($\Delta X, \Delta Y$), slope ($m$), and pixel rounding. Handles horizontal, vertical, single-point, and negative slope edge cases safely.
   - **Bresenham Circle Drawing Algorithm**: Integer-based decision parameter ($P = 3 - 2r$) computation with 8-way circular symmetry point generation.
2. **Interactive HTML5 Canvas Grid**:
   - Dynamic auto-scaling grid system supporting positive, negative, small, and large coordinates.
   - HiDPI canvas rendering with major/minor grid lines, X/Y axes, tick labels, and plotted pixel cells.
   - Octant color-coding for 8-way circle symmetry.
3. **Step-by-Step Execution Controls**:
   - **▶ Play**, **⏸ Pause**, **⏭ Next Step**, **↻ Reset**, and Speed Slider (50ms to 1000ms).
   - Real-time Math Breakdown panel updating after every single step.
   - Scrollable, line-highlighted step iteration table.

---

## 📁 Project Architecture

```
CG-Algorithm-Lab/
├── app.py                     # Flask REST API & Web Server
├── requirements.txt           # Python Dependencies (Flask)
├── README.md                  # Microproject Documentation & Setup Guide
├── algorithms/
│   ├── __init__.py
│   ├── dda.py                 # DDA Line Algorithm Logic
│   └── bresenham_circle.py    # Bresenham Circle Algorithm Logic
├── templates/
│   └── index.html             # Single-Page UI Application
└── static/
    ├── css/
    │   └── style.css          # Dark Mode UI Theme
    └── js/
        ├── canvas.js          # Dynamic Canvas Grid Renderer
        ├── dda.js             # DDA Animation Controller & Math Breakdown
        ├── bresenham.js       # Bresenham Circle Controller & 8-Way Symmetry
        └── app.js             # Main UI Manager & Health Check
```

---

## 🚀 Quick Setup & Local Execution

### Prerequisites
- Python 3.8+ installed on your machine.

### Step-by-Step Run Commands

1. **Navigate to the Project Folder**:
   ```bash
  
   ```

2. **Create a Virtual Environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate Virtual Environment**:
   - Windows PowerShell:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - Windows Command Prompt (cmd):
     ```cmd
     .\venv\Scripts\activate.bat
     ```

4. **Install Required Packages**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the Flask Application**:
   ```bash
   python app.py
   ```

6. **Open in Browser**:
   Navigate to: **`http://127.0.0.1:5000`**

---

## 🎥 Screen-Recording Demonstration Guide (For Mentor Submission)

1. **Introduce the Project**:
   - Open `http://127.0.0.1:5000` in full screen.
   - Point out the **Dashboard** tab showing project overview and tech stack.
2. **Demonstrate DDA Line Visualizer**:
   - Click on the **DDA Line** tab.
   - Select a preset (e.g. *Standard Line* or *Negative Slope*).
   - Click **Calculate & Load DDA**.
   - Use **⏭ Next Step** to show how floating-point increments $X = X + X_{inc}$ update the rounded pixel coordinates on the canvas and math panel.
   - Click **▶ Play** to watch the line render pixel-by-pixel.
3. **Demonstrate Bresenham Circle Visualizer**:
   - Switch to the **Bresenham Circle** tab.
   - Click **Calculate & Load Circle**.
   - Point out the **Initial Decision Parameter** $P_0 = 3 - 2r$.
   - Use **⏭ Next Step** to highlight how decision parameter $P$ determines East ($P < 0$) vs South-East ($P \ge 0$) pixel choices.
   - Show how 1 calculated point automatically renders **8 symmetric points** across all 8 colored octants on the canvas grid.

