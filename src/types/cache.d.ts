export type Cache  = {
    [address: string]: {
        "status": string,
        "search": string,
        "location": {
            "address": string,
            "lat": number,
            "lng": number,
            "city": string,
            "addressNumber": string,
            "addressStreet": string
        },
        "serviceArea": string,
        "cacheTimeout": number

    }
  };