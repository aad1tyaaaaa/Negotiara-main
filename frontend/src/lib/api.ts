const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export async function fetcher(endpoint: string, options?: RequestInit) {
    let token = "";
    if (typeof window !== "undefined") {
        try {
            const authStorage = localStorage.getItem("negotiara-auth");
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

        try {
            const error = await response.json();
            throw new Error(error.message || `API error: ${response.status}`)
        } catch (parseError) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
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
