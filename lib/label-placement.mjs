import {placeRevealLabels} from './reveal-labels.mjs';

// Backward-compatible single-label entry point. Explorer now uses the same
// structured placement engine as Reveal.
export function placeCountryLabel(input){
 const fitsInside=input.fitsInside??(input.country.w>=input.label.w*1.45&&input.country.h>=input.label.h*1.35);
 return placeRevealLabels(input.viewport,[{id:'selected',...input.label,country:input.country,anchor:input.anchor,neighbors:input.neighbors||[],fitsInside}]).selected;
}
