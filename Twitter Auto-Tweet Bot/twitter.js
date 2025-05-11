// Twitter Auto Tweet Bot
import { TwitterApi } from 'twitter-api-v2';
import inquirer from 'inquirer';
import fs from 'fs';
import dotenv from 'dotenv';  // Import dotenv to load environment variables

// Load environment variables from the .env file
dotenv.config();

console.log('API Key:', process.env.TWITTER_API_KEY);  


const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY, 
  appSecret: process.env.TWITTER_API_SECRET, 
  accessToken: process.env.TWITTER_ACCESS_TOKEN, 
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET, 
});

inquirer
    .prompt([
        {
            type: "input",
            name: "tweet",
            message: "Enter the tweet you want to post:",
        },
    ])
    .then(async (answers) => {
        const tweet = answers.tweet;

        try {
            const response = await client.v2.tweet(tweet);
            console.log("Tweet posted successfully:", response.data.text);

            fs.writeFile("tweet_log.txt", `Tweet: ${tweet}\nID: ${response.data.id}`, (err) => {
                if (err) return console.error(err);
                console.log("Tweet saved in tweet_log.txt");
            });
        } catch (error) {
            console.error("Error posting tweet:", error);
        }
    })
    .catch(console.error);