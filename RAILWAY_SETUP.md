# Railway Deployment Setup for Map Generation

This guide explains how to deploy the map-generation branch to Railway with Mapbox support.

## Environment Variables

You need to add the following environment variable in Railway's dashboard:

### VITE_MAPBOX_TOKEN

**Value:**
```
pk.eyJ1IjoidGhlb2ZmaWNpYWxwb3BvIiwiYSI6ImNtaGh5emk4aDB2c3Eya3M3eHR4eGh6d2MifQ.qE1-7d1F34TVRvRfh40IjA
```

## How to Add Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on your service
3. Go to the **Variables** tab
4. Click **+ New Variable**
5. Add:
   - **Key:** `VITE_MAPBOX_TOKEN`
   - **Value:** Your Mapbox token (see above)
6. Click **Add**
7. Redeploy the service if needed

## Deployment Steps

1. **Push the branch to GitHub:**
   ```bash
   git push origin feature/map-generation
   ```

2. **Deploy on Railway:**
   - Option A: Railway auto-deploys from GitHub (if connected)
   - Option B: Manual deploy from Railway dashboard

3. **Set environment variable** (see above)

4. **Access your deployment:**
   - Railway will provide a URL like: `https://your-app.railway.app`
   - The map test page should load automatically

## Testing the Deployment

Once deployed, you should see:

1. **City Selection Screen** - Grid of 5 cities with stats
2. **Map Display** - Click "View Map" to see the bounded Mapbox display
3. **City Switching** - Use the compact selector to switch between cities

## Troubleshooting

### Maps not loading
- **Check environment variable:** Make sure `VITE_MAPBOX_TOKEN` is set in Railway
- **Check browser console:** Look for Mapbox errors
- **Verify token:** Ensure the token is valid at https://account.mapbox.com/access-tokens/

### Build fails
- **Check build logs:** Look for npm install errors
- **Verify package.json:** Make sure mapbox-gl and react-map-gl are listed

### Page shows "Mapbox Token Required"
- Environment variable not set or incorrect
- Vite prefix missing: must be `VITE_MAPBOX_TOKEN` (not just `MAPBOX_TOKEN`)

## Railway Configuration

The project uses these Railway settings (from `railway.json`):

- **Builder:** NIXPACKS (auto-detects React + Node.js)
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Restart Policy:** ON_FAILURE with max 10 retries

## Important Notes

- **DO NOT commit `.env` files** - They are gitignored for security
- **Mapbox free tier:** 50,000 map loads/month (plenty for testing)
- **This is a test branch** - Not connected to the main game yet
- **Map Test Mode:** Uses `MapTest.jsx` instead of `App.jsx`

## Switching Back to Main Game

To deploy the main game instead of the map test:

1. Edit `client/src/main.jsx`
2. Change:
   ```javascript
   // From:
   import MapTest from './MapTest.jsx';

   // To:
   import App from './App.jsx';
   ```
3. Commit and push
4. Railway will auto-deploy

## Next Steps

After testing the map infrastructure:

1. **Design station placement algorithm** (automated, not manual)
2. **Implement station generation**
3. **Integrate with main game**
4. **Add player position markers**
5. **Connect to multiplayer system**

---

**Branch:** `feature/map-generation`
**Status:** Phase 1 Complete - Map display infrastructure ready for testing
