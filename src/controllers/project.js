import Message from '../models/message';
import Project from '../models/project';
import { SET_MESSAGE } from '../utils/actions';
import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_SEVERITY,
	SNACKBAR_VARIANTS
} from '../utils/constants';
import * as fileUtils from '../utils/file-utils';
import { NEW_PROJECT } from '../utils/notification-types';

export const addProject = (values, notifyUsers, attachments) => {
	return async (dispatch, getState) => {
		const {
			name,
			description,
			customer,
			vendors,
			owners,
			status,
			reminder,
			value
		} = values;
		console.log(values);

		// const { authUser } = getState().authState;
		const { users } = getState().dataState;

		let newProject;
		try {
			newProject = new Project({
				projectId: null,
				attachments: [],
				comments: [],
				customer: { ...customer },
				description: description.trim(),
				metadata: null,
				name: name.trim(),
				owners: owners.map((owner) => owner.userId),
				reminder: reminder,
				status: status.statusId,
				value: value,
				vendors: vendors.map((vendor) => ({ ...vendor }))
			});
			await newProject.save();
			if (attachments.length > 0) {
				const uploadedAttachments = await dispatch(
					fileUtils.upload(
						attachments,
						'projectsNew',
						newProject.projectId,
						newProject.metadata.createdAt.getTime().toString()
					)
				);
				newProject.attachments = uploadedAttachments;
				await newProject.save();
			}
			const message = new Message({
				title: 'Projects',
				body: 'Project added successfully',
				feedback: SNACKBAR,
				options: {
					duration: 3000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.SUCCESS
				}
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		} catch (error) {
			console.log(error);
			const message = new Message({
				title: 'Pojects',
				body: 'Failed to add project',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return null;
		}
		//Send notification, do nothing if this fails so no error is thrown
		try {
			const recipients = users.filter(
				(user) =>
					newProject.owners.includes(user.userId) ||
					notifyUsers.includes(user.userId)
			);
			if (recipients.length > 0) {
				const notifications = [];
				for (const recipient of recipients) {
					const senderFullName = `${authUser.firstName} ${authUser.lastName}`;
					const readableTitle = getReadableTitle(
						{
							details: newEvent.details,
							type: newEvent.type,
							user: authUser.userId
						},
						users
					);
					const emailData = {
						eventTitle: readableTitle,
						start: newEvent.start.getTime(),
						end: newEvent.end.getTime(),
						allDay: newEvent.allDay
					};
					const transformedRecipient = {
						userId: recipient.userId,
						email: recipient.email,
						firstName: recipient.firstName,
						lastName: recipient.lastName,
						location: recipient.location.locationId
					};
					const notification = new Notification({
						notificationId: null,
						emailData: emailData,
						link: `/projects/${newProject.projectId}`,
						metadata: null,
						page: 'Staff Calendar',
						recipient: transformedRecipient,
						title: `Staff Calendar "${readableTitle}" created by ${senderFullName}`,
						type: NEW_PROJECT
					});
					notifications.push(notification);
				}
				await Notification.saveAll(notifications);
			}
			return true;
		} catch (error) {
			return true;
		}
	};
};

export const getListener = (userId) => {
	return Project.getListener(userId);
};
