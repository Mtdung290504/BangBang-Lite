# BB-Lite Skill DSL — System Reference (v3)

> **Dành cho AI/Agent và Developer.** Đọc hết file này là đủ để hiểu và mở rộng hệ thống.
> Nguồn sự thật: các file type trong `dsl/` và canonical examples (falcon, gia-cat-luong, kirito, magneto).
> **Các file cũ trong `.examples/`** ([basic.ts](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/.examples/basic.ts), [e-chop.ts](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/.examples/e-chop.ts), [nor-atk-star.ts](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/.examples/nor-atk-star.ts), [passive-cheat-death.ts](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/.examples/passive-cheat-death.ts),
> [tsubasa-skill.ts](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/.examples/tsubasa-skill.ts)) là bản **lỗi thời**, không reflect API hiện tại — bỏ qua.

---

## 1. Triết lý thiết kế

**"Type gọn, khai báo dài."**

- Mỗi type mới = engine thêm 1 code path, thêm bug, thêm maintain. Chi phí là **vĩnh viễn**.
- Khai báo dài = xử lý bằng JS (template function, map). Chi phí là **1 lần**.
- Toàn bộ DSL chỉ có **2 primitive**: **Impactor** và **Effect**. Mọi mechanic quy về hai thứ này.
- Hệ thống **khai báo tĩnh** (static declaration) + **function resolver** cho logic động. Không có runtime state trong file DSL.
- Skill **trải phẳng hoàn toàn** — không gắn vào instance tank — để tái sử dụng và tránh bug copy-skill.

---

## 2. Hai Primitive: Impactor và Effect

### 2.1 Impactor (`@create-entity`)

Vật thể va chạm. Mọi thứ trong game là một impactor với config khác nhau:

| Loại         | `duration`                    | `limit-range`           | `impact-capacity`                  | `interval`   | Ghi chú                                             |
| ------------ | ----------------------------- | ----------------------- | ---------------------------------- | ------------ | --------------------------------------------------- |
| Đạn thường   | _(không khai báo)_ = Infinity | kế thừa 100% tầm tank   | 1 (default)                        | _(không có)_ | Bị xóa khi hết range OR hết capacity                |
| Đạn xuyên    | Infinity                      | có                      | > 1 hoặc `'all'`                   | _(không có)_ | Bay xuyên N mục tiêu rồi mới vỡ                     |
| Area damage  | N giây                        | _(không khai báo)_      | Infinity                           | có           | Tồn tại N giây, hit theo interval                   |
| Laser / Aura | N giây                        | _(không có)_            | Infinity                           | _(liên tục)_ | `impact-capacity: Infinity` = không bao giờ "đầy"   |
| Sensor       | `frame-time`                  | _(không có)_            | Infinity                           | nhỏ          | No visual, dùng để query game state qua collision   |
| Dash         | Infinity                      | _(caster làm giới hạn)_ | Infinity (`pierce-targets: 'all'`) | _(không có)_ | `drag-targets: true` + `affected-faction: ['self']` |

**Lifecycle của Impactor** (thứ tự bắt buộc):

1. **Collider chết** — hết `impact-capacity` hoặc hết `duration`. Logic (collision, movement) tắt ngay.
2. **Sprite hoàn thành** — nếu `visual.on-parent-death: 'wait-finish'`, animation chạy hết rồi entity mới xóa.

**Dash pattern** được nhận diện tự động bởi engine khi impactor có `drag-targets: true` + `affected-faction: ['self']`:

- Engine auto-link impactor với caster.
- Khi caster bị CC ngăn chuyển động (stun/root), impactor loại này bị destroy ngay lập tức.

### 2.2 Effect (`@apply:effect`)

Component gắn vào entity, tồn tại theo duration, có thể stack. Không chỉ là buff/debuff — là **bất kỳ trạng thái nào** cần tồn tại theo thời gian.

---

## 3. Cấu trúc [DefineSkill](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/manifest.types.ts#9-13)

```ts
type DefineSkill = {
	effects?: Record<string, EffectManifest>;
	manifest: Record<string, SkillEntry>;
};
```

- `manifest`: flat record, key là tên slot (`'normal-attack'`, `'s1'`, `'s2'`, `'ultimate'`, hoặc custom string).
- `effects`: flat record, key là ID effect được tham chiếu trong actions.
- Không có nesting — mọi thứ ở cùng level.

---

## 4. [SkillEntry](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/active.type-entities.ts#53-54) — Phase System

```ts
type SkillEntry = SkillPhaseEntry | SkillPhaseEntry[];
```

- **Single phase** (phổ biến): khai báo object đơn.
- **Multi-phase**: mảng — index trong mảng = số phase. Engine track phase hiện tại per-slot.

