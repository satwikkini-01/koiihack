import axios from "axios";
import * as cheerio from "cheerio";
import Parser from "rss-parser";

const parser = new Parser();

// Fetch news from public RSS feeds
async function fetchRSSFeeds() {
  const rssFeeds = [
    "https://www.ndtv.com/rss",                        // NDTV
    "https://timesofindia.indiatimes.com/rss.cms",     // Times of India
    "https://www.hindustantimes.com/rss/topnews/rssfeed.xml", // Hindustan Times
    "https://indianexpress.com/section/india/feed/",  // Indian Express
    "https://www.espn.in/espn/rss/news",              // ESPN India
    "https://economictimes.indiatimes.com/rss.cms",   // Economic Times
    "https://zeenews.india.com/rss/india-national-news.xml", // Zee News
    "https://www.rediff.com/rss/inrss.xml",           // Rediff
    "https://www.livemint.com/rss/news",              // LiveMint
    "https://www.thehindu.com/feeder/default.rss",    // The Hindu
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
    { name: "NDTV", url: "https://www.ndtv.com", headlineSelector: ".newsHdng" },
    { name: "Times of India", url: "https://timesofindia.indiatimes.com", headlineSelector: "h1, h2, h3" },
    { name: "Indian Express", url: "https://indianexpress.com", headlineSelector: "h2" },
    { name: "Hindustan Times", url: "https://www.hindustantimes.com", headlineSelector: "h3" },
    { name: "Zee News", url: "https://zeenews.india.com", headlineSelector: "h2" },
    { name: "ESPN India", url: "https://www.espn.in", headlineSelector: "h1" },
    { name: "Economic Times", url: "https://economictimes.indiatimes.com", headlineSelector: "h3" },
    { name: "Rediff", url: "https://www.rediff.com", headlineSelector: "h2" },
    { name: "LiveMint", url: "https://www.livemint.com", headlineSelector: "h3" },
    { name: "The Hindu", url: "https://www.thehindu.com", headlineSelector: "h2" },
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

// Task execution function
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
