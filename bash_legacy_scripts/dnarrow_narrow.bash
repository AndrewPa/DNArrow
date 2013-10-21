#!/usr/bash

##
## DNArrow v.1.1.0
##
## Features list:
## - Extracts chromosomal coordinates from Excel spreadsheet files
## - Removes regions experimentally shown not to affect phenotype
##
##   Then either:
##
## - Generates a list of unique, non-overlapping regions of interest (_Collapse)
##                                OR
## - Narrows region maximally through active region overlaps (_Narrow)
##
## Note: This script relies on a spreadsheet parser to convert .xls
## data to plain text. Version 1.0.0+ uses Spreadsheet::ParseExcel,
## Copyright (c) 2000-2011 K. Takonori, G. Szabo and J. McNamara
##
## DNArrow Copyright (c) Andrew Papadopoli 2013
## University of Toronto, Department of Molecular Genetics, Brill lab
##

echo "

Welcome to DNArrow, a data analysis tool for genetic screening.
        v.1.1.0 Copyright (c) Andrew Papadopoli 2013

"

echo 'You are currently running the "Narrow" script.'

filename=$1
arm=$2
mode=$3

echo "Parsing Excel file with Spreadsheet::ParseExcel (c) J. McNamara 2009-2011..."

perl parse_xls.perl $filename > $filename.parsed

echo "Done parsing. Removing neutral regions..."

InitCoords=`bash ./eliminate_inactive.bash $filename $arm $mode | sort -n | uniq | grep -v Contradiction | grep -v DNE | sed 's/;/,/'`

echo "Done. Finding active region overlaps..."

input=$InitCoords

    for coord1 in $input
        do

            coordslist=""

            coord1left=`echo $coord1 | sed 's/,.*$//'`
            coord1right=`echo $coord1 | sed 's/^.*,//'`

            length1=`expr $coord1right - $coord1left`

            for coord2 in $input
                do

                    coord2left=`echo $coord2 | sed 's/,.*$//'`
                    coord2right=`echo $coord2 | sed 's/^.*,//'`

                    allcoords="$coord1left,$coord1right,$coord2left,$coord2right"

                    min=`echo $allcoords | gawk 'BEGIN { RS="," } min==""{ min=$1 } min>$1 { min=$1 } END { print min }'`
                    max=`echo $allcoords | gawk 'BEGIN { RS="," } max==""{ max=$1 } max<$1 { max=$1 } END { print max }'`

                    length2=`expr $coord2right - $coord2left`

                    if [[ `expr $max - $min` -lt `expr $length1 + $length2` ]]
                        then

                            if [[ $coord1left$coord1right != $coord2left$coord2right ]]
                                then

                                    coordinate1=`echo $allcoords | sed "s/$min//" | sed "s/$max//" | sed 's/,,/,/g' | sed 's/,,/,/g' | sed 's/,$//' | sed 's/^,//'`

                                    coord1left=`echo $coordinate1 | gawk 'BEGIN { RS="," } min==""{ min=$1 } min>$1 { min=$1 } END { print min }'`
                                    coord1right=`echo $coordinate1 | gawk 'BEGIN { RS="," } max==""{ max=$1 } max<$1 { max=$1 } END { print max }'`

                                    length1=`expr $coord1right - $coord1left`

                            fi

                    fi

                done

            narcoords=$narcoords"\n"$coord1left","$coord1right

        done

printf '%b\n' $narcoords | gawk '!/$^/ { print }' | sort -n | uniq > $filename.$arm.$mode.narrowed

echo "Done. The results have been placed in this directory, in a file called $filename.$arm.$mode.narrowed.

Thank you for using DNArrow! Copyright (c) Andrew Papadopoli 2013
University of Toronto, Department of Molecular Genetics, Brill Lab
"
