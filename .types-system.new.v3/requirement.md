# BB-Lite Skill DSL — System Requirement

> Tài liệu này mô tả đầy đủ thiết kế, triết lý, và cơ chế của hệ thống DSL khai báo skill cho BB-Lite.
> AI hoặc developer đọc file này sẽ không cần giải thích thêm để hiểu và mở rộng hệ thống.

---

## 1. Triết lý thiết kế

**"Type gọn, khai báo dài."**

- Mỗi type mới thêm = engine thêm 1 code path, thêm bug, thêm maintain. Chi phí là vĩnh viễn.
- Khai báo dài = xử lý bằng JS (template function, spread, map). Chi phí là 1 lần, có thể tái sử dụng.
- Toàn bộ DSL chỉ có **2 primitive**: **Impactor** và **Effect**. Mọi mechanic phức tạp đều quy về hai thứ này.
- Đây là hệ thống khai báo **tĩnh** (static declaration) với **function resolver** cho logic động. Không có runtime state nào trong file DSL — chỉ có ngữ cảnh và hành vi.
- Skill phải **trải phẳng hoàn toàn** — không gắn vào instance tank, vì 2 lý do: tái sử dụng bộ skill và tránh bug khi copy skill (e.g. cơ chế sao chép skill). Instance tank chỉ giữ string key.

---

## 2. Hai Primitive: Impactor và Effect

### Impactor (`@create-entity`)

Là vật thể va chạm (đạn, vùng, aura, sensor...). Mọi thứ trong game về bản chất là một cục va chạm:

| Loại | `duration` | `limit-range` | `impact-capacity` | `interval` | Ghi chú |
|---|---|---|---|---|---|
| Đạn thường | *(không khai báo)* = Infinity | `100%` (kế thừa tầm tank) | 1 (default) | *(không có)* | Bị xóa khi: hết `limit-range` HOẶC hết `impact-capacity` |
| Đạn xuyên | Infinity | có | > 1 hoặc `pierce-targets` | *(không có)* | Bay xuyên N mục tiêu rồi mới vỡ |
| Area damage | `N` giây | *(không khai báo)* | Infinity | có | Tồn tại N giây, hit interval tick |
| Laser / Aura | `N` giây | *(không khai báo)* | Infinity | *(liên tục)* | `impact-capacity: Infinity` = không bao giờ "đầy" |
| Sensor | `frame-time` hoặc ngắn | *(không khai báo)* | Infinity | nhỏ | Không có visual, dùng để query state |
| Dash | Infinity | *(caster làm giới hạn)* | Infinity (`pierce-targets: all`) | *(không có)* | `drag-targets: true` + `affected-faction: self` |

**Phân biệt đạn thường và area damage:**

- **Đạn thường**: `duration` không khai báo → Infinity. Engine xóa khi **một trong hai**: hết `limit-range` bay được, hoặc `impact-capacity` cạn kiệt. Mỗi target trúng tốn 1 capacity.
- **Area damage**: `duration = N`. Engine xóa khi hết thời gian. Collider luôn active trong suốt `duration`. `interval` quy định bao lâu reset danh sách "đã trúng" — sau mỗi interval, tất cả target trong vùng lại eligible bị hit. Tương đương: hit → lưu target vào blacklist → hết interval → xóa blacklist → hit lại.

> **[Engine Note — Impactor Lifecycle]**
> Impactor bị xóa phải qua 2 điều kiện theo thứ tự:
> 1. **Collider chết** (hết capacity hoặc hết duration)
> 2. **Sprite hoàn thành** (nếu `visual.on-parent-death: 'wait-finish'`, chờ animation xong)
>
> Logic (collision, movement) tắt ngay ở bước 1. Visual tiếp tục ở bước 2 nếu được cấu hình.


Impactor **không phân biệt** projectile / area-effect / sensor ở tầng type — chỉ khác nhau ở config collider và movement.

