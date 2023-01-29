const generateMsg = (text, username) => {
  return {
    text,
    createdAt: new Date().getTime(),
    username,
  };
};

export default generateMsg;
