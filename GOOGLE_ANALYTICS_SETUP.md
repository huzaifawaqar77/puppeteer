# Google Analytics 4 Setup Guide

## Step 1: Create Google Analytics Account

1. Go to https://analytics.google.com
2. Click "Start measuring"
3. Enter Account name: "UIFlexer"
4. Configure data sharing settings (recommended: all enabled)
5. Click "Next"

## Step 2: Create Property

1. Property name: "UIFlexer PDF Tools"
2. Reporting time zone: Your timezone
3. Currency: USD (or your currency)
4. Click "Next"

## Step 3: Set Up Data Stream

1. Select platform: **Web**
2. Website URL: `https://pdf.uiflexer.com`
3. Stream name: "UIFlexer Website"
4. Click "Create stream"

## Step 4: Get Your Measurement ID

You'll see a Measurement ID like: `G-XXXXXXXXXX`

**Copy this ID** - you'll need it for the next step.

---

## Step 5: Add Tracking Code to Your Website

### Option A: I'll Add It For You

Just give me your Measurement ID (G-XXXXXXXXXX) and I'll add the tracking code to all your pages automatically.

### Option B: Manual Installation

Add this code to the `<head>` section of **every HTML page**:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

---

## Step 6: Set Up Conversion Events

Track important user actions:

### Event 1: User Signup
```javascript
gtag('event', 'sign_up', {
  method: 'Email'
});
```

### Event 2: PDF Generation
```javascript
gtag('event', 'generate_pdf', {
  pdf_type: 'html_to_pdf',
  plan: 'starter'
});
```

### Event 3: Subscription Purchase
```javascript
gtag('event', 'purchase', {
  transaction_id: 'T12345',
  value: 29.99,
  currency: 'USD',
  items: [{
    item_name: 'Professional Plan',
    item_category: 'Subscription'
  }]
});
```

### Event 4: PDF Tool Usage
```javascript
gtag('event', 'use_pdf_tool', {
  tool_name: 'merge_pdf',
  plan: 'starter'
});
```

---

## Step 7: Verify Installation

1. Go back to Google Analytics
2. Click "View real-time report"
3. Open your website in a new tab
4. You should see yourself as an active user!

---

## Step 8: Set Up Goals/Conversions

1. In GA4, go to **Configure** > **Events**
2. Click **Create event**
3. Create custom events for:
   - Signups
   - PDF generations
   - Subscription purchases
   - Tool usage

---

## Useful GA4 Reports to Monitor

1. **Acquisition Overview** - Where users come from
2. **Engagement Overview** - How users interact
3. **Monetization Overview** - Revenue tracking
4. **Retention** - User retention rates
5. **User Attributes** - Demographics

---

## Pro Tips

- Set up **Custom Dimensions** for plan types
- Create **Audiences** for remarketing
- Link to **Google Ads** if you run ads
- Set up **Data Filters** to exclude internal traffic
- Enable **Enhanced Measurement** for automatic event tracking

---

## Need Help?

Let me know your Measurement ID and I'll integrate it into all your pages automatically! 🚀

