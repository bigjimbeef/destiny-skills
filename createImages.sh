#!/bin/bash

# Dir names are class names
if [[ -d $1 ]]
then
	cd $1

	while read line
	do
		echo -e $line'\n'
		if [[ "$line" =~ ^([a-zA-Z_]+):\ (.*)$ ]]; then
			skillName=`echo ${BASH_REMATCH[1]}`
			url=`echo ${BASH_REMATCH[2]}`

			wget $url -O $skillName.png
		fi
	done < imageUrls

	cd -

	exit 1
fi

echo "No directory named '$1' found!";
exit 2
