const {
  GENERAL,
  MEETING,
  ON_SITE,
  TRAINING,
  OUT_OF_OFFICE,
  SICK_LEAVE,
  ANNUAL_LEAVE,
  OTHER_LEAVE,
  PUBLIC_HOLIDAY
} = require('../data/events');
const admin = require('firebase-admin');
const CollectionData = require('./collection-data');
const { CREATE } = require('../data/actions');
const Permission = require('./permission');
const { addDays, subHours, setMinutes } = require('date-fns');
const { scheduleHour } = require('../utils/function-parameters');
const collectionRef = admin.firestore().collection('events-new');
module.exports = class Event {
  constructor({
    eventId,
    actions,
    allDay,
    comments,
    details,
    end,
    locations,
    metadata,
    start,
    subscribers,
    type,
    user
  }) {
    this.eventId = eventId;
    this.actions = actions;
    this.allDay = allDay;
    this.comments = comments;
    this.details = details;
    this.end = end;
    this.locations = locations;
    this.metadata = metadata;
    this.start = start;
    this.subscribers = subscribers;
    this.type = type;
    this.user = user;
  }

  getEventTitle(eventUserFullName) {
    switch (this.type) {
      case GENERAL:
        return this.details;
      case MEETING:
        return `${eventUserFullName} in a Meeting${
          this.details ? ` (${this.details})` : ''
        }`;
      case ON_SITE:
        return `${eventUserFullName} On Site${
          this.details ? ` (${this.details})` : ''
        }`;
      case TRAINING:
        return `${eventUserFullName} in Training${
          this.details ? ` (${this.details})` : ''
        }`;
      case OUT_OF_OFFICE:
        return `${eventUserFullName} Out of Office${
          this.details ? ` (${this.details})` : ''
        }`;
      case SICK_LEAVE:
        return `${eventUserFullName} on Sick Leave`;
      case ANNUAL_LEAVE:
        return `${eventUserFullName} on Annual Leave`;
      case OTHER_LEAVE:
        return `${eventUserFullName} on Other Leave${
          this.details ? ` (${this.details})` : ''
        }`;
      case PUBLIC_HOLIDAY:
        return `${this.details} Public Holiday`;
      default:
        return this.details;
    }
  }

  static async getAdmins() {
    const permissions = await Permission.get('customers');
    return permissions.groups.admins;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.eventId;
    return databaseObject;
  }

  async save() {
    if (!this.eventId) {
      this.metadata = {
        createdAt: new Date(),
        createdBy: this.user,
        updatedAt: new Date(),
        updatedBy: this.user
      };
      this.actions = [
        ...this.actions,
        {
          actionType: CREATE,
          actionedAt: new Date(),
          actionedBy: this.user,
          notifyUsers: []
        }
      ];
      const docRef = await collectionRef.add(this.getDatabaseObject());
      this.eventId = docRef.id;
      await CollectionData.addCollectionData({
        document: 'events',
        docId: this.eventId
      });
    }
  }

  async delete() {
    await collectionRef.doc(this.eventId).delete();
  }

  async deleteAttachments() {
    await admin
      .storage()
      .bucket()
      .deleteFiles({
        prefix: `events-new/${this.eventId}`
      });
  }

  static async getDayEvents(date) {
    //Bring time back to midnight by subtracting the scheduled hour offset
    const startOfDay = setMinutes(subHours(date, scheduleHour), 0);
    const endOfDay = addDays(startOfDay, 1);
    const collection = await collectionRef
      .where('start', '>=', admin.firestore.Timestamp.fromDate(startOfDay))
      .where('start', '<', admin.firestore.Timestamp.fromDate(endOfDay))
      .get();
    const events = collection.docs.map(
      (doc) => new Event({ eventId: doc.id, ...doc.data() })
    );
    return events;
  }
};
