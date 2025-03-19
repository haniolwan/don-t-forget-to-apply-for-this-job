chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === "dailyReminder") {
    checkUpcomingDeadlines();
  }
});

function checkUpcomingDeadlines() {
    chrome.storage.local.get(["jobs"], (data) => {
      if (data.jobs && data.jobs.length > 0) {
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];
  
        const upcomingJobs = data.jobs.filter((job) => {
          if (!job.deadline) return false; // Skip if deadline is missing
          const deadline = new Date(job.deadline);
  
          if (isNaN(deadline)) return false; // Skip if deadline is invalid
  
          const deadlineStr = deadline.toISOString().split("T")[0];
          return deadlineStr === todayStr;
        });
  
        if (upcomingJobs.length > 0) {
          const jobList = upcomingJobs.map((job) => `• ${job.title}`).join("\n");
  
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Job Application Deadlines Today!",
            message: `You have ${upcomingJobs.length} job(s) due today:\n${jobList}`,
            priority: 2
          });
        }
      }
    });         
  }
  

// chrome.runtime.onInstalled.addListener(() => {
//   checkUpcomingDeadlines(); // Manually trigger the function
// });
