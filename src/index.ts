import axios, { AxiosInstance } from "axios";

export interface AddressRetrieveRequest {
    Key?: string;
    Id: string;
}

export interface AddressResolveRequest {
    Key?: string;
    Text?: string;
    IsMiddleware?: boolean;
    Container?: string;
    Origin?: string;
    Countries?: string;
    Limit?: number;
    Language?: string;
}

export interface AddressRetrieveResponse {
    Id: string;
    DomesticId: string;
    Language: string;
    LanguageAlternatives: string;
    Department: string;
    Company: string;
    SubBuilding: string;
    BuildingNumber: string;
    BuildingName: string;
    SecondaryStreet: string;
    Street: string;
    Block: string;
    Neighbourhood: string;
    District: string;
    City: string;
    Line1: string;
    Line2: string;
    Line3: string;
    Line4: string;
    Line5: string;
    AdminAreaName: string;
    AdminAreaCode: string;
    Province: string;
    ProvinceName: string;
    ProvinceCode: string;
    PostalCode: string;
    CountryName: string;
    CountryIso2: string;
    CountryIso3: string;
    CountryIsoNumber: number;
    SortingNumber1: string;
    SortingNumber2: string;
    Barcode: string;
    POBoxNumber: string;
    Label: string;
    Type: string;
    DataLevel: string;
}

export interface AddressResolveResponse {
    Id: string;
    Type: "Address" | "Postcode" | "Street";
    Text: string;
    Highlight: string;
    Description: string;
}

export default class Lookup {
    protected addresses: AddressResolveResponse[];
    protected apiVersion: string;
    protected axios: AxiosInstance;
    protected baseUrl: string;
    protected params: AddressResolveRequest;

    constructor(Key: string, Text: string = "") {
        this.addresses = [];
        this.apiVersion = "v1.1";
        this.axios = axios.create();
        this.baseUrl = "https://api.addressy.com/Capture/Interactive";
        this.params = {
            Key,
            Text,
        };
    }

    /**
     * Clear the current Lookup to re-use the same object for a new Lookup
     *
     * @returns Lookup
     * @memberof Lookup
     */
    clear() {
        const { Key } = this.params;

        this.params = { Key, Text: "" };
        this.addresses = [];

        return this;
    }

    /**
     * Set the search parameter for the Find query. Typically this would be a Postcode or address
     */
    find(address: string) {
        this.params.Text = address;

        return this;
    }

    /**
     * Set the origin location of the request to enable more intelligent lookups.
     * Typically the user's IP or an ISO country code.
     */
    from(location: string) {
        this.params.Origin = location;

        return this;
    }

    /**
     * Limit the search to a specific country to provide better results. Separate multiple countries
     * by using the | character. E.g. 'GB|US'
     */
    inCountry(countryCode: string) {
        this.params.Countries = countryCode;

        return this;
    }

    /**
     * Limit the number of results returned by the API.
     */
    limit(amount: number) {
        this.params.Limit = amount;

        return this;
    }

    /**
     * Set the language you would like the results to be returned in. Can be a 2 or 4 letter locale
     * identifier. E.g. 'en' or 'eb-gb'
     */
    inLanguage(locale: string) {
        this.params.Language = locale;

        return this;
    }

    /**
     * Make the requests to the API and retrieve the results. Returns an array of addesses found
     */
    async get() {
        const params: AddressResolveRequest = this.params;
        await this.axios
            .get(this.findUrl, { params })
            .then(async ({ data: { Items } }) => {
                if (Items.length === 0)
                    return Promise.reject(
                        new Error("No results find for query")
                    );
                if (Items[0].Error) return Promise.reject(Items[0]);

                const entries = await Promise.all(
                    Items.filter(
                        (item: AddressResolveResponse) => {
                            const isAddress: boolean =  item.Type === "Address"
                            if (!isAddress) return true

                            this.addresses.push(item)
                        }
                    ).map(async (item: AddressResolveResponse) =>
                        this.resolve(item).then(
                            async (addresses: AddressResolveResponse[]) =>
                                addresses.map((addressOption) => {
                                    this.addresses.push(addressOption);

                                    return Promise.resolve(addressOption);
                                })
                        )
                    )
                ).catch(() =>
                    Promise.reject(
                        new Error("The postcode could not be resolved")
                    )
                );

                return Promise.resolve(entries);
            });

        return this.addresses;
    }

    /**
     * Returns the URL for Find requests to the API
     */
    get findUrl(): string {
        return `${this.baseUrl}/Find/${this.apiVersion}/json3ex.ws?`;
    }

    /**
     * Returns the URL for Retrieve requests to the API
     */
    get retrieveUrl(): string {
        return `${this.baseUrl}/Retrieve/${this.apiVersion}/json3ex.ws?`;
    }

    /**
     * Resolves a Postcode object returned from a find query into an array of address objects
     */
    async resolve({ Id }: AddressResolveResponse) {
        const params: AddressResolveRequest = { Container: Id, ...this.params };
        return this.axios
            .get(this.findUrl, { params })
            .then(({ data: { Items } }) => {
                if (Items.length === 0)
                    return Promise.reject(
                        new Error("No results for resolve query")
                    );
                if (Items[0].Error) return Promise.reject(new Error(Items[0]));

                return Promise.resolve(Items);
            })
            .catch((error) => Promise.reject(error));
    }

    /**
     * Returns an object containing full details of an address from an address object
     *
     * @param string { Id }
     * @returns Promise
     * @memberof Lookup
     */
    async retrieve({ Id }: AddressResolveResponse) {
        const { Key } = this.params;
        const params: AddressRetrieveRequest = { Id, Key };
        const address = await this.axios
            .get(this.retrieveUrl, { params })
            .then(({ data: { Items } }) => {
                if (Items.length === 0)
                    return Promise.reject(
                        new Error("No results for retrieve query")
                    );
                if (Items[0].Error) return Promise.reject(Items[0]);

                return Promise.resolve(Items[0]);
            })
            .catch((error) => Promise.reject(error));

        return Promise.resolve(address);
    }
}
