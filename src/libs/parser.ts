
// Vini Vici & Astrix - Adhana [Iboga Records][Trippy video/Trippy Anime]


function parseTitle(title: string) {
    const res: {title: string, tags: string[]} = {
        title: "",
        tags: []
    }
    let rt = false;
    let tagbuff = "";

    for (const c of title) {
        if ((c === "[" || c === "(") && !rt) {
            rt = true;
        }
        else if ((c === "]" || c === ")") && rt) {
            rt = false;
            res.tags.push(tagbuff);
            tagbuff = "";
        }
        else if (!rt) {
            res.title += c;
        } 
        else {
            tagbuff += c;
        }
    }
    res.title = res.title.trim();
    res.tags.map(s => s.trim());
    return res;
}

export interface IParseResult {
    interprets: string[];
    title: string;
    tags: string[];
}


export function parse(videotitle: string) : IParseResult|string {
    if (videotitle.indexOf("-") === -1) {
        return videotitle;
    }

    const parts = videotitle
        .split("-")
        .map(s => s.trim());

    const interprets = parts[0]
        .split(/([&+,]|feat\.)+/i)
        .filter((_, i) => i % 2 === 0)
        .map(s => s.trim());

    const { title, tags } = parseTitle(parts[1]);

    return { interprets, title, tags };
}
