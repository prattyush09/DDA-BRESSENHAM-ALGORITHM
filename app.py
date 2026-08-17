"""
CG Algorithm Lab - Flask Application Server
Computer Graphics Microproject (MSBTE Diploma)
"""

from flask import Flask, render_template, request, jsonify
from algorithms.dda import generate_dda_line
from algorithms.bresenham_circle import generate_bresenham_circle

app = Flask(__name__)

@app.route('/')
def index():
    """Renders the main single-page visualizer application."""
    return render_template('index.html')

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint to verify backend status."""
    return jsonify({
        "status": "ok",
        "app": "CG Algorithm Lab",
        "version": "1.0.0"
    })

@app.route('/api/dda', methods=['POST'])
def api_dda():
    """
    API endpoint for DDA Line Algorithm.
    Expects JSON: { "x1": float, "y1": float, "x2": float, "y2": float }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "Invalid request. JSON payload required."}), 400
        
    try:
        x1 = float(data.get("x1"))
        y1 = float(data.get("y1"))
        x2 = float(data.get("x2"))
        y2 = float(data.get("y2"))
    except (ValueError, TypeError):
        return jsonify({
            "success": False, 
            "error": "Coordinates must be valid numbers (x1, y1, x2, y2)."
        }), 400
        
    # Range check to avoid memory crash
    if any(abs(val) > 2000 for val in [x1, y1, x2, y2]):
        return jsonify({
            "success": False,
            "error": "Coordinates should be within range [-2000, 2000] for optimal visualization."
        }), 400
        
    steps, details = generate_dda_line(x1, y1, x2, y2)
    
    return jsonify({
        "success": True,
        "algorithm": "DDA Line Algorithm",
        "steps": steps,
        "details": details
    })

@app.route('/api/bresenham-circle', methods=['POST'])
def api_bresenham_circle():
    """
    API endpoint for Bresenham Circle Algorithm.
    Expects JSON: { "center_x": int, "center_y": int, "radius": int }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "Invalid request. JSON payload required."}), 400
        
    try:
        center_x = float(data.get("center_x"))
        center_y = float(data.get("center_y"))
        radius = float(data.get("radius"))
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "error": "Inputs must be valid numbers (center_x, center_y, radius)."
        }), 400
        
    if radius <= 0:
        return jsonify({
            "success": False,
            "error": "Radius must be a positive number greater than 0."
        }), 400
        
    if radius > 1000:
        return jsonify({
            "success": False,
            "error": "Radius should be less than or equal to 1000 for visual performance."
        }), 400
        
    steps, details = generate_bresenham_circle(center_x, center_y, radius)
    
    return jsonify({
        "success": True,
        "algorithm": "Bresenham Circle Algorithm",
        "steps": steps,
        "details": details
    })

if __name__ == '__main__':
    print("Starting CG Algorithm Lab server on http://127.0.0.1:5000 ...")
    app.run(debug=True, port=5000)
