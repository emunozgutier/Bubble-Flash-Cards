import React, { useState, useEffect } from 'react';
import './GlobalErrorToast.css';

const GlobalErrorToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    console.log(`[GlobalErrorToast] Adding toast: ${id} - ${title}`);
    setToasts((prev) => [...prev, { id, title, message, hiding: false }]);

    // Start fade out animation after 5.7s
    setTimeout(() => {
      console.log(`[GlobalErrorToast] Triggering hide animation for toast: ${id}`);
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, hiding: true } : t))
      );
    }, 5700);

    // Remove completely after 6s
    setTimeout(() => {
      console.log(`[GlobalErrorToast] Removing toast from state: ${id}`);
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  useEffect(() => {
    const handleGlobalError = (event) => {
      try {
        let message = event.message || "An error occurred";
        let title = "Application Error";
        
        // Match specific cross-origin script error or missing error information
        if (message === "Script error.") {
          title = "Script Error";
          message = "Script error at :0:0. (A cross-origin or browser extension script failed)";
        } else {
          const filename = event.filename ? event.filename.split('/').pop() : '';
          if (filename) {
            title = "Runtime Error";
            message = `${message} (at ${filename}:${event.lineno}:${event.colno})`;
          }
        }
        
        addToast(title, message);
      } catch (e) {
        console.error("Error in global error handler:", e);
      }
    };

    const handleUnhandledRejection = (event) => {
      try {
        const reason = event.reason;
        let message = "Unhandled promise rejection";
        if (reason) {
          message = reason.message || String(reason);
        }
        addToast("Promise Rejection", message);
      } catch (e) {
        console.error("Error in unhandled rejection handler:", e);
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="error-toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`error-toast ${toast.hiding ? 'hiding' : ''}`}
        >
          <div className="error-toast-icon">⚠️</div>
          <div className="error-toast-content">
            <div className="error-toast-title">{toast.title}</div>
            <div className="error-toast-message">{toast.message}</div>
          </div>
          <button
            className="error-toast-close"
            onClick={() => dismissToast(toast.id)}
            aria-label="Close"
          >
            ×
          </button>
          <div className="error-toast-progress" />
        </div>
      ))}
    </div>
  );
};

export default GlobalErrorToast;
