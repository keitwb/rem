// If used with `await` this will delay execution for at least the given number of millis.
export default function sleep(millis: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, millis);
  });
}
