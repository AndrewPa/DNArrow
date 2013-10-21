#!/bin/bash

## This initial script removes chromosomal regions you marked as inactive
## i.e. with an "X" in the .xls data file in this directory.)
##
## Please do not run this file directly. The top level files are either
## dnarrow_collapse.bash or dnarrow_narrow.bash.
##
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

#!\bin\bash

#for testing

filename=$1
arm=$2
mode=$3

supcoords=`cat $filename.$arm.$mode.collapsed | sed 's/,/;/' | sort -n`
neucoords=`cat $filename.$arm.$mode.narrowed | sed 's/,/;/' | sort -n`

numlines=`printf '%b\n' $supcoords | wc -l`

n=1

#printf '%b\n' "Supcoords:\n$supcoords\n\nNeucoords:\n$neucoords\n\n"

Difference()

{

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

        echo $supcoord

        n=$(( $n + 1 ))

    done

}

Difference | grep -v Con | grep -v DNE | grep -v ^$ | sort -n | uniq > $filename.$arm.$mode.difference
