import firebase from 'lib/firebase';
import { delBasePath } from 'next/dist/next-server/lib/router/router';

const firestore = firebase.firestore();

export function createUser(uid, data) {
  return firestore
    .collection('users')
    .doc(uid)
    .set({ uid, ...data }, { merge: true });
}

export function createLinks(uids) {
  const batch = firestore.batch();

  uids.forEach((uid) => {
    const linkRef = firestore.collection('links').doc(uid);
    batch.set(linkRef, {
      user_id: '',
      name: '',
      taken: false,
      clicked_by: [],
      id: uid
    });
  });

  batch.commit();
}

export async function resetGame() {
  const batch = firestore.batch();
  const snapshot = await firestore.collection('links').get();

  let link_ids = [];

  snapshot.forEach((doc) => {
    link_ids.push(doc.id);
  });

  link_ids.forEach((id) => {
    const linkRef = firestore.collection('links').doc(id);
    batch.update(linkRef, {
      user_id: '',
      name: '',
      taken: false,
      photoUrl: '',
      clicked_by: []
    });
  });

  batch.commit();
}

export async function startGame() {
  await firestore
    .collection('game')
    .doc('90AiAeusoimJA0CydGC4')
    .update({ start: true });
}

export async function endGame() {
  await firestore
    .collection('game')
    .doc('90AiAeusoimJA0CydGC4')
    .update({ start: false });
}

export async function getGameConfig() {
  try {
    const doc = await firestore
      .collection('game')
      .doc('90AiAeusoimJA0CydGC4')
      .get();

    return doc.data();
  } catch (error) {
    return { error };
  }
}

export async function getLinkById(id) {
  try {
    const doc = await firestore.collection('links').doc(id).get();

    return doc.data();
  } catch (error) {
    return { error };
  }
}

export async function getTheEgg({ id, user }) {
  const linkRef = firestore.collection('links').doc(id);

  try {
    const res = await firestore.runTransaction(async (t) => {
      const doc = await t.get(linkRef);

      if (!doc.data().taken) {
        await t.update(linkRef, {
          taken: true,
          name: user.name,
          user_id: user.id,
          photoUrl: user.photoUrl
        });
        return true;
      } else {
        return false;
      }
    });

    return res;
  } catch (error) {
    return { error };
  }
}
