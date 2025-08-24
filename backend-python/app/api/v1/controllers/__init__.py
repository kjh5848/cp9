"""API controllers with separated responsibilities.

This package provides specialized controllers following Clean Architecture principles:
- ProductResearchController: Product research operations
- ResearchController: General research job management
"""

# Controllers will be imported by router modules as needed
__all__ = [
    "product_research_controller",
    "research_controller",
]