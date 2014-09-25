#!/bin/bash

CLASS_FILE="class_base.js"

JSON_FILES[0]="striker/skills.json"
JSON_FILES[1]="defender/skills.json"
JSON_FILES[2]="gunslinger/skills.json"
JSON_FILES[3]="bladedancer/skills.json"
JSON_FILES[4]="voidwalker/skills.json"
JSON_FILES[5]="sunsinger/skills.json"

if [[ -f $CLASS_FILE ]]
then
	iCurrentClass=0

	rm classes.js

	while read line
	do
		echo $line >> classes.js

		if [[ "$line" =~ "skill" ]]; then
			echo "Found skill line!"

			cat ${JSON_FILES[$iCurrentClass]} >> classes.js
			((iCurrentClass++))
		fi
	done < $CLASS_FILE
fi
