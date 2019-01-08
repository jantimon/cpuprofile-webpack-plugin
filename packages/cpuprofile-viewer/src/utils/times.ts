export function prettifyExecutionTime(time: number) {
  return time > 1000000
    ? (time / 1000000).toFixed(2) + "s"
    : (time / 1000).toFixed(2) + "ms";
}
