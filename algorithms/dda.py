"""
DDA Line Drawing Algorithm Implementation
Computer Graphics Educational Module for MSBTE Diploma
"""

def generate_dda_line(x1, y1, x2, y2):
    """
    Generates step-by-step pixel coordinates using the Digital Differential Analyzer (DDA) algorithm.
    
    Formula:
      dx = x2 - x1
      dy = y2 - y1
      steps = max(|dx|, |dy|)
      x_increment = dx / steps
      y_increment = dy / steps
      
    Returns a tuple of (steps_data, details_dictionary).
    """
    # Convert inputs to float for calculation precision
    x1 = float(x1)
    y1 = float(y1)
    x2 = float(x2)
    y2 = float(y2)
    
    dx = x2 - x1
    dy = y2 - y1
    
    abs_dx = abs(dx)
    abs_dy = abs(dy)
    
    steps = int(max(abs_dx, abs_dy))
    
    if steps == 0:
        x_increment = 0.0
        y_increment = 0.0
        slope_m = 0.0
    else:
        x_increment = dx / steps
        y_increment = dy / steps
        slope_m = (dy / dx) if dx != 0 else float('inf')
        
    steps_data = []
    
    current_x = x1
    current_y = y1
    
    # Generate points step-by-step
    for k in range(steps + 1):
        rounded_x = int(round(current_x))
        rounded_y = int(round(current_y))
        
        # Educational explanation text for each step
        if k == 0:
            calc_info = f"Initial Point: start at ({x1:.2f}, {y1:.2f})"
        else:
            calc_info = f"Step {k}: X = {current_x:.2f} (+{x_increment:.2f}), Y = {current_y:.2f} (+{y_increment:.2f})"
            
        steps_data.append({
            "step": k,
            "x": round(current_x, 4),
            "y": round(current_y, 4),
            "rounded_x": rounded_x,
            "rounded_y": rounded_y,
            "calculation": calc_info
        })
        
        current_x += x_increment
        current_y += y_increment

    # Summary details for calculation display panel
    details = {
        "x1": x1,
        "y1": y1,
        "x2": x2,
        "y2": y2,
        "dx": round(dx, 4),
        "dy": round(dy, 4),
        "abs_dx": round(abs_dx, 4),
        "abs_dy": round(abs_dy, 4),
        "steps": steps,
        "x_increment": round(x_increment, 4),
        "y_increment": round(y_increment, 4),
        "slope": "Infinity (Vertical)" if slope_m == float('inf') else round(slope_m, 4),
        "total_pixels": len(steps_data)
    }
    
    return steps_data, details
