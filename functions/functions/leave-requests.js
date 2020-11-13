const Notification = require('../models/notification');
const { LEAVE_REQUEST_ACTION_REMINDER } = require('../data/notification-types');
const LeaveRequest = require('../models/leave-request');

module.exports.sendLeaveRequestActionReminder = async () => {
  const leaveRequests = await LeaveRequest.getAwaitingApproval();
  //Only send notifications if there is at least one document returned
  if (leaveRequests.length > 0) {
    // Get unique list of all expense claim managers
    const leaveRequestManagers = [];
    for (const leaveRequest of leaveRequests) {
      if (!leaveRequestManagers.includes(leaveRequest.manager)) {
        leaveRequestManagers.push(leaveRequest.manager);
      }
    }
    const notifications = [];
    for (const manager of leaveRequestManagers) {
      const notification = new Notification({
        link: '/leave-requests',
        metadata: {
          createdAt: new Date(),
          createdBy: manager,
          updatedAt: new Date(),
          updatedBy: manager
        },
        page: 'Leave Requests',
        recipient: manager,
        title: 'Leave Requests reminder to Approve outstanding Requests',
        type: LEAVE_REQUEST_ACTION_REMINDER
      });
      notifications.push(notification);
    }
    await Notification.saveAll(notifications);
  }
};
