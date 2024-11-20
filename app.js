const sideSection = document.querySelector(".container > section:nth-child(2)");
const mainSection = document.querySelector(".container > section:nth-child(1)");
const closeSideSectionButton = document.getElementById("close");
const closeSideNavButtonMobile = document.querySelector(
  "#mobile-chats > svg:nth-child(1)"
);
const closeSideSectionButtonMobile = document.getElementById("close");

const participants = document.querySelectorAll(".participants > div");
const sideSectionNavItems = document.querySelectorAll(".sideSectionNav > div");
const messagesSection = document.querySelector(".messagesContainer");
const messagesSectionMobile = document.querySelector(
  ".messagesContainer-mobile"
);

const participantsSection = document.querySelector(".participantsContainer");
const participantsSectionMobile = document.querySelector(
  ".participantsContainer-mobile"
);

const displayFrame = document.getElementById("displayFrame");
const videoFrames = document.getElementsByClassName("video-container");
let userIdInDisplayFrame = null;
const userButton = document.getElementById("user-btn");
const mobileChats = document.getElementById("mobile-chats");

// Functions
const handleCloseSideSection = () => {
  if (window.innerWidth < 1023) {
    mobileChats.style.height = "0vh";
    userButton.classList.remove("control-active");
  } else {
    sideSection.style.flexBasis = "0px";
    sideSection.style.width = "0px";
    userButton.classList.remove("control-active");
  }
};

const handleOpenSideSection = () => {
  sideSection.style.visibility = "visible";
  sideSection.style.flexBasis = "372px";

  userButton.classList.add("control-active");

  scrollToBottomOfChatFrame();
};

const handleClicSideSectionNav = (id) => {
  sideSectionNavItems.forEach((div) => {
    if (div.id === id) {
      div.classList.add("active");
    } else {
      div.classList.remove("active");
    }
  });

  const activeSideSection = Array.from(sideSectionNavItems).find((data) =>
    data?.classList.contains("active")
  );

  if (activeSideSection.id === "messages") {
    messagesSection.style.display = "block";
    messagesSectionMobile.style.display = "block";

    participantsSection.style.display = "none";
    participantsSectionMobile.style.display = "none";
  } else {
    messagesSection.style.display = "none";
    messagesSectionMobile.style.display = "none";
    participantsSection.style.display = "block";
    participantsSectionMobile.style.display = "block";
  }
};

let expandVideoFrame = (e) => {
  let child = displayFrame.children[0];

  if (child) {
    document.getElementById("participants").appendChild(child);
  }

  displayFrame.style.display = "block";
  displayFrame.appendChild(e.currentTarget);
  userIdInDisplayFrame = e.currentTarget.id;
};

const expandMobileChats = () => {
  if (window.innerWidth < 767) {
    mobileChats.style.height = "100vh";

    scrollToBottomOfChatFrame();
  } else {
    handleOpenSideSection();

    scrollToBottomOfChatFrame();
  }
};

const scrollToBottomOfChatFrame = () => {
  const chatSection = document.getElementById("chatSection");
  const chatSectionMobile = document.getElementById("chatSection-mobile");

  chatSection.scroll({ top: chatSection.scrollHeight, behavior: "smooth" });
  chatSectionMobile.scroll({
    top: chatSectionMobile.scrollHeight,
    behavior: "smooth",
  });
};

userButton.addEventListener("click", expandMobileChats);

for (let i = 0; videoFrames.length > i; i++) {
  videoFrames[i].addEventListener("click", expandVideoFrame);
}

closeSideSectionButton.addEventListener("click", handleCloseSideSection);
closeSideNavButtonMobile.addEventListener("click", handleCloseSideSection);

participants.forEach((div) => {
  div.addEventListener("click", handleOpenSideSection);
});

sideSectionNavItems.forEach((div) => {
  div.addEventListener("click", () => handleClicSideSectionNav(div.id));
});

handleClicSideSectionNav("messages");

scrollToBottomOfChatFrame();
