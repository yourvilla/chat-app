const users = [];

//addUser,removeUser,getUser,getUserInRoom

export const addUser = ({ id, username, room }) => {
  //Clean the data
  username = username.trim();
  room = room.trim();

  //validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  //check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //validate username
  if (existingUser) {
    return {
      error: "Username is in use",
    };
  }

  //Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

export const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
  return {
    error: "User not found",
  };
};

export const getUser = (id) => {
  return users.find((user) => user.id === id);
};

export const getUserInRoom = (room) => {
  return users.filter((user) => user.room === room);
};
