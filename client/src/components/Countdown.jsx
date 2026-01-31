import { useEffect, useState } from "react";

function formatMs(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function Countdown({ endTimeMs, serverNowMs }) {
  const [leftMs, setLeftMs] = useState(() => endTimeMs - serverNowMs());

  useEffect(() => {
    const id = setInterval(() => {
      setLeftMs(endTimeMs - serverNowMs());
    }, 250); // smooth enough
    return () => clearInterval(id);
  }, [endTimeMs, serverNowMs]);

  const ended = leftMs <= 0;

  return (
    <div style={{ fontWeight: 700, color: ended ? "#999" : "white" }}>
      {ended ? "Ended" : formatMs(leftMs)}
    </div>
  );
}
