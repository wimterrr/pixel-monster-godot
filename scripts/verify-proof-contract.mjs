import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.cwd());

const requiredFiles = [
  "project.godot",
  "README.md",
  "scenes/Route01.tscn",
  "scenes/Battle.tscn",
  "scripts/route01.gd",
  "scripts/save_anchor.gd",
  "scripts/battle.gd",
  "scripts/save_anchor_contract.md",
  "scripts/proof_contract.json",
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function sha256(contents) {
  return crypto.createHash("sha256").update(contents).digest("hex");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const relativePath of requiredFiles) {
  assert(fs.existsSync(path.join(root, relativePath)), `Missing required file: ${relativePath}`);
}

const project = read("project.godot");
assert(
  project.includes('run/main_scene="res://scenes/Route01.tscn"'),
  "project.godot must keep Route01 as the main scene",
);

const routeScene = read("scenes/Route01.tscn");
assert(routeScene.includes('script = ExtResource("1_route")'), "Route01 must attach route01.gd");
assert(routeScene.includes('[node name="SaveAnchor" type="Node" parent="."]'), "Route01 must expose SaveAnchor");
assert(routeScene.includes('[node name="BattleEntry" type="Marker2D" parent="."]'), "Route01 must expose BattleEntry");

const battleScene = read("scenes/Battle.tscn");
assert(battleScene.includes('script = ExtResource("1_battle")'), "Battle must attach battle.gd");
assert(battleScene.includes('[node name="EnemySpawn" type="Marker2D" parent="."]'), "Battle must expose EnemySpawn");

const routeScript = read("scripts/route01.gd");
const saveAnchor = read("scripts/save_anchor.gd");
const battleScript = read("scripts/battle.gd");
const saveAnchorContract = read("scripts/save_anchor_contract.md");
for (const field of ["checkpoint_id", "roster_delta", "spent_items"]) {
  assert(saveAnchor.includes(`"${field}"`), `save_anchor.gd must freeze ${field}`);
  assert(saveAnchorContract.includes(`\`${field}\``), `save_anchor_contract.md must mention ${field}`);
}

const proof = JSON.parse(read("scripts/proof_contract.json"));
assert(proof.route_scene === "res://scenes/Route01.tscn", "proof contract route_scene mismatch");
assert(proof.battle_scene === "res://scenes/Battle.tscn", "proof contract battle_scene mismatch");
assert(proof.battle_receipt?.id === "first_capture_battle", "proof contract battle receipt id mismatch");
assert(Array.isArray(proof.battle_receipt?.enemy_party) && proof.battle_receipt.enemy_party.length === 1, "proof contract must freeze one enemy party");
assert(proof.battle_receipt.enemy_party[0]?.capture_target === true, "proof contract enemy must be capture target");
assert(proof.save_receipt?.checkpoint_id === "route01_after_first_capture", "proof contract checkpoint mismatch");
assert(Array.isArray(proof.save_receipt?.spent_items) && proof.save_receipt.spent_items.length === 1, "proof contract must freeze one spent item receipt");
assert(Array.isArray(proof.save_receipt?.roster_delta?.captured_species) && proof.save_receipt.roster_delta.captured_species[0] === "Mossbit", "proof contract must freeze the captured species");

const routeBattleEntryMatch = routeScene.match(/\[node name="BattleEntry" type="Marker2D" parent="\."\]\s+position = Vector2\(([^,]+), ([^)]+)\)/m);
assert(routeBattleEntryMatch, "Route01 BattleEntry position is missing");

const battleEnemySpawnMatch = battleScene.match(/\[node name="EnemySpawn" type="Marker2D" parent="\."\]\s+position = Vector2\(([^,]+), ([^)]+)\)/m);
assert(battleEnemySpawnMatch, "Battle EnemySpawn position is missing");

const receipt = {
  generated_at: new Date().toISOString(),
  proof: "route01-first-capture-contract",
  workspace: {
    project_file: {
      path: "project.godot",
      sha256: sha256(project),
    },
    README: {
      path: "README.md",
      sha256: sha256(read("README.md")),
    },
  },
  route_scene: {
    path: "scenes/Route01.tscn",
    sha256: sha256(routeScene),
    nodes: ["Route01", "SaveAnchor", "BattleEntry"],
    battle_entry_position: {
      x: Number(routeBattleEntryMatch[1]),
      y: Number(routeBattleEntryMatch[2]),
    },
  },
  battle_scene: {
    path: "scenes/Battle.tscn",
    sha256: sha256(battleScene),
    nodes: ["Battle", "EnemySpawn"],
    enemy_spawn_position: {
      x: Number(battleEnemySpawnMatch[1]),
      y: Number(battleEnemySpawnMatch[2]),
    },
  },
  save_anchor_contract: {
    path: "scripts/save_anchor.gd",
    sha256: sha256(saveAnchor),
    required_fields: ["checkpoint_id", "roster_delta", "spent_items"],
    contract_note: {
      path: "scripts/save_anchor_contract.md",
      sha256: sha256(saveAnchorContract),
    },
  },
  runtime_scripts: [
    {
      path: "scripts/route01.gd",
      sha256: sha256(routeScript),
    },
    {
      path: "scripts/battle.gd",
      sha256: sha256(battleScript),
    },
  ],
  proof_contract: {
    path: "scripts/proof_contract.json",
    sha256: sha256(JSON.stringify(proof)),
    battle_receipt_id: proof.battle_receipt.id,
    checkpoint_id: proof.save_receipt.checkpoint_id,
    captured_species: proof.save_receipt.roster_delta.captured_species,
    spent_items: proof.save_receipt.spent_items,
  },
};

const outputsDir = path.join(root, "outputs");
fs.mkdirSync(outputsDir, { recursive: true });
fs.writeFileSync(
  path.join(outputsDir, "latest-proof-receipt.json"),
  `${JSON.stringify(receipt, null, 2)}\n`,
);

console.log("proof-contract: ok");
