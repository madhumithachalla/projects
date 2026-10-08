import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_profile(name="madhumitha"):
    path = name if name.endswith(".json") else os.path.join(ROOT, "profiles", name + ".json")
    with open(path, encoding="utf8") as f:
        return json.load(f)
