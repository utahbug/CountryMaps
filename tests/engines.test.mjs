import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DragController } from '../lib/engines/drag-controller.mjs';
import {
  ExplorerEngine,
  RevealEngine,
  PuzzleEngine,
} from '../lib/engines/activities.mjs';
const manifest = JSON.parse(
  fs.readFileSync(new URL('../data/africa.manifest.json', import.meta.url)),
);
const data = JSON.parse(
  fs.readFileSync(new URL('../data/africa.json', import.meta.url)),
);
const ids = data.countries.map((c) => c.id);
function fixture() {
  let preview = null;
  const drops = [];
  const classes = new Set();
  let captured = null;
  const source = {
    classList: { add: (x) => classes.add(x), remove: (x) => classes.delete(x) },
    setPointerCapture: (id) => (captured = id),
    hasPointerCapture: (id) => id === captured,
    releasePointerCapture: () => {
      captured = null;
    },
  };
  const ctl = new DragController(
    (state) => (preview = state),
    (...args) => drops.push(args),
  );
  const event = (id = 1, extra = {}) => ({
    pointerId: id,
    isPrimary: true,
    button: 0,
    pointerType: 'mouse',
    clientX: 10,
    clientY: 10,
    ...extra,
  });
  return {
    ctl,
    source,
    classes,
    drops,
    event,
    get preview() {
      return preview;
    },
    get capture() {
      return captured;
    },
  };
}
test('explicit 54-country manifest exactly matches generated geometry', () => {
  assert.equal(manifest.expectedCount, 54);
  assert.equal(ids.length, 54);
  assert.equal(new Set(ids).size, 54);
  assert.deepEqual(
    ids,
    manifest.countries.map((c) => c[0]),
  );
  assert.equal(data.context.length, 3);
  assert.equal(data.context[0].id, 'SAH');
  assert.equal(ids.includes('SOL'), false);
  assert.equal(ids.includes('SAH'), false);
  for (const c of data.countries) {
    assert.ok(c.path.startsWith('M'));
    assert.ok(c.path.endsWith('Z'));
    assert.ok(c.bounds[2] > c.bounds[0]);
    assert.ok(c.bounds[3] > c.bounds[1]);
    assert.ok(c.anchor.every(Number.isFinite));
  }
  for (const id of ['CPV', 'COM', 'MUS', 'SYC', 'STP']) {
    const c = data.countries.find((c) => c.id === id);
    assert.ok(c.inset);
    assert.ok(c.path.split('M').length > 2);
  }
});
test('Explorer selects every manifest id and rejects invalid ids', () => {
  const engine = new ExplorerEngine(ids);
  for (const id of ids) {
    assert.equal(engine.select(id), true);
    assert.equal(engine.selected, id);
  }
  assert.equal(engine.select('SOL'), false);
  engine.reset();
  assert.equal(engine.selected, null);
});
test('Reveal individual, all and reset are repeatable and idempotent', () => {
  const engine = new RevealEngine(ids);
  for (let cycle = 0; cycle < 5; cycle++) {
    for (const id of ids) {
      engine.reveal(id);
      engine.reveal(id);
    }
    assert.equal(engine.revealed.size, 54);
    engine.reset();
    assert.equal(engine.revealed.size, 0);
    engine.revealAll();
    assert.equal(engine.revealed.size, 54);
    engine.reset();
  }
  assert.equal(engine.reveal('invalid'), false);
});
test('Puzzle correct/incorrect/duplicate drops, preview and completion count', () => {
  const engine = new PuzzleEngine(ids);
  for (const id of ids) {
    assert.equal(engine.place(id, false), false);
    assert.equal(engine.place(id, true), true);
    assert.equal(engine.place(id, true), false);
  }
  assert.equal(engine.placed.size, 54);
  engine.preview = true;
  assert.equal(engine.place(ids[0], true), false);
  engine.preview = false;
  assert.equal(engine.placed.size, 54);
  engine.reset();
  assert.equal(engine.placed.size, 0);
  assert.equal(engine.preview, false);
});
test('second pointer cannot steal ownership, move, release or cancel first pointer', () => {
  const f = fixture();
  assert.ok(f.ctl.begin(f.event(1), { id: 'DZA' }, f.source));
  assert.equal(
    f.ctl.begin(
      f.event(2, { isPrimary: false, pointerType: 'touch' }),
      { id: 'AGO' },
      f.source,
    ),
    false,
  );
  assert.equal(f.ctl.begin(f.event(2), { id: 'AGO' }, f.source), false);
  assert.equal(f.ctl.move(f.event(2, { clientX: 99 })), false);
  assert.equal(f.ctl.finish(f.event(2)), false);
  f.ctl.lost(f.event(2));
  assert.equal(f.ctl.active.pointerId, 1);
  assert.equal(f.capture, 1);
  assert.equal(f.preview.country.id, 'DZA');
  assert.equal(f.drops.length, 0);
  f.ctl.finish(f.event(1, { clientX: 100 }));
  assert.equal(f.drops.length, 1);
  assert.equal(f.preview, null);
  assert.equal(f.classes.size, 0);
});
test('pointer cancel and lost capture use the same complete cleanup path', () => {
  for (const pointerType of ['mouse', 'touch', 'pen'])
    for (const reason of ['pointercancel', 'lostpointercapture']) {
      const f = fixture();
      f.ctl.begin(f.event(7, { pointerType }), { id: 'COM' }, f.source);
      f.ctl.move(f.event(7, { clientY: 100 }));
      f.ctl.lost(f.event(7, { type: reason }));
      assert.equal(f.ctl.active, null);
      assert.equal(f.preview, null);
      assert.equal(f.capture, null);
      assert.equal(f.classes.size, 0);
      assert.equal(f.drops.length, 0);
      assert.ok(
        f.ctl.begin(f.event(8, { pointerType }), { id: 'COM' }, f.source),
      );
      f.ctl.finish(f.event(8, { clientX: 100 }));
      assert.equal(f.drops.length, 1);
    }
});
test('Reset during or after abnormal drag states is complete and repeatable', () => {
  const f = fixture(),
    engine = new PuzzleEngine(ids);
  for (let cycle = 0; cycle < 20; cycle++) {
    f.ctl.begin(
      f.event(cycle + 1, { pointerType: 'touch' }),
      { id: 'DZA' },
      f.source,
    );
    engine.place('AGO', true);
    engine.preview = true;
    if (cycle % 2) f.ctl.lost(f.event(cycle + 1));
    f.ctl.cancel();
    engine.reset();
    f.ctl.cancel();
    assert.equal(f.ctl.active, null);
    assert.equal(f.preview, null);
    assert.equal(f.classes.size, 0);
    assert.equal(f.capture, null);
    assert.equal(engine.placed.size, 0);
    assert.equal(engine.preview, false);
    assert.equal(f.ctl.finish(f.event(cycle + 1, { clientX: 200 })), false);
  }
});
test('200 repeated mouse/touch drags leave no temporary state', () => {
  const f = fixture();
  for (let i = 0; i < 200; i++) {
    const e = f.event(i + 1, { pointerType: i % 2 ? 'touch' : 'mouse' });
    assert.ok(f.ctl.begin(e, { id: ids[i % 54] }, f.source));
    f.ctl.move({ ...e, clientX: 50 });
    f.ctl.finish({ ...e, clientX: 60 });
    assert.equal(f.preview, null);
    assert.equal(f.classes.size, 0);
    assert.equal(f.capture, null);
  }
  assert.equal(f.drops.length, 200);
  assert.equal(
    f.drops.some((d) => d[3]),
    false,
  );
});
test('stationary taps are distinguished from drops', () => {
  const f = fixture();
  f.ctl.begin(f.event(), { id: 'DZA' }, f.source);
  f.ctl.finish(f.event());
  assert.equal(f.drops[0][3], true);
});
test('capture failure and reentrant lostcapture cannot strand state or double-drop', () => {
  const f = fixture();
  f.source.setPointerCapture = () => {
    throw Error('capture unavailable');
  };
  assert.equal(f.ctl.begin(f.event(), {}, f.source), false);
  assert.equal(f.preview, null);
  assert.equal(f.classes.size, 0);
  const g = fixture();
  g.source.releasePointerCapture = (id) => g.ctl.lost(g.event(id));
  g.ctl.begin(g.event(), {}, g.source);
  g.ctl.finish(g.event(1, { clientX: 80 }));
  assert.equal(g.drops.length, 1);
  assert.equal(g.preview, null);
});
test('unowned nonprimary pointers and right clicks are ignored', () => {
  const f = fixture();
  assert.equal(
    f.ctl.begin(f.event(1, { isPrimary: false }), {}, f.source),
    false,
  );
  assert.equal(f.ctl.begin(f.event(1, { button: 2 }), {}, f.source), false);
  assert.equal(f.preview, null);
});
