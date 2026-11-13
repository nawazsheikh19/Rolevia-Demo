/** Browser-neutral file selection shared by individual and folder uploads. */
export function selectResumeFiles(files,capacity=30){
 const eligible=[],unsupportedFiles=[];
 for(const file of Array.from(files||[])){
  const name=String(file?.name||"");
  const ext=name.toLowerCase().split(".").pop();
  const path=String(file?.webkitRelativePath||"");
  const hidden=name.startsWith(".")||path.split("/").some(segment=>segment.startsWith(".")||segment==="__MACOSX");
  if(!file||hidden||!["pdf","docx","txt"].includes(ext)){
   unsupportedFiles.push(name);
   continue;
  }
  eligible.push(file);
 }
 const room=Math.max(0,Math.min(30,Math.floor(Number(capacity)||0)));
 return {selected:eligible.slice(0,room),unsupported:unsupportedFiles.length,overLimit:Math.max(0,eligible.length-room)};
}
