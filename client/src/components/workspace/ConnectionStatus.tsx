interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
}

/**
 * A quiet, always-present indicator of the realtime connection.
 *
 * Shown rather than hidden when healthy, because "is this live?" is the first
 * question a user asks when messages seem slow — and Socket.IO reconnects on
 * its own, so a transient red dot is information, not an error to act on.
 */
const ConnectionStatus = ({ isConnected, error }: ConnectionStatusProps) => (
  <div className="flex items-center gap-2 text-xs" title={error ?? undefined}>
    <span
      aria-hidden="true"
      className={`h-2.5 w-2.5 rounded-full ${
        isConnected ? "bg-green-500" : "animate-pulse bg-amber-500"
      }`}
    />
    <span className={isConnected ? "text-slate-500" : "text-amber-600"}>
      {isConnected ? "Live" : "Reconnecting…"}
    </span>
  </div>
);

export default ConnectionStatus;
