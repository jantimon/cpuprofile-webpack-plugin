export function prettifyExecutionTime(time: number) {
  return time > 50000
    ? (time / 100000).toFixed(2) + "s"
    : (time / 100).toFixed(2) + "ms";
}
