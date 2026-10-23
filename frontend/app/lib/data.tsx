// Centralised API layer for the WiFiGhost backend.
//
// The backend base URL can be overridden with NEXT_PUBLIC_API_URL (see
// .env.example); it defaults to the local Flask server.

export const API_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8080';

export interface KeyInfo {
    apName: string;
    bssid: string;
    password: string | null;
    file?: string;
}

export interface ApiResult<T = any> {
    ok: boolean;
    data?: T;
    error?: string;
}

async function api<T = any>(path: string, options?: RequestInit): Promise<ApiResult<T>> {
    try {
        const response = await fetch(`${API_URL}${path}`, options);
        let data: any = null;
        try {
            data = await response.json();
        } catch {
            // Non-JSON body; ignore.
        }

        if (!response.ok) {
            const message =
                (data && (data.status || data.error)) || `Request failed (${response.status})`;
            return { ok: false, error: String(message) };
        }

        return { ok: true, data };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Network error';
        console.error(`API error on ${path}:`, error);
        return { ok: false, error: `Cannot reach the backend at ${API_URL}. Is it running?` };
    }
}

export const init = async (): Promise<ApiResult> => api('/');

const getNetcards = async (): Promise<string[]> => {
    const res = await api<{ netcards: string[] }>('/netcard');
    if (!res.ok || !res.data) return [];
    const nc = res.data.netcards;
    return Array.isArray(nc) ? nc : nc ? [nc] : [];
};

export const fetchNetcards = async (
    setNetcards: React.Dispatch<React.SetStateAction<string[]>>,
) => {
    const netcards = await getNetcards();
    setNetcards(netcards);
};

export const setNetcardMon = async (netcard: string): Promise<ApiResult> =>
    api('/netcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ netcard }),
    });

export const stopNetcardMon = async (): Promise<ApiResult> => api('/stop');

export const startScan = async (): Promise<ApiResult> => api('/scan');

export const stopScan = async (): Promise<ApiResult> => api('/stopScan');

export const setTarget = async (
    bssid: string,
    essid: string,
    channel: number,
): Promise<ApiResult> =>
    api('/target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bssid, essid, channel }),
    });

export const startAttack = async (id: number): Promise<ApiResult> =>
    api(`/attack/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });

export const startAttack0 = async (id: number, nPackets: number): Promise<ApiResult> =>
    api(`/attack/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n: nPackets }),
    });

export const startAttack2 = async (id: number, fakeNets: string): Promise<ApiResult> =>
    api(`/attack/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fn: fakeNets }),
    });

export const prepareCrack = async (wordlist: string): Promise<ApiResult> =>
    api(`/prepareCrack/${encodeURIComponent(wordlist)}`);

export const startCrack = async (hash: string, wordlist?: string): Promise<ApiResult> => {
    const qs = wordlist ? `?wordlist=${encodeURIComponent(wordlist)}` : '';
    return api(`/crack/${encodeURIComponent(hash)}${qs}`);
};

const getList = async (list: string): Promise<any[]> => {
    const res = await api<{ ls: any[] }>(`/list/${encodeURIComponent(list)}`);
    return res.ok && res.data ? res.data.ls || [] : [];
};

export const fetchList = async (
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    type: string,
) => {
    setList(await getList(type));
};

export const fetchKeys = async (
    setKeys: React.Dispatch<React.SetStateAction<KeyInfo[]>>,
    type: string,
) => {
    if (type === 'passDB') {
        setKeys(await getList('passDB'));
    } else if (type === 'hashDB') {
        setKeys(await getList('hashDB'));
    } else if (type === 'all') {
        const [pass, hash] = await Promise.all([getList('passDB'), getList('hashDB')]);
        setKeys([...pass, ...hash]);
    }
};

export const uploadFile = async (list: string, file: File): Promise<ApiResult> => {
    const formData = new FormData();
    formData.append('file', file);
    return api(`/list/${encodeURIComponent(list)}`, { method: 'POST', body: formData });
};

export const deleteFile = async (list: string, file: string): Promise<ApiResult> =>
    api(`/deleteFile/${encodeURIComponent(list)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file }),
    });

export const readFile = async (
    list: string,
    file: string,
): Promise<ApiResult<{ content: string; truncated: boolean }>> =>
    api(`/file/${encodeURIComponent(list)}/${encodeURIComponent(file)}`);
