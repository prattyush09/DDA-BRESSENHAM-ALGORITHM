/**
 * CG Algorithm Lab - Main Application Controller
 * Handles tab navigation, CTA buttons, health status pings, and initializations.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Controllers
    window.ddaController = new DdaController();
    window.bresenhamController = new BresenhamController();

    initTabNavigation();
    initCtaButtons();
    checkBackendHealth();
    
    // Auto-load default DDA data on start
    window.ddaController.loadDdaData();
});

/**
 * Handles switching between SPA tabs
 */
function initTabNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-tab');

            navTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // Trigger canvas resize when switching to visualizer tabs
            if (targetId === 'dda-tab' && window.ddaController) {
                window.ddaController.gridCanvas.resize();
                window.ddaController.renderCanvas();
            } else if (targetId === 'bresenham-tab' && window.bresenhamController) {
                window.bresenhamController.gridCanvas.resize();
                if (window.bresenhamController.stepsData.length === 0) {
                    window.bresenhamController.loadBresenhamData();
                } else {
                    window.bresenhamController.renderCanvas();
                }
            }
        });
    });
}

/**
 * Binds Open Tab CTA buttons on Dashboard hero cards
 */
function initCtaButtons() {
    const openBtns = document.querySelectorAll('.open-tab-btn');
    openBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTabId = btn.getAttribute('data-target');
            const navTab = document.querySelector(`.nav-tab[data-tab="${targetTabId}"]`);
            if (navTab) {
                navTab.click();
            }
        });
    });
}

/**
 * Verifies Flask backend status via GET /api/health
 */
async function checkBackendHealth() {
    const statusBadge = document.getElementById('serverStatusBadge');
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        if (data.status === 'ok') {
            statusBadge.innerHTML = '<span class="status-dot"></span> Flask API Online';
            statusBadge.classList.add('online');
        } else {
            throw new Error("Backend offline");
        }
    } catch (e) {
        statusBadge.innerHTML = '<span class="status-dot" style="background:#f43f5e"></span> Backend Offline';
        statusBadge.style.borderColor = 'rgba(244,63,94,0.4)';
        statusBadge.style.color = '#fca5a5';
    }
}
