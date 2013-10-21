#!/bin/bash

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
## data to plain text. Version 1.x.x+ uses Spreadsheet::ParseExcel,
## Copyright (c) 2000-2011 K. Takonori, G. Szabo and J. McNamara
##
## DNArrow Copyright (c) Andrew Papadopoli 2013
## University of Toronto, Department of Molecular Genetics, Brill lab
##

echo "

Welcome to DNArrow, a data analysis tool for genetic screening.
        v.1.2.0 Copyright (c) Andrew Papadopoli 2013

"

echo 'You are currently running the "Remaining" script.
'

#for testing

#coords=`echo "100,200x150,300x50,400x700,1000" | awk 'BEGIN { RS="x" } { print }' | sort -n`

#printf '%b\n' "First Coordinates:\n$coords\n\n"

filename=$1
arm=$2

echo "Parsing Excel file with Spreadsheet::ParseExcel (c) J. McNamara 2009-2011...
"

perl parse_xls.perl $filename > $filename.parsed

echo "Done parsing. Fetching coordinates from .xls file...
"

neucoordsraw=`cat $filename.parsed | grep "^[0-9]*,$arm Dfs," | gawk 'BEGIN { RS="Dfs,0," } /,6,X/{ print }' | grep "$arm Dfs,4," | gawk 'BEGIN { FS=":" } { print $2 }'`
supcoordsraw=`cat $filename.parsed | grep "^[0-9]*,$arm Dfs," | gawk 'BEGIN { RS="Dfs,0," } /,6,SUP/{ print }' | grep "$arm Dfs,4," | gawk 'BEGIN { FS=":" } { print $2 }'`
enhcoordsraw=`cat $filename.parsed | grep "^[0-9]*,$arm Dfs," | gawk 'BEGIN { RS="Dfs,0," } /,6,ENH/{ print }' | grep "$arm Dfs,4," | gawk 'BEGIN { FS=":" } { print $2 }'`

neucoords=`printf '%b\n' $neucoordsraw | gawk '!(/--/) { print }' | sort -n`
supcoords=`printf '%b\n' "$supcoordsraw\n$enhcoordsraw" | gawk '!(/--/) { print }' | sort -n`

neucoords_dashes=`printf '%b\n' $neucoordsraw | gawk '(/--/) { print }' | sort -n`
supcoords_dashes=`printf '%b\n' "$supcoordsraw\n$enhcoordsraw" | gawk '(/--/) { print }' | sort -n`

sup_removed_dashes=`printf '%b\n' $supcoords_dashes | sed 's/--/;/g'`

for sup_uncertain_breakpoint in $sup_removed_dashes
    do

        min=`echo $sup_uncertain_breakpoint | gawk 'BEGIN { RS=";" } min==""{ min=$1 } min>$1 { min=$1 } END { print min }'`
        max=`echo $sup_uncertain_breakpoint | gawk 'BEGIN { RS=";" } max==""{ max=$1 } max<$1 { max=$1 } END { print max }'`

        moresups="$moresups\n$min;$max"

    done

for neu_uncertain_breakpoint in $neucoords_dashes
    do

        fixed_new_neu=`echo $neu_uncertain_breakpoint | gawk 'BEGIN { RS="--" } { print }' | grep ";"`

        moreneus="$moreneus\n$fixed_new_neu"

    done

supcoords=`printf '%b\n' "$supcoords\n$moresups" | sort -n | grep -v ^$`
neucoords=`printf '%b\n' "$neucoords\n$moreneus" | sort -n | grep -v ^$`

coords=`printf '%b\n' "$supcoords\n$neucoords" | sed 's/;/,/g' | sort -n | grep -v ^$`

#printf '%b\n' $coords

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

covered_regions=`Collapser`

numlines=`printf '%b\n' $covered_regions | wc -l`

n=1

numbases=`cat ./genome/$arm.raw | wc -c`

supcoords="1;$numbases"
neucoords=`printf '%b\n' $covered_regions | sed 's/,/;/g'`

numlines=`printf '%b\n' $supcoords | wc -l`

while [[ $n -le $numlines ]]
    do

        supcoord=`printf '%b\n' $supcoords | head -$n | tail -1`

        neucoords=`printf '%b\n' $neucoords`

        did_overlap_right=0

        for neucoord in $neucoords
            do

                does_overlap_right=0

                supcoordleft=`echo $supcoord | sed 's/;.*$//'`
                supcoordright=`echo $supcoord | sed 's/^.*;//'`

                neucoordleft=`echo $neucoord | sed 's/;.*$//'`
                neucoordright=`echo $neucoord | sed 's/^.*;//'`

                narrowleftsup=$supcoordleft
                narrowrightsup=$supcoordright

                test1=0
                test2=0

                narrowleftleft="None"

                if [[ $neucoordleft -le $supcoordleft && $neucoordright -ge $supcoordright ]]
                    then
                        echo Contradiction found in $supcoordleft,$supcoordright and $neucoordleft,$neucoordright
                        narrowleftsup="DNE"
                        narrowrightsup="DNE"

                        supcoord=$narrowleftsup";"$narrowrightsup

                        break

                    else
                        if [[ $neucoordleft -le $supcoordleft && $neucoordright -ge $supcoordleft ]]
                            then
                                narrowleftsup=$neucoordright

                            else

                                test1=1
                        fi

                        if [[ $neucoordright -ge $supcoordright && $supcoordright -ge $neucoordleft ]]
                            then
                                narrowrightsup=$neucoordleft

                                does_overlap_right=1
                                did_overlap_right=1

                            else

                                test2=1
                        fi
                fi

                if [[ $(($test1 + $test2)) -eq 2 ]]
                    then
                        if [[ $supcoordleft -le $neucoordleft && $supcoordright -ge $neucoordright ]]
                            then
                                narrowleftleft=$supcoordleft
                                narrowleftright=$neucoordleft
                                narrowrightleft=$neucoordright
                                narrowrightright=$supcoordright
                        fi
                fi

                supcoord=$narrowleftsup";"$narrowrightsup

                if [[ $narrowleftleft != "None" ]]
                    then
                        supcoords=$supcoords'\n'$narrowleftleft";"$narrowleftright'\n'$narrowrightleft";"$narrowrightright

                        numlines=`printf '%b\n' $supcoords | wc -l`

                        supcoord=""

                        break

                fi

                if [[ $did_overlap_right -eq 1 ]]
                    then

                        if [[ $does_overlap_right -eq 0 ]]
                            then

                                break

                        fi

                fi

            done

        remaining_results=`printf '%b\n' "$remaining_results\n$supcoord"`

        n=$(( $n + 1 ))

    done

printf '%b\n' $remaining_results | grep -v ^$ | sort -n | uniq > $filename.$arm.remaining

echo "Done. The results have been placed in this directory, in a file called $filename.$arm.remaining.

Thank you for using DNArrow! Copyright (c) Andrew Papadopoli 2013
University of Toronto, Department of Molecular Genetics, Brill Lab
"

