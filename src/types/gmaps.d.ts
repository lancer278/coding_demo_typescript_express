export type Gmapspos =  {
    status: string,
    results: [
        {types: [string],
        formatted_address: string,
        address_components: [{
        short_name: string,
        long_name: string,
        postcode_localities: [string],
        types: [string]
        }],
        partial_match: boolean,
        place_id: string,
        postcode_localities: [string],
        geometry: {
        location: {lat: number, lng: number},
        location_type: string
        viewport: number,
        bounds: number
        }
    }
    ]
   };