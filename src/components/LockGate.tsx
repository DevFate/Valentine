"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const STORAGE_KEY = "valentine:unlocked";
const PASSPHRASE = "cutie pututie";

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function LockGate({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "true") {
        setIsUnlocked(true);
      }
    } catch {
      // Ignore storage failures (private mode, etc.)
    }
  }, []);

  const helperCopy = useMemo(
    () =>
      error
        ? "Try again, love."
        : "Enter the key to unlock this little love story.",
    [error],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalize(inputValue);

    if (normalized === PASSPHRASE) {
      setIsUnlocked(true);
      setError("");
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // Ignore storage failures
      }
      return;
    }

    setError("That key does not match. ❤️");
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="lock-screen">
      <div className="lock-card">
        <p className="lock-eyebrow">For my favorite human</p>
        <h1>Enter our secret key</h1>
        <p className="lock-subtitle">{helperCopy}</p>

        <form className="lock-form" onSubmit={handleSubmit}>
          <label className="lock-label" htmlFor="valentine-key">
            Key phrase
          </label>
          <input
            id="valentine-key"
            className="lock-input"
            type="text"
            placeholder="Type the key here"
            autoComplete="off"
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              if (error) {
                setError("");
              }
            }}
          />
          {error ? (
            <p className="lock-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="lock-button" type="submit">
            Unlock the story
          </button>
        </form>

        <p className="lock-footer">Hint: the sweetest nickname.</p>
      </div>
    </div>
  );
}
