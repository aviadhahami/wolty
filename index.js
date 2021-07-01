const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
const axios = require('axios');


const WOLT_EPS = {
	getLocationId: 'https://restaurant-api.wolt.com/v1/google/places/autocomplete/json?input='
}

async function run(){

	if(argv.help || argv.h){
		return `Usage is 'wolty <location> [--random]' \n // If your location has space in it, use quotes. \n // Also, please use precise location as there are no IO checks nor testing <3 \n // -h to show help \n // --random to randomize a place to order from`;
	}

	// Make sure we only get one arg
	if(argv._.length > 1) {
		return '❌ Immediate arg should be the location';
	}
	//return `${WOLT_EPS.getLocationId}${encodeURIComponent(argv._[0])}`
	// 1. Get the location ID from wolt
	const woltLocations = await axios.get(`${WOLT_EPS.getLocationId}${encodeURIComponent(argv._[0])}`); 
	const woltLocationId = woltLocations.data.predictions[0].place_id; // This is why we only use single arg with no verifications. Feel free to PR this <3
	return woltLocationId
}

run().then(console.log).catch(console.error);
