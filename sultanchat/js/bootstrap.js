// ===============================
// ULTRA EARLY ERROR QUEUE
// MUST LOAD FIRST
// ===============================

window.__earlyErrorQueue = [];

// Catch JS runtime errors BEFORE error.js loads
window.addEventListener("error", (event) => {

    const error = {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        col: event.colno,
        stack: event.error?.stack || null
    };

    // If error system not ready → queue it
    if (!window.showError) {
        window.__earlyErrorQueue.push(error);
        return;
    }

    window.showError(error, "JS_ERROR");
});

// Catch promise rejections BEFORE error.js loads
window.addEventListener("unhandledrejection", (event) => {

    const error = {
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack || null
    };

    if (!window.showError) {
        window.__earlyErrorQueue.push(error);
        return;
    }

    window.showError(error, "PROMISE_ERROR");
});