> **[Engine Note — Implicit Caster-Linked Behavior]**
> Impactor có `drag-targets: true` + `affected-faction: ['self']` được xem là **dash gắn với caster**.
> Engine tự nhận diện combo này — không cần khai báo thêm field nào trong DSL.
> Hành vi: khi caster bị CC làm dừng chuyển động (stun/root), engine tự destroy impactor loại này ngay lập tức.
> Đây là hành vi hiển nhiên theo vật lý: caster dừng → lực kéo mất → không có lý do để impactor tiếp tục tồn tại độc lập.

### Effect (`@apply:effect`)

Là component gắn vào entity, tồn tại theo thời gian, có thể stack. Không phải chỉ "buff/debuff" mà là **bất kỳ trạng thái nào** cần tồn tại theo duration.

---

## 3. Cấu trúc Skill Manifest

```
DefineSkill {
    manifest: Record<string, SkillEntry>   // flat, không lồng nhau
    effects?: Record<string, EffectManifest>
}
```

### SkillEntry — Array-Based Phases

Mỗi skill slot là `SkillPhaseEntry | SkillPhaseEntry[]`:

- **Index trong array = số phase**. Engine track phase hiện tại per-slot.
- Engine chọn phase entry theo index, rồi check `conditions` của entry đó để quyết định có fire không.
- Mục đích array: icon + cooldown bar trên HUD thay đổi theo phase — hoàn toàn tách biệt khỏi effect visual.

```ts
'normal-attack': [
    // phase 0 — default
    { icon: 'normal-attack', conditions: ctx => !ctx.self.hasEffect('s2-empower'), actions: [...] },
    // phase 1 — cường hóa
    { icon: 'normal-attack-s2', conditions: ctx => ctx.self.hasEffect('s2-empower'), actions: [...] },
]
```

Skill 1 phase (phổ biến) = khai báo object đơn, không cần array.

### Trigger

```ts
triggers?: ('on-key:s1' | 'on-key:s2' | 'on-key:ultimate' | 'on-key:normal-attack' | 'on-ready' | string & {})[]
```

`on-ready` = auto-trigger khi cooldown xong (passive pattern). Các skill nội tại đặt tên tự do (VD: `'innate-recharge'`).

---

## 4. Effect System

### EffectManifest

```
EffectManifest {
    duration?: number          // Infinity = vĩnh viễn
    unremovable?: true         // Chỉ chống bị dispel by-tag; hết duration / clean by-id vẫn xóa được
    stack-timeline-policy?     // reset-duration (mặc định) | keep-duration
    interval?: number          // trigger on-interval theo interval giây
    impacts: EffectImpactManifest | EffectImpactManifest[]  // mảng = stack levels
}
```

### EffectImpactManifest — 4 tầng

| Tầng | Field | Bản chất |
|---|---|---|
| ① | `modify-stats` | Buff/debuff stat liên tục suốt duration |
| ② | `modify-states` | Toggle CC/state on/off (root, silent, invincible, immune...) |
| ③ | `on-start / on-interval / on-end` | Hành động tức thì tại thời điểm tương ứng |
| ④ | `on-event` | Lắng nghe TankEvent, fire action khi event xảy ra |

### Stack bằng mảng `impacts`

```ts
// Stack 1-4 với buff tăng dần
impacts: [1, 2, 3, 4].map(stack => ({
    'modify-stats': { attribute: 'fire-rate', value: `${10 * stack}%` }
}))
```

Index mảng = stack level. Engine theo dõi stack hiện tại, apply `impacts[currentStack]`.

### Passive skill = SkillEntry với `on-ready` trigger

Passive không còn là type riêng. Flow:
```
CD xong → auto-trigger → @apply:effect listener → effect.on-event bắt TankEvent → fire actions → có thể reset CD
```

---

## 5. Damage và Reduction Pipeline

**Không có DamageType enum.** Damage type được quy định bằng **tên của reduction function**:

```ts
// Damage vật lý — dùng physicalDamageReduction template
{ action: '@apply:modifier', attribute: 'current-HP',
  value: ctx => -ctx.self['attack-power'], reductions: physicalDamageReduction }

// True damage — không khai báo reductions
{ action: '@apply:modifier', attribute: 'current-HP',
  value: ctx => -ctx.target['lost-HP'] * 0.5 }
```

