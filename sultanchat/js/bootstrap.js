// ===============================
// ULTRA-EARLY ERROR CATCHER
// MUST LOAD FIRST
// ===============================

window.__earlyErrorQueue = [];

// JS runtime errors
window.onerror = function (msg, src, line, col, err) {

    const error = {
        message: msg,
        source: src,
        line,
        col,
        stack: err?.stack || String(err)
    };

    if (!window.showError) {
        window.__earlyErrorQueue.push(error);
        return;
    }

    window.showError(error, "JS_ERROR");
};

// Promise errors
window.addEventListener("unhandledrejection", (event) => {

    const error = event.reason;

    if (!window.showError) {
        window.__earlyErrorQueue.push(error);
        return;
    }

    window.showError(error, "PROMISE_ERROR");
});
