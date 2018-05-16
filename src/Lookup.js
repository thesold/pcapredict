const axios = require('axios')

export default class Lookup {
    constructor(key) {
        this.addresses = []
        this.apiVersion = 'v1.00'
        this.axios = axios.create({})
        this.baseUrl = 'https://services.postcodeanywhere.co.uk/Capture/Interactive'
        this.params = {
            key,
        }
    }

    /**
     * Clear the current Lookup to re-use the same object for a new Lookup
     *
     * @returns Lookup
     * @memberof Lookup
     */
    clear() {
        const { key } = this.params

        this.params = { key }
        this.addresses = []

        return this
    }

    /**
     * Set the search parameter for the Find query. Typically this would be a Postcode or address
     *
     * @param string address
     * @returns Lookup
     * @memberof Lookup
     */
    find(address) {
        this.params.text = address

        return this
    }


    /**
     * Set the origin location of the request to enable more intelligent lookups.
     * Typically the user's IP or an ISO country code.
     *
     * @param string location
     * @returns Lookup
     * @memberof Lookup
     */
    from(location) {
        this.params.origin = location

        return this
    }

    /**
     * Limit the search to a specific country to provide better results. Separate multiple countries
     * by using the | character. E.g. 'GB|US'
     *
     * @param string countryCode
     * @returns Lookup
     * @memberof Lookup
     */
    inCountry(countryCode) {
        this.params.countries = countryCode

        return this
    }

    /**
     * Limit the number of results returned by the API.
     *
     * @param int amount
     * @returns Lookup
     * @memberof Lookup
     */
    limit(amount) {
        this.params.limit = amount

        return this
    }

    /**
     * Set the language you would like the results to be returned in. Can be a 2 or 4 letter locale
     * identifier. E.g. 'en' or 'eb-gb'
     *
     * @param string locale
     * @returns Lookup
     * @memberof Lookup
     */
    inLanguage(locale) {
        this.params.language = locale

        return this
    }

    /**
     * Make the requests to the API and retrieve the results. Returns an array of addesses found
     *
     * @returns Promise
     * @memberof Lookup
     */
    async get() {
        await this.axios.get(this.findUrl, this.queryParams()).then(async ({ data }) => {
            if (data.length === 0) return Promise.reject(new Error('No results find for query'))
            if (data[0].Error) return Promise.reject(data[0])

            const entries = await Promise.all(data.map(async postcode =>
                this.resolve(postcode).then(async addresses => addresses.map((addressOption) => {
                    this.addresses.push(addressOption)

                    return Promise.resolve(addressOption)
                }))))

            return Promise.resolve(entries)
        })

        return this.addresses
    }

    /**
     * Returns the URL for Find requests to the API
     *
     * @readonly
     * @returns string
     * @memberof Lookup
     */
    get findUrl() {
        const url = `${this.baseUrl}/Find/${this.apiVersion}/json.ws?`

        return url
    }

    /**
     * Returns the URL for Retrieve requests to the API
     *
     * @readonly
     * @returns string
     * @memberof Lookup
     */
    get retrieveUrl() {
        const url = `${this.baseUrl}/Retrieve/${this.apiVersion}/json.ws?`

        return url
    }

    /**
     * Generates API paramaters combined from both the Class params and additional parameters
     * passed into the method itself.
     *
     * @param Object params
     * @returns Object
     * @memberof Lookup
     */
    queryParams(params = {}) {
        return {
            params: {
                ...this.params,
                ...params,
            },
        }
    }

    /**
     * Resolves a Postcode object returned from a find query into an array of address objects
     *
     * @param string { Id }
     * @returns Promise
     * @memberof Lookup
     */
    resolve({ Id }) {
        return this.axios.get(this.findUrl, this.queryParams({
            container: Id,
        })).then(({ data }) => {
            if (data.length === 0) return Promise.reject(new Error('No results for resolve query'))
            if (data[0].Error) return Promise.reject(new Error(data[0]))

            return Promise.resolve(data)
        }).catch(error => Promise.reject(error))
    }

    /**
     * Returns an object containing full details of an address from an address object
     *
     * @param string { Id }
     * @returns Promise
     * @memberof Lookup
     */
    async retrieve({ Id }) {
        const address = await this.axios.get(this.retrieveUrl, this.queryParams({
            Id,
        })).then(({ data }) => {
            if (data.length === 0) return Promise.reject(new Error('No results for retrieve query'))
            if (data[0].Error) return Promise.reject(data[0])

            return Promise.resolve(data[0])
        }).catch(error => Promise.reject(error))

        return Promise.resolve(address)
    }
}
