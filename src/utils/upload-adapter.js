import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';

export default class UploadAdapter {
  constructor(loader, folder) {
    // The file loader instance to use during the upload.
    this.loader = loader;
    this.folder = folder;
  }
  // Starts the upload process.
  async upload() {
    const file = await this.loader.file;
    const serverTime = await getServerTimeInMilliseconds();
    const fullPath = `inline-images/${this.folder}/${serverTime}/${file.name}`;
    this.uploadTask = await firebase.storage().ref().child(fullPath).put(file);
    const imageUrl = await firebase
      .storage()
      .ref()
      .child(this.uploadTask.ref.fullPath)
      .getDownloadURL();
    return { default: imageUrl };
  }
  // Aborts the upload process.
  abort() {
    if (this.uploadTask) {
      this.uploadTask.cancel();
    }
  }
}
