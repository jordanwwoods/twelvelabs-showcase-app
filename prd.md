# Preliminary Product Requirements Document (PRD) for TwelveLabs Showcase

## 1. Introduction

This document outlines the requirements for a web-based application designed to showcase the capabilities of TwelveLabs' video understanding models. The application will provide a simple and intuitive interface for users to run search queries against their own video indexes.

## 2. Goals

*   **Showcase TwelveLabs Technology:** Demonstrate the power and simplicity of TwelveLabs' models in a real-world application.
*   **User-Friendly Interface:** Create an intuitive experience for non-technical users, such as content moderators and operators.
*   **Customer Enablement:** Allow customers to use the tool with their own TwelveLabs index IDs to explore their own data.
*   **Sharability:** The final product should be a shareable website that can be easily distributed to customers.

## 3. User Stories

*   **As a user,** I want to enter my TwelveLabs index ID so I can search my own indexed videos.
*   **As a user,** I want to have pre-set search buttons for common queries (e.g., nudity, swearing, specific objects) so I can quickly perform common searches.
*   **As a user,** I want to be able to customize the search prompts on the buttons so I can search for content specific to my needs.
*   **As a user,** I want to view the search results in a clear and understandable format.

## 4. Features

*   **Index ID Input:** A prominent text field for users to enter their TwelveLabs index ID.
*   **Default Search Buttons:** A set of 5-6 default buttons for common search queries. Examples:
    *   "Find nudity"
    *   "Find swearing"
    *   "Find maps of India"
    *   "Find cigarettes"
    *   "Find alcohol bottles"
*   **Customizable Buttons:**
    *   **Edit:** Right-clicking on a button will open a context menu or an inline editor to change the search prompt.
    *   **Duplicate:** An option to duplicate an existing button, allowing the user to then edit the prompt of the newly created button.
*   **Results Display:** A clean and organized section to display the video search results, including timestamps and video clips where the queried content appears.
*   **Sharable URL:** The application will be accessible via a URL that can be shared with customers.

## 5. Design & UI/UX

*   **Theme:** A modern, dark background.
*   **Buttons:** Visually appealing, "sexy" buttons that are easy to interact with.
*   **Layout:** A simple, clean, and uncluttered layout that focuses the user's attention on the core functionality.

## 6. Technical Considerations

*   **Frontend:** A modern JavaScript framework (e.g., React, Svelte, or Vue) will be used to create a dynamic user experience.
*   **Backend:** A lightweight backend will be necessary to securely handle API calls to the TwelveLabs API, preventing the exposure of API keys on the client-side.
*   **API Integration:** The application will integrate with the TwelveLabs API to perform searches and retrieve results.
