# app/models/__init__.py
# Import all models here so that Base.metadata.create_all() finds them.

from app.models.heritage_site import HeritageSite        # noqa: F401
from app.models.maintenance   import MaintenanceRecord   # noqa: F401
from app.models.visitor        import VisitorRecord       # noqa: F401
