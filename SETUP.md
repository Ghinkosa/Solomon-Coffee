# 🚀 Sheba Cup Coffee - Installation & Setup Guide

Welcome to Sheba Cup Coffee! This guide will walk you through setting up your new e-commerce platform. We've made the process as straightforward as possible.

---

## 📋 Table of Contents

1.  [Prerequisites](#prerequisites)
2.  [Step 1: Environment Setup](#step-1-environment-setup)
3.  [Step 2: Sanity CMS (Content)](#step-2-sanity-cms-content)
4.  [Step 3: Clerk (Authentication)](#step-3-clerk-authentication)
5.  [Step 4: Stripe (Payments)](#step-4-stripe-payments)
6.  [Step 5: Firebase (Database)](#step-5-firebase-database)
7.  [Step 6: Email Service](#step-6-email-service)
8.  [Step 7: Launch](#step-7-launch)

---

## Prerequisites

Before you begin, ensure you have the following installed on your computer:

- **Node.js** (v18 or higher) - [Download Here](https://nodejs.org/)
- **Code Editor** (VS Code recommended) - [Download Here](https://code.visualstudio.com/)
- **Git** - [Download Here](https://git-scm.com/)

---

## Step 1: Environment Setup

1.  **Unzip the project file** to your desired location.
2.  Open the folder in your code editor (VS Code).
3.  Open a terminal (Command/Ctrl + `) and install dependencies:
    ```bash
    npm install
    # or if you use pnpm
    pnpm install
    ```
4.  **Create your configuration file**:
    - Locate the file named `.env.example` in the root directory.
    - Duplicate it and rename the copy to `.env`.
    - **Important**: You will paste your API keys into this `.env` file in the following steps.

---

## Step 2: Sanity CMS (Content)

Sanity is where you will manage your products, categories, and other content.

1.  **Create a Account/Project**:
    - Go to [https://www.sanity.io/manage](https://www.sanity.io/manage) and sign up.
    - Click "Create new project".
    - Give it a name (e.g., "My Shop").

2.  **Get Project ID**:
    - In your project dashboard, copy the **Project ID**.
    - Paste it into `.env` as `NEXT_PUBLIC_SANITY_PROJECT_ID`.

3.  **Get API Tokens**:
    - Go to **API** tab > **Tokens**.
    - **Add API Token**: Name it "Viewer", select **Viewer** permissions. Copy and paste to `SANITY_API_READ_TOKEN`.
    - **Add API Token**: Name it "Editor", select **Editor** permissions. Copy and paste to `SANITY_API_TOKEN`.

4.  **Import Data (Optional)**:
    - If a `seed.tar.gz` file is included, you can import sample data:
      ```bash
      npx sanity@latest dataset import seed.tar.gz production
      ```

---

## Step 3: Clerk (Authentication)

Clerk handles user accounts, sign-ups, and logins.

1.  **Create Application**:
    - Go to [https://dashboard.clerk.com/](https://dashboard.clerk.com/) and create a new application.
    - Name it "Sheba Cup Coffee".
    - Select "Email" and "Google" (or other providers) as authentication methods.

2.  **Get API Keys**:
    - On the homepage of your Clerk dashboard, locate **API Keys**.
    - Copy **Publishable Key** -> paste to `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
    - Copy **Secret Key** -> paste to `CLERK_SECRET_KEY`.

---

## Step 4: Stripe (Payments)

Stripe handles all payment processing securely.

1.  **Create Account**:
    - Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register).

2.  **Get API Keys**:
    - Go to **Developers** tab > **API keys**.
    - Copy **Secret key** -> paste to `STRIPE_SECRET_KEY`.

3.  **Setup Webhook** (for order confirmation):
    - **Local Development**:
      - Follow Stripe's guide to install CLI and listen locally.
      - Command: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
      - Copy the webhook signing secret (starts with `whsec_`) -> paste to `STRIPE_WEBHOOK_SECRET`.
    - **Production**:
      - Go to **Developers** > **Webhooks** > **Add Endpoint**.
      - URL: `https://your-domain.com/api/webhooks/stripe`
      - Events to select: `checkout.session.completed`, `payment_intent.succeeded`.
      - Copy the Signing Secret -> paste to `STRIPE_WEBHOOK_SECRET`.

---

## Step 5: Firebase (Database)

Firebase is used for storing user profiles, order history, and reviews.

1.  **Create Project**:
    - Go to [https://console.firebase.google.com/](https://console.firebase.google.com/).
    - Add a new project.

2.  **Enable Firestore**:
    - Go to **Build** > **Firestore Database** > **Create Database**.
    - Start in **Production mode**.

3.  **Get Config**:
    - Go to **Project Settings** (gear icon).
    - Scroll down to **Your apps** > select **Web** (`</>`).
    - Register app (no need for hosting setup yet).
    - Copy the `firebaseConfig` object values (apiKey, authDomain, etc.) and paste them into the corresponding fields in your `.env` file.

---

## Step 6: Email Service

To send order confirmations, you need to set up Gmail using OAuth2 (more secure than just a password).

1.  **Google Cloud Console**:
    - Go to [https://console.cloud.google.com/](https://console.cloud.google.com/).
    - Create a project > Enable **Gmail API**.
    - **Credentials** > **Create Credentials** > **OAuth Client ID** (Web Application).
    - Authorized Redirect URI: `https://developers.google.com/oauthplayground`
    - Copy **Client ID** and **Client Secret** to `.env`.

2.  **Get Refresh Token**:
    - Go to [https://developers.google.com/oauthplayground](https://developers.google.com/oauthplayground).
    - Settings (gear icon) > Check "Use your own OAuth credentials" > Paste Client ID/Secret.
    - Select API: `https://mail.google.com/`.
    - Authorize > Exchange authorization code for tokens > Copy **Refresh Token** to `.env`.

---

## Step 7: Launch

You are ready!

1.  **Start the server**:
    ```bash
    npm run dev
    ```
2.  **Open Browser**:
    Visit [http://localhost:3000](http://localhost:3000).

### Need Help?

If you have any questions, please verify that all keys in your `.env` file are correct and have no extra spaces.
For support, contact us at: **reactjsbd@gmail.com**
