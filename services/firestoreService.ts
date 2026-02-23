import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Game } from '../types';

export const saveGameToFirestore = async (userId: string, game: Game): Promise<void> => {
  const gameRef = doc(db, 'users', userId, 'games', game.id);
  await setDoc(gameRef, {
    ...game,
    updatedAt: serverTimestamp()
  });
};

export const getGamesFromFirestore = async (userId: string): Promise<Game[]> => {
  const gamesRef = collection(db, 'users', userId, 'games');
  const snapshot = await getDocs(gamesRef);
  return snapshot.docs.map(doc => doc.data() as Game);
};

export const deleteGameFromFirestore = async (userId: string, gameId: string): Promise<void> => {
  const gameRef = doc(db, 'users', userId, 'games', gameId);
  await deleteDoc(gameRef);
};

export const saveMultipleGamesToFirestore = async (userId: string, games: Game[]): Promise<void> => {
  const promises = games.map(game => saveGameToFirestore(userId, game));
  await Promise.all(promises);
};

export const updateUserProfile = async (userId: string, data: any): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
};
