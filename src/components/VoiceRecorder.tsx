"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onChange: (value: { mime: string; base64: string } | null) => void;
};

export function VoiceRecorder({ onChange }: Props) {
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        !!window.MediaRecorder &&
        !!navigator.mediaDevices?.getUserMedia,
    );
    return () => {
      stopTracks();
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopTracks() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        stopTracks();
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        const buffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i += 1) {
          binary += String.fromCharCode(bytes[i]!);
        }
        onChange({ mime, base64: btoa(binary) });
      };
      mediaRef.current = recorder;
      recorder.start(250);
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s >= 119) {
            stop();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setSupported(false);
    }
  }

  function stop() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
    setRecording(false);
  }

  function clear() {
    stop();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSeconds(0);
    onChange(null);
  }

  if (!supported) {
    return (
      <p className="hint">
        Spraakopname werkt niet in deze browser. Je kunt nog steeds typen.
      </p>
    );
  }

  return (
    <div className="recorder">
      <div className="recorder-row">
        {!recording ? (
          <button type="button" className="btn ghost" onClick={start}>
            Spreek in
          </button>
        ) : (
          <button type="button" className="btn danger" onClick={stop}>
            Stop · {formatTime(seconds)}
          </button>
        )}
        {previewUrl && (
          <button type="button" className="btn text" onClick={clear}>
            Wis audio
          </button>
        )}
      </div>
      {recording && (
        <div className="wave" aria-hidden>
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      )}
      {previewUrl && (
        <audio className="audio-preview" controls src={previewUrl} />
      )}
    </div>
  );
}

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
