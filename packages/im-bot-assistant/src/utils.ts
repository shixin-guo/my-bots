import { Response } from 'express';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function log(...args: any[]): void {
  // eslint-disable-next-line no-console
  console.log(...args);
}

async function within(
  fn: () => object,
  res: Response,
  duration: number,
): Promise<void> {
  const id = setTimeout(
    () =>
      res.send({
        message: 'There was an error with the upstream service!',
      }),
    duration,
  );

  try {
    const data = await fn();
    clearTimeout(id);
    res.json(data);
  } catch (e: unknown) {
    res.status(500).json({ error: e });
  }
}

export { within, log };
