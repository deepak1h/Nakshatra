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

  const responseText = await res.text();

  if (!res.ok) {
      console.error("--------------------- API REQUEST FAILED ---------------------");
      console.error(`HTTP Status: ${res.status} (${res.statusText})`);
      console.error("URL:", url);
      console.error("Response Body (HTML or Error Message):");
      // Log the full HTML or text response from the server
      console.error(responseText);
      console.error("----------------------------------------------------------");
      
      // Throw an error to be caught by React Query
      throw new Error(`Request failed with status ${res.status}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      // This block will run if the server returned a 200 OK status, but the body was HTML, not JSON
      console.error("--------------------- JSON PARSING FAILED ---------------------");
      console.error("The server responded with a 200 OK status, but the response was not valid JSON. This is likely a proxy or routing issue.");
      console.error("URL:", url);
      console.error("Response Body (HTML):");
      // Log the full HTML response
      console.error(responseText);
      console.error("-----------------------------------------------------------");
      
      // Re-throw the original parsing error so React Query knows it failed
      throw e;
    }

  



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
