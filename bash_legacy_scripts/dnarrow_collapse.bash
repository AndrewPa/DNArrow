#!/usr/bash

##
## DNArrow v.1.2.0
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
## data to plain text. Version 1.x.x uses Spreadsheet::ParseExcel,
## Copyright (c) 2000-2011 K. Takonori, G. Szabo and J. McNamara
##
## DNArrow Copyright (c) Andrew Papadopoli 2013
## University of Toronto, Department of Molecular Genetics, Brill lab
##

echo "

Welcome to DNArrow, a data analysis tool for genetic screening.
        v.1.2.0 Copyright (c) Andrew Papadopoli 2013

"

echo 'You are currently running the "Collapse" script.
'

filename=$1
arm=$2
mode=$3

if [[ -r ./$filename.$arm.collapsed ]]
    then

        rm ./$filename.$arm.collapsed

fi

echo "Parsing Excel file with Spreadsheet::ParseExcel (c) J. McNamara 2009-2011...
"

perl parse_xls.perl $filename > $filename.parsed

echo "Done parsing. Removing neutral regions...
"
coords=`bash ./eliminate_inactive.bash $filename $arm $mode | grep -v Contradiction | grep -v DNE | sort -n | uniq | sed 's/;/,/g'`

#for testing

#coords=`echo "100,200x150,300x50,400x700,1000" | awk 'BEGIN { RS="x" } { print }' | sort -n`

#printf '%b\n' "First Coordinates:\n$coords\n\n"

printf '%b\n' $coords

echo "Done. Merging overlapping regions..."

Collapser()

{

orig_list_num=`printf '%b\n' $coords | wc -l`

while [[ -n "$coords" ]]
    do

        coord1=`printf '%b\n' $coords | head -1`

        coord1left=`echo $coord1 | sed 's/,.*$//'`
        coord1right=`echo $coord1 | sed 's/^.*,//'`

        length1=`expr $coord1right - $coord1left`

        last_coord=`printf '%b\n' $coords | tail -1`

        for coord2 in $coords
            do

                found_overlap_toggle=0

                coord2left=`echo $coord2 | sed 's/,.*$//'`
                coord2right=`echo $coord2 | sed 's/^.*,//'`

                allcoords="$coord1left,$coord1right,$coord2left,$coord2right"

                min=`echo $allcoords | gawk 'BEGIN { RS="," } min==""{ min=$1 } min>$1 { min=$1 } END { print min }'`
                max=`echo $allcoords | gawk 'BEGIN { RS="," } max==""{ max=$1 } max<$1 { max=$1 } END { print max }'`

                length2=`expr $coord2right - $coord2left`

                if [[ `expr $max - $min` -le `expr $length1 + $length2` ]]
                    then

                        found_overlap_toggle=1

                        if [[ "$coord1" != "$coord2" ]]
                            then

                                collapsed_coord=`echo "$min,$max"`

                                coords=`printf '%b\n' $coords | grep -v $coord1 | grep -v $coord2 | sort -n`

                                coords=`printf '%b\n' "$collapsed_coord\n$coords" | sort -n`

                                break

                        fi

                fi

                if [[ "$coord2" == "$last_coord" ]] || [[ $found_overlap_toggle -eq 0 ]]
                    then

                        echo $coord1

                        coords=`printf '%b\n' $coords | grep -v $coord1 | sort -n`

                        break

                fi

            done

    done

}

Collapser > ./$filename.$arm.$mode.collapsed

echo "Done. The results have been placed in this directory, in a file called $filename.$arm.$mode.collapsed.

Thank you for using DNArrow! Copyright (c) Andrew Papadopoli 2013
University of Toronto, Department of Molecular Genetics, Brill Lab
"
