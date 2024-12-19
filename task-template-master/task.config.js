module.exports = {
    name: "news-aggregator-task",
    description: "Fetch and aggregate news from multiple sources",
    entry: "src/index.js", // Change to your entry file if different
    interval: "60 * * * * *", // Every 60 seconds
    reward: {
        type: "participation", // Reward type
        amount: 10,            // KOII tokens per execution
    },
};
