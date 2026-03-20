type ApiOptions = RequestInit & {
  params?: Record<string, string>;
};

type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

async function api<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options;

  const url = new URL(endpoint, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      data: null,
      error: json?.error ?? `Erro ${response.status}`,
      status: response.status,
    };
  }

  return { data: json as T, error: null, status: response.status };
}

api.get = <T>(endpoint: string, options?: ApiOptions) =>
  api<T>(endpoint, { ...options, method: "GET" });

api.post = <T>(endpoint: string, body: unknown, options?: ApiOptions) =>
  api<T>(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });

api.put = <T>(endpoint: string, body: unknown, options?: ApiOptions) =>
  api<T>(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });

api.delete = <T>(endpoint: string, options?: ApiOptions) =>
  api<T>(endpoint, { ...options, method: "DELETE" });

export { api };
