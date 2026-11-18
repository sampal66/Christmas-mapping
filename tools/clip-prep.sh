#!/usr/bin/env bash
# Prepares a generated character clip for the app (WP-04; DESIGN_SYSTEM §09). Cloud-side only: ffmpeg is not an app
# dependency. Steps: crush near-black to pure black (so the 'screen' blend leaves no grey box), crop to the
# character's bounding box over the whole clip, scale to ≤ 540 px tall, 30 fps, then pack it as stacked alpha
# (tools/clip-alpha.js: colour on top, matte below; H.264 CRF 26, no audio, faststart).
# With --loop, the clip's last 0.5 s crossfades into its first 0.5 s so it repeats without a seam.
#
# Usage: tools/clip-prep.sh <in.mp4> <id> [--loop] [--pad N] [--maxh N]
#   → app/assets/clips/<id>.mp4
set -euo pipefail
in=$1; id=$2; shift 2
loop=0; pad=12; maxh=540
while [ $# -gt 0 ]; do
  case $1 in
    --loop) loop=1 ;;
    --pad) pad=$2; shift ;;
    --maxh) maxh=$2; shift ;;
  esac
  shift
done
final="$(dirname "$0")/../app/assets/clips/$id.mp4"
mkdir -p "$(dirname "$final")"
out="$(mktemp --suffix=.mp4)"   # cropped colour clip; packed with its matte at the end

# Levels: anything under ≈7 % brightness becomes black (the generator's "black" drifts to dark grey).
levels="colorlevels=rimin=0.07:gimin=0.07:bimin=0.07"
read -r W H D < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height:format=duration -of csv=p=0:nk=1 "$in" | tr ',\n' '  '; echo)

# Bounding box: union of cropdetect's per-frame boxes over the whole clip.
box=$(ffmpeg -hide_banner -i "$in" -vf "$levels,cropdetect=limit=10:round=2:reset=1" -f null - 2>&1 |
  grep -o 'x1:[0-9]* x2:[0-9]* y1:[0-9]* y2:[0-9]*' |
  awk -F'[: ]' 'NR==1{a=$2;b=$4;c=$6;d=$8} {if($2<a)a=$2; if($4>b)b=$4; if($6<c)c=$6; if($8>d)d=$8} END{print a,b,c,d}')
read -r x1 x2 y1 y2 <<<"$box"
x1=$(( x1 - pad < 0 ? 0 : x1 - pad )); y1=$(( y1 - pad < 0 ? 0 : y1 - pad ))
x2=$(( x2 + pad >= W ? W - 1 : x2 + pad )); y2=$(( y2 + pad >= H ? H - 1 : y2 + pad ))
cw=$(( (x2 - x1 + 1) / 2 * 2 )); ch=$(( (y2 - y1 + 1) / 2 * 2 ))
th=$(( ch < maxh ? ch : maxh ))
crop="$levels,crop=$cw:$ch:$x1:$y1,scale=-2:$th:flags=lanczos,fps=30,format=yuv420p"

if [ $loop = 1 ]; then
  x=0.5
  off=$(awk -v d="$D" -v x=$x 'BEGIN{printf "%.3f", d - 2*x}')
  ffmpeg -v error -y -i "$in" -filter_complex \
    "[0:v]$crop,split[a][b];[a]trim=start=$x,setpts=PTS-STARTPTS[main];[b]trim=0:$x,setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=$x:offset=$off[v]" \
    -map "[v]" -an -c:v libx264 -preset fast -crf 12 "$out"
else
  ffmpeg -v error -y -i "$in" -vf "$crop" -an -c:v libx264 -preset fast -crf 12 "$out"
fi
# Stacked alpha: colour on top, matte below (no black box behind the character, on any browser).
node "$(dirname "$0")/clip-alpha.js" "$out" "$final" >/dev/null
rm -f "$out"
printf '%s  crop %sx%s+%s+%s → %s  %s\n' "$id" "$cw" "$ch" "$x1" "$y1" "$(ffprobe -v error -show_entries stream=width,height:format=duration -of csv=p=0 "$final" | tr '\n' ' ')" "$(du -h "$final" | cut -f1)"
