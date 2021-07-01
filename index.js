const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv
const axios = require('axios');
const orderBy = require('lodash.orderby');
const Table = require('cli-table');

const WOLT_EPS = {
	getLocationId: 'https://restaurant-api.wolt.com/v1/google/places/autocomplete/json?input=',
	getLocationGeo: 'https://restaurant-api.wolt.com/v1/google/geocode/json?place_id=',
	getRestaurants: 'https://restaurant-api.wolt.com/v1/pages/restaurants?'
}

const COMPARATORS = {
	rating: 'rating.rating',
	price: 'price_range',
	shippingTime: 'estimate',
	deliveryPrice: 'delivery_price'
}

const getRestsURLBuilder = (lat, lon) => `${WOLT_EPS.getRestaurants}lat=${lat}&lon=${lon}`;

function present(venues){
	const arrReadyVenues = [].concat(venues);
	const table = new Table({
		head: ['Name', 'Type', 'Delivery est. (minutes)', 'Delivery price', 'Price range', 'Rating']	
	});
	table.push(
		...arrReadyVenues.map(({venue}) => {
			const results = [];
			results.push(venue.name);
			results.push((venue.categories || []).map(v=>v.name));
			results.push(venue.estimate);
			results.push(venue.delivery_price);
			results.push(new Array(Number(venue.price_range || 0)).fill('$').join(''))
			results.push(new Array(Number((venue.rating|| {}).rating) || 0).fill('★').join(''));
			return results;
		})
	)
	return table.toString();
}

async function run(){

	if(argv.help || argv.h){
		return `Usage is 'wolty <location> [--random]' \n // If your location has space in it, use quotes. \n // Also, please use precise location as there are no IO checks nor testing <3 \n // -h to show help \n // --random to randomize a place to order from`;
	}

	// Make sure we only get one arg
	if(argv._.length > 1) {
		return '❌ Immediate arg should be the location';
	}
	
	if(argv.sort){
		if(!COMPARATORS[argv.sort]) return `Invalid sort option, "${argv.sort}"; Use one of ${Object.keys(COMPARATORS).join(', ')}`
	}
	// 1. Get the location ID from wolt
	const woltLocations = await axios.get(`${WOLT_EPS.getLocationId}${encodeURIComponent(argv._[0])}`); 
	const woltLocationId = woltLocations.data.predictions[0].place_id; // This is why we only use single arg with no verifications. Feel free to PR this <3
	
	// 2. Get coords from location
	const woltGeoResponse = await axios.get(`${WOLT_EPS.getLocationGeo}${woltLocationId}`);

	// Coords shape is {lat: number, lng: number}. Yes, no TS.
	const coords = woltGeoResponse.data.results[0].geometry.location;

	const nearbyRests = (await axios.get(getRestsURLBuilder(coords.lat, coords.lng)))
											.data
											.sections[0] // not sure, wolt api ¯\_(ツ)_/¯
											.items;
	// Filter for open & delivering
	let relevantVenues = nearbyRests.filter(v=>v.venue.online && v.venue.delivers);

	if (argv.random){
		return present(relevantVenues[Math.floor(Math.random() * relevantVenues.length)])
	}

	if(argv.sort){
		relevantVenues = orderBy(relevantVenues, `venue.${COMPARATORS[argv.sort]}`)
	}

	return present(relevantVenues);
}

run().then(console.log).catch(console.error);
