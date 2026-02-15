#!/usr/bin/env python3
"""
Test script for the AI Visibility Analyzer
Tests the analyzer with local HTML files
"""

from ai_visibility_analyzer import AIVisibilityAnalyzer, print_report
from bs4 import BeautifulSoup


def test_with_local_file(filename, description):
    """Test analyzer with a local HTML file."""
    print(f"\n{'='*70}")
    print(f"Testing: {description}")
    print(f"File: {filename}")
    print('='*70)
    
    # Create analyzer instance
    analyzer = AIVisibilityAnalyzer("https://test-hotel.com")
    
    # Load local HTML file instead of fetching
    with open(filename, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    analyzer.soup = BeautifulSoup(html_content, 'html.parser')
    
    # Run checks
    analyzer.check_structured_data()
    analyzer.check_meta_tags()
    analyzer.check_hotel_information()
    analyzer.check_semantic_html()
    analyzer.check_image_accessibility()
    
    # Note: Skipping robots.txt check for local files
    
    # Ensure score doesn't go below 0
    analyzer.score = max(0, analyzer.score)
    
    # Generate and print report
    report = analyzer.generate_report()
    print_report(report)
    
    return report


def main():
    """Run tests."""
    print("\nAI VISIBILITY ANALYZER - TEST SUITE")
    print("="*70)
    
    # Test with well-optimized hotel page
    print("\n\nTEST 1: Well-Optimized Hotel Website")
    report1 = test_with_local_file(
        'test_hotel_good.html',
        'Well-optimized hotel with Schema.org, good meta tags, and semantic HTML'
    )
    
    # Test with poorly-optimized hotel page
    print("\n\nTEST 2: Poorly-Optimized Hotel Website")
    report2 = test_with_local_file(
        'test_hotel_bad.html',
        'Poorly-optimized hotel missing key elements'
    )
    
    # Summary
    print("\n\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    print(f"\nTest 1 (Good Hotel):")
    print(f"  Score: {report1['score']}/100 (Grade: {report1['grade']})")
    print(f"  Issues: {report1['summary']['total_issues']}")
    
    print(f"\nTest 2 (Bad Hotel):")
    print(f"  Score: {report2['score']}/100 (Grade: {report2['grade']})")
    print(f"  Issues: {report2['summary']['total_issues']}")
    
    print("\n✓ All tests completed successfully!")
    print("="*70 + "\n")


if __name__ == '__main__':
    main()
