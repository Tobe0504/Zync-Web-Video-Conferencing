let form = document.getElementById("lobby-form");

let displayName = sessionStorage.getItem("video-conf-name");

if (displayName) {
  form.name.value = displayName;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  sessionStorage.setItem("video-conf-name", e.target.name.value);

  let inviteCode = e.target.room.value;

  if (!inviteCode) {
    inviteCode = String(Math.floor(Math.random() * 10000));
  }

  window.location = `index.html?room=${inviteCode}`;
});
