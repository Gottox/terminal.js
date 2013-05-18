#!/bin/bash

for i in 1 2 3; do
	echo $i;
	sleep 1;
done

dialog --infobox "Hello" 3 30
sleep 2
dialog --infobox "This is a remote Shell" 3 30
sleep 3
dialog --infobox "Well, sort of..." 3 30
sleep 2
dialog --infobox "But it's a cool demo" 3 30
sleep 2
dialog --infobox "Anyway... Good bye!" 3 30
