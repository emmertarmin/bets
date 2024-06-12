export const prerender = false;

import json_data from "@/data/matches_scheduled.json";
import download from "image-downloader";

export async function GET({ request }: APIContext) {
    // console.log("GET /api/import/flags");
    const img_dl = [];
    const matches: any[] = json_data.matches;
    for(const match of matches) {
        if (!match.homeTeam.crest) continue;
        let { tla, crest } = match.homeTeam;
        let options = {
            url: crest,
            dest: '../../public/assets/' + tla.toLowerCase() + '.' + crest.split('.').pop()
        };
        // get image, array of promises
        img_dl.push(
            download.image(options)
        )
        // download.image(options).then(({ filename }) => {
            // console.log('Saved to', filename);
            // img_dl.push({ message: matches[match].homeTeam.crest + ' saved to ' + filename });
        // }).catch((err) => console.error(err));
    }
    const body = (await Promise.all(img_dl)).map(({ filename }) => "Saved to " + filename);
    return new Response(JSON.stringify(body));
    // return img_dl;
};