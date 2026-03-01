from typing import Any


def extract_medication_names(result: Any) -> list[str]:
    if not isinstance(result, dict):
        return []

    def _get_list(obj: Any, *path: str) -> list[Any]:
        cur = obj
        for key in path:
            if not isinstance(cur, dict):
                return []
            cur = cur.get(key)
        return cur if isinstance(cur, list) else []

    candidates: list[Any] = []
    candidates.extend(_get_list(result, "medications"))
    candidates.extend(_get_list(result, "entities", "medications"))
    candidates.extend(_get_list(result, "extracted", "medications"))

    names: list[str] = []
    for item in candidates:
        if isinstance(item, str):
            value = item.strip()
        elif isinstance(item, dict):
            value = str(item.get("name") or item.get("medication") or item.get("drug") or "").strip()
        else:
            value = ""
        if value:
            names.append(value)

    seen = set()
    unique: list[str] = []
    for name in names:
        key = name.lower()
        if key not in seen:
            seen.add(key)
            unique.append(name)

    return unique
