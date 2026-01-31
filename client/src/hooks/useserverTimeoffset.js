import { useCallback, useState } from "react";

export function useserverTimeoffset() {
  const [offsetMs, setOffsetMs] = useState(0);

  // Call this whenever you receive serverTimeMs from the backend
  const sync = useCallback((serverTimeMs) => {
    setOffsetMs(serverTimeMs - Date.now());
  }, []);

  // serverNowMs() gives you "current server time" even on the client
  const serverNowMs = useCallback(() => Date.now() + offsetMs, [offsetMs]);

  return { offsetMs, sync, serverNowMs };
}
