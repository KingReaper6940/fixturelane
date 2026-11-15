export const SCHEMA = 'fixturelane-project-v1';
export function text(value,max,name,multi=false){
 if(typeof value!=='string'||value.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffe\uffff]/.test(value)||(!multi&&/[\r\n\t]/.test(value))||[...value].some(c=>c.length===1&&c.charCodeAt(0)>=0xd800&&c.charCodeAt(0)<=0xdfff))throw Error('Invalid '+name+' (maximum '+max+' code units).');
}
export function names(source,max,name){
 text(source,4000,name,true);
 const rows=source.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
 if(!rows.length||rows.length>max)throw Error('Use 1–'+max+' '+name+'.');
 for(const row of rows)text(row,64,name+' label');
 if(new Set(rows).size!==rows.length)throw Error(name+' labels must be distinct after trimming.');
 return rows;
}
function exact(obj,keys){return obj&&typeof obj==='object'&&!Array.isArray(obj)&&Object.keys(obj).sort().join('|')===[...keys].sort().join('|')}
export function validate(p){
 if(!exact(p,['schema','title','entrantText','courtText','legs','notes'])||p.schema!==SCHEMA)throw Error('Unsupported project fields or version.');
 text(p.title,80,'title');text(p.notes,1000,'notes',true);if(!p.title.trim())throw Error('Title is required.');
 const entrants=names(p.entrantText,24,'entrant');if(entrants.length<2)throw Error('At least two entrants are required.');names(p.courtText,12,'court');
 if(![1,2].includes(p.legs))throw Error('Choose one or two legs.');return p;
}
export const blank=()=>({schema:SCHEMA,title:'Untitled fixtures',entrantText:'Entrant 1\nEntrant 2',courtText:'Court 1',legs:1,notes:''});
export const clone=p=>structuredClone(validate(p));
export function parseProject(source){if(typeof source!=='string'||source.length>150000)throw Error('Project exceeds 150,000 decoded code units.');return clone(JSON.parse(source.replace(/^\uFEFF/,'')));}
export function history(initial){let current=clone(initial),past=[],future=[];return {get value(){return structuredClone(current)},get canUndo(){return !!past.length},get canRedo(){return !!future.length},commit(p){const q=clone(p);if(JSON.stringify(q)===JSON.stringify(current))return false;past.push(current);past=past.slice(-25);future=[];current=q;return true},undo(){if(!past.length)return false;future.push(current);current=past.pop();return true},redo(){if(!future.length)return false;past.push(current);past=past.slice(-25);current=future.pop();return true}}}
