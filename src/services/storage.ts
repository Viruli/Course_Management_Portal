import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadCoverImage(localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob     = await response.blob();

  const ext      = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path     = `course-covers/${Date.now()}.${ext}`;
  const fileRef  = ref(storage, path);

  const snapshot = await uploadBytes(fileRef, blob);
  return getDownloadURL(snapshot.ref);
}
