import React, { useEffect, useRef, useState } from "react";
import { getCsrfToken } from "../../services/adminApi.js";
import {
  MEDIA_ACCEPT,
  validateFiles,
  uploadFiles,
} from "./mediaUploadQueue.js";

function uploadFile(file, progress, active) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    active.current = xhr;
    xhr.open("POST", "/api/media/upload");
    xhr.setRequestHeader("X-CSRF-Token", getCsrfToken());
    xhr.timeout = 180000;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) progress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const value = JSON.parse(xhr.responseText);
        if (xhr.status < 200 || xhr.status >= 300)
          throw new Error(value.error || "Upload failed.");
        resolve(value);
      } catch (error) {
        reject(error);
      }
    };
    xhr.onerror = () =>
      reject(new Error("Network error. Please retry this file."));
    xhr.ontimeout = () =>
      reject(new Error("Upload timed out. Please retry this file."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));
    const data = new FormData();
    data.append("file", file);
    xhr.send(data);
  });
}

export function Upload({ onDone, onBusyChange, accept = MEDIA_ACCEPT }) {
  const [files, setFiles] = useState([]),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [results, setResults] = useState([]),
    [progress, setProgress] = useState(0),
    [current, setCurrent] = useState(0);
  const input = useRef(null),
    active = useRef(null),
    mounted = useRef(true),
    running = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      active.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!busy) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);
  async function start() {
    if (running.current) return;
    const problem = validateFiles(files);
    if (problem) {
      setMessage(problem);
      return;
    }
    running.current = true;
    setBusy(true);
    onBusyChange?.(true);
    setMessage("");
    setResults([]);
    try {
      const out = await uploadFiles(
        files,
        (file, report) => {
          if (!mounted.current) throw new Error("Upload cancelled.");
          return uploadFile(file, report, active);
        },
        ({ index, percent, results: done }) => {
          if (!mounted.current) return;
          setCurrent(index + 1);
          setProgress(
            Math.round(((index + percent / 100) / files.length) * 100),
          );
          setResults([...done]);
        },
      );
      if (!mounted.current) return;
      const uploaded = out.filter((x) => x.item).map((x) => x.item);
      const failed = out.filter((x) => x.error).map((x) => x.file);
      setFiles(failed);
      if (input.current) input.current.value = "";
      setMessage(
        `${uploaded.length} file(s) uploaded.${failed.length ? ` ${failed.length} failed. Click Retry failed files to retry only those files.` : ""}`,
      );
      if (uploaded.length) onDone?.(uploaded);
    } finally {
      running.current = false;
      if (mounted.current) {
        setBusy(false);
        onBusyChange?.(false);
      }
    }
  }
  return (
    <div className="card upload-box" aria-busy={busy}>
      <label>
        Choose up to 20 files
        <input
          ref={input}
          type="file"
          multiple
          accept={accept}
          disabled={busy}
          onChange={(e) => {
            const chosen = [...e.target.files],
              problem = validateFiles(chosen);
            setMessage(problem);
            setResults([]);
            setFiles(problem ? [] : chosen);
            if (problem) e.target.value = "";
          }}
        />
      </label>
      <p className="muted">
        Select up to 20 pictures at once. JPG, PNG, WebP, GIF, MP4, WebM and PDF
        are supported; each file is checked separately.
      </p>
      {!!files.length && !busy && (
        <p>
          {files.length} file(s) ready: {files.map((x) => x.name).join(", ")}
        </p>
      )}
      <button
        type="button"
        className="button small"
        disabled={busy || !files.length}
        onClick={start}
      >
        {busy
          ? `Uploading ${current}/${files.length} · ${progress}%`
          : results.some((x) => x.error)
            ? "Retry failed files"
            : "Upload selected files"}
      </button>
      {busy && (
        <progress value={progress} max="100" aria-label="Upload progress" />
      )}
      <p role="status" aria-live="polite">
        {message}
      </p>
      {!!results.length && (
        <ul className="upload-results">
          {results.map((x, i) => (
            <li key={i} className={x.error ? "field-error" : ""}>
              {x.file.name}: {x.error || "Uploaded"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
