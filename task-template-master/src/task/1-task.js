import axios from "axios";
import * as cheerio from "cheerio";
import Parser from "rss-parser";

const parser = new Parser();

// RSS Feeds for different categories
const rssFeeds = {
  general: [
    "https://www.thehindu.com/news/feeder/default.rss", // The Hindu
    "https://indianexpress.com/feed/", // Indian Express
    "https://timesofindia.indiatimes.com/rssfeeds/1221656.cms", // Times of India
  ],
  sports: [
    "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms", // TOI Sports
    "https://www.espncricinfo.com/rss/content/story/feeds/0.xml", // ESPN Cricinfo
  ],
  politics: [
    "https://www.ndtv.com/rss", // NDTV
    "https://www.thehindu.com/news/national/feeder/default.rss", // The Hindu Politics
  ],
  entertainment: [
    "https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms", // TOI Entertainment
    "https://www.bollywoodhungama.com/rss/entertainment-news.xml", // Bollywood Hungama
  ],
};

// Fetch news from public RSS feeds
async function fetchRSSFeeds(category) {
  const urls = rssFeeds[category] || [];
  let aggregatedNews = [];

  for (const url of urls) {
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
    { name: "NDTV", url: "https://www.ndtv.com", headlineSelector: "h2" },
    {
      name: "India Today",
      url: "https://www.indiatoday.in",
      headlineSelector: "h2",
    },
    {
      name: "Hindustan Times",
      url: "https://www.hindustantimes.com",
      headlineSelector: "h3",
    },
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
async function fetchNewsAggregator(category = "general") {
  console.log(`Starting news aggregation for category: ${category}`);

  const rssNews = await fetchRSSFeeds(category);
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

export { task };
export { fetchNewsAggregator };
