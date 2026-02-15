#!/usr/bin/env python3
"""
AI Visibility Optimisation Tool
Analyzes hotel websites to identify issues that reduce how well AI systems
like ChatGPT, Perplexity, and Google AI can understand and recommend the property.
"""

import requests
from bs4 import BeautifulSoup
import json
from urllib.parse import urljoin, urlparse
import re
from typing import Dict, List, Optional, Tuple
import sys


class AIVisibilityAnalyzer:
    """Analyzes hotel websites for AI visibility optimization."""
    
    def __init__(self, url: str):
        self.url = url
        self.domain = urlparse(url).netloc
        self.soup = None
        self.issues = []
        self.recommendations = []
        self.score = 100
        
    def fetch_page(self) -> bool:
        """Fetch the webpage content."""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (compatible; AIVisibilityBot/1.0)'
            }
            response = requests.get(self.url, headers=headers, timeout=10)
            response.raise_for_status()
            self.soup = BeautifulSoup(response.content, 'html.parser')
            return True
        except requests.exceptions.RequestException as e:
            self.issues.append({
                'category': 'Accessibility',
                'severity': 'Critical',
                'issue': f'Failed to fetch page: {str(e)}',
                'impact': 'AI systems cannot access your website'
            })
            return False
    
    def check_structured_data(self) -> None:
        """Check for Schema.org structured data (JSON-LD)."""
        scripts = self.soup.find_all('script', type='application/ld+json')
        
        if not scripts:
            self.issues.append({
                'category': 'Structured Data',
                'severity': 'High',
                'issue': 'No Schema.org structured data found',
                'impact': 'AI systems cannot easily extract hotel information',
                'recommendation': 'Add Schema.org Hotel markup using JSON-LD format'
            })
            self.score -= 20
            return
        
        has_hotel_schema = False
        for script in scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict):
                    schema_type = data.get('@type', '')
                    if 'Hotel' in schema_type or 'LodgingBusiness' in schema_type:
                        has_hotel_schema = True
                        self.recommendations.append({
                            'category': 'Structured Data',
                            'message': '✓ Hotel Schema.org markup found'
                        })
                        break
            except json.JSONDecodeError:
                continue
        
        if not has_hotel_schema:
            self.issues.append({
                'category': 'Structured Data',
                'severity': 'High',
                'issue': 'No Hotel-specific Schema.org markup found',
                'impact': 'AI systems may not recognize this as a hotel website',
                'recommendation': 'Add Schema.org Hotel or LodgingBusiness type'
            })
            self.score -= 15
    
    def check_meta_tags(self) -> None:
        """Check meta description and title tags."""
        title = self.soup.find('title')
        if not title or not title.string or len(title.string.strip()) < 10:
            self.issues.append({
                'category': 'Meta Tags',
                'severity': 'High',
                'issue': 'Missing or insufficient title tag',
                'impact': 'AI systems may not understand page purpose',
                'recommendation': 'Add descriptive title with hotel name and location'
            })
            self.score -= 10
        
        meta_desc = self.soup.find('meta', attrs={'name': 'description'})
        if not meta_desc or not meta_desc.get('content') or len(meta_desc.get('content', '').strip()) < 50:
            self.issues.append({
                'category': 'Meta Tags',
                'severity': 'Medium',
                'issue': 'Missing or insufficient meta description',
                'impact': 'AI systems lack context about your hotel',
                'recommendation': 'Add meta description (150-160 chars) with key hotel features'
            })
            self.score -= 10
    
    def check_hotel_information(self) -> None:
        """Check for key hotel information in content."""
        page_text = self.soup.get_text().lower()
        
        # Check for essential hotel information
        info_checks = {
            'address': ['address', 'location', 'located at'],
            'amenities': ['amenities', 'facilities', 'features', 'pool', 'gym', 'wifi'],
            'contact': ['phone', 'email', 'contact'],
            'rooms': ['room', 'suite', 'accommodation']
        }
        
        missing_info = []
        for info_type, keywords in info_checks.items():
            if not any(keyword in page_text for keyword in keywords):
                missing_info.append(info_type)
        
        if missing_info:
            self.issues.append({
                'category': 'Content',
                'severity': 'Medium',
                'issue': f'Missing key information: {", ".join(missing_info)}',
                'impact': 'AI systems cannot provide complete hotel details',
                'recommendation': f'Add clear sections for: {", ".join(missing_info)}'
            })
            self.score -= len(missing_info) * 5
    
    def check_robots_txt(self) -> None:
        """Check robots.txt for AI bot accessibility."""
        robots_url = urljoin(self.url, '/robots.txt')
        try:
            response = requests.get(robots_url, timeout=5)
            if response.status_code == 200:
                robots_content = response.text.lower()
                # Check if AI bots are blocked
                ai_bots = ['gptbot', 'chatgpt-user', 'google-extended', 'perplexitybot']
                blocked_bots = [bot for bot in ai_bots if f'user-agent: {bot}' in robots_content and 'disallow' in robots_content]
                
                if blocked_bots:
                    self.issues.append({
                        'category': 'Accessibility',
                        'severity': 'Critical',
                        'issue': f'AI bots blocked in robots.txt: {", ".join(blocked_bots)}',
                        'impact': 'AI systems cannot crawl your website',
                        'recommendation': 'Allow AI bots in robots.txt or remove blocking rules'
                    })
                    self.score -= 25
        except requests.exceptions.RequestException:
            pass  # robots.txt not required, so no penalty
    
    def check_semantic_html(self) -> None:
        """Check for semantic HTML usage."""
        semantic_tags = ['header', 'main', 'article', 'section', 'nav', 'footer']
        found_tags = [tag for tag in semantic_tags if self.soup.find(tag)]
        
        if len(found_tags) < 3:
            self.issues.append({
                'category': 'HTML Structure',
                'severity': 'Low',
                'issue': 'Limited use of semantic HTML tags',
                'impact': 'AI systems may have difficulty parsing content structure',
                'recommendation': 'Use semantic HTML5 tags (header, main, article, section)'
            })
            self.score -= 5
    
    def check_image_accessibility(self) -> None:
        """Check if images have alt text."""
        images = self.soup.find_all('img')
        images_without_alt = [img for img in images if not img.get('alt')]
        
        if images and len(images_without_alt) > len(images) * 0.3:
            self.issues.append({
                'category': 'Accessibility',
                'severity': 'Medium',
                'issue': f'{len(images_without_alt)} of {len(images)} images missing alt text',
                'impact': 'AI systems cannot understand image content',
                'recommendation': 'Add descriptive alt text to all images'
            })
            self.score -= 8
    
    def analyze(self) -> Dict:
        """Run all checks and return results."""
        if not self.fetch_page():
            return self.generate_report()
        
        # Run all checks
        self.check_structured_data()
        self.check_meta_tags()
        self.check_hotel_information()
        self.check_robots_txt()
        self.check_semantic_html()
        self.check_image_accessibility()
        
        # Ensure score doesn't go below 0
        self.score = max(0, self.score)
        
        return self.generate_report()
    
    def generate_report(self) -> Dict:
        """Generate the analysis report."""
        # Categorize issues by severity
        critical_issues = [i for i in self.issues if i.get('severity') == 'Critical']
        high_issues = [i for i in self.issues if i.get('severity') == 'High']
        medium_issues = [i for i in self.issues if i.get('severity') == 'Medium']
        low_issues = [i for i in self.issues if i.get('severity') == 'Low']
        
        return {
            'url': self.url,
            'score': self.score,
            'grade': self.get_grade(),
            'summary': {
                'total_issues': len(self.issues),
                'critical': len(critical_issues),
                'high': len(high_issues),
                'medium': len(medium_issues),
                'low': len(low_issues)
            },
            'issues': self.issues,
            'recommendations': self.recommendations
        }
    
    def get_grade(self) -> str:
        """Convert score to letter grade."""
        if self.score >= 90:
            return 'A'
        elif self.score >= 80:
            return 'B'
        elif self.score >= 70:
            return 'C'
        elif self.score >= 60:
            return 'D'
        else:
            return 'F'


