import Compressor from 'compressorjs';
import firebase from './firebase';

export const upload = async (folder, file, width) => {
	if (!file.type.includes('image')) {
		throw new Error('Invalid image format');
	}
	const resizedFile = await new Promise((resolve, reject) => {
		return new Compressor(file, {
			width: width,
			success: (result) => {
				resolve(
					new File([result], file.name, {
						type: file.type,
						lastModified: file.lastModified
					})
				);
			},
			error: (error) => reject(error)
		});
	});
	const listAll = await firebase //Delete all existing profile pictures in user folder
		.storage()
		.ref(folder)
		.listAll();
	for (const item of listAll.items) {
		await firebase.storage().ref().child(item.fullPath).delete();
	} //Upload image, then use snapshot in promise to update profilePicture property in the user database
	const uploadResult = await firebase
		.storage()
		.ref()
		.child(`${folder}/${resizedFile.name}`)
		.put(resizedFile);
	const downloadUrl = await firebase
		.storage()
		.ref()
		.child(uploadResult.ref.fullPath)
		.getDownloadURL();
	return downloadUrl;
};
