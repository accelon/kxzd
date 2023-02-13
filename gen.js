import {ptk_version,glob,nodefs,writeChanged,peelXML,readTextContent, readTextLines, fromObj } from 'ptk/nodebundle.cjs'; //ptk/pali
// mklink/j html /github.com/kangxizidian/kxzd/
await nodefs; //export fs to global
const srcdir='html/'
const outdir='off/'
const lst = readTextLines('kx.lst');

const notes={};
export const conv=(fn)=>{
    let content=readTextContent(srcdir+fn).replace(/\uFEFF/g,'');
    const from=content.indexOf('<pb')
    const to=content.lastIndexOf('</xml>');
    content=content.slice(from,to);
    
    //無法區分 ph 和 d
    content=content.replace(/<ph>/g,'^d').replace(/<\/ph>/g,'');
    content=content.replace(/\n?<pb ed="wyd?" id="([^>]+)"><\/pb>\n?/g,'^pb$1');
    content=content.replace(/\n?<pb ed="twsj" id="([^>]+)"><\/pb>\n?/g,'^pbb$1');
    content=content.replace(/<a name="u[A-Fa-f\d ]+"><\/a>\n/g,'');
    content=content.replace(/<sc n="\d+"><\/sc>\n/g,'');
    content=content.replace(/<ps n="[^>]+?"><\/ps>\n?/g,'');
    content=content.replace(/<zy>/g,'^zy').replace(/<\/zy>/g,'');
    content=content.replace(/<d>/g,'^d').replace(/<\/d>/g,'');
    //some note just after </wh> , force break to make it not part of ^e 
    content=content.replace(/\n?<wh[^>]*>/g,'\n^e').replace(/<\/wh>/g,'\n');
    content=content.replace(/<t>\n?/g,'').replace(/<\/t>\n?/g,'');

    content=content.replace(/<ch [^>]+>/g,'').replace(/<\/ch>/g,'');
    content=content.replace(/<an>/g,'^an').replace(/<\/an>/g,'');
    content=content.replace(/<sc[^>]+>/g,'').replace(/<\/sc>\n?/g,'');
    content=content.replace(/\n?<part>/g,'\n^part').replace(/<\/part>/g,'');
    content=content.replace(/\n?<juan n="([^>]+)">/g,'\n^juan$1').replace(/<\/juan>/g,'');

    content=content.replace(/《<k n="([^>]+)">([^<]+)<\/k>/g,(m,m1,m2)=>{
        m1=m1.replace(':','.');
        return '^l@'+m1+'《'+m2
    });

    let lines=content.split('\n').filter(it=>!!it);
    let entry='',notecount=0;
    for (let i=0;i<lines.length;i++) {
        const line=lines[i];
        if (line.startsWith('^e')) {
            entry=line.slice(2);
            notecount=0;
        }
        const line2=line.replace(/<note n="([^>]+)" ?><\/note>/g,(m,m1)=>{
            //出現1080次，去除，
            //並將原文「流」改為「流」
            if (m1=='(案，《康熙字典》「流」字上從「𠫓」，同「流」字) --') {
                return '';
            }
            notecount++;
            notes[ entry+notecount]=m1.replace('--','');
            return '^f'+notecount;
        }).replace(/流/g,'流')

        if (line2!==line) lines[i]=line2;
    }
/*

*/

    content=lines.join('\n');
    writeChanged(outdir+fn.replace('.htm','.off'),content,true)
    if (~content.indexOf('<') ) {
        throw fn+' has residue tag'
    }
}


//lst.length=1;
lst.forEach(conv);
writeChanged(outdir+'notes.tsv',fromObj(notes,true).join('\n'),true);
