const fetchPlayers = (firestore: any) => {
  return firestore
    .collection('players')
    .orderBy('fullName', 'asc')
    .get()
    .then((querySnapshot: any) => {
      const playersRef: any[] = [];
      querySnapshot.forEach((doc: any) => playersRef.push(doc));
      return playersRef;
    });
};

export default fetchPlayers;
