# NOTE: run with
#   make -j 2
# since recipe 'open' and 'server' should run in parallel.

run: server open

.PHONY: open
open:
	chromium-browser http://localhost:8000/

.PHONY: server
server:
	python3 -m http.server
