import os
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def main():
    try:
        import uvicorn
    except ImportError as error:
        raise SystemExit("uvicorn is not installed. Run: pip install -r requirements-public.txt") from error

    host = os.environ.get("SAT_STUDIO_HOST", "127.0.0.1")
    port = int(os.environ.get("SAT_STUDIO_PORT", "8765"))
    uvicorn.run("sat_public_app:create_app", factory=True, host=host, port=port, reload=False)


if __name__ == "__main__":
    main()
