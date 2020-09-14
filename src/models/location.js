export default class Location {
	constructor(
		locationId,
		address,
		branch,
		colors,
		map,
		phone,
		state,
		timezone
	) {
		this.locationId = locationId;
		this.address = address;
		this.branch = branch;
		this.colors = colors;
		this.map = map;
		this.phone = phone;
		this.state = state;
		this.timezone = timezone;
	}
}
