const Event = require('../models/event');
const {
  ANNUAL_LEAVE,
  SICK_LEAVE,
  OTHER_LEAVE,
  PUBLIC_HOLIDAY
} = require('../data/events');
const User = require('../models/user');
const Notification = require('../models/notification');
const { EVENT_REMINDER } = require('../data/notification-types');
const CollectionData = require('../models/collection-data');

module.exports.sendEventReminder = async () => {
  const todayEvents = await Event.getDayEvents(new Date());
  //Remove events that involve leave, do not need reminders
  const filteredEvents = todayEvents.filter((todayEvent) => {
    const excludedEvents = [ANNUAL_LEAVE, SICK_LEAVE, OTHER_LEAVE];
    return !excludedEvents.includes(todayEvent.type);
  });
  //If any events are of Public Holiday, get all active users
  let activeUsers = [];
  if (filteredEvents.some((event) => event.type === PUBLIC_HOLIDAY)) {
    const collectionData = await CollectionData.get('active-users');
    activeUsers = collectionData.documents;
  }
  let promises = [];
  //Get all the event users first
  for (const event of filteredEvents) {
    promises.push(User.get(event.user));
  }
  const eventUsers = await Promise.all(promises);
  promises = [];
  //Loop through each event and generate the notifications
  for (const [index, event] of filteredEvents.entries()) {
    //Use [index] to map the eventUser with the corresponing event
    const eventUser = eventUsers[index];
    const eventUserFullName = eventUser.getFullName();
    const eventTitle = event.getEventTitle(eventUserFullName);

    let recipients = [...event.subscribers, event.user];
    //If public holiday, inform all active users
    if (event.type === PUBLIC_HOLIDAY) {
      recipients = activeUsers;
    }
    const uniqueRecipients = [...new Set(recipients)];
    const notifications = [];

    const emailData = {
      eventTitle: eventTitle,
      start: event.start.toDate().getTime(),
      end: event.end.toDate().getTime(),
      allDay: event.allDay
    };
    const metadata = {
      createdAt: new Date(),
      createdBy: event.metadata.createdBy,
      updatedAt: new Date(),
      updatedBy: event.metadata.updatedBy
    };

    for (const recipient of uniqueRecipients) {
      const notification = new Notification({
        emailData: emailData,
        link: `/calendar/${event.eventId}`,
        metadata: metadata,
        page: 'Staff Calendar',
        recipient: recipient,
        title: `Staff Calendar reminder for "${eventTitle}" `,
        type: EVENT_REMINDER
      });
      notifications.push(notification);
    }
    promises.push(Notification.saveAll(notifications));
  }
  await Promise.all(promises);
};