`ReductionFn = (value, ctx) => number` — pipeline chain: raw → fn1 → fn2 → final.

Designer không viết reduction function thô — dùng template từ `builder/templates/combat/`.

---

## 6. Context Convention

```ts
type EntitySnapshot = Readonly<RuntimeStats> & {
    hasEffect(id: string): boolean;
};

interface ValueResolveContext {
    self: EntitySnapshot;    // LUÔN là caster — tank kích hoạt skill
    target: EntitySnapshot;  // Entity nhận effect (phụ thuộc context, xem bên dưới)
    getChargeTime(name: string): number;
}
```

### `target` theo context:

| Context | `ctx.target` là |
|---|---|
| `target-effect` (impact) | Entity trúng đòn |
| `self-action` (impact) | Caster (= self) |
| `on-hit-taken` (event) | Entity vừa đánh mình (attacker) |
| `on-hit-dealt-damage` (event) | Entity bị mình đánh |
| `on-destroy` / `on-destroyed` | Kẻ chết / caster |

`ctx.self.hasEffect('id')` — check caster đang mang effect gì (dùng trong `conditions`).
`ctx.target.hasEffect('id')` — check entity bên kia (dùng cho conditional proc, zero-return pattern).

### Zero-return trick (conditional action không cần wrapper type)

```ts
'on-hit-dealt-damage': {
    action: '@apply:modifier', attribute: 'current-HP',
    value: ctx => ctx.target.hasEffect('enemy-mark') ? ctx.self['attack-power'] * 0.2 : 0
    // Return 0 = no-op, engine không hiển thị số bay
}
```

---

## 7. TankEvent

```ts
type TankEvent =
    | 'on-hit-taken'           // Receiver: trước khi damage áp
    | 'on-hit-taken-damage'    // Receiver: sau khi chịu damage
    | 'on-hit-dealt-damage'    // Attacker: sau khi damage áp thành công (kể cả bị shield)
    | 'on-fatal-damage'        // Receiver: damage sẽ giết, trước khi chết
    | 'on-destroy'             // Attacker: giết được target
    | 'on-destroyed'           // Victim: bị giết
    | 'on-energy-empty'        // Tank: energy về 0
    | 'on-wall-collide'        // Tank: body đập vào tường (khi bị knock)
```

---

## 8. ImpactAction — Phân phối effect

```ts
ImpactAction = {
    'affected-faction'?: Faction[]       // Mặc định: ['enemy', 'tower']
    'target-effect'?: ApplyEffect[]      // Áp effect lên entity trúng đòn
    'self-action'?: SkillCastAction[]    // Action lên caster (tạo impactor, đổi phase...)
}
```

`SkillCastAction = CreateImpactor | ChangePhase`

Trong `on-event`, `@create-entity` hướng về `target` context (attacker, kẻ bị giết...) bằng cách dùng `from: 'target-pos'` hoặc `strategy: { type: 'targeting', method: 'self' }`.

---

## 9. Phase Management

```ts
// Đổi phase của skill slot
{ action: '@do-act:change-phase', slot: 'normal-attack', phase: 1 }

// Reset về default
{ action: '@do-act:change-phase', slot: 'normal-attack', phase: 0 }
```

`slot` nhận `SkillSlot | SpSkillSlot | (string & {})` — các slot chuẩn có autocomplete, custom name vẫn hợp lệ.

```ts
// Sửa cooldown
{ action: '@apply:modify-countdown', slot: 'innate-recharge', value: '-100%' }
{ action: '@apply:modify-countdown', slot: ['s1', 's2'], value: '-100%' }
```

---

## 10. Các Pattern Quan Trọng

### Sensor Entity

Impactor không có visual, không có movement, `impact.interval` nhỏ → dùng như "query engine" đọc game state qua collision:

```ts
// Đếm số địch trong vùng
{ action: '@create-entity', from: 'self-pos',
  collider: { shape: { type: 'circle', size: { radius: 300 } } },
  impact: { interval: 0.016, actions: { 'affected-faction': ['enemy'],
    'self-action': { action: '@apply:effect', effect: 'enemy-count-stack' } } } }
```

