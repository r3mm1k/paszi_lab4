import json
import logging
import sys

def _json_formatter(record: logging.LogRecord) -> str:
    payload = {
        "level": record.levelname,
        "logger": record.name,
        "message": record.getMessage(),
    }
    if record.exc_info:
        payload["exc_info"] = logging.Formatter().formatException(record.exc_info)
    return json.dumps(payload, ensure_ascii=False)

class JsonStreamHandler(logging.StreamHandler):
    def format(self, record: logging.LogRecord) -> str:
        return _json_formatter(record)

def setup_logging(level: int = logging.INFO) -> None:
    root = logging.getLogger()
    root.setLevel(level)
    # чистим дефолтные хендлеры (uvicorn их добавляет)
    for h in list(root.handlers):
        root.removeHandler(h)
    handler = JsonStreamHandler(stream=sys.stdout)
    root.addHandler(handler)

# вызвать при импорте модуля
setup_logging()
