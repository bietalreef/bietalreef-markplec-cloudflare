import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../dist-worker/worker.mjs';

const root='https://market-test.bietalreef.ae';
test('published test homepage is nonindexed and includes the new footer',async()=>{
  const response=await app.fetch(new Request(root+'/'));
  const html=await response.text();
  assert.equal(response.status,200);
  assert.match(response.headers.get('x-robots-tag')||'',/noindex/);
  assert.match(html,/id="footer-guide"/);
  assert.match(html,/نظام اختبار/);
  assert.match(html,/noindex,nofollow,noarchive/);
  assert.doesNotMatch(html,/بيئة تطوير/);
});
test('all footer assets are available with correct types and nonindex headers',async()=>{
  for(const [path,type] of [
    ['/footer-pages.js','text/javascript'],['/footer-ux.css','text/css'],
    ['/app.js','text/javascript'],['/routes.js','text/javascript'],['/styles.css','text/css']]){
    const r=await app.fetch(new Request(root+path));
    assert.equal(r.status,200,path);
    assert.ok(r.headers.get('content-type')?.includes(type),path);
    assert.match(r.headers.get('x-robots-tag')||'',/noindex/);
    assert.ok((await r.text()).length>100,path);
  }
});
test('crawler routes are blocked and unsupported methods cannot mutate',async()=>{
  const robots=await app.fetch(new Request(root+'/robots.txt'));
  assert.equal(robots.status,200);
  assert.match(await robots.text(),/Disallow: \/+/);
});
test('unsafe methods and unknown paths are blocked',async()=>{
  assert.equal((await app.fetch(new Request(root+'/',{method:'POST'}))).status,405);
  assert.equal((await app.fetch(new Request(root+'/unknown/private'))).status,404);
});
