import httpx

BASE = "http://127.0.0.1:8000"


def main() -> None:
    with httpx.Client(timeout=10.0) as client:
        try:
            print("health:", client.get(f"{BASE}/api/health", timeout=5.0).json())
        except httpx.TimeoutException as exc:
            raise SystemExit(
                "Health check timed out. Confirm uvicorn is running on 127.0.0.1:8000."
            ) from exc

        payload = {
            "medications": ["Warfarin", "Ibuprofen", "warfarin"],
        }
        print("interactions:", client.post(f"{BASE}/api/interactions/check", json=payload, timeout=8.0).json())


if __name__ == "__main__":
    main()
