import test from 'node:test';
import assert from 'node:assert/strict';
import {resultHref} from '../routes.js';
test('Arabic search, section and type survive navigation and tab changes together',()=>{
  const initial=new URLSearchParams({q:'تنظيف & صيانة'});
  const filtered=resultHref(initial,{category:'maintenance'});
  const query=new URLSearchParams(filtered.split('?')[1]);
  assert.equal(query.get('category'),'maintenance');
  assert.equal(query.get('q'),'تنظيف & صيانة');
  const changed=new URLSearchParams(resultHref(query,{type:'service'}).split('?')[1]);
  assert.equal(changed.get('category'),'maintenance');
  assert.equal(changed.get('type'),'service');
  assert.equal(changed.get('q'),'تنظيف & صيانة');
  assert.equal(changed.has('amp;category'),false);
});
