## Step 1: Generate a Google App Password

1. Go to your Google Account on your phone or computer: [myaccount.google.com](https://myaccount.google.com).
2. Make sure you are logged in as **crocheella19@gmail.com**.
3. On the left side menu, click on **Security**.
4. Scroll down to the **"How you sign in to Google"** section.
5. First, verify that **2-Step Verification** is turned `On`. 
   *(If it's off, click it, enter your phone number, and follow the instructions to turn it on—Google requires this to use App Passwords).*
6. Once 2-Step Verification is `On`, locate the **search bar** at the very top of your Google Account page. Type **App Passwords** and click the resulting option.
   *(Alternatively, under the 2-step verification settings at the bottom, there is a link to App Passwords).*
7. You will be prompted to create an App Password. Where it asks for an "App name", type something like: `Website Contact Form`.
8. Click **Create** or **Generate**.
9. Google will instantly show a popup containing a **16-letter code** inside a yellow box (e.g., `abcd efgh ijkl mnop`).
10. **Copy this 16-letter code!** You won't be able to see it again after you close the popup.

---

## Step 2: Add the Password to the `.env` file

1. Open your code editor.
2. Go into the `backend` folder and open the file named `.env`.
3. Scroll to the very bottom of the `.env` file. You will see these two lines:
   ```env
   EMAIL_USER=crocheella19@gmail.com
   EMAIL_PASS=YOUR_APP_PASSWORD_HERE
   ```
4. Delete `YOUR_APP_PASSWORD_HERE` and paste the 16-letter code you copied from Google.
5. **CRITICAL:** Make sure there are NO SPACES in the password. If Google gave you `abcd efgh ijkl mnop`, you must type it tightly like this:
   ```env
   EMAIL_PASS=abcdefghijklmnop