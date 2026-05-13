import { auth } from './firebase';

export async function getAuthToken(): Promise<string | undefined> {
  return auth.currentUser?.getIdToken() ?? undefined;
}
