const cookieUpdate = (response: Response) => {
    const newCookies = response.headers.get('Set-Cookie')
    if (newCookies) {
        document.cookie = newCookies
    }
}

export const init = async () => {
    const response = await fetch('http://127.0.0.1:8080/')
    const data = await response.json()
    cookieUpdate(response)
    console.log(data.status)
}

export const getNetcards = async () =>  {
    const response = await fetch('http://127.0.0.1:8080/netcard', {
        headers: {
            'Cookie': document.cookie,
        }
    })
    const data = await response.json()
    cookieUpdate(response)
    console.log(data.netcards)
    return data.netcards
}

export const setNetcardMon = async (netcard: string) => {
    const response = await fetch('http://127.0.0.1:8080/netcard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': document.cookie,
        },
        body: JSON.stringify({"netcard": netcard}),
    });

    const data = await response.json();
    cookieUpdate(response);
    console.log(data);
};


export const stopNetcardMon = async () => {
    const response = await fetch('http://127.0.0.1:8080/stop')
    const data = await response.json()
    cookieUpdate(response)
    console.log(data)
}

export const startScan = async () => {
    const response = await fetch('http://127.0.0.1:8080/scan')
    const data = await response.json()
    cookieUpdate(response)
    console.log(data)
}

export const setTarget = async (bssid: string, essid: string, channel: string) => {
    const response = await fetch('http://127.0.0.1:8080/target', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bssid, essid, channel }),
    })
    const data = await response.json()
    cookieUpdate(response)
    console.log(data)
}

export const startAttack = async (id: number, nPackets: string) => {
    const response = await fetch(`http://127.0.0.1:8080/attack/${id}`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ n: nPackets }),
    })
    const data = await response.json()
    cookieUpdate(response)
    console.log(data)
}

export const startCrack = async (wordlist: string) => {
    const response = await fetch(`http://127.0.0.1:8080/crack/${wordlist}`)
    const data = await response.json()
    cookieUpdate(response)
    console.log(data)
}

export const getLists = async (list: string) => {
    const response = await fetch(`http://127.0.0.1:8080/list/${list}`)
    const data = await response.json()
    cookieUpdate(response)
    console.log(data.ls)
    return data.ls
}

export const uploadFile = async (list: string, file: string) => {
    const response = await fetch(`http://127.0.0.1:8080/list/${list}`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: file }),
    })
    const data = await response.json()
    cookieUpdate(response)
    return data.ls
}