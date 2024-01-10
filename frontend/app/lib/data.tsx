export const init = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8080/');
        const data = await response.json();
        console.log(data.status);
    } catch (error) {
        console.error('Error in init:', error);
    }
}

export const getNetcards = async () =>  {
    try {
        const response = await fetch('http://127.0.0.1:8080/netcard');
        const data = await response.json();
        console.log(data.netcards);
        return data.netcards;
    } catch (error) {
        console.error('Error in getNetcards:', error);
        return null;
    }
}

export const setNetcardMon = async (netcard: string) => {
    try {
        const response = await fetch('http://127.0.0.1:8080/netcard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({netcard: netcard}),
        });

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error in setNetcardMon:', error);
    }
}

export const stopNetcardMon = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8080/stop');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error in stopNetcardMon:', error);
    }
}

export const startScan = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8080/scan');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error in startScan:', error);
    }
}

export const setTarget = async (bssid: string, essid: string, channel: number) => {
    try {
        const response = await fetch('http://127.0.0.1:8080/target', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "bssid": bssid, "essid": essid, "channel": channel }),
        });

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error in setTarget:', error);
    }
}

export const startAttack = async (id: number, nPackets: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:8080/attack/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "n": nPackets }),
        });

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error in startAttack:', error);
    }
}

export const startCrack = async (wordlist: string, hash: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:8080/crack/${wordlist}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "hash": hash }),
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error in startCrack:', error);
    }
}

export const getList = async (list: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:8080/list/${list}`);
        const data = await response.json();
        console.log(data.ls);
    } catch (error) {
        console.error('Error in getList:', error);
    }
}

export const uploadFile = async (list: string, file: File) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`http://127.0.0.1:8080/list/${list}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        console.log(data.ls);
    } catch (error) {
        console.error('Error in uploadFile:', error);
    }
}

export const deleteFile = async (list: string, file: string) => {  
    try {
        const response = await fetch(`http://127.0.0.1:8080/deleteFile/${list}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "file": file }),
        });

        const data = await response.json();
        console.log(data.status);
    } catch (error) {
        console.error('Error in deleteFile:', error);
    }
}
