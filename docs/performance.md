## 🧪 Professional Performance Testing Guide

To maintain these performance gains, follow this testing methodology:

### 1. Google Lighthouse Audit (Chrome DevTools)
Lighthouse is the industry standard for measuring performance, accessibility, SEO, and best practices.

**How to Test:**
1. Open Chrome Incognito window (to disable extensions).
2. Open **DevTools** (`F12`) and go to the **Lighthouse** tab.
3. Select **Mode: Navigation**, **Device: Mobile**, and **Categories: Performance**.
4. Click **Analyze page load**.

**Which pages should I test?**
You don't need to test every single page, but you should prioritize the **main templates**:
1. **Home Page** (SEO & First Impression)
2. **Shop/Products Page** (Image heavy)
3. **Checkout Page** (Conversion critical)
4. **Admin Dashboard** (Operational efficiency)

**How to share results for further enhancement:**
If the score is below target or you see "Opportunities" suggestions:
1. Copy the text from the **"Opportunities"** and **"Diagnostics"** sections.
2. Paste them here in our chat.
3. I will analyze the specific bottlenecks (e.g., large images, unused JS) and implement the necessary code fixes.

**Target Metrics:**
- **Performance Score:** > 90
- **Largest Contentful Paint (LCP):** < 2.5s
- **Total Blocking Time (TBT):** < 200ms
- **Cumulative Layout Shift (CLS):** < 0.1

### 2. Network Throttling (Simulating Slow Networks)
Test how the site behaves for users on 4G or 3G connections.

**How to Test:**
1. In DevTools, go to the **Network** tab.
2. Select **Throttling: Fast 3G** or **Slow 3G**.
3. Reload the page and observe the `Suspense` loading states and image loading priority.

### 3. React Developer Tools (Profiler)
Identify unnecessary re-renders in real-time.

**How to Test:**
1. Install the "React Developer Tools" extension.
2. Open the **Profiler** tab in DevTools.
3. Click "Start recording", interact with the app (e.g., add to cart, switch tabs), and click "Stop".
4. Look for "gray" bars in the flame chart; gray means the component didn't re-render (which is good for performance).

### 4. Bundle Analysis
Visualize what libraries are taking up space in your JS files.

**How to Test:**
1. Run `npm run build`.
2. Observe the output log to identify any chunks exceeding 500kB.
3. Use a tool like `rollup-plugin-visualizer` if you need to deep-dive into specific dependencies.