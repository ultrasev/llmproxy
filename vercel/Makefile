NUM_WORKERS = auto
pytest=$(shell which pytest)

test:
	$(pytest) -vv tests


dev:
	uvicorn main:app --reload --host 0.0.0.0 --port 3000
