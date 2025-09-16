
# Production Ad Setup Guide

## Quick Start Checklist

### 1. Configure Ad Networks (Required)
- Go to `/ad-config` in your admin dashboard
- Enter your ad network credentials:
  - **Google AdSense**: Publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`)
  - **Ezoic**: Site ID 
  - **Adsterra**: Publisher ID and Zone IDs

### 2. Enable Production Mode
- Toggle "Production Mode" in the Ad Config page
- Or manually set `localStorage.setItem('blox_production_mode', 'true')`

### 3. Update HTML Script Tags
Replace `ca-pub-XXXXXXXXXXXXXXXX` in `client/index.html` with your actual AdSense Publisher ID

### 4. Deploy to Production
Your ads will automatically activate when:
- You're on a deployed domain (replit.app or custom domain)
- Ad configuration is properly set up
- Production mode is enabled

## Ad Network Setup Instructions

### Google AdSense
1. Sign up at https://www.google.com/adsense/
2. Add your website and get approved
3. Create ad units for:
   - Top banner (728x90 or responsive)
   - Bottom banner (728x90 or responsive)
4. Copy your Publisher ID and Ad Unit IDs to the Ad Config page

### Ezoic (AI-Optimized)
1. Sign up at https://www.ezoic.com/
2. Follow their site integration process
3. Get your Site ID from the Ezoic dashboard
4. Add to Ad Config page

### Adsterra (High CPM)
1. Sign up at https://adsterra.com/
2. Create different ad zones:
   - Banner ads
   - Interstitial ads
   - Popup ads
   - Rewarded video ads
3. Copy zone IDs to Ad Config page

## Testing Your Ads

### Development Mode
- Simulated ads show with blue borders
- "This would be a real ad in production" message appears

### Production Mode
- Real ads load from your configured networks
- Revenue tracking begins
- AdBlock detection active

## Revenue Optimization Tips

1. **Strategic Placement**: Top/bottom banners + interstitials
2. **User Experience**: Limit interstitial frequency 
3. **Multiple Networks**: Diversify with AdSense + Ezoic/Adsterra
4. **Mobile Optimization**: Responsive ad formats
5. **Content Quality**: Higher quality = better ad rates

## Troubleshooting

### Ads Not Showing
- Check browser console for errors
- Verify Publisher IDs are correct
- Ensure production mode is enabled
- Check if AdBlock is blocking ads

### Low Revenue
- Ensure proper ad placement
- Try different ad networks
- Optimize for mobile users
- Increase user engagement time

## GDPR/Privacy Compliance
- Consider adding cookie consent banner
- Update privacy policy to mention ad cookies
- Implement user consent management if targeting EU users
