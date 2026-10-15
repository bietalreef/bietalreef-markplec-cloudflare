// Raw route value: escape only when inserting into HTML, never before navigation.
export function resultHref(params,updates){
  const next=new URLSearchParams(params);
  for(const [key,value] of Object.entries(updates)) value?next.set(key,value):next.delete(key);
  return '#results?'+next.toString();
}
