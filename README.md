# ADO Helper

The report functionality in Azure DevOps isn't *really* the best.
For example, throughput vs estimate for an iteration/sprint (when you're only part-way through) doesn't account for annual leave which can make the data look wrong and result in the wrong questions being asked.

## What is this then?

The idea behind this project is to build something that is generic that could help other Azure DevOps users to have a better view of an iteration or workitem etc.

It is an entirely client-side web application, with no analytics or anything included. You're more than welcome to pull the code down and see for yourself. The Project, Organisation and PAT are stored in an object within the browser's localstorage for whatever domain it runs on.

Yes, it looks a bit janky. I've gone for something that shows the data I need rather than something that looks nice.

## So what can it do?

- Allows a user to specify the organisation and project within a Settings page, along with a Personal Access Token (PAT) which should be obtained from Azure DevOps.
- Lists all teams within the organisation and project
- Lists all iterations for a selected team, ordered into a hierarchical dropdown
- Lists all user stories (and associated tasks) within a selected iteration
  - with an at-a-glance view of story points for user stories and estimate, remaining, completed against tasks
- Shows a calculated view of an iteration, to show a developer's throughput in the iteration
  - **but most importantly**, it shows a delta value that accommodates for annual leave
 
And then recently, I've added the following functionality (I'll add that this new stuff was done with the help of Claude):

- Ability to view a workitem in an alternative view
  - This was off the back of someone in my team saying that the amount of text that can sit in a Description on an ADO workitem is quite hard to digest, so I've tried to use the headings in a description to break down the content into more bite-sized chunks.

## Will it work for me?

Truth be told, I don't know. I've tried to make it as generic as possible, but YMMV. I'm also more than welcome to take any feedback or PRs from anyone too.
