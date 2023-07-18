1. Clone repo
2. Run the scripts with example data
3. When ready and confident in app, delete the "speed_test_results.json" file. Restart the apps (find pid and kill them)
4. go to localhost or servers ip. 
    4a. 127.0.0.0:8000
    4b. 0.0.0.0:8000
5. Modify as you see fit.

Start script

nohup python -m check_internet &

Start website

nohup python -m http.server &