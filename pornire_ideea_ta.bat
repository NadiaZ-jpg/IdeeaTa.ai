@echo off
podman machine start
podman rm -f ideea-ta-core
podman run -d --name ideea-ta-core -p 3000:3000 -v "%cd%":/app core-automation-env:latest
exit

@echo off
podman rm -f ideea-ta-core
podman run -d --name ideea-ta-core -p 3000:3000 -v "%cd%":/app core-automation-env:latest
exit
