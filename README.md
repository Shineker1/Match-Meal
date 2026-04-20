# Match & Meal

Match & Meal is a web application designed to help users discover recipes based on the ingredients they have available and plan their weekly meals.

## Key Features

* Ingredient Search: Filtering of recipes based on the products selected by the user.
* Dietary Filters: Options to filter by tags such as Vegan, Vegetarian, Gluten-Free, and High Protein.
* Weekly Planner: Organizing meals (breakfast, lunch, dinner) for each day of the week.
* Favorite Recipes: Saving preferred dishes to a personal list.
* Admin Panel: Content management for adding or deleting ingredients and recipes, as well as managing user accounts.
* Responsive Design: Modern UI adapted for different devices and screen sizes.

## Technologies Used

* Frontend: HTML5, CSS3 (Custom Variables, Flexbox, Grid), JavaScript (ES6 Modules).
* Backend: Firebase (Authentication, Firestore Database).
* Icons and Fonts: FontAwesome, Boxicons, Google Fonts (Nunito).

## Setup Instructions

Since the application uses ES6 modules, it must be run through a local server.

1. Clone the repository:
   git clone https://github.com/your-username/match-n-meal.git

2. Configure Firebase:
   - Create a file named config.js in the root directory.
   - Add your Firebase configuration keys into this file.
   - Ensure config.js is added to your .gitignore to prevent keys from being pushed to public repositories.

3. Start a server:
   - If using VS Code, install the Live Server extension.
   - Right-click home.html and select Open with Live Server.

## Database Structure

The application uses Cloud Firestore with the following hierarchy:
* recipes: Documents containing title, ingredients, steps, and nutritional values.
* ingredients: A list of all available products for filtering.
* users: Information about users, their favorite recipes, and their weekly plan.

## Security

To protect user data and configuration:
* Access keys are stored in config.js, which is excluded from version control via .gitignore.
* Admin Panel access is restricted via email verification in the admin logic.
* Firestore Security Rules should be configured in the Firebase console to restrict read/write access.

## Author
Developed as a project to facilitate healthy eating and reduce food waste.