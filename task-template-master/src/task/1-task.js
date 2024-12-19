import axios from "axios";
import * as cheerio from "cheerio";
import Parser from "rss-parser";
import {BskyAgent} from "@atproto/api";
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from "dotenv";

dotenv.config();
console.log(process.env.USERNAME)

const parser = new Parser();

const USERNAME = process.env.USERNAME; 
const PASSWORD = process.env.PASSWORD;
const apiKey = process.env.apiKey;

async function generateSummary(context, apiKey) {
  try {
      const genAI = new GoogleGenerativeAI(apiKey);

      let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = {
          contents: [
          {
              role: 'user',
              parts: [
              {
                  text: `Summarize the following news article where I have a bunch of news article in json format and I want to summarize each one of them individually into a concise paragraph containing the key details, including the main topic, any important names, dates, locations, and outcomes. Ensure the summary is clear and objective, without personal opinions or embellishments. Keep the summary under 200 words. 
                  Article: \n\n${JSON.stringify(
                  context
                  )}`,
              },
              ],
          },
          ],
      };

      const result = await model.generateContent(prompt);

      console.log('gemini returned comment', result.response.text());
      const comment = result.response.text();
      
      return comment;

  } catch (error) {
    console.error('Error generating Bluesky comment:', error);
    return null; 
  }
}

async function fetchURL() {
  const agent = new BskyAgent({ service: 'https://bsky.social' });

  await agent.login({ identifier: USERNAME, password: PASSWORD });

  const profile = await agent.getProfile({ actor: USERNAME });
  const feed = await agent.getAuthorFeed({ actor: profile.data.did, limit: 1 });

  if (feed.data.feed.length > 0) {
    const urlsBS = feed.data.feed[0].post.record.text;

    console.log("Raw URLs from Bluesky:", urlsBS);

    try {
      const parsedURLs = JSON.parse(urlsBS);
      console.log("Parsed URLs:", parsedURLs);
      return parsedURLs;
    } catch (error) {
      console.error("Error parsing URLs from Bluesky:", error.message);
      return null;
    }
  } else {
    console.log("No posts found for this user.");
    return null;
  }
}

async function fetchRSSFeeds(category) {
  const rssFeeds = await fetchURL();
  console.log(typeof(rssFeeds))

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
        description: item.contentSnippet || item.content || "No description available",
      }));
      aggregatedNews.push(...articles);
      console.log(`Fetched ${articles.length} articles from ${url}`);
    } catch (error) {
      console.error(`Failed to fetch RSS feed from ${url}:`, error.message);
    }
  }

  aggregatedNews = aggregatedNews.filter(
    (article) =>
      article.title &&
      !["Videos", "Air Quality Index", "Opinion"].includes(article.title.trim())
  );

  return aggregatedNews.slice(0, 10);
}

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

      const headlines = [];
      $(site.headlineSelector).each((_, element) => {
        const title = $(element).text().trim();
        if (title && !["Videos", "Air Quality Index", "Opinion"].includes(title)) {
          headlines.push({ title, source: site.name, link: site.url });
        }
      });

      aggregatedNews.push(...headlines);
      console.log(`Scraped ${headlines.length} headlines from ${site.name}`);
    } catch (error) {
      console.error(`Failed to scrape ${site.name}:`, error.message);
    }
  }

  return aggregatedNews.slice(0, 10); 
}

async function fetchFullContent(newsList) {
  const detailedNews = [];

  for (const news of newsList) {
    try {
      console.log(`Fetching full content for: ${news.link}`);
      const response = await axios.get(news.link);
      const $ = cheerio.load(response.data);

      const content = $("article").text().trim() || $("body").text().trim();
      detailedNews.push({
        title: news.title,
        link: news.link,
        source: news.source,
        description: news.description,
        content: content || "Full content not available",
      });
    } catch (error) {
      console.error(`Failed to fetch full content for ${news.link}:`, error.message);
      detailedNews.push({
        title: news.title,
        link: news.link,
        source: news.source,
        description: news.description,
        content: "Failed to fetch content",
      });
    }
  }

  return detailedNews;
}

async function fetchNewsAggregator(category = "general") {
  console.log(`Starting news aggregation for category: ${category}`);

  const rssNews = await fetchRSSFeeds(category);
  const scrapedNews = await scrapeNewsWebsites();

  const combinedNews = [...rssNews, ...scrapedNews];
  const detailedNews = await fetchFullContent(combinedNews.slice(0, 10));
  const summ = await generateSummary(detailedNews,apiKey);
  console.log("Aggregated News with Full Content:", detailedNews);
  console.log("Gemini Summarized:",summ)
  return {detailedNews, summ};
}

async function task() {
  try {
    console.log("Starting News Aggregator Task...");
    const newsData = await fetchNewsAggregator();

    console.log("News aggregation completed.");
    return newsData;
  } catch (error) {
    console.error("Error in News Aggregator Task:", error.message);
    return [];
  }
}

export { task };
export { fetchNewsAggregator };