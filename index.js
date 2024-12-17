require('dotenv').config(); // Load environment variables
const axios = require('axios');
const cheerio = require('cheerio');
const koiiSdk = require('@_koii/sdk');
console.log(koiiSdk);

/**
 * Scrapes news headlines from BBC News and uploads them to the Koii Network.
 */
async function scrapeNews() {
    const url = 'https://www.bbc.com/news'; // Example news website

    try {
        // Fetch the webpage
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Extract headlines from the webpage
        const headlines = [];
        $('h3').each((index, element) => {
            const headline = $(element).text().trim();
            if (headline) {
                headlines.push(headline);
            }
        });

        if (headlines.length === 0) {
            console.error('No headlines found on the page.');
            return;
        }

        console.log('Scraped Headlines:', headlines);

        // Upload scraped headlines to Koii Network
        await uploadToKoii(headlines);
    } catch (error) {
        console.error('Error scraping news:', error.message);
    }
}

/**
 * Uploads data to the Koii Network.
 * @param {Array} headlines - Array of news headlines to upload.
 */
async function uploadToKoii(headlines) {
    try {
        // Initialize Koii SDK with private key
        const koiiNode = new koiiNode({
            privateKey: process.env.KOII_PRIVATE_KEY,
        });

        // Define data to be uploaded
        const taskData = {
            title: 'News Headlines',
            description: 'Scraped BBC News headlines',
            content: JSON.stringify(headlines), // Convert to JSON string
        };

        // Create a new task on the Koii Network
        const taskId = await koiiNode.createTask(taskData);

        console.log(`Headlines uploaded successfully! Task ID: ${taskId}`);
    } catch (error) {
        console.error('Error uploading to Koii:', error.message);
    }
}

// Execute the scraper
scrapeNews();
