const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
    (typeof window !== "undefined" ? `http://${window.location.hostname}:4000` : "http://127.0.0.1:4000");

export async function fetcher(endpoint: string, options?: RequestInit) {
    let token = "";
    if (typeof window !== "undefined") {
        try {
            const authStorage = localStorage.getItem("negotiara-auth-v2");
            if (authStorage) {
                const parsed = JSON.parse(authStorage);
                token = parsed.state?.user?.token || "";
            }
        } catch (e) {
            console.error("Failed to retrieve auth token:", e);
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            ...options?.headers,
        },
    })

    if (!response.ok) {
        // Handle 401 Unauthorized - clear auth store and redirect to login
        if (response.status === 401 && typeof window !== "undefined") {
            try {
                localStorage.removeItem("negotiara-auth");
                // Optionally redirect to login
                // window.location.href = "/auth/login";
            } catch (e) {
                console.error("Failed to clear auth on 401:", e);
            }
        }

        let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        try {
            const error = await response.json();
            // Prefer detail field, then message, then generic HTTP error
            errorMsg = error?.detail || error?.message || errorMsg;
        } catch (parseError) {
            // If response body is not JSON, try to get text
            try {
                const text = await response.text();
                console.error("Non-JSON error response:", text);
                errorMsg = text.substring(0, 200) || errorMsg;
            } catch (e) {
                console.error("Failed to read error response:", e);
            }
        }
        throw new Error(errorMsg)
    }

    return response.json()
}

export const negotiationApi = {
    create: (data: any) => fetcher("/api/negotiation/start", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    getSession: (id: string) => fetcher(`/api/negotiation/${id}`),
    getHistory: () => fetcher("/api/negotiation/history"),
    getMetrics: () => fetcher("/api/negotiation/metrics"),
    chat: (data: { negotiationId: string; message: string; price: number; role: "SHIPPER" | "CARRIER" }) => fetcher("/api/negotiation/chat", {
        method: "POST",
        body: JSON.stringify(data),
    }),
}
