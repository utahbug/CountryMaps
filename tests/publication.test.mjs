import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
test('all source HTML pages discourage indexing and link local icons',()=>{
 for(const name of ['index.html','africa/index.html','tests/pan-browser.html','tests/home-browser.html','tests/americas-browser.html','tests/regions-browser.html','tests/clues-browser.html','tests/drops-browser.html','tests/explorer-groups-browser.html']){
  const url=new URL(name,root),html=fs.readFileSync(url,'utf8');
  assert.match(html,/<meta name="robots" content="noindex, nofollow">/);
  assert.match(html,/rel="apple-touch-icon"/);
  for(const match of html.matchAll(/(?:src|href)="(\.\.?\/[^"?]+)"/g))assert.ok(fs.existsSync(new URL(match[1],html.includes('<base href="../">')?new URL('../',url):url)),match[1]);
 }
 assert.equal(fs.readFileSync(new URL('robots.txt',root),'utf8').trim(),'User-agent: *\nDisallow: /');
});
test('PNG icons have required dimensions and manifest paths stay project-relative',()=>{
 for(const [name,size] of [['favicon-32x32.png',32],['apple-touch-icon.png',180],['icon-192.png',192],['icon-512.png',512]]){
  const png=fs.readFileSync(new URL(name,root));
  assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);
 }
 const manifest=JSON.parse(fs.readFileSync(new URL('site.webmanifest',root),'utf8'));
 assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
 for(const icon of manifest.icons){assert.ok(icon.src.startsWith('./'));assert.ok(fs.existsSync(new URL(icon.src,root)));}
});
