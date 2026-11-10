import test from "node:test";
import assert from "node:assert/strict";
import {
  uploadFiles,
  validateFiles,
} from "../../client/src/admin/components/mediaUploadQueue.js";

test("upload queue accepts twenty files and rejects twenty-one before upload", async () => {
  const files = Array.from({ length: 20 }, (_, i) => ({
    name: `photo-${i}.png`,
  }));
  let inFlight = 0,
    peak = 0;
  const results = await uploadFiles(files, async (file, progress) => {
    peak = Math.max(peak, ++inFlight);
    await Promise.resolve();
    progress(50);
    inFlight--;
    return { _id: file.name };
  });
  assert.equal(results.length, 20);
  assert.equal(peak, 1);
  assert.ok(results.every((r) => r.item));
  let called = false;
  await assert.rejects(
    uploadFiles([...files, files[0]], () => {
      called = true;
    }),
    /maximum of 20/,
  );
  assert.equal(called, false);
  assert.match(validateFiles([]), /at least one/);
});

test("partial upload failure continues and supports retrying failures only", async () => {
  const files = [
    { name: "ok.png" },
    { name: "bad.png" },
    { name: "later.png" },
  ];
  const out = await uploadFiles(files, async (file) => {
    if (file.name === "bad.png") throw new Error("Invalid file bytes");
    return { _id: file.name };
  });
  assert.deepEqual(
    out.filter((r) => r.item).map((r) => r.file.name),
    ["ok.png", "later.png"],
  );
  const failures = out.filter((r) => r.error);
  assert.equal(failures[0].error, "Invalid file bytes");
  const retried = [];
  await uploadFiles(
    failures.map((r) => r.file),
    async (file) => {
      retried.push(file.name);
      return {};
    },
  );
  assert.deepEqual(retried, ["bad.png"]);
});
