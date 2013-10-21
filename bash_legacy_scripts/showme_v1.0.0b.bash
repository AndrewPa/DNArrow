#!/usr/bash

arm=$1
armfile=./genome/$arm.raw
filename=$2
maxlength=$3
perspace=$4

neucoordsraw=`awk 'BEGIN { RS=",0,"; FS=",[0-9]," } /X/{ print $5 }' $filename.parsed | awk '/.*;.*/{ print }' | grep -v 3LHet | grep $arm`
supcoordsraw=`awk 'BEGIN { RS=",0,"; FS=",[0-9]," } /SUP/{ print $5 }' $filename.parsed | awk '/.*;.*/{ print }' | grep -v 3LHet | grep $arm`

neucoords=`echo $neucoordsraw | awk 'BEGIN { RS="[0-9][A-Z]:" } (/^[0-9]/) && !(/--/) { print }' | sed 's/;/,/g' | sort -n`
supcoords=`echo $supcoordsraw | awk 'BEGIN { RS="[0-9][A-Z]:" } (/^[0-9]/) && !(/--/) { print }' | sed 's/;/,/g' | sort -n`

echo "Zooming in..."

armlength=`cat $armfile | wc -c`

zoom=$(( $armlength / $maxlength ))

zoomed=$(( $armlength / $zoom ))

SupZoom()

{

for supcoord in `printf '%b\n' $supcoords`
    do

        supcoordleft=`echo $supcoord | sed 's/,.*$//'`
        supcoordright=`echo $supcoord | sed 's/^.*,//'`

        supcoordleftzoomed=$(( $supcoordleft / $zoom ))
        supcoordrightzoomed=$(( $supcoordright / $zoom ))

        echo $supcoordleftzoomed","$supcoordrightzoomed

    done

}

NeuZoom()

{

for neucoord in `printf '%b\n' $neucoords`
    do

        neucoordleft=`echo $neucoord | sed 's/,.*$//'`
        neucoordright=`echo $neucoord | sed 's/^.*,//'`

        neucoordleftzoomed=$(( $neucoordleft / $zoom ))
        neucoordrightzoomed=$(( $neucoordright / $zoom ))

        echo $neucoordleftzoomed","$neucoordrightzoomed

    done

}

DoesOverlap()

{

firstinput=`NeuZoom`

outercounter=0

if [[ $cyclecounter -le 1 ]]
    then

        input=$firstinput

    else

        input=`printf '%b\n' $leftoveroutput | sort -n | uniq`

        line2=""

fi

numneucoords=`printf '%b\n' $input | wc -l`

    while [[ $outercounter -le $numneucoords ]]
        do

            toggle2=0

            outercounter=$(( $outercounter + 1 ))
            innercounter=0

            coord2counter=$outercounter

            coordslist=""

            coord1left=`printf '%b\n' $input | head -$outercounter | tail -1 | sed 's/,.*$//'`
            coord1right=`printf '%b\n' $input | head -$outercounter | tail -1 |  sed 's/^.*,//'`

            length1=`expr $coord1right - $coord1left`

            while [[ $coord2counter -le $numneucoords ]]
                do

                    coord2left=`printf '%b\n' $input | head -$coord2counter | tail -1 | sed 's/,.*$//'`
                    coord2right=`printf '%b\n' $input | head -$coord2counter | tail -1 |  sed 's/^.*,//'`

                    allcoords="$coord1left,$coord1right,$coord2left,$coord2right"

                    min=`echo $allcoords | awk 'BEGIN { RS="," } min==""{ min=$1 } min>$1 { min=$1 } END { print min }'`
                    max=`echo $allcoords | awk 'BEGIN { RS="," } max==""{ max=$1 } max<$1 { max=$1 } END { print max }'`

                    length2=`expr $coord2right - $coord2left`

                    if [[ `expr $max - $min` -le `expr $length1 + $length2` ]]
                        then

                            line1=$line1"\n"$coord1left","$coord1right

                            toggle2=1

                            if [[ $coord1left$coord1right != $coord2left$coord2right ]]
                                then

                                    line2=$line2"\n"$coord2left","$coord2right

                                    outercounter=$(( $outercounter + 1 ))


                            fi

                        else

                            if [[ $toggle2 -eq 1 ]]

                                then

                                    coord2counter=$(( $numneucoords + 1 ))

                            fi

                    fi

                    coord2counter=$(( $coord2counter + 1 ))

                done

        done

}

numlinesleft=$perspace

cyclecounter=0

while [[ $numlinesleft -gt 1 ]]
    do

        cyclecounter=$(( $cyclecounter + 1 ))

        echo Calculating line $cyclecounter map positions...

        DoesOverlap

        leftoveroutput=$line2
        export line$cyclecounter=$line1

        numlinesleft=`printf '%b\n' $leftoveroutput | wc -l`

        printline=`printf '%b\n' $line1 | sort -n | uniq`

        printtolines=$printtolines"\n"$cyclecounter$printline

        line1=""

    done

