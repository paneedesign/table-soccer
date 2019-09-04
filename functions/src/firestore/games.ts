const fetchGames = (firestore: any) => {
  return firestore
    .collection('games')
    .orderBy('timestamp', 'asc')
    .get()
    .then((querySnapshot: any) => {
      const gamesRef: any[] = [];
      querySnapshot.forEach((doc: any) => gamesRef.push(doc));
      return gamesRef;
    });
};

export default fetchGames;