### Paired Effect (Personal Proc Mechanic)

Khi muốn "chỉ tôi hưởng lợi từ mark tôi đặt lên địch", dùng 2 effect cùng lúc:

```ts
impact.actions: [
    { 'target-effect': { action: '@apply:effect', effect: 'enemy-mark' } },   // mark trên địch
    { 'self-action':   { action: '@apply:effect', effect: 'mark-owner-buff' } } // listener trên caster
]
// mark-owner-buff dùng on-event + ctx.target.hasEffect('enemy-mark') cho conditional
```

### Interval Action qua Effect

Không dùng `on-interval` thuần — dùng effect với impactor interval để có thể bị CC ngắt:

```ts
// Chiêu channel: apply effect → effect tạo impactor mỗi interval
// CC xóa effect → on-end fire → kết thúc chuỗi tự nhiên
```

### Gồng / Charge

Effect với `unremovable: false` + `modify-states: { type: 'silent', slot: [...] }` + `on-end: [nhả chiêu]`. Bị choáng không interrupt được việc đang gồng (không thể nhả), nhưng không cần force-remove — thiết kế cân bằng.

---

## 11. Những thứ KHÔNG có trong DSL (có chủ ý)

| Thứ không có | Lý do |
|---|---|
| `DamageType` enum | Thay bằng reduction function name |
| `ally-nearby`, `enemy-nearby` stat | Dùng sensor entity pattern |
| Teleport/set-position action | `speed: Infinity` trên impactor đủ |
| `on-effect-removed` event riêng | `on-end` luôn fire cho cả 2 case (hết duration + dispel) |
| Condition trong EffectAction | Zero-return trick trong ValueResolver + ctx.target.hasEffect |
| `context-target` direction trên action | `@create-entity` với `from: target-pos` thay thế |
| Lifesteal action | Stat `life-steal` được xử lý trong engine, không phải DSL |
| Summon | Skill đặc thù, để sau |

---

## 12. Cấu trúc File

```
dsl/
  entity/
    skill/
      .enums.ts              — SkillSlot, SpSkillSlot
      .type-components.ts    — SkillTiming, SkillPhaseDisplay, ActionBased
      active.type-entities.ts — SkillPhaseEntry, SkillEntry
      manifest.types.ts      — DefineSkill
      actions/
        apply-effect.type-entities.ts — EffectAction union, ApplyModifier, ChangePhase...
        apply-effect.types.ts         — EffectManifest, EffectImpactManifest
        create-attack.type-entities.ts — CreateImpactor
        .types.ts                     — ImpactAction, ImpactHandle, SkillCastAction
    tank/
      .enums.ts              — TankStatValueKey, CurrentStatKeys, LostStatKeys...
      .types.ts              — ShootingStats, SurvivalStats, AttackPowerStats, AdditionalStats
  combat/
    .enums.ts                — Faction
    visual.type-components.ts — VisualManifest, Renderable
    state.type-components.ts  — LimitedDuration, Impactable
  physic/
    collider.*               — Collidable, ColliderDeclaration (rectangle/circle/ring)
    movement.*               — Movable, StraightMovement, TrackingMovement
    position.enums.ts        — PositionDeclaration
    range.type-components.ts — LimitedDistance
  runtime.types.ts           — EntitySnapshot, ValueResolveContext, ValueResolver, ReductionFn, ConditionPredicate

builder/templates/combat/
  reduction-policies.ts      — physicalDamageReduction, energyDamageReduction
  getters.ts                 — getPierce, getReduction helpers
```

---

## 13. Ví dụ Chuẩn

Xem `dsl/.examples/falcon-skill.ts` — file duy nhất được coi là canonical example (các file khác trong `.examples/` là cũ).

Falcon thể hiện đầy đủ:
- Normal attack 2 phase với icon riêng
- Passive `on-ready` với energy mechanic
- S2 cường hóa via effect + phase change
- Stack tracking qua `impacts` array
- Ultimate mark với `on-hit-taken` stack
- `ctx.self.hasEffect()` trong conditions