cleanlines=`printf '%b\n' $printtolines | awk '!/^$/ { print }'`

ShowMe()

{

echo "Building map..."

extraspace=`printf -v spaces '%*s' $perspace ''; printf '%s\n' ${spaces// /'|'}`

numlines=$(( $maxlength / $perspace ))

singlesupline=`printf -v spaces '%*s' $maxlength ''; printf '%s\n' ${spaces// /'-'}`

for zoomedsup in `SupZoom`
    do

                supprintleft=`echo $zoomedsup | sed 's/,.*$//'`
                supprintright=`echo $zoomedsup | sed 's/^.*,//'`

                singlesupline=`echo $singlesupline | awk 'function repl(s,p,v)
                { return substr(s,1,p-1) sprintf("%-*s",1, v) substr(s,p+1) }
                { a=repl($0,'$supprintleft',"[") }
                { print a }'`

                singlesupline=`echo $singlesupline | awk 'function repl(s,p,v)
                { return substr(s,1,p-1) sprintf("%-*s",1, v) substr(s,p+1) }
                { a=repl($0,'$supprintright',"]") }
                { print a }'`

    done

for everyline in `seq 1 $cyclecounter`
    do

        totextralines=$totextralines$extraspace"\n"

    done

totextralines=`printf '%b\n' $totextralines | awk ' !/^$/ { print } '`

numberoflines=$(( $maxlength / $perspace ))

plusperspace=$(( $perspace + 1 ))

spaced=`printf '%b\n' $singlesupline | awk 'function spacer(s,p,v)
{ return substr(s,1,p) sprintf("%-*s",1, v) substr(s,p+1) }
{ a=spacer($0,'$perspace',"xx") }
{ for(i=2;i<='$numberoflines';i++)

 {

   m = i * '$plusperspace'

   a=spacer(a,m,"x")

 }

}

{ print a }'`

suplines=`printf '%b\n' $spaced | sed 's/xx/x/g' | awk 'BEGIN { RS="x" } { print }' | awk '!/^$/{print}'`

for singleline in `printf '%b\n' $suplines`
    do

        regspaced=$regspaced$totextralines"\n"$singleline"\n"

    done

echo "Populating map..."

regspaced=`printf '%b\n' $regspaced | awk '!/^$/ { print }'`

lineskipper=$(( $cyclecounter + 1 ))

for linenumber in `seq 1 $cyclecounter`
    do

        reversenumber=$(( $(( $cyclecounter + 1 )) - $linenumber ))

        nowprinting=`printf '%b\n' $cleanlines | awk 'BEGIN { RS="\n[0-9]\n"; FS="\n" } { if(NR == '$linenumber') print }' | awk '/,/{print}'`

        for printcoordinate in `printf '%b\n' $nowprinting`
            do

                neuprintleft=`echo $printcoordinate | sed 's/,.*$//'`
                neuprintright=`echo $printcoordinate | sed 's/^.*,//'`

                neulineleft=$(( $neuprintleft / $perspace ))
                neuposleft=$(( $(( $neuprintleft % $perspace )) + 0 ))

                neulineright=$(( $neuprintright / $perspace ))
                neuposright=$(( $(( $neuprintright % $perspace )) + 0 ))

                if [[ $neuposleft -eq 0 ]]
                    then

                        neuposleft=$perspace

                        neulineleft=$(( $neulineleft - 1 ))

                fi

                if [[ $neuposright -eq 0 ]]
                    then

                        neuposright=$perspace

                        neulineright=$(( $neulineright - 1 ))

                fi

                properlineleft=$(( $(( $neulineleft * $lineskipper )) + $reversenumber ))
                properlineright=$(( $(( $neulineright * $lineskipper )) + $reversenumber ))

                regspaced=`printf '%b\n' $regspaced | awk 'function repl(s,p,v)
                { return substr(s,1,p-1) sprintf("%-*s",1, v) substr(s,p+1) }
                { a=repl($0,'$neuposleft',"(") }
                {if (NR=='$properlineleft') print a;}
                {if (NR!='$properlineleft') print;}'`

                regspaced=`printf '%b\n' $regspaced | awk 'function repl(s,p,v)
                { return substr(s,1,p-1) sprintf("%-*s",1, v) substr(s,p+1) }
                { a=repl($0,'$neuposright',")") }
                {if (NR=='$properlineright') print a;}
                {if (NR!='$properlineright') print;}'`

            done

    done

sidecounter=1

lineend=$(( $perspace * $zoom ))

while [[ $sidecounter -le $numberoflines ]]
    do

        lineendcoord=$(( $lineend * $sidecounter ))

        markedline=$(( $sidecounter * $(( $cyclecounter + 1 )) ))

        regspaced=`printf '%b\n' $regspaced | awk '{ if(NR != '$markedline') {print} else {print $0"<<<""'$lineendcoord'"} }'`

        sidecounter=$(( $sidecounter + 1 ))

    done

printf '%b\n' $regspaced

}

ShowMe
