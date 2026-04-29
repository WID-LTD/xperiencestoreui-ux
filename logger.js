/**
 * logger.js - Unified Frontend Logging Bridge
 * Intercepts console logs and pipes them to the server terminal
 */

export const Logger = {
    _bridgeUrl: '/api/logs',

    init() {
        console.log('[Logger] Initializing unified terminal bridge...');
        
        // Wrap original console methods
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            originalLog.apply(console, args);
            this._send('info', args);
        };

        console.error = (...args) => {
            originalError.apply(console, args);
            this._send('error', args);
        };

        console.warn = (...args) => {
            originalWarn.apply(console, args);
            this._send('warn', args);
        };

        // Capture unhandled errors
        window.onerror = (message, source, lineno, colno, error) => {
            this.error('Unhandled Exception:', { message, source, lineno, colno, stack: error?.stack });
            return false;
        };

        // Capture unhandled promise rejections
        window.onunhandledrejection = (event) => {
            this.error('Unhandled Promise Rejection:', event.reason);
        };

        this.info('Frontend logger initialized and connected to server terminal.');
    },

    info(message, data) { this._send('info', message, data); },
    warn(message, data) { this._send('warn', message, data); },
    error(message, data) { this._send('error', message, data); },

    _send(level, messageOrArgs, data) {
        let message = '';
        let extraData = data;

        if (Array.isArray(messageOrArgs)) {
            message = messageOrArgs.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
        } else {
            message = messageOrArgs;
        }

        const payload = {
            level,
            message,
            data: extraData,
            timestamp: Date.now(),
            url: window.location.pathname
        };

        // Use fetch with 'keepalive' to ensure logs are sent even during page unloads
        fetch(this._bridgeUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-log-secret': window.LOG_SECRET || ''
            },
            body: JSON.stringify(payload),
            keepalive: true
        }).catch(() => {
            // Silently fail if server is down to avoid infinite loops or console noise
        });
    }
};

// Auto-initialize if not being imported as a module (for head script usage)
if (typeof import.meta === 'undefined' || !import.meta.url) {
    window.Logger = Logger;
    Logger.init();
}
