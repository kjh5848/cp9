"""Research components package.

This package contains the SRP-separated components for product research:
- JobManager: Manages research job lifecycle
- Executor: Executes research operations
- ResultProcessor: Processes and stores research results
"""

from app.services.research_components.executor import ResearchExecutor
from app.services.research_components.job_manager import ResearchJobManager
from app.services.research_components.result_processor import ResearchResultProcessor

__all__ = [
    "ResearchJobManager",
    "ResearchExecutor", 
    "ResearchResultProcessor",
]