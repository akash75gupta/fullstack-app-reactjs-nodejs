# fullstack-app-reactjs-nodejs
A standalone fullstack application created using react.js(front end) and node.js(back end). 

App Name: 
Analytics Dashboard App

App Description:
The app consists of a dashboard that provides graphical analytics of user events captured at product level using Amplitude Analytics.  

System Flow: 
1.) End-User(Customer) uses some product(application) say MyApp. 
2.) Events are logged using third party analytical tools like Amplitude or Google Web Analytics(in this case Amplitude) that captures user behavior across the application called MyApp. 
3.) Amplitude stores and aggregates these events. 
4.) The analytics-dashboard application queries data from Amplitude for a given user(s) pertaining to MyApp, creates reports and renders those reports on the dashboard as graphs. 
5.) Customers can log in to the application and view the dashboard.

Tech stack: 
1.) React.js (Front end) 
2.) Node.js (Back end) 
3.) Redis (Caching) 4.) Amplitude Analytics (Data store) 5.) HighCharts.js (Graphs)  

Glossary: 
MyApp - is the name of an application which is extrinsic to this project. It has been used as a example to define the system flow.
