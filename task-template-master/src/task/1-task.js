import axios from "axios";
import * as cheerio from "cheerio";
import Parser from "rss-parser";

const parser = new Parser();

// Fetch news from public RSS feeds
async function fetchRSSFeeds() {
  const rssFeeds = [
    "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml", // New York Times
    "http://feeds.bbci.co.uk/news/rss.xml",                     // BBC News
    "https://www.aljazeera.com/xml/rss/all.xml",                // Al Jazeera
  ];

  let aggregatedNews = [];

  for (const url of rssFeeds) {
    try {
      console.log(`Fetching RSS feed from: ${url}`);
      const feed = await parser.parseURL(url);
      const articles = feed.items.map((item) => ({
        title: item.title,
        link: item.link,
        source: feed.title,
      }));
      aggregatedNews.push(...articles);
      console.log(`Fetched ${articles.length} articles from ${url}`);
    } catch (error) {
      console.error(`Failed to fetch RSS feed from ${url}:`, error.message);
    }
  }

  return aggregatedNews;
}

// Scrape news headlines directly from websites
async function scrapeNewsWebsites() {
  const websites = [
    { name: "BBC", url: "https://www.bbc.com/news", headlineSelector: "h3" },
    { name: "NYTimes", url: "https://www.nytimes.com", headlineSelector: "h2" },
    { name: "CNN", url: "https://edition.cnn.com", headlineSelector: "span.cd__headline-text" },
  ];

  let aggregatedNews = [];

  for (const site of websites) {
    try {
      console.log(`Scraping website: ${site.name}`);
      const response = await axios.get(site.url);
      const $ = cheerio.load(response.data);

      // Extract headlines based on the selector
      const headlines = [];
      $(site.headlineSelector).each((_, element) => {
        const title = $(element).text().trim();
        if (title) {
          headlines.push({ title, source: site.name, link: site.url });
        }
      });

      aggregatedNews.push(...headlines);
      console.log(`Scraped ${headlines.length} headlines from ${site.name}`);
    } catch (error) {
      console.error(`Failed to scrape ${site.name}:`, error.message);
    }
  }

  return aggregatedNews;
}

// Main task to aggregate news
async function fetchNewsAggregator() {
  console.log("Starting news aggregation...");

  const rssNews = await fetchRSSFeeds();
  const scrapedNews = await scrapeNewsWebsites();

  const combinedNews = [...rssNews, ...scrapedNews];

  console.log("Aggregated News:", combinedNews);
  return combinedNews;
}

// Task execution function for Koii
async function task() {
  try {
    console.log("Starting News Aggregator Task...");
    const newsData = await fetchNewsAggregator();

    // Optionally return or log the data
    console.log("News aggregation completed.");
    return newsData;
  } catch (error) {
    console.error("Error in News Aggregator Task:", error.message);
    return [];
  }
}

task(); // Add this to run the task manually for testing purposes

export { task };
