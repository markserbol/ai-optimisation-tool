#!/usr/bin/env python3
"""
Demo script showing AI Visibility Analyzer with sample hotel websites
"""

from ai_visibility_analyzer import AIVisibilityAnalyzer, print_report
from bs4 import BeautifulSoup


def demo_analysis(html_file, description):
    """Run analysis on a local HTML file for demonstration."""
    print(f"\n{'='*70}")
    print(f"DEMO: {description}")
    print(f"{'='*70}\n")
    
    # Create analyzer instance
    analyzer = AIVisibilityAnalyzer("https://demo-hotel.com")
    
    # Load local HTML file
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    analyzer.soup = BeautifulSoup(html_content, 'html.parser')
    
    # Run all checks (except robots.txt for demo)
    analyzer.check_structured_data()
    analyzer.check_meta_tags()
    analyzer.check_hotel_information()
    analyzer.check_semantic_html()
    analyzer.check_image_accessibility()
    
    analyzer.score = max(0, analyzer.score)
    
    # Generate and print report
    report = analyzer.generate_report()
    print_report(report)
    
    return report


def main():
    """Run demonstration."""
    print("\n" + "="*70)
    print(" AI VISIBILITY OPTIMISATION TOOL - DEMONSTRATION")
    print("="*70)
    print("\nThis demo shows how the tool analyzes hotel websites for AI visibility.")
    print("We'll analyze two sample hotel websites:")
    print("  1. A well-optimized hotel website")
    print("  2. A poorly-optimized hotel website")
    print("\n" + "="*70)
    
    # Demo 1: Well-optimized site
    print("\n\n📊 ANALYSIS 1 of 2")
    report1 = demo_analysis(
        'test_hotel_good.html',
        'Well-Optimized Hotel Website'
    )
    
    # Demo 2: Poorly-optimized site
    print("\n\n📊 ANALYSIS 2 of 2")
    report2 = demo_analysis(
        'test_hotel_bad.html',
        'Poorly-Optimized Hotel Website'
    )
    
    # Final summary
    print("\n\n" + "="*70)
    print(" COMPARISON SUMMARY")
    print("="*70)
    
    print(f"\n{'Hotel Type':<30} {'Score':<15} {'Grade':<10} {'Issues':<10}")
    print("-" * 70)
    print(f"{'Well-Optimized':<30} {report1['score']}/100{'':<8} {report1['grade']:<10} {report1['summary']['total_issues']:<10}")
    print(f"{'Poorly-Optimized':<30} {report2['score']}/100{'':<8} {report2['grade']:<10} {report2['summary']['total_issues']:<10}")
    
    print("\n" + "="*70)
    print(" KEY TAKEAWAYS")
    print("="*70)
    print("""
The well-optimized hotel website includes:
  ✓ Schema.org structured data for hotels
  ✓ Proper meta tags (title and description)
  ✓ Complete hotel information (amenities, location, contact)
  ✓ Semantic HTML structure
  ✓ Image alt text for accessibility

The poorly-optimized hotel website is missing:
  ✗ Schema.org structured data
  ✗ Proper meta tags
  ✗ Key hotel information sections
  ✗ Semantic HTML
  ✗ Image alt text

This results in a significant difference in AI visibility and the ability
of AI systems like ChatGPT, Perplexity, and Google AI to understand and
recommend the property.
""")
    print("="*70)
    print("\n✨ Demo completed! To analyze your hotel website, run:")
    print("   python ai_visibility_analyzer.py <your-hotel-url>\n")


if __name__ == '__main__':
    main()
