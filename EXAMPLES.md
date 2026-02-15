# Example Usage Guide

## Quick Start

### Basic Analysis

Analyze any hotel website:

```bash
python ai_visibility_analyzer.py https://www.marriott.com
```

### With Domain Auto-Detection

If you forget the protocol, it will automatically add https://

```bash
python ai_visibility_analyzer.py example-hotel.com
```

## Understanding the Report

### Score Interpretation

The tool assigns a score from 0-100 based on:

- **Structured Data**: 35 points maximum
  - No structured data: -20 points
  - No hotel-specific schema: -15 points
  
- **Meta Tags**: 20 points maximum
  - Missing/poor title: -10 points
  - Missing/poor description: -10 points

- **Content**: 25 points maximum (5 points per missing section)
  - Address/location
  - Amenities
  - Contact information
  - Room descriptions

- **AI Bot Access**: 25 points maximum
  - Blocking AI bots: -25 points

- **HTML Structure**: 5 points maximum
  - Poor semantic HTML: -5 points

- **Image Accessibility**: 8 points maximum
  - Missing alt text (>30% images): -8 points

### Issue Severity Levels

**Critical**: Prevents AI systems from accessing your site
- Blocked AI bots in robots.txt
- Website not accessible

**High**: Major impact on AI understanding
- Missing structured data
- Missing meta tags
- No hotel-specific schema

**Medium**: Moderate impact on completeness
- Missing content sections
- Poor meta descriptions
- Missing alt text on many images

**Low**: Minor improvements
- Limited semantic HTML
- Could improve but not critical

## Common Scenarios

### Scenario 1: Brand New Hotel Website

**Typical Score**: 40-60 (Grade D-F)

**Common Issues**:
- No Schema.org markup
- Generic meta tags
- Missing key information

**Quick Wins**:
1. Add Hotel schema JSON-LD
2. Write descriptive title and meta description
3. Create clear sections for amenities, location, contact

### Scenario 2: Existing Hotel Website

**Typical Score**: 60-80 (Grade C-B)

**Common Issues**:
- Has basic content but missing structured data
- May have some meta tags
- Could improve image alt text

**Quick Wins**:
1. Add Schema.org Hotel markup
2. Optimize existing meta tags
3. Add alt text to images

### Scenario 3: Well-Optimized Hotel Website

**Typical Score**: 80-100 (Grade A-B)

**Characteristics**:
- Has Schema.org Hotel markup
- Good meta tags
- Complete information
- Semantic HTML
- Image alt text
- Allows AI bot crawling

## Sample Output Explained

```
======================================================================
AI VISIBILITY OPTIMISATION REPORT
======================================================================

Website: https://example-hotel.com
Overall Score: 75/100 (Grade: C)
```
This shows the overall assessment. Grade C means "Fair - several improvements needed."

```
Issues Found: 3
  Critical: 0    ← No blocking issues
  High: 1        ← 1 major issue to fix
  Medium: 2      ← 2 moderate issues
  Low: 0         ← No minor issues
```
Priority should be: Critical → High → Medium → Low

```
----------------------------------------------------------------------
POSITIVE FINDINGS:
----------------------------------------------------------------------

✓ Hotel Schema.org markup found
```
This shows what's working well. Build on these strengths!

```
----------------------------------------------------------------------
ISSUES REQUIRING ATTENTION:
----------------------------------------------------------------------

[HIGH] Structured Data
  Issue: No Hotel-specific Schema.org markup found
  Impact: AI systems may not recognize this as a hotel website
  Fix: Add Schema.org Hotel or LodgingBusiness type
```
Each issue includes:
- **Severity level**: How important it is
- **Issue**: What's wrong
- **Impact**: Why it matters for AI systems
- **Fix**: What to do about it

## Advanced Usage

### Save and Compare Reports

```bash
# Run analysis and save report
python ai_visibility_analyzer.py https://example-hotel.com

# Report is automatically saved as: ai_visibility_report_example-hotel_com.json

# Make improvements to your site, then run again
python ai_visibility_analyzer.py https://example-hotel.com

# Compare the two JSON files to see improvements
```

### Batch Analysis

Analyze multiple properties:

```bash
for url in hotel1.com hotel2.com hotel3.com; do
    python ai_visibility_analyzer.py $url
done
```

## Fixing Common Issues

### Issue: No Schema.org structured data

**Solution**: Add this to your hotel homepage `<head>` section:

```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": "Your Hotel Name",
    "description": "Brief description of your hotel",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Main St",
        "addressLocality": "City Name",
        "postalCode": "12345",
        "addressCountry": "US"
    },
    "telephone": "+1-555-123-4567",
    "email": "info@yourhotel.com",
    "starRating": {
        "@type": "Rating",
        "ratingValue": "4"
    },
    "priceRange": "$$",
    "amenityFeature": [
        {"@type": "LocationFeatureSpecification", "name": "Free WiFi"},
        {"@type": "LocationFeatureSpecification", "name": "Swimming Pool"},
        {"@type": "LocationFeatureSpecification", "name": "Fitness Center"}
    ]
}
</script>
```

### Issue: Missing or poor meta description

**Solution**: Add/update in your `<head>` section:

```html
<title>Hotel Name - Luxury Accommodation in City Name</title>
<meta name="description" content="Experience luxury at Hotel Name. Modern rooms, pool, spa, and dining in City. Book your perfect stay today!">
```

### Issue: AI bots blocked in robots.txt

**Solution**: Edit your robots.txt to allow AI bots:

```
# Allow AI bots for better visibility
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /
```

### Issue: Missing alt text on images

**Solution**: Add descriptive alt text:

```html
<!-- Bad -->
<img src="room.jpg">

<!-- Good -->
<img src="room.jpg" alt="Spacious deluxe room with king bed and ocean view">
```

## Best Practices Checklist

Before running the analyzer, ensure your hotel website has:

- [ ] Schema.org Hotel or LodgingBusiness JSON-LD markup
- [ ] Descriptive title tag (50-60 characters)
- [ ] Meta description (150-160 characters)
- [ ] Clear address and location information
- [ ] Comprehensive amenities list
- [ ] Contact information (phone, email, address)
- [ ] Room/accommodation descriptions
- [ ] Alt text on all images
- [ ] Semantic HTML5 structure
- [ ] AI-friendly robots.txt

## Troubleshooting

### Issue: "Failed to fetch page"

**Possible causes**:
- Website is down or slow
- Website blocks automated access
- Network connectivity issues
- Invalid URL

**Solutions**:
- Verify the URL is correct and accessible
- Check if your website blocks bot user agents
- Try again in a few minutes
- Ensure the URL includes http:// or https://

### Issue: Score seems too low

The tool is strict to ensure AI systems can effectively understand your hotel. A lower score means there's room for improvement, which is an opportunity to enhance your AI visibility.

### Issue: Some checks seem incorrect

If you believe an issue is incorrectly flagged:
1. Verify the element exists in your HTML source (not just rendered)
2. Check that structured data is in valid JSON-LD format
3. Ensure elements are in the correct locations (e.g., meta tags in `<head>`)

## Getting Help

- Review the README.md for detailed information
- Check that your website follows Schema.org guidelines
- Test your structured data with Google's Rich Results Test
- Ensure your robots.txt doesn't block AI bots unnecessarily
