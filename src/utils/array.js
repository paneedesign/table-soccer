const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export {
  // eslint-disable-next-line import/prefer-default-export
  shuffleArray,
};
