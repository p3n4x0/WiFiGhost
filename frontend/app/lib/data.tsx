interface KeyInfo {
    apName: string;
    bssid: string;
    password: string;
}

export const init = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8080/');
        const data = await response.json();
        ////console.log(data.status);
    } catch (error) {
        console.error('Error in init:', error);
    }
}

const getNetcards = async () =>  {
    try {
        const response = await fetch('http://127.0.0.1:8080/netcard');
        const data = await response.json();
        return data.netcards;
    } catch (error) {
        console.error('Error in getNetcards:', error);
        return null;
    }
}

export const fetchNetcards = async (setNetcards: React.Dispatch<React.SetStateAction<string[]>>) => {
    try {
      const netcardsBackend = await getNetcards();
      if (netcardsBackend) {
        const netcardsArray = Array.isArray(netcardsBackend) ? netcardsBackend : [netcardsBackend];
        setNetcards(netcardsArray);
      }
    } catch (error) {
      console.error('Error fetching netcards:', error);
    }
  };

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
        ////console.log(data);
    } catch (error) {
        console.error('Error in setNetcardMon:', error);
    }
}

export const stopNetcardMon = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8080/stop');
        const data = await response.json();
        ////console.log(data);
    } catch (error) {
        console.error('Error in stopNetcardMon:', error);
    }
}

export const startScan = async (setScanning: (value: React.SetStateAction<boolean>) => void) => {
    try {
        const response = await fetch('http://127.0.0.1:8080/scan');
        const data = await response.json();
        if (response.status === 200) {
            setScanning(true);
        }
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
        ////console.log(data);
    } catch (error) {
        console.error('Error in setTarget:', error);
    }
}

export const startAttack = async (id: number) => {
    try {
        const response = await fetch(`http://127.0.0.1:8080/attack/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        ////console.log(data);
    } catch (error) {
        console.error('Error in startAttack:', error);
    }
}

export const startAttack0 = async (id: number, nPackets: number) => {
    try {
        const response = await fetch(`http://127.0.0.1:8080/attack/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "n": nPackets }),
        });

        const data = await response.json();
        ////console.log(data);
    } catch (error) {
        console.error('Error in startAttack:', error);
    }
}

export const startAttack2 = async (id: number, fakeNets: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:8080/attack/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "fn": fakeNets }),
        });

        const data = await response.json();
        ////console.log(data);
    } catch (error) {
        console.error('Error in startAttack:', error);
    }
}

export const prepareCrack = async (wordlist: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:8080/prepareCrack/${wordlist}`);
        const data = await response.json();
        ////console.log(data);
    } catch (error) {
        console.error('Error in prepareCrack:', error);
    }
}

export const startCrack = async (hash: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:8080/crack/${hash}`);
        const data = await response.json();
        ////console.log(data);
    } catch (error) {
        console.error('Error in startCrack:', error);
    }
}

const getList = async (list: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:8080/list/${list}`);
        const data = await response.json();
        //console.log(data.ls);
        return data.ls
    } catch (error) {
        console.error('Error in getList:', error);
    }
}

export const fetchList = async (setList: React.Dispatch<React.SetStateAction<string[]>>, type: string) => {
    try {
      const listFromBackend = await getList(type);
      if(listFromBackend){
        setList(listFromBackend);
      }
    } catch (error) {
      console.error('Error fetching initial list:', error);
    }
};

export const fetchKeys = async (setKeys: React.Dispatch<React.SetStateAction<KeyInfo[]>>, type: string) => {
    try {
        if (type === "passDB"){
            const passBackend = await getList("passDB");
            setKeys(passBackend);
        }
        else if (type === "hashDB"){
            const hashBackend = await getList("hashDB");
            setKeys(hashBackend);
        }
        else if (type === "all"){
            const passBackend = await getList("passDB");
            const hashBackend = await getList("hashDB");

            let combinedList: KeyInfo[] = []
            combinedList = [...passBackend, ...hashBackend];
            setKeys(combinedList);
        }

    } catch (error) {
        console.error('Error fetching initial list:', error);
    }
};


export const uploadFile = async (list: string, file: File) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`http://127.0.0.1:8080/list/${list}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        ////console.log(data.ls);
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
        ////console.log(data.status);
    } catch (error) {
        console.error('Error in deleteFile:', error);
    }
}
