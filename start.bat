@echo off
start cmd /k "cd front-end && npx serve -s build -l 80"
start cmd /k "cd back-end && python app.py"