```ts
interface SkillPhaseEntry {
	triggers?: TriggerEvent[]; // Nguồn kích hoạt
	cooldown?: number; // Giây. Mặc định: 0
	conditions?: ConditionPredicate; // Nếu false → không fire dù đúng trigger
	actions: EffectAction | EffectAction[];
	'casting-method'?: CastingMethod; // UI indicator only, không ảnh hưởng logic
	visual?: { sprite?: { key: string } }; // Icon trên HUD
	description?: string;
}
```

### Trigger

```ts
type TriggerEvent = `on-key:${'s1' | 's2' | 'ultimate' | 'normal-attack' | 'sp'}` | 'on-ready';
```

- `'on-ready'` = auto-trigger khi cooldown về 0 → **passive pattern**.
- Slot tên tự do (VD `'innate-recharge'`) cũng hợp lệ vì `SkillSlot = 's1' | 's2' | ... | (string & {})`.
- Một skill slot có thể có nhiều triggers: `triggers: ['on-key:s1', 'on-key:s2']` (multi-key binding).

### Phase Management

```ts
// Chuyển sang phase N
{ action: '@do-act:change-phase', slot: 'normal-attack', phase: 1 }

// Reset về default
{ action: '@do-act:change-phase', slot: 'normal-attack', phase: 0 }
```

Phase ảnh hưởng icon + CD bar trên HUD. Conditions trong mỗi phase entry quyết định phase nào được fire.

---

## 5. [ImpactHandle](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/.types.ts#12-28) — Phân phối effect khi trúng đòn

```ts
type ImpactHandle = {
	'affected-faction'?: Faction[]; // Mặc định: ['enemy', 'tower']
	'target-effect'?: EffectAction | EffectAction[]; // Effect lên entity trúng đòn
	'caster-effect'?: EffectAction | EffectAction[]; // Effect/action lên caster
	'fly-object-effect'?: 'destroy'; // Huỷ đạn bay khi trúng
	actions?: SkillCastAction | SkillCastAction[]; // Action tạo impactor mới / change-phase
};

type ImpactAction = { 'affected-faction'?: Faction[] } & ImpactHandle;
```

**Lưu ý quan trọng:**

