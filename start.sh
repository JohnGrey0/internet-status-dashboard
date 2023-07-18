#!/bin/bash
nohup python -m check_internet &
nohup python -m http.server &