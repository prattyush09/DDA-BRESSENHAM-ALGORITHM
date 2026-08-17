"""
Bresenham Circle Drawing Algorithm Implementation
Computer Graphics Educational Module for MSBTE Diploma
"""

def generate_bresenham_circle(center_x, center_y, radius):
    """
    Generates step-by-step points for a circle using Bresenham's Integer Circle Drawing Algorithm
    with 8-way symmetry.
    
    Formula & Decision Parameter:
      Initial point: (x = 0, y = radius)
      Initial decision parameter P = 3 - 2 * radius
      
      While x <= y:
        If P < 0:
            P_next = P + 4*x + 6
            x = x + 1
        Else:
            P_next = P + 4*(x - y) + 10
            x = x + 1
            y = y - 1
            
    Returns a tuple of (steps_data, details_dictionary).
    """
    xc = int(center_x)
    yc = int(center_y)
    r = int(radius)
    
    x = 0
    y = r
    p = 3 - 2 * r  # Initial decision parameter
    
    steps_data = []
    step_count = 0
    
    while x <= y:
        # Calculate 8-way symmetry points
        symmetric_points = [
            {"x": xc + x, "y": yc + y, "octant": 1, "label": "(xc+x, yc+y)"},
            {"x": xc - x, "y": yc + y, "octant": 2, "label": "(xc-x, yc+y)"},
            {"x": xc + x, "y": yc - y, "octant": 3, "label": "(xc+x, yc-y)"},
            {"x": xc - x, "y": yc - y, "octant": 4, "label": "(xc-x, yc-y)"},
            {"x": xc + y, "y": yc + x, "octant": 5, "label": "(xc+y, yc+x)"},
            {"x": xc - y, "y": yc + x, "octant": 6, "label": "(xc-y, yc+x)"},
            {"x": xc + y, "y": yc - x, "octant": 7, "label": "(xc+y, yc-x)"},
            {"x": xc - y, "y": yc - x, "octant": 8, "label": "(xc-y, yc-x)"}
        ]
        
        # Deduplicate points (e.g., when x=0 or x=y) while keeping symmetry information
        unique_points = []
        seen = set()
        for pt in symmetric_points:
            coord = (pt["x"], pt["y"])
            if coord not in seen:
                seen.add(coord)
                unique_points.append(pt)
                
        # Decision parameter evaluation and next values
        curr_p = p
        if p < 0:
            choice = "P < 0: Select East pixel (x+1, y)"
            next_p = p + 4 * x + 6
            next_x = x + 1
            next_y = y
        else:
            choice = "P >= 0: Select South-East pixel (x+1, y-1)"
            next_p = p + 4 * (x - y) + 10
            next_x = x + 1
            next_y = y - 1
            
        steps_data.append({
            "step": step_count,
            "x": x,
            "y": y,
            "decision_parameter": curr_p,
            "choice": choice,
            "next_p": next_p,
            "next_x": next_x,
            "next_y": next_y,
            "points": unique_points,
            "all_symmetric": symmetric_points
        })
        
        # Update values for next iteration
        p = next_p
        x = next_x
        y = next_y
        step_count += 1
        
    details = {
        "center_x": xc,
        "center_y": yc,
        "radius": r,
        "initial_p": 3 - 2 * r,
        "total_iterations": step_count,
        "total_unique_pixels": sum(len(s["points"]) for s in steps_data)
    }
    
    return steps_data, details
