document.addEventListener("DOMContentLoaded", () => {
  chrome.alarms.create("dailyReminder", { periodInMinutes: 1440 });
});

document.addEventListener("DOMContentLoaded", () => {
  const jobTitleInput = document.getElementById("jobTitle");
  const jobLinkInput = document.getElementById("jobLink");
  const jobDeadlineInput = document.getElementById("jobDeadline");
  const saveButton = document.getElementById("saveJob");
  const jobList = document.getElementById("jobList");

  // load saved jobs
  chrome.storage.local.get(["jobs"], data => {
    if (data.jobs) {
      data.jobs.forEach(addJobToList);
    }
  });

  saveButton.addEventListener("click", () => {
    const title = jobTitleInput.value.trim();
    const link = jobLinkInput.value.trim();
    const deadline = jobDeadlineInput.value;
    const dateSaved = new Date().toLocaleDateString();

    if (title && link && deadline) {
      const job = { title, link, deadline, dateSaved };

      chrome.storage.local.get(["jobs"], data => {
        const jobs = data.jobs || [];
        jobs.push(job);
        chrome.storage.local.set({ jobs }, () => {
          addJobToList(job);
          jobTitleInput.value = "";
          jobLinkInput.value = "";
          jobDeadlineInput.value = "";

          // Schedule a notification 1 day before the deadline
          scheduleNotification(job);
        });
      });
    }
  });

  function addJobToList(job) {
    const li = document.createElement("li");

    const a = document.createElement("a");
    a.href = job.link;
    a.textContent = job.title;
    a.target = "_blank";

    const infoSpan = document.createElement("span");
    infoSpan.innerHTML = ` - <strong>Saved:</strong> ${job.dateSaved} | <strong>Deadline:</strong> ${job.deadline}`;
    infoSpan.style.fontSize = "12px";
    infoSpan.style.color = "gray";
    infoSpan.style.marginLeft = "5px";

    li.appendChild(a);
    li.appendChild(infoSpan);
    jobList.appendChild(li);
  }

  function scheduleNotification(job) {
    const deadline = new Date(job.deadline);
    const oneDayBefore = new Date(deadline);
    oneDayBefore.setDate(deadline.getDate() - 1);

    const now = new Date();
    const timeUntilNotification = oneDayBefore.getTime() - now.getTime();

    if (timeUntilNotification > 0) {
      chrome.alarms.create(job.title, {
        when: Date.now() + timeUntilNotification,
      });
    }
  }
});
