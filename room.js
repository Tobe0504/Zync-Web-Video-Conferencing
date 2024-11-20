const APP_ID = "d516b535e21c41738ad3666f1360d893";

let uid = sessionStorage.getItem("uid");

if (!uid) {
  uid = String(Math.floor(Math.random() * 10000));

  sessionStorage.setItem("uid", uid);
}

let token = null;
let client;

let rtmClient;
let channel;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get("room");

if (!roomId) {
  roomId = "main";
}

let displayName = sessionStorage.getItem("video-conf-name");
if (!displayName) {
  window.location = "lobby.html";
}

let localTracks = [];
let remoteUsers = {};

let localScreenTracks;
let sharingScreen = false;

let joinRoomInit = async () => {
  rtmClient = await AgoraRTM.createInstance(APP_ID);
  await rtmClient.login({ uid, token });

  await rtmClient.addOrUpdateLocalUserAttributes({ name: displayName });

  channel = await rtmClient.createChannel(roomId);
  await channel.join();

  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  await client.join(APP_ID, roomId, token, uid);

  client.on("user-published", handleUserPublished);
  client.on("user-left", handleUserLeft);

  channel.on("MemberJoined", handleMemberJoined);
  channel.on("MemberLeft", handleMemberLeft);

  channel.on("ChannelMessage", handleChannelMessage);

  getMembers();
  addBotMessageToDom(`Welcome to the room ${displayName}! 👋`);
};

let joinStream = async () => {
  console.log("Before end is being run", 100);

  document.getElementById("join-btn").style.display = "none";
  document.getElementById("controls").style.display = "flex";

  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks(
    {},
    {
      encoderConfig: {
        width: { min: 640, ideal: 920, max: 920 },
        height: { min: 480, ideal: 1080, max: 1080 },
      },
    }
  );

  let player = `<div id="user-container-${uid}">
  <div class="video-player" id="user-${uid}"></div>
  </div>`;

  document
    .getElementById("participants")
    .insertAdjacentHTML("beforeend", player);

  document
    .getElementById(`user-container-${uid}`)
    .addEventListener("click", expandVideoFrame);

  localTracks[1].play(`user-${uid}`);

  await client.publish([localTracks[0], localTracks[1]]);
};

let switchToCamera = async () => {
  let player = `<div id="user-container-${uid}">
    <div class="video-player" id="user-${uid}"></div>
    </div>`;

  displayFrame.insertAdjacentHTML("beforeend", player);

  await localTracks[0].setMuted(true);
  await localTracks[1].setMuted(true);

  document.getElementById("mic-btn").classList.remove("control-active");
  document.getElementById("screen-btn").classList.remove("control-active");

  localTracks[1].play(`user-${uid}`);
  await client.publish([localTracks[1]]);
};

const handleUserPublished = async (user, mediaType) => {
  remoteUsers[user.uid] = user;

  await client.subscribe(user, mediaType);

  let player = document.getElementById(`user-container-${user.uid}`);

  if (player === null) {
    player = `<div id="user-container-${user.uid}">
    <div class="video-player" id="user-${user.uid}"></div>
    </div>`;

    document
      .getElementById("participants")
      .insertAdjacentHTML("beforeend", player);

    document
      .getElementById(`user-container-${user.uid}`)
      .addEventListener("click", expandVideoFrame);
  }

  if (mediaType === "video") {
    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

const handleUserLeft = (async = (user) => {
  delete remoteUsers[user.uid];

  document.getElementById(`user-container-${user.uid}`).remove();

  if (userIdInDisplayFrame === `user-container-${user.uid}`) {
    displayFrame.appendChild(videoFrames[0]);
    userIdInDisplayFrame = videoFrames[0].id;
  }
});

let toggleMic = async (e) => {
  let button = e.currentTarget;

  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    button.classList.add("control-active");
  } else {
    await localTracks[0].setMuted(true);
    button.classList.remove("control-active");
  }
};

let toggleCamera = async (e) => {
  let button = e.currentTarget;

  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    button.classList.add("control-active");
  } else {
    await localTracks[1].setMuted(true);
    button.classList.remove("control-active");
  }
};

let toggleScreen = async (e) => {
  let screenButton = e.currentTarget;
  let cameraButton = document.getElementById("camera-btn");

  if (!sharingScreen) {
    sharingScreen = true;

    screenButton.classList.add("control-active");
    cameraButton.classList.remove("control-active");
    cameraButton.style.display = "none";

    localScreenTracks = await AgoraRTC.createScreenVideoTrack();

    document.getElementById(`user-container-${uid}`).remove();
    // displayFrame.style.display = "block";

    let player = `<div id="user-container-${uid}">
<div class="video-player" id="user-${uid}"></div>
</div>`;

    displayFrame.insertAdjacentHTML("beforeend", player);
    document
      .getElementById(`user-container-${uid}`)
      .addEventListener("click", expandVideoFrame);

    userIdInDisplayFrame = `user-container-${uid}`;
    localScreenTracks.play(`user-${uid}`);

    await client.unpublish([localTracks[1]]);
    await client.publish([localScreenTracks]);
  } else {
    sharingScreen = false;
    cameraButton.style.display = "flex";
    document.getElementById(`user-container-${uid}`).remove();
    await client.unpublish([localScreenTracks]);

    switchToCamera();
  }
};

let leaveStream = async (e) => {
  e.preventDefault();

  document.getElementById("join-btn").style.display = "block";
  document.getElementById("controls").style.display = "none";

  for (let i = 0; localTracks.length > i; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }

  await client.unpublish([localTracks[0], localTracks[1]]);

  if (localScreenTracks) {
    await client.unpublish([localScreenTracks]);
  }

  document.getElementById(`user-container-${uid}`).remove();
};

document.getElementById("camera-btn").addEventListener("click", toggleCamera);
document.getElementById("mic-btn").addEventListener("click", toggleMic);
document.getElementById("screen-btn").addEventListener("click", toggleScreen);
document.getElementById("join-btn").addEventListener("click", joinStream);
document.getElementById("leave-btn").addEventListener("click", leaveStream);

joinRoomInit();
