function generateRandomCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

module.exports.generateOrderCode = () => {
  return 'ORDER-' + generateRandomCode(8);
}

module.exports.generateTransactionCode = () => {
  return 'TRANS-' + generateRandomCode(8);
}

module.exports.generateTourCode = () => {
  return 'TOUR-' + generateRandomCode(8);
}