# Postcode Anywhere (PCA Predict) API Wrapper

A simple API wrapper for the Postcode Anywhere (PCA Predict) Service

Authors:

* [Marco Mark](mailto:m2de@outook.com)

## Overview

An unofficial implementation of the PCA Predict API for modern Javascript to easily lookup addresses from Post Codes or Partial Address details using the PCA Predict service.

## Requirements

A [PCA Predict](https://www.pcapredict.com/) account and API key is required to use this package.

## Installation

Add the package to your project

```sh
npm install @thesold/pcapredict
```

## Usage

```js
import { Lookup } from '@thesold/pcapredict'

const lookup = new Lookup('API-KEY')

lookup.find('POST CODE').get()
    .then((results) =>
        // results contains an array of addresses found
        lookup.retrieve(results[0]).then((address) => {
            // address contains the full address details for the requested entry
        })
    )
    .catch((error) => {
        // Something went wrong
    })
```

Please see the [official API documentation](https://www.pcapredict.com/support/webservice/serviceslist/capture/) for details about the data returned.
