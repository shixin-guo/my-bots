type Data = Record<string, unknown>;
type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
export const request = async <Result = Data>(
  path: string,
  method: Method = 'GET',
  data?: Data,
  headers?: Record<string, string>,
): Promise<Result> => {
  const res = await fetch(path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: (method !== 'GET' && data && JSON.stringify(data)) || undefined,
    // workaround safari 13 issue
    credentials: 'include',
  });
  let result: string | Result = await res.text();
  try {
    result = JSON.parse(result);
  } catch {
    /* do nothing */
  }
  if (res.ok && result === '') return undefined as unknown as Result;
  if (typeof result === 'string') throw new Error(result);
  if (!res.ok) throw Object.assign(new Error(), result);
  return result as Result;
};

export const GET = async <Result = Data>(path: string): Promise<Result> =>
  request(path);
export const DELETE = async <Result = Data>(
  path: string,
  data?: Data,
): Promise<Result> => request(path, 'DELETE', data);
export const POST = async <Result = Data>(
  path: string,
  data?: Data,
): Promise<Result> => request(path, 'POST', data);
export const PUT = async <Result = Data>(
  path: string,
  data: Data,
): Promise<Result> => request(path, 'PUT', data);
export const PATCH = async <Result = Data>(
  path: string,
  data?: Data,
): Promise<Result> => request(path, 'PATCH', data);
