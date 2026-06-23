"use client";

/**
 * Global error boundary — catches errors thrown in the root layout itself.
 * Must render its own <html>/<body> because it replaces the root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f9fafb",
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 420,
              width: "100%",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 32,
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
              Something went wrong
            </h2>
            <p style={{ color: "#4b5563", marginBottom: 24 }}>
              A critical error occurred while loading the control panel.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: "8px 16px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