def print_report(report: Dict) -> None:
    """Print formatted analysis report."""
    print("\n" + "="*70)
    print("AI VISIBILITY OPTIMISATION REPORT")
    print("="*70)
    print(f"\nWebsite: {report['url']}")
    print(f"Overall Score: {report['score']}/100 (Grade: {report['grade']})")
    print(f"\nIssues Found: {report['summary']['total_issues']}")
    print(f"  Critical: {report['summary']['critical']}")
    print(f"  High: {report['summary']['high']}")
    print(f"  Medium: {report['summary']['medium']}")
    print(f"  Low: {report['summary']['low']}")
    
    if report['recommendations']:
        print("\n" + "-"*70)
        print("POSITIVE FINDINGS:")
        print("-"*70)
        for rec in report['recommendations']:
            print(f"\n{rec['message']}")
    
    if report['issues']:
        print("\n" + "-"*70)
        print("ISSUES REQUIRING ATTENTION:")
        print("-"*70)
        
        for issue in report['issues']:
            print(f"\n[{issue['severity'].upper()}] {issue['category']}")
            print(f"  Issue: {issue['issue']}")
            print(f"  Impact: {issue['impact']}")
            if 'recommendation' in issue:
                print(f"  Fix: {issue['recommendation']}")
    
    print("\n" + "="*70)
    print("INTERPRETATION:")
    print("="*70)
    if report['score'] >= 90:
        print("Excellent! Your website is well-optimized for AI systems.")
    elif report['score'] >= 80:
        print("Good! Minor improvements will help AI systems better understand your hotel.")
    elif report['score'] >= 70:
        print("Fair. Several improvements needed for better AI visibility.")
    elif report['score'] >= 60:
        print("Poor. Significant improvements needed for AI systems to recommend your hotel.")
    else:
        print("Critical. Major issues prevent AI systems from understanding your hotel.")
    print("="*70 + "\n")


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python ai_visibility_analyzer.py <hotel_website_url>")
        print("\nExample:")
        print("  python ai_visibility_analyzer.py https://example-hotel.com")
        sys.exit(1)
    
    url = sys.argv[1]
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    print(f"\nAnalyzing AI visibility for: {url}")
    print("Please wait...\n")
    
    analyzer = AIVisibilityAnalyzer(url)
    report = analyzer.analyze()
    print_report(report)
    
    # Also save as JSON
    json_filename = f"ai_visibility_report_{urlparse(url).netloc.replace('.', '_')}.json"
    with open(json_filename, 'w') as f:
        json.dump(report, f, indent=2)
    print(f"Detailed report saved to: {json_filename}\n")


if __name__ == '__main__':
    main()
