declare class Districts {
    "crs": {
        "properties": {
            "name": string
        },
        "type": string
    };
    "features": [
        {
            "type": string,
            "geometry": {
                "type": string,
                "coordinates": [
                    [number, number, number]
                ],
            "properties": {
                "Description": string,
                "Name": string
            }
            }
        }
    ];
}

export = Districts;