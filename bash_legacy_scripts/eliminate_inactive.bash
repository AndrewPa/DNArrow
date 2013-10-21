#!/bin/bash

## This initial script removes chromosomal regions you marked as inactive
## i.e. with an "X" in the .xls data file in this directory.)
##
## Please do not run this file directly. The top level files are either
## dnarrow_collapse.bash or dnarrow_narrow.bash.
##
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
## data to plain text. Version 1.x.x uses Spreadsheet::ParseExcel,
## Copyright (c) 2000-2011 K. Takonori, G. Szabo and J. McNamara
##
## DNArrow Copyright (c) Andrew Papadopoli 2013
## University of Toronto, Department of Molecular Genetics, Brill lab
##

#!\bin\bash

#for testing

#supcoordsraw=""
#neucoordsraw=""

#supcoords=`echo $supcoordsraw | awk 'BEGIN { RS="x" } { print }'`
#neucoords=`echo $neucoordsraw | awk 'BEGIN { RS="x" } { print }'`

filename=$1
arm=$2

neucoordsraw=`awk 'BEGIN { RS=",0,"; FS=",[0-9]," } /X/{ print $5 }' $filename.parsed | awk '/.*;.*/{ print }' | grep -v 3LHet | grep $arm`
supcoordsraw=`awk 'BEGIN { RS=",0,"; FS=",[0-9]," } /SUP/{ print $5 }' $filename.parsed | awk '/.*;.*/{ print }' | grep -v 3LHet | grep $arm`

neucoords=`echo $neucoordsraw | awk 'BEGIN { RS="[0-9][A-Z]:" } (/^[0-9]/) && !(/--/) { print }'`
supcoords=`echo $supcoordsraw | awk 'BEGIN { RS="[0-9][A-Z]:" } (/^[0-9]/) && !(/--/) { print }'`

supcoords_dashes=`echo $supcoordsraw | awk 'BEGIN { RS="[0-9][A-Z]:" } (/^[0-9]/) && (/--/) { print }'`
neucoords_dashes=`echo $neucoordsraw | awk 'BEGIN { RS="[0-9][A-Z]:" } (/^[0-9]/) && (/--/) { print }'`

sup_removed_dashes=`printf '%b\n' $supcoords_dashes | sed 's/--/;/g'`

for sup_uncertain_breakpoint in $sup_removed_dashes
    do

        min=`echo $sup_uncertain_breakpoint | awk 'BEGIN { RS=";" } min==""{ min=$1 } min>$1 { min=$1 } END { print min }'`
        max=`echo $sup_uncertain_breakpoint | awk 'BEGIN { RS=";" } max==""{ max=$1 } max<$1 { max=$1 } END { print max }'`

        moresups="$moresups\n$min;$max"

    done

for neu_uncertain_breakpoint in $neucoords_dashes
    do

        fixed_new_neu=`echo $neu_uncertain_breakpoint | awk 'BEGIN { RS="--" } { print }' | grep ";"`

        moreneus="$moreneus\n$fixed_new_neu"

    done

supcoords=`printf '%b\n' "$supcoords\n$moresups" | sort -n | grep -v ^$`
neucoords=`printf '%b\n' "$neucoords\n$moreneus" | sort -n | grep -v ^$`

numlines=`printf '%b\n' $supcoords | wc -l`

n=1

#printf '%b\n' "Supcoords:\n$supcoords\n\nNeucoords:\n$neucoords\n\n"

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

                narrowleftleft=0

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

                if [[ $narrowleftleft -ne 0 ]]
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

        echo $supcoord

        n=$(( $n + 1 ))

    done
