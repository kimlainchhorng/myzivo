/** Search protection stub */
export function checkSearchAbuse(
  _origin: string,
  _destination: string,
  _date: string,
  _sessionId: string
) {
  return { allowed: true, message: null };
}
