import Lookup from './Lookup'

const lookup = new Lookup('JG66-NJ95-WT24-HA11')
console.log('started')
lookup.find('TR11 2BY').get().then(result => console.log(result))
