const parseFullName = (fullName) => {
  const [name, surname, ...other] = fullName.split(' ');
  return `${name} ${surname.charAt(0).toUpperCase()}. ${other.map(o => `${o.charAt(0).toUpperCase()}.`)}`;
};

export default parseFullName;
