# EMRALL: Contest Management System

**EMRALL** is a contest management software built using JavaScript and Node.js for contest holders. It facilitates the registration of users, the generation of unique QR codes, and the management of users and contest results. The software allows admins to assign times to users, track their performance, and calculate contest winners based on custom algorithms.

## Features
- **User Registration & Login**: Users can sign up and log in. After sign-up, each user is assigned a unique QR code.
- **Admin Login**: Admins have special access to manage users, assign times, and view contest results.
- **QR Code Generation**: Each user gets a unique QR code upon registration, which is scanned by admins to assign times to users in different sections.
- **Contest Management**: Admins can assign times to users in various contest sections, store data in a PostgreSQL database, and view results.
- **Results Calculation**: The software computes the contest winner based on an algorithm specified by the admin, which can vary for different contests.
- **Clear Table**: Admins can clear the contest table when the contest is over and reset it for the next contest.
- **User Management**: Admins can delete users and manage the database entries.

## Tech Stack
- **Node.js**: Backend runtime for server-side logic.
- **Express.js**: Web framework for handling HTTP requests.
- **EJS**: Templating engine to render dynamic HTML pages.
- **Cookies**: For user and admin authentication, ensuring secure session management.
- **PostgreSQL**: For storing user data and contest results in a relational database.

## Warning

**For safety reasons**, the files in this repository are not complete. This project is **for sale**. If you are interested in purchasing it or learning more about how the software works, you can **click on the following link** to try the live version of the software:


## Try The Software!
[Try the software here](https://emrall.onrender.com/)
The Username and Password for admin login is Username: admin | password: admin

## How It Works

### User Flow:
- Users visit the contest website, sign up, and receive a unique QR code upon successful registration.
- Admins can scan these QR codes to assign users to different contest sections.
- The software tracks users' performance and stores it in the PostgreSQL database.
- Based on the admin-defined algorithm, the software calculates the winner of the contest.

### Admin Flow:
- Admins log in to the admin panel, where they can view and manage users.
- Admins can assign times to users, view contest results, and delete users.
- Once the contest is over, admins can clear the result table to reset for the next contest.
  
## License
This project is licensed under the **ISC License**.

## Author
This project was developed by **Amirali Bavafa**.
