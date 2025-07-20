# 📅 Telegram Reminder Web Application
A full-stack web application that allows users to schedule personalized reminders through Telegram bot integration, with support for Indian Standard Time (IST) scheduling.
### 🚀 Live Demo
[https://ping-my-phone.vercel.app]
## ✨ Features
***👤 User Management***

- User Registration - Create secure accounts with email verification
- User Authentication - Secure login/logout system
- Profile Management - Edit and update user profiles
- Telegram Integration - Link Telegram ID for bot communication

***🤖 Telegram Bot Integration***

- Bot Connection - Seamless integration with custom Telegram bot
- Message Delivery - Automated reminder messages sent via Telegram using GitHub actions
- Real-time Communication - Scheduled message delivery to user's Telegram with a maximum delay of 15 minutes

***⏰ Reminder System***

- Custom Scheduling - Set reminders for specific dates and times
- IST Support - Full support for Indian Standard Time zone
- Flexible Timing - Schedule reminders minutes, hours, or days in advance
- Multiple Reminders - Create and manage multiple active reminders

***📝 Message Management***

- Create Messages - Write custom reminder messages
- Edit Messages - Modify existing reminder content
- Delete Messages - Remove unwanted reminders

## 🛠️ Tech Stack
***Frontend:***

- HTML5, CSS3, JavaScript
- Responsive design for all devices
- Interactive user interface

***Backend:***

- Python, Flask
- RESTful API architecture
- User authentication and authorization

***Database:***

-Firebase
-User data and reminder storage
-Secure data management

***External APIs:***

-Telegram Bot API(BotFather) - Message delivery system

***Deployment:***

- Vercel - Frontend hosting and deployment
- Render - API and database hosting
- GitHub actions - Scheduled triggering of reminders

## 🖥️ Interfaces
***📋 User Dashboard***

- Quick access to create new reminders
- Quick access to edit existing reminders

***🔈Reminders***
- View all scheduled reminders
- Create reminders
- Edit all scheduled reminders
- Delete selected reminders

***🙎‍♂️Profile***
- Profile management interface
- Telegram connection status

## 🎯Functionalities
***⚙️ Reminder Creation***

- Date and time picker with IST support
- Custom message input with subject and body
- Preview functionality before scheduling

***🔧 Management Features***

- Edit reminder content
- Delete specific reminders

## 📱 User Journey

- Registration - User creates account with email/password
- Login - User Logs in to their account
- Profile Setup - User adds Telegram ID to profile
- Bot Connection - User connects with Telegram bot
- Schedule Reminder - User sets date, time, and custom message
- Automatic Delivery - Bot sends reminder at scheduled time
- Management - User can edit, delete, or reschedule reminders

## 📊 Performance
<img width="806" height="643" alt="image" src="https://github.com/user-attachments/assets/8f1bb99f-9e0f-4916-8ef3-0e8b7aed93f5" />

## 🔮 Future Enhancements

- Multiple Timezone Support - Support for global timezones
- Recurring Reminders - Weekly, monthly reminder options
- Group Reminders - Send reminders to Telegram groups
- Rich Media - Support for images and documents in reminders
- Mobile App - Native mobile application development

## 🐛 Known Issues

- Timezone handling needs improvement for edge cases
- Mobile UI could be more intuitive
- Rate limiting for heavy users needs optimization
- Since it runs in render free tier, the server shuts down on inactivity which causes delays sometimes
- Maximum reminder delay of 15 minutes due to gtihub actions

## 🤝 Contributing

- Fork the repository
- Create feature branch 
- Commit changes 
- Push to branch 
- Create Pull Request

## 📄 License
This project is licensed under the MIT License

⭐ Star this repo if you found it helpful!
Built with ❤️ for better productivity and time management