- `target-effect`: áp effect lên **entity trúng đòn** (faction filter áp dụng).
- `caster-effect`: áp effect/action lên **caster**.
- `actions`: dành riêng cho [SkillCastAction](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/.types.ts#5-6) = `CreateImpactor | ChangePhase`.
- **`impact.manifest`** có thể là mảng `ImpactAction[]` để apply nhiều nhóm effect khác nhau lên các faction khác nhau trong cùng 1 collision.

```ts
// Ví dụ: hit enemy → damage; hit self → buff
impact: {
	manifest: [
		{ 'affected-faction': ['enemy'], 'target-effect': { action: '@apply:effect', effect: 'damage' } },
		{ 'affected-faction': ['self'], 'caster-effect': { action: '@apply:effect', effect: 'buff' } },
	];
}
```

**Faction:**

```ts
type Faction = 'ally' | 'enemy' | 'self' | 'tower';
```

---

## 6. Effect System

### [EffectManifest](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.types.ts#7-58)

```ts
interface EffectManifest {
	duration?: number; // giây. Infinity = vĩnh viễn. Mặc định: 0 (instant)
	unremovable?: true; // Chỉ chống dispel by-tag. Hết duration / clean by-id vẫn bị xóa.
	interval?: number; // Trigger on-interval theo N giây
	shield?: ValueResolver; // HP khiên bind với effect. Khi value = 0 → effect bị xóa tự động.
	name?: string; // Label nhận dạng / hiển thị
	description?: string;
	visual?: VisualManifest;
	impacts: EffectImpactManifest | EffectImpactManifest[]; // Mảng = stack levels
}
```

**Shield mechanism:** `shield` là numeric value bind với lifecycle của effect. Engine track giá trị này. Khi giảm về 0, engine tự clean effect. Nếu muốn buff tồn tại sau khi khiên vỡ, tạo 2 effect riêng.

**Stack system:** `impacts` là mảng — `impacts[N]` là config của stack thứ N+1. Max stack = `impacts.length`. Khi apply thêm stack vượt max, giữ ở max.

```ts
// Stack 1-4 damage tăng dần
impacts: [1, 2, 3, 4].map((stack) => ({
	'on-start': {
		action: '@apply:modifier',
		attribute: 'current-HP',
		value: (ctx) => -ctx.caster['attack-power'] * (0.5 + stack * 0.25),
	},
}));
```

### [EffectImpactManifest](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.types.ts#66-121) — 4 tầng

| Tầng | Field                                 | Bản chất                                             |
| ---- | ------------------------------------- | ---------------------------------------------------- |
| ①    | `modify-stats`                        | Buff/debuff stat liên tục suốt duration              |
| ②    | `modify-states`                       | Toggle CC/state on/off (root, silent, invincible...) |
| ③    | `on-start` / `on-interval` / `on-end` | Action tức thì tại thời điểm tương ứng               |
| ④    | `on-event`                            | Lắng nghe TankEvent, fire action khi event xảy ra    |

**`on-end` fire cho cả 2 case**: hết duration tự nhiên VÀ bị dispel (clean-effect).

---

## 7. Action Types ([EffectAction](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.type-entities.ts#157-170))

Tất cả action dùng được trong `actions`, `on-start`, `on-interval`, `on-end`, `on-event`, `target-effect`, `caster-effect`:

| Action                    | Type                                                                                                                                     | Mô tả                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `@create-entity`          | [CreateImpactor](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/create-attack.type-entities.ts#26-32)       | Tạo impactor mới                             |
| `@apply:effect`           | [ApplyEffect](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.type-entities.ts#172-175)         | Áp effect theo ID                            |
| `@apply:modifier`         | [ApplyModifier](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.type-entities.ts#76-83)         | Điều chỉnh stat tức thì (damage, heal, cost) |
| `@apply:modify-countdown` | [ModifyCountdown](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.type-entities.ts#101-108)     | Sửa CD của skill slot                        |
| `@apply:clean-effect`     | [CleanEffect](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.type-entities.ts#113-116)         | Xóa effect theo tag hoặc ID                  |
| `@apply:knockback`        | [ApplyKnockback](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.type-entities.ts#130-133)      | Đẩy lui (vector từ điểm va chạm)             |
| `@apply:radial-push`      | [ApplyRadialPush](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.type-entities.ts#140-143)     | Đẩy hướng tâm (+ = hút vào, - = đẩy ra)      |
| `@apply:modify-stack`     | [ModifyStack](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.type-entities.ts#149-153)         | Tăng/giảm stack của 1 effect cụ thể          |
| `@do-act:change-phase`    | [ChangePhase](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.type-entities.ts#87-99)           | Chuyển phase của skill slot                  |
| `@do-act:wait`            | [WaitAction](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.type-entities.ts#118-122)          | Dừng chuỗi action (sequential)               |
| `@do-act:modify-charge`   | [ModifyChargeAction](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.type-entities.ts#124-128)  | Bắt đầu/kết thúc đếm thời gian gồng          |
| `@do-act:activate-skill`  | [ActivateSkillAction](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.type-entities.ts#145-148) | Gọi 1 skill khác theo tên                    |

> **⚠️ Known issue:** [ModifyStack](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.type-entities.ts#149-153) hiện thiếu field chỉ định tên effect cần modify. Cần bổ sung `effect: string`.

### Action sequencing

Mảng `actions` trong skill entry và trong effect hooks **chạy tuần tự**. `@do-act:wait` chặn chuỗi cho đến khi hết duration hoặc bị interrupt.

```ts
actions: [
    { action: '@apply:effect', effect: 'k-invisible-short' }, // Bước 1
    { action: '@do-act:wait', duration: 0.5 },                // Đợi 0.5s
    { action: '@create-entity', ... },                         // Bước 3, sau delay
]
```

### `@apply:modifier` — Damage/Heal

```ts
interface ApplyModifier {
	action: '@apply:modifier';
	attribute: CurrentStatKeys; // 'current-HP' | 'current-energy-point'
	value: ValueResolver; // Âm = damage/cost, Dương = heal/regen
	reductions?: ReductionFn | ReductionFn[]; // Không khai báo = true damage
}
```

Loại damage được xác định bởi reduction function — **không có `DamageType` enum**:

- [physicalDamageReduction](file:///c:/BigProject/BB-Lite/.types-system.new.v3/builder/templates/combat/reduction-policies.ts#16-23) → damage vật lý (giảm theo armor + penetration)
- [energyDamageReduction](file:///c:/BigProject/BB-Lite/.types-system.new.v3/builder/templates/combat/reduction-policies.ts#8-15) → damage năng lượng (giảm theo energy-shield + penetration)
- Không khai báo `reductions` → true damage

### `@apply:clean-effect`

```ts
interface CleanEffect {
	action: '@apply:clean-effect';
	filter: `tag:${'buff' | 'debuff' | 'immune' | 'slow' | 'CC' | 'all'}` | `id:${string}`;
}
```

Filter `id:xyz` xóa đúng effect đó (kể cả `unremovable`). Filter `tag:xyz` bị chặn bởi `unremovable`.

### `@apply:modify-countdown`

```ts
interface ModifyCountdown {
	action: '@apply:modify-countdown';
	slot: SkillSlot | SpSkillSlot | (SkillSlot | SpSkillSlot)[];
	value: ValueWithUnit; // '-100%' = reset CD (xong ngay), '+5u' = cộng thêm 5 giây
}
```

### `@apply:radial-push`

Điểm neo là source của impactor/event.

- `speed > 0`: hút vào tâm (engine auto-stop khi tới tâm, không vụt qua).
- `speed < 0`: đẩy văng ra xa.

### `@do-act:wait`

```ts
interface WaitAction {
	action: '@do-act:wait';
	duration: number;
	'on-interrupt'?: EffectAction | EffectAction[]; // Fire nếu chuỗi bị ngắt (CC, etc.)
}
```

---

## 8. States ([StateEntry](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.type-entities.ts#36-55))

Khai báo trong `modify-states` của [EffectImpactManifest](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.types.ts#66-121):

```ts
type StateEntry =
	| { type: 'silent'; slot: (SkillSlot | SpSkillSlot)[] | 'all' }
	| { type: 'root' }
	| { type: 'throw-up' } // Hất tung
	| { type: 'invincible' } // Bất tử
	| { type: 'untargetable' } // Không thể bị khóa mục tiêu
	| { type: 'invisible' } // Tàng hình
	| { type: 'unstealthable' } // Bị lộ tàng hình
	| { type: 'immune'; filter: `tag:${'slow' | 'CC' | 'all'}` | `id:${string}` }
	| { type: 'impact-immune'; filter?: 'all' | 'skill' | 'normal-attack' };
```

**Choáng (stun)** = `{ type: 'root' }` + `{ type: 'silent', slot: 'all' }` + giảm speed 100% qua `modify-stats`.

---

## 9. Context — [ValueResolveContext](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/runtime.types.ts#46-58)

```ts
interface ValueResolveContext {
	caster: EntitySnapshot; // LUÔN là tank đã kích hoạt skill — bất kể effect đang áp lên ai
	target: EntitySnapshot; // Entity nhận effect / trigger event (phụ thuộc context — xem bảng)
	'skill-hit-count': number; // Số hit mà skill parent đã đánh trúng
	getChargeTime(name: string): number; // Thời gian đã gồng (nếu có @do-act:modify-charge)
}

type EntitySnapshot = Readonly<RuntimeStats> & {
	effect(id: string): { stack?: number }; // Trả về {} nếu không có effect đó; stack luôn ≥ 1 nếu có
};
```

### `ctx.target` theo context

| Context                           | `ctx.target` là                 |
| --------------------------------- | ------------------------------- |
| `target-effect` (impact)          | Entity trúng đòn                |
| `caster-effect` (impact)          | Caster (= `ctx.caster`)         |
| `on-event: 'on-hit-taken'`        | Entity vừa đánh mình (attacker) |
| `on-event: 'on-hit-dealt-damage'` | Entity bị mình đánh             |
| `on-event: 'on-destroy'`          | Kẻ vừa bị giết                  |
| `on-event: 'on-destroyed'`        | Kẻ giết mình                    |
| `on-event: 'on-fatal-damage'`     | Entity gây fatal damage         |

### Check effect

```ts
// Check bản thân có effect không
conditions: (ctx) => !!ctx.caster.effect('s2-empower').stack;

// Check đối thủ có mark không (để conditional proc)
value: (ctx) => (ctx.target.effect('enemy-mark').stack ? ctx.caster['attack-power'] * 0.2 : 0);
```

### Zero-return trick — Conditional action không cần wrapper type

```ts
// Return 0 = no-op, engine không hiển thị số bay
value: (ctx) => (ctx.target.effect('mark').stack ? -ctx.caster['attack-power'] * 0.3 : 0);
```

---

## 10. TankEvent

```ts
type TankEvent =
	| 'on-hit-taken' // Receiver: bị trúng đòn, TRƯỚC khi damage áp
	| 'on-hit-taken-damage' // Receiver: bị trúng đòn VÀ đã chịu damage
	| 'on-hit-dealt-damage' // Attacker: gây damage thành công, SAU khi áp xong
	| 'on-fatal-damage' // Receiver: damage SẼ giết, TRƯỚC khi chết
	| 'on-destroy' // Attacker: giết được target
	| 'on-destroyed' // Victim: bị giết
	| 'on-energy-empty' // Tank: energy về 0
	| 'on-wall-collide' // Tank: body đập vào tường (khi bị knock/push)
	| 'on-out-combat' // Tank: không nhận damage trong 4s → thoát combat
	| 'on-join-combat'; // Tank: nhận damage đầu tiên sau thời gian out-combat
```

Khai báo trong `on-event` của [EffectImpactManifest](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.types.ts#66-121):

```ts
'on-event': {
    'on-hit-taken': [
        { action: '@apply:modifier', attribute: 'current-HP', value: (ctx) => ctx.caster['limit-HP'] * 0.1 },
    ],
    'on-destroy': { action: '@apply:effect', effect: 'kill-buff' },
}
```

---

## 11. Physic — Collider, Movement, Position

### Collider shapes

```ts
type ColliderDeclaration =
	| { type: 'rectangle'; size: { width: number; height: number } }
	| { type: 'circle'; size: { radius: number; 'arc-angle'?: number } } // arc-angle = hình quạt
	| { type: 'ring'; size: { 'inner-radius': number; 'outer-radius': number } };
```

Ring shape dùng cho aura bám theo người — entity trong inner-radius không bị hit.

### Collider properties

```ts
collider: {
    shape: ColliderDeclaration;
    'impact-capacity'?: number;     // Mặc định: 1. Infinity = laser/aura.
    'pierce-targets'?: PierceableTarget[] | 'all'; // Các faction đạn đi xuyên qua mà không kích hoạt impact
    'warm-up'?: number;             // Giây trước khi collider thực sự hoạt động
    'drag-targets'?: true;          // Kéo entity trúng đòn theo hướng impactor
}

type PierceableTarget = 'architecture' | 'self' | 'enemy' | 'ally' | 'non-tank';
```

**Lưu ý:** `pierce-targets` cho phép đi **xuyên** mà không trigger impact. Collide vẫn xảy ra (animation, v.v.) nhưng không consume capacity hay fire impact actions.

### Movement

```ts
type Movement = StraightMovement | TrackingMovement;

interface StraightMovement {
	'move-type': 'straight';
	speed?: ValueResolver; // Mặc định: flight-speed của caster
}
interface TrackingMovement {
	'move-type': 'tracking';
	speed?: ValueResolver;
}
```

- Không khai báo `movement` → đứng yên.
- `speed: () => Infinity` = teleport/blink tức thì.
- `speed: () => 0` = đứng yên (dùng khi chỉ cần collider tại 1 điểm cố định).

### Position (`from`)

```ts
type PositionDeclaration =
	| 'caster-pos' // Tâm tank caster
	| 'caster-head' // Đầu tank (tâm + bán kính + 3px theo hướng chuột)
	| 'target-pos' // Vị trí target (dùng trong on-event — attacker, entity vừa chết, v.v.)
	| 'parent-pos' // Vị trí impactor parent hoặc entity đang mang effect
	| 'mouse-pos'; // Vị trí con trỏ chuột
```

**`parent-pos`** trong context `on-end` của effect = **vị trí của entity đang mang effect** (entity bị affect), không phải caster.

### Strategy (targeting cho CreateImpactor)

```ts
// Bắn theo hướng chuột
strategy: { type: 'direction'; 'delta-angle'?: number | 'random' }

// Khóa mục tiêu
strategy: { type: 'targeting'; method?: 'active-lock' | 'nearest' | 'weakest' | 'self' | 'random'; 'limit-target'?: boolean }
```

---

## 12. Stat Keys

### Runtime stats available trong [ValueResolver](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/runtime.types.ts#71-72)

```ts
interface ShootingStats {
    'fire-rate': 60 | 90 | 120;   // Đạn/phút
    'fire-range': RangeEnum;
    'flight-speed': 15 | 17.5;
}

interface SurvivalStats {
    'limit-HP': number;
    'physical-armor': number;
    'energy-shield': number;
    'resistance'?: number;       // %
    'damage-reduction'?: number; // %
    'life-steal'?: number;       // %
}

interface AttackPowerStats {
    'attack-power': number;
    'penetration-unit': number;
    'penetration-percent': number;
    'crit-rate'?: number;        // %
    'crit-damage': 150 | 200;    // %
}

// Context stats (runtime only — không khai báo tĩnh trong tank manifest)
type CurrentStatKeys = 'current-HP' | 'current-energy-point';
type LostStatKeys = 'lost-HP' | 'lost-energy-point';

// Cộng thêm:
'movement-speed': 160 | 165 | 170 | 175 | 180;
'energy-point': 100 | 150 | 200;  // Max energy
```

**`modify-stats` target attribute:** `Exclude<TankStatValueKey, CurrentStatKeys | LostStatKeys>` — tức là chỉ buff/debuff các stat "gốc", không áp trực tiếp lên current/lost HP.

---

## 13. Damage Pipeline ([ReductionFn](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/runtime.types.ts#82-83))

```ts
type ReductionFn = (value: number, ctx: ValueResolveContext) => number;
```

Engine chạy pipeline: `rawValue → fn1 → fn2 → ... → finalValue`.

```ts
// Physical damage — giảm theo armor + penetration
export const physicalDamageReduction: ReductionFn = (v, ctx) => {
    const { pierceUnit, piercePercent } = getPierce(ctx, 'caster');
    const { armor, damageReduction } = getReduction(ctx, 'target');
    const def = armor * (1 - piercePercent / 100) - pierceUnit;
    return applyDamageReduction(applyDef(v, def), damageReduction);
};

// Energy damage — giảm theo energy-shield + penetration
export const energyDamageReduction: ReductionFn = ...

// True damage — không khai báo reductions
```

Designer dùng template từ `builder/templates/combat/`, không viết reduction function thô.

---

## 14. Visual

```ts
interface VisualManifest {
	sprite: { key: SpriteKey; 'display-size'?: { width: number; height: number } };
	rotate?: number; // Degrees
	'on-parent-death'?: 'vanish' | 'wait-finish'; // Mặc định: 'vanish'
	loop?: true;
}
```

- `'vanish'`: sprite biến mất cùng entity (đạn thường).
- `'wait-finish'`: entity tắt logic nhưng sprite chạy hết animation rồi mới xóa (laser, chém kiếm).

---

## 15. CastingMethod (UI Indicator only)

Khai báo trong `SkillPhaseEntry.casting-method`, **không ảnh hưởng logic game**, chỉ hiển thị indicator:

```ts
type CastingMethod =
	| { type: 'on-target'; 'limit-range'?: ValueResolver } // Khoá mục tiêu
	| { type: 'at-area'; 'limit-range'?: ValueResolver; display?: { size: number } }
	| { type: 'in-direction'; 'limit-range'?: ValueResolver; display?: { size: number } };
```

---

## 16. Patterns Quan Trọng

### Passive = `on-ready` trigger

```ts
'innate-listen': {
    triggers: ['on-ready'],
    cooldown: Infinity,  // Chỉ fire 1 lần lúc đầu game
    actions: { action: '@apply:effect', effect: 'passive-listener' },
},
```

Effect `passive-listener` dùng `on-event` để bắt TankEvent và fire actions.

### Sensor Entity (query game state)

```ts
// Đếm số địch trong vùng bằng sensor không có visual
{
    action: '@create-entity',
    from: 'caster-pos',
    collider: { shape: { type: 'circle', size: { radius: 300 } }, 'impact-capacity': Infinity },
    impact: {
        interval: 0.016,
        manifest: {
            'affected-faction': ['enemy'],
            'caster-effect': { action: '@apply:effect', effect: 'enemy-count-stack' },
        },
    },
}
```

### Paired Effect (Personal Proc)

Khi "chỉ tôi hưởng lợi từ mark tôi đặt lên địch":

```ts
// Đặt mark trên địch + listener trên bản thân
impact: {
    manifest: [
        { 'target-effect': { action: '@apply:effect', effect: 'enemy-mark' } },
        { 'caster-effect': { action: '@apply:effect', effect: 'mark-owner-listener' } },
    ],
}
// mark-owner-listener dùng on-event + zero-return trick
```

### Blink / Teleport

```ts
// Tạo impactor tại mouse-pos, hút caster vào với speed vô hạn
{
    action: '@create-entity',
    from: 'mouse-pos',
    duration: 0.032,
    movement: { 'move-type': 'straight', speed: () => 0 },
    collider: { shape: { type: 'circle', size: { radius: 99999 } } },
    impact: {
        manifest: {
            'affected-faction': ['self'],
            actions: { action: '@apply:radial-push', speed: () => 99999 },
        },
    },
}
```

### Dash + Lôi địch

```ts
{
    action: '@create-entity',
    from: 'caster-pos',
    strategy: { type: 'direction' },
    movement: { 'move-type': 'straight', speed: () => 800 },
    collider: {
        shape: { type: 'circle', size: { radius: 50 } },
        'pierce-targets': 'all',
        'drag-targets': true,  // Lôi theo bất cứ ai trúng
    },
    impact: {
        manifest: { 'affected-faction': ['self'], actions: [/* phase change, buff */] },
    },
}
```

### Delayed Impact (`warm-up`)

```ts
// Sét đánh sau 1.25s
collider: {
    shape: { type: 'circle', size: { radius: 250 } },
    'impact-capacity': Infinity,
    'warm-up': 1.25,  // Collider xuất hiện nhưng chờ 1.25s trước khi active
}
```

### On-Effect-End để Trigger Chain

```ts
'gcl-s2-wind-levitate': {
    duration: 1,
    impacts: {
        'modify-states': { type: 'root' },
        'on-end': [
            { action: '@apply:effect', effect: 'gcl-s2-wind-land-slow' },
            { action: '@apply:effect', effect: 'gcl-s2-wind-land-amp' },
        ],
    },
},
```

### Counter-Attack Pattern (`on-hit-taken` + `from: target-pos`)

```ts
'gcl-s2-cloud-shield': {
    impacts: {
        'modify-states': { type: 'impact-immune', filter: 'skill' },
        'on-event': {
            'on-hit-taken': [
                // ... self-heal
                {
                    action: '@create-entity',
                    from: 'target-pos', // target = attacker trong on-hit-taken
                    // ... impactor tại vị trí kẻ tấn công
                },
            ],
        },
    },
}
```

### Stack-Based Buff với Auto-Expire

```ts
// Tracker 5 đạn — khi bắn hết viên 5, stack 6 on-start tự clean
's2-attack-tracker': {
    duration: Infinity,
    impacts: [
        { visual: { sprite: { key: 's2-bullet:1' } } },
        { visual: { sprite: { key: 's2-bullet:2' } } },
        { visual: { sprite: { key: 's2-bullet:3' } } },
        { visual: { sprite: { key: 's2-bullet:4' } } },
        { visual: { sprite: { key: 's2-bullet:5' } } },
        {
            'on-start': [
                { action: '@do-act:change-phase', slot: 'normal-attack', phase: 0 },
                { action: '@apply:clean-effect', filter: 'id:s2-empower' },
                { action: '@apply:clean-effect', filter: 'id:s2-attack-tracker' },
            ],
        },
    ],
}
```

### Multi-Phase Skill Xoay Vòng (GCL pattern)

```ts
// S1: 3 phase xoay vòng Gió → Sét → Mây → Gió
// Mỗi phase action tự change-phase S1, S2, S3 đồng thời
// Trạng thái hệ active được track qua effect (gcl-phase-wind, etc.)
s1: [
	{
		actions: [
			{ action: '@apply:clean-effect', filter: 'id:gcl-phase-wind' },
			{ action: '@apply:effect', effect: 'gcl-phase-thunder' },
			{ action: '@do-act:change-phase', slot: 's1', phase: 1 },
			{ action: '@do-act:change-phase', slot: 's2', phase: 1 },
		],
	},
	// phase 1, 2...
];
```

---

## 17. Những thứ KHÔNG có trong DSL (có chủ ý)

| Không có                           | Lý do / Thay thế                                                          |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `ApplyShield` action               | Shield là `EffectManifest.shield`. Khi HP khiên = 0, engine clean effect. |
| `DamageType` enum                  | Thay bằng tên reduction function                                          |
| `ally-nearby`, `enemy-nearby` stat | Dùng sensor entity pattern                                                |
| Teleport / set-position action     | `speed: Infinity` trên impactor + `@apply:radial-push`                    |
| `on-effect-removed` riêng          | `on-end` fire cho cả hết duration lẫn dispel                              |
| Condition trong EffectAction       | Zero-return trick trong ValueResolver                                     |
| Lifesteal action                   | Stat `life-steal` xử lý trong engine                                      |
| Summon                             | Skill đặc thù, để sau                                                     |
| `on-attack-input` event            | Dùng `on-hit-dealt-damage` hoặc `on-start` trong normal-attack effect     |

---

## 18. Cấu trúc File

```
.types-system.new.v3/
├── requirement.md              ← Overview (một số section đã lỗi thời)
├── dsl/
│   ├── runtime.types.ts        ← ValueResolveContext, EntitySnapshot, ValueResolver, ReductionFn, ConditionPredicate
│   ├── .types.ts               ← ValueWithUnit, InheritDeclaration, TypedRecord, DeepPartial
│   ├── entity/
│   │   ├── skill/
│   │   │   ├── .enums.ts       ← SkillKeySlot, SkillSlot, SpSkillSlot
│   │   │   ├── active.type-entities.ts ← SkillPhaseEntry, SkillEntry, TriggerEvent
│   │   │   ├── manifest.types.ts       ← DefineSkill, EffectManifestRecord
│   │   │   ├── context/
│   │   │   │   ├── .types.ts           ← TankEvent
│   │   │   │   └── casting-methods.type-components.ts ← CastingMethod
│   │   │   └── actions/
│   │   │       ├── .enums.ts           ← ActionPrefix, LockMethod
│   │   │       ├── .type-components.ts ← ActionType, UseDirectionStrategy, UseTargetingStrategy
│   │   │       ├── .types.ts           ← SkillCastAction, ImpactAction, ImpactHandle
│   │   │       ├── apply-effect.type-entities.ts ← StatModifier, StateEntry, ApplyModifier, ChangePhase,
│   │   │       │                                   ModifyCountdown, CleanEffect, WaitAction, ModifyChargeAction,
│   │   │       │                                   ApplyKnockback, ApplyRadialPush, ActivateSkillAction,
│   │   │       │                                   ModifyStack, EffectAction, ApplyEffect
│   │   │       ├── apply-effect.types.ts ← EffectManifest, EffectImpactManifest
│   │   │       └── create-attack.type-entities.ts ← CreateImpactor
│   │   └── tank/
│   │       ├── .enums.ts       ← TankStatValueKey, CurrentStatKeys, LostStatKeys, FireRateEnum...
│   │       ├── .types.ts       ← ShootingStats, SurvivalStats, AttackPowerStats, AdditionalStats
│   │       └── .type-entities.ts ← TankManifest
│   ├── combat/
│   │   ├── .enums.ts           ← Faction
│   │   ├── state.type-components.ts ← LimitedDuration, Impactable
│   │   ├── visual.type-components.ts ← VisualManifest, Renderable
│   │   ├── visual.enums.ts     ← SpriteKey
│   │   ├── visual.types.ts     ← SpriteDeclaration
│   │   └── props.type-components.ts ← FlyingObjectProps (bounce, return)
│   └── physic/
│       ├── collider.enums.ts   ← PierceableTarget
│       ├── collider.type-conponents.ts ← Collidable
│       ├── collider.type.ts    ← Rectangle, Circle, Ring, ColliderDeclaration
│       ├── movement.enums.ts   ← SpeedInheritAttribute, MovementSpeedEnum, FlightSpeedEnum
│       ├── movement.type-components.ts ← Movable
│       ├── movement.types.ts   ← StraightMovement, TrackingMovement
│       ├── position.enums.ts   ← PositionDeclaration
│       ├── position.type-components.ts ← RequireInitPositionMethod
│       ├── range.enums.ts      ← RangeEnum
│       └── range.type-components.ts ← LimitedDistance
└── builder/templates/combat/
    ├── reduction-policies.ts   ← physicalDamageReduction, energyDamageReduction
    └── getters.ts              ← getPierce, getReduction

dsl/.examples/ (canonical — chỉ đọc 4 file này):
    falcon-skill.ts       ← CANONICAL: passive innate, multi-phase attack, dash, ult stack
    gia-cat-luong-skill.ts ← 3-element cycle, counter-attack, radial-push
    kirito-skill.ts       ← blink, wall-collide listener, wait-sequence, on-fatal-damage
    magneto-skill.ts      ← combo stack, levitate+land chain, random targeting, global AOE
```

---

## 19. Known Issues & Gaps

| Issue                                                                                                                                                                                                                                | File                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Mô tả                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ModifyStack](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.type-entities.ts#149-153) thiếu field [effect](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/runtime.types.ts#15-27) | [apply-effect.type-entities.ts](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/actions/apply-effect.type-entities.ts)                                                                                                                                                                                                                                                                                                                                                                              | Cần thêm `effect: string` để chỉ định effect nào modify stack                                                                                                                           |
| `StatModifier.value` chỉ nhận [ValueResolver](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/runtime.types.ts#71-72)                                                                                                         | same                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Không nhận string `'50%'` — phải dùng [() => 0.5 \* stat](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/physic/collider.type.ts#31-40). Các file cũ còn dùng string + `as any` |
| [TriggerEvent](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/active.type-entities.ts#6-7) không có custom string                                                                                               | [active.type-entities.ts](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/entity/skill/active.type-entities.ts)                                                                                                                                                                                                                                                                                                                                                                                                  | Innate custom-name slots cần [(string & {})](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/physic/collider.type.ts#31-40) trong union                                          |
| Examples cũ chưa updated                                                                                                                                                                                                             | [.examples/basic.ts](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/.examples/basic.ts), [e-chop.ts](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/.examples/e-chop.ts), [nor-atk-star.ts](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/.examples/nor-atk-star.ts), [passive-cheat-death.ts](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/.examples/passive-cheat-death.ts), [tsubasa-skill.ts](file:///c:/BigProject/BB-Lite/.types-system.new.v3/dsl/.examples/tsubasa-skill.ts) | Dùng API cũ: `ctx.self`, `type: 'normal'`, `self-pos`, generic DefineSkill. **Bỏ qua toàn bộ.**                                                                                         |
| [requirement.md](file:///c:/BigProject/BB-Lite/.types-system.new.v3/requirement.md) một số section lỗi thời                                                                                                                          | [requirement.md](file:///c:/BigProject/BB-Lite/.types-system.new.v3/requirement.md)                                                                                                                                                                                                                                                                                                                                                                                                                                     | §6 dùng `ctx.self` (đúng là `ctx.caster`); §8 dùng `self-action` (đúng là `caster-effect` / `actions`); §11 shield mô tả sai                                                            |
