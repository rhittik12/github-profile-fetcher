import inquirer from 'inquirer';
import fetch from 'node-fetch';
import fs from 'fs';

inquirer
    .prompt([
        {
            name : "username",
            message : "Enter the GitHub username",
            type : "input", 
        }
    ])
    .then(async answers => {
        const username = answers.username;
        const userURL = `https://api.github.com/users/${username}`;
        const reposURL = `https://api.github.com/users/${username}/repos`;
        const eventsURL = `https://api.github.com/users/${username}/events`;

        try{
           
            const userResponse = await fetch(userURL);
            const userData = await userResponse.json();

            if(userData.message === "Not Found"){
                console.log("User not found");
                return;
            }

            
            const reposResponse = await fetch(reposURL);
            const reposData = await reposResponse.json();

            
            const eventsResponse = await fetch(eventsURL);
            const eventsData = await eventsResponse.json();

           
            const projectList = reposData.map(repo => `${repo.name} (${repo.language || 'No language specified'})`).join('\n');

            // Filter duplicate events
            const seenEvents = new Set();
            const uniqueEvents = eventsData.filter(event => {
                const eventKey = `${event.type}-${event.repo?.name}`; // Use optional chaining
                if (seenEvents.has(eventKey)) {
                    return false; // Skip duplicate
                }
                seenEvents.add(eventKey);
                return true; // Keep unique event
            });

            // Extract recent activity (limited to 10 events for brevity)
            const recentActivity = uniqueEvents.slice(0, 10).map(event => {
                const eventType = event.type;
                const repoName = event.repo ? event.repo.name : 'N/A';
                return `${eventType} on ${repoName}`;
            }).join('\n');

            const userInfo = `Name: ${userData.name || 'N/A'}\nUsername: ${userData.login}\nBio: ${userData.bio || 'N/A'}\nFollowers: ${userData.followers}\nFollowing: ${userData.following}\nPublic Repos: ${userData.public_repos}\n\nProjects:\n${projectList || 'No projects found'}\n\nRecent Activity:\n${recentActivity || 'No recent activity'}`;

            console.log(userInfo);

            fs.writeFile("github_profile.txt", userInfo, (err) => {
                if(err){
                    console.log(err);
                }
                console.log("GitHub profile info saved to github_profile.txt");
            });

        }
        catch (error) {
            console.error("Error fetching GitHub data:", error);
        }   

    })
    .catch(console.error);