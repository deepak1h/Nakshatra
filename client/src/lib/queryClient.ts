import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Try to parse JSON error first, then fallback to text
    let errorBody;
    try {
      errorBody = await res.json();
    } catch {
      errorBody = await res.text();
    }
    const errorMessage = errorBody?.message || (typeof errorBody === 'string' ? errorBody : res.statusText);
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  token?: string | null,
): Promise<any> {

  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  // Handle cases where the response might be empty (e.g., DELETE 204 No Content)
  if (res.status === 204) {
    return; 
  }
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const getAdminQueryFn = <T>(token: string | null): QueryFunction<T> => 
  async ({ queryKey }) => {
    if (!token) {
      // Or handle this more gracefully depending on your app's needs
      throw new Error("Admin token not provided for authenticated query.");
    }

    const res = await fetch(queryKey.join("/") as string, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
