export default class Event {
	constructor({
		eventId,
		allDay,
		createdAt,
		createdBy,
		end,
		locations,
		participants,
		start,
		subscribers,
		details,
		type
	}) {
		this.eventId = eventId;
		this.allDay = allDay;
		this.createdAt = createdAt;
		this.createdBy = createdBy;
		this.details = details;
		this.end = end;
		this.locations = locations;
		this.participants = participants;
		this.start = start;
		this.subscribers = subscribers;
		this.type = type;
	}
}
