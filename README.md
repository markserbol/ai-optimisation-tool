# AI Visibility Optimisation Tool

This tool analyzes hotel websites to identify issues that reduce how well AI systems like ChatGPT, Perplexity, and Google AI can understand and recommend the property.

## Overview

Modern AI systems increasingly influence how travelers discover and book hotels. This tool helps hotel websites ensure they are optimized for AI understanding and recommendation by checking:

- **Structured Data**: Schema.org markup for hotels
- **Meta Tags**: Title and description optimization
- **Content Accessibility**: Key hotel information presence
- **AI Bot Access**: robots.txt configuration
- **HTML Structure**: Semantic markup usage
- **Image Accessibility**: Alt text for images

## Installation

1. Clone the repository:
```bash
git clone https://github.com/markserbol/ai-optimisation-tool.git
cd ai-optimisation-tool
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

Or using a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Usage

Run the analyzer with a hotel website URL:

```bash
python ai_visibility_analyzer.py https://example-hotel.com
```

The tool will:
1. Analyze the website for AI visibility issues
2. Display a detailed report in the terminal
3. Save a JSON report file for further analysis

### Example Output

```
======================================================================
AI VISIBILITY OPTIMISATION REPORT
======================================================================

Website: https://example-hotel.com
Overall Score: 75/100 (Grade: C)

Issues Found: 3
  Critical: 0
  High: 1
  Medium: 2
  Low: 0

----------------------------------------------------------------------
ISSUES REQUIRING ATTENTION:
----------------------------------------------------------------------

[HIGH] Structured Data
  Issue: No Hotel-specific Schema.org markup found
  Impact: AI systems may not recognize this as a hotel website
  Fix: Add Schema.org Hotel or LodgingBusiness type

[MEDIUM] Meta Tags
  Issue: Missing or insufficient meta description
  Impact: AI systems lack context about your hotel
  Fix: Add meta description (150-160 chars) with key hotel features

[MEDIUM] Content
  Issue: Missing key information: amenities
  Impact: AI systems cannot provide complete hotel details
  Fix: Add clear sections for: amenities

======================================================================
INTERPRETATION:
======================================================================
Fair. Several improvements needed for better AI visibility.
======================================================================
```

## What the Tool Checks

### 1. Structured Data (Critical)
- Checks for Schema.org JSON-LD markup
- Verifies Hotel or LodgingBusiness schema type
- Ensures AI systems can extract structured information

### 2. Meta Tags (Important)
- Title tag presence and quality
- Meta description presence and length
- Helps AI understand page context

### 3. Hotel Information (Important)
- Address/location details
- Amenities and facilities
- Contact information
- Room descriptions

### 4. Robot Access (Critical)
- Checks robots.txt for AI bot blocking
- Identifies if GPTBot, ChatGPT-User, Google-Extended, or PerplexityBot are blocked
- Ensures AI systems can crawl the site

### 5. Semantic HTML (Nice to have)
- Usage of header, main, article, section tags
- Improves content structure understanding

### 6. Image Accessibility (Important)
- Alt text presence on images
- Helps AI understand visual content

## Scoring System

- **90-100 (Grade A)**: Excellent AI visibility
- **80-89 (Grade B)**: Good, minor improvements recommended
- **70-79 (Grade C)**: Fair, several improvements needed
- **60-69 (Grade D)**: Poor, significant improvements required
- **0-59 (Grade F)**: Critical issues preventing AI understanding

## Best Practices for AI Visibility

1. **Add Schema.org Hotel Markup**
   - Use JSON-LD format
   - Include: name, address, telephone, amenities, rating, price range

2. **Optimize Meta Tags**
   - Title: Include hotel name and location (50-60 chars)
   - Description: Highlight key features (150-160 chars)

3. **Provide Complete Information**
   - Clear sections for amenities, location, rooms, contact
   - Use descriptive headings

4. **Allow AI Bot Crawling**
   - Don't block GPTBot, ChatGPT-User, Google-Extended, PerplexityBot
   - Keep robots.txt permissive for AI crawlers

5. **Use Semantic HTML**
   - Structure content with semantic tags
   - Use proper heading hierarchy (h1, h2, h3)

6. **Add Alt Text to Images**
   - Describe what's in hotel photos
   - Include relevant keywords naturally

## Output Files

The tool generates a JSON report file: `ai_visibility_report_[domain].json`

This file contains:
- Detailed issue breakdown
- Severity classifications
- Specific recommendations
- Overall score and grade

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this tool to optimize your hotel websites for AI visibility.

## Support

For issues or questions, please open an issue on GitHub.