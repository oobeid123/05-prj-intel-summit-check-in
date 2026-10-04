// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const attendeeList = document.getElementById("attendeeList");
const emptyListMessage = document.getElementById("emptyListMessage");
const celebration = document.getElementById("celebration");

// Track attendance
const maxCount = 50;
let count = 0;
let teamCounts = { water: 0, zero: 0, power: 0 };
let attendees = [];

// Full team names, used in messages and the attendee list
const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

// Load any saved progress from local storage
function loadProgress() {
  const savedCount = localStorage.getItem("attendeeCount");
  const savedTeams = localStorage.getItem("teamCounts");
  const savedAttendees = localStorage.getItem("attendees");

  if (savedCount !== null) {
    count = parseInt(savedCount) || 0;
  }
  if (savedTeams !== null) {
    teamCounts = JSON.parse(savedTeams);
  }
  if (savedAttendees !== null) {
    attendees = JSON.parse(savedAttendees);
  }
}

// Save the current progress to local storage
function saveProgress() {
  localStorage.setItem("attendeeCount", count);
  localStorage.setItem("teamCounts", JSON.stringify(teamCounts));
  localStorage.setItem("attendees", JSON.stringify(attendees));
}

// Show the total count and move the progress bar
function updateAttendance() {
  attendeeCount.textContent = count;

  let percentage = Math.round((count / maxCount) * 100);
  if (percentage > 100) {
    percentage = 100;
  }
  progressBar.style.width = `${percentage}%`;
}

// Show each team's count
function updateTeamCounts() {
  document.getElementById("waterCount").textContent = teamCounts.water;
  document.getElementById("zeroCount").textContent = teamCounts.zero;
  document.getElementById("powerCount").textContent = teamCounts.power;
}

// Show every attendee and their team beneath the team counters
function updateAttendeeList() {
  attendeeList.innerHTML = "";

  for (let i = 0; i < attendees.length; i++) {
    const item = document.createElement("li");
    item.className = `attendee-item ${attendees[i].team}`;

    const name = document.createElement("span");
    name.className = "attendee-name";
    name.textContent = attendees[i].name;

    const team = document.createElement("span");
    team.className = "attendee-team";
    team.textContent = teamNames[attendees[i].team];

    item.appendChild(name);
    item.appendChild(team);
    attendeeList.appendChild(item);
  }

  if (attendees.length === 0) {
    emptyListMessage.style.display = "block";
  } else {
    emptyListMessage.style.display = "none";
  }
}

// Find the team (or teams, if tied) with the most attendees
function getWinningTeams() {
  let highest = 0;
  for (const team in teamCounts) {
    if (teamCounts[team] > highest) {
      highest = teamCounts[team];
    }
  }

  const winners = [];
  for (const team in teamCounts) {
    if (teamCounts[team] === highest) {
      winners.push(team);
    }
  }
  return winners;
}

// Once the goal is reached, celebrate and highlight the winning team
function checkGoal() {
  const cards = document.querySelectorAll(".team-card");
  for (let i = 0; i < cards.length; i++) {
    cards[i].classList.remove("winner");
  }

  if (count < maxCount) {
    celebration.style.display = "none";
    return;
  }

  const winners = getWinningTeams();
  const winnerNames = [];
  for (let i = 0; i < winners.length; i++) {
    document.querySelector(`.team-card.${winners[i]}`).classList.add("winner");
    winnerNames.push(teamNames[winners[i]]);
  }

  if (winners.length === 1) {
    celebration.textContent = `🎉 Goal reached! ${maxCount} attendees checked in. ${winnerNames[0]} wins with ${teamCounts[winners[0]]} attendees!`;
  } else {
    celebration.textContent = `🎉 Goal reached! ${maxCount} attendees checked in. It's a tie between ${winnerNames.join(" and ")}!`;
  }
  celebration.style.display = "block";
}

// Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Get form values
  const name = nameInput.value.trim();
  const team = teamSelect.value;

  // A name made only of spaces gets past "required", so check it here
  if (name === "") {
    nameInput.value = "";
    nameInput.focus();
    return;
  }

  // Increment the total and the team's count
  count++;
  teamCounts[team]++;
  attendees.push({ name: name, team: team });

  // Show a personalized greeting
  greeting.textContent = `🎉 Welcome, ${name} from ${teamNames[team]}!`;
  greeting.className = "success-message";
  greeting.style.display = "block";

  updateAttendance();
  updateTeamCounts();
  updateAttendeeList();
  checkGoal();
  saveProgress();

  form.reset();
  nameInput.focus();
});

// Restore the page from saved progress when it first loads
loadProgress();
updateAttendance();
updateTeamCounts();
updateAttendeeList();
checkGoal();
