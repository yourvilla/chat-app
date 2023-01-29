const socket = io();

//Elements
const $inputBox = document.getElementById("message");
const $sendMessageButton = document.getElementById("send-message");
const $shareLocationButton = document.getElementById("send-location");
const $messageContainer = document.getElementById("messages");

//Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  // //New message element
  const $newMessage = $messageContainer.lastElementChild;
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);

  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // //visible height
  const visibleHeight = $messageContainer.offsetHeight;
  const containerHeight = $messageContainer.scrollHeight;
  var $messageContainer = document.getElementById("your_div");

  // how far i scrolled
  const scrollOffset = $messageContainer.scrollTop + visibleHeight;
  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messageContainer.scrollTop = $messageContainer.scrollHeight;
  }

  console.log(newMessageStyles);
};

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
    username: message.username,
  });
  $messageContainer.insertAdjacentHTML("beforeend", html);
  autoScroll();
  console.log(message);
});

socket.on("location", (link) => {
  const html = Mustache.render(locationTemplate, {
    link: link.text,
    createdAt: moment(link.createdAt).format("h:mm a"),
    username: link.username,
  });
  $messageContainer.insertAdjacentHTML("beforeend", html);
  autoScroll();
  console.log(message);
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

// socket.on("countUpdated", (count) => {
//   console.log("Count updated", count);
// });

// document.querySelector("#increment").addEventListener("click", () => {
//   socket.emit("increment");
// });

$sendMessageButton.addEventListener("click", () => {
  $sendMessageButton.setAttribute("disabled", "disabled");
  socket.emit("send", $inputBox.value, (error) => {
    $sendMessageButton.removeAttribute("disabled");
    $inputBox.value = "";
    if (error) return console.error(error);
    console.log("Msg delivererd");
  });
});

$shareLocationButton.addEventListener("click", () => {
  $shareLocationButton.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position);
    socket.emit(
      "send-location",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        console.log("Location shared");
        $shareLocationButton.removeAttribute("disabled");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    window.location.href = "/";
  }
});
