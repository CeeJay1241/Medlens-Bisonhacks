.PHONY: up down build logs ps restart smoke test

up:
	docker compose up -d --build

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f backend mongo

ps:
	docker compose ps

restart:
	docker compose restart backend

smoke:
	curl -sS http://127.0.0.1:8000/api/health && echo
	docker compose exec -T backend python scripts/dev_smoke_test.py

test:
	docker compose exec backend pytest -q
