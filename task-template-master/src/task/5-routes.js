import { namespaceWrapper, app } from "@_koii/namespace-wrapper";
import { fetchNewsAggregator } from "./1-task.js"; // Import the news aggregator function

export function routes() {
  /**
   * Define custom routes here
   */

  // General News
  app.get("/news/general", async (_req, res) => {
    try {
      console.log("Received request to fetch general news.");
      const news = await fetchNewsAggregator("general");
      res.status(200).json({ news });
    } catch (error) {
      console.error("Error while fetching general news:", error.message);
      res.status(500).json({ error: "Failed to fetch general news." });
    }
  });

  // Sports News
  app.get("/news/sports", async (_req, res) => {
    try {
      console.log("Received request to fetch sports news.");
      const news = await fetchNewsAggregator("sports");
      res.status(200).json({ news });
    } catch (error) {
      console.error("Error while fetching sports news:", error.message);
      res.status(500).json({ error: "Failed to fetch sports news." });
    }
  });

  // Politics News
  app.get("/news/politics", async (_req, res) => {
    try {
      console.log("Received request to fetch politics news.");
      const news = await fetchNewsAggregator("politics");
      res.status(200).json({ news });
    } catch (error) {
      console.error("Error while fetching politics news:", error.message);
      res.status(500).json({ error: "Failed to fetch politics news." });
    }
  });

  // Entertainment News
  app.get("/news/entertainment", async (_req, res) => {
    try {
      console.log("Received request to fetch entertainment news.");
      const news = await fetchNewsAggregator("entertainment");
      res.status(200).json({ news });
    } catch (error) {
      console.error("Error while fetching entertainment news:", error.message);
      res.status(500).json({ error: "Failed to fetch entertainment news." });
    }
  });

  // Example route for testing
  app.get("/value", async (_req, res) => {
    try {
      const value = await namespaceWrapper.storeGet("value");
      console.log("value", value);
      res.status(200).json({ value });
    } catch (error) {
      console.error("Error fetching value:", error.message);
      res.status(500).json({ error: "Failed to fetch value." });
    }
  });
}