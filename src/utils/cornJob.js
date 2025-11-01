const { startOfDay, endOfDay, subDays } = require("date-fns");
const cron = require("node-cron");
const ConnectionRequest = require("../model/connectionRequest");
const sentEmail = require("./sesSendEmail");

cron.schedule("5 8 * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequestOfYesterday = await ConnectionRequest.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");

    const listOfEmails = [
      ...new Set(pendingRequestOfYesterday.map((req) => req.toUserId.email)),
    ];

    for (const email of listOfEmails) {
      // instaed of

      try {
        const res = await sentEmail.run(
          "this is a times mail ",
          "you are revieving this becs you have have a request interested which is not rejected or accepted, so please accept it and you revieve this at 8:05",
          email.split("@")[0]
        );
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    console.error(error);
  }
});
