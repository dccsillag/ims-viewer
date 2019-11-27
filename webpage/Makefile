# NOTE: run with
#   make -j 2
# since recipe 'open' and 'server' should run in parallel.

#BROWSER = chromium-browser	# Reasonable
BROWSER = firefox   		# Surprisingly the best
#BROWSER = epiphany  		# Very bad

run: server open

.PHONY: open
open:
	$(BROWSER) http://localhost:8000/

.PHONY: server
server:
	python3 -m http.server
