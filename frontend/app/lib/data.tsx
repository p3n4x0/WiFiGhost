
export async function getNetcards() {
    try {
        const response = await fetch('http://127.0.0.1:8080/netcard');
        const data = await response.json();
        console.log(data)
        return data.cards;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Puedes decidir si lanzar el error nuevamente o manejarlo de alguna manera específica.
    }
}

export const setNetcardMon = async (netcard: string) => {
    const response = await fetch('http://127.0.0.1:8080/netcard', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ netcard }),
    });
    const data = await response.json();
    console.log(data)
    return data;
};

export const stopNetcardMon = async () => {
    const response = await fetch('http://127.0.0.1:8080/stop');
    const data = await response.json();
    return data;
};

export const startScan = async () => {
    const response = await fetch('http://127.0.0.1:8080/scan');
    const data = await response.json();
    return data;
};

export const setTarget = async (bssid: string, essid: string, channel: string) => {
    const response = await fetch('http://127.0.0.1:8080/target', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bssid, essid, channel }),
    });
    const data = await response.json();
    return data;
};

export const startAttack = async (id: number, nPackets: string) => {
    const response = await fetch(`http://127.0.0.1:8080/attack/${id}`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ n: nPackets }),
    });
    const data = await response.json();
    return data;
};

export const startCrack = async (wordlist: string) => {
    const response = await fetch(`http://127.0.0.1:8080/crack/${wordlist}`);
    const data = await response.json();
    return data;
};

export const getLists = async (list: string) => {
    const response = await fetch(`http://127.0.0.1:8080/list/${list}`);
    const data = await response.json();
    return data.ls
};

export const uploadFile = async (list: string, file: string) => {
    const response = await fetch(`http://127.0.0.1:8080/list/${list}`{
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: file }),
    });
    const data = await response.json();
    return data.ls
};