let handleMemberJoined = async (MemberId) => {
  addMemberToDom(MemberId);

  let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ["name"]);

  addBotMessageToDom(`Welcome to the room ${name}! 👋`);
};

let addMemberToDom = async (MemberId) => {
  let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ["name"]);

  let membersWrapper = document.getElementById("participantsContainer");
  let membersWrapperMobile = document.getElementById(
    "participantsContainer-mobile"
  );

  let memberItem = ` <p id="member-${MemberId}-wrapper">
    <span> ${name} </span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 384 512"
      height="14px"
      width="14px"
    >
      <path
        d="M32 32C32 14.3 46.3 0 64 0L320 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-29.5 0 11.4 148.2c36.7 19.9 65.7 53.2 79.5 94.7l1 3c3.3 9.8 1.6 20.5-4.4 28.8s-15.7 13.3-26 13.3L32 352c-10.3 0-19.9-4.9-26-13.3s-7.7-19.1-4.4-28.8l1-3c13.8-41.5 42.8-74.8 79.5-94.7L93.5 64 64 64C46.3 64 32 49.7 32 32zM160 384l64 0 0 96c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-96z"
        fill="#fff"
      />
    </svg>
  </p>`;

  membersWrapper.insertAdjacentHTML("beforeend", memberItem);
  membersWrapperMobile.insertAdjacentHTML("beforeend", memberItem);
};

let handleMemberLeft = async (MemberId) => {
  removeMemberFromDom(MemberId);
};

let removeMemberFromDom = async (MemberId) => {
  let memberWrapper = document.getElementById(`member-${MemberId}-wrapper`);
  const name = memberWrapper.children[0].innerHTML;

  memberWrapper.remove();

  addBotMessageToDom(`${name} has left the room`);
};

let getMembers = async () => {
  let members = await channel.getMembers();

  for (let i = 0; members.length > i; i++) {
    addMemberToDom(members[i]);
  }
};

let handleChannelMessage = async (messageData, MemberId) => {
  let data = JSON.parse(messageData.text);

  if (data.type === "chat") {
    addMessageToDom(data.displayName, data?.message);
  }
};

let sendMessage = async (e) => {
  e.preventDefault();

  let message = e.target.message.value;
  channel.sendMessage({
    text: JSON.stringify({
      type: "chat",
      message: message,
      displayName: displayName,
    }),
  });

  addMessageToDom(displayName, message);

  e.target.reset();
};

let addMessageToDom = (name, message) => {
  let messagesWrappper = document.getElementById("chatSection");
  let messagesWrappperMobile = document.getElementById("chatSection-mobile");

  let newMessage = `<div class="chat">
    <p>${name}</p>
    <p>${message}</p>
  </div>`;

  messagesWrappper.insertAdjacentHTML("beforeend", newMessage);
  messagesWrappperMobile.insertAdjacentHTML("beforeend", newMessage);

  let lastMessage = document.querySelector(".chatSection > chat:last-child");
  if (lastMessage) {
    lastMessage.scrollIntoView();
  }

  // scrollToBottomOfChatFrame();
};

let addBotMessageToDom = (botMessage) => {
  let messagesWrappper = document.getElementById("chatSection");
  let messagesWrappperMobile = document.getElementById("chatSection-mobile");

  let newMessage = ` <div class="chat-bot">
    <p>Video Conf Bot</p>
    <p>
      ${botMessage}
    </p>
  </div>`;

  messagesWrappper.insertAdjacentHTML("beforeend", newMessage);
  messagesWrappperMobile.insertAdjacentHTML("beforeend", newMessage);

  let lastMessage = document.querySelector(".chatSection > chat:last-child");
  if (lastMessage) {
    lastMessage.scrollIntoView();
  }

  // scrollToBottomOfChatFrame();
};

let leaveChannel = async () => {
  await channel.leave();
  await rtmClient.logout();
};

window.addEventListener("beforeunload", leaveChannel);
let messageForm = document.getElementById("message-form");
let messageFormMobile = document.getElementById("message-form-mobile");

messageForm.addEventListener("submit", sendMessage);
messageFormMobile.addEventListener("submit", sendMessage);