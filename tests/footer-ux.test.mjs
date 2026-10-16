import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {footerSections,infoDocuments,legalDocuments,ownerTopics} from '../footer-pages.js';

test('old marketplace footer pages remain available as new in-site routes', async () => {
  assert.equal(Object.keys(infoDocuments).length,17);
  assert.deepEqual(Object.keys(legalDocuments).sort(),['cookies','legal','privacy']);
  assert.equal(Object.keys(ownerTopics).length,8);
  assert.equal(footerSections.length,5);
  for(const group of footerSections){
    assert.ok(group.links.length>=2);
    for(const [text,href] of group.links){
      assert.ok(text.length);
      assert.match(href,/^#(?:info|owner|results|categories)/);
      if(href.startsWith('#info?slug='))assert.ok(Object.hasOwn(infoDocuments,new URLSearchParams(href.split('?')[1]).get('slug')));
      if(href.startsWith('#owner?topic='))assert.ok(Object.hasOwn(ownerTopics,new URLSearchParams(href.split('?')[1]).get('topic')));
    }
  }
});

test('legal pages use full existing sections, not incomplete placeholder policies',()=>{
  for(const kind of ['privacy','legal','cookies']){
    const doc=legalDocuments[kind];
    assert.ok(doc.title.length>5);
    assert.ok(doc.sections.length>=4);
    assert.ok(doc.sections.every(s=>s.title && ((s.items&&s.items.length)||(s.paragraphs&&s.paragraphs.length))));
  }
});

test('market preview header, product/service/offer templates remain intact',async()=>{
  const html=await readFile('dist/index.html','utf8');
  const app=await readFile('dist/app.js','utf8');
  assert.match(html,/id="footer-guide"/);
  assert.match(html,/href="\/footer-ux\.css"/);
  assert.match(app,/function home\(\)/);
  assert.match(app,/function detailPage\(params\)/);
  assert.match(app,/function storePage\(\)/);
  assert.match(app,/function renderFooter\(\)/);
  assert.match(app,/policy:\(\)=>policyPage\(params\)/);
  assert.match(app,/info:\(\)=>informationPage\(params\)/);
  assert.match(app,/owner:\(\)=>ownerInfoPage\(params\)/);
  assert.match(app,/sitemap:footerSitemap/);
});

test('test market stays noindex and does not embed backoffice entry points',async()=>{
  const html=await readFile('dist/index.html','utf8');
  const info=await readFile('dist/footer-pages.js','utf8');
  assert.match(html,/noindex,nofollow,noarchive/);
  assert.doesNotMatch(html,/mcp\.admin\.|admin\.bietalreef\.ae/);
  assert.doesNotMatch(info,/https?:\/\/admin\.bietalreef\.ae/);
});
