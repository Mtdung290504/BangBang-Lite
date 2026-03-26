# Tư duy Cấu trúc: Phase vs Effect trong ECS

**Ngày:** 2026-03-25
**Chủ đề:** Giải quyết bài toán cường hóa xếp chồng và lý do Phase không thể thay thế Effect.

## 1. Bài toán: Ngắt cộng dồn (Pause Stack) trong thời gian Buff kích hoạt
**Case study:** Bắn thường 4 phát -> Nhận Buff xuyên giáp 4s. Trong 4s này không được tích tụ thêm stack của phát bắn.

**Giải pháp Chuẩn ECS:** Cấp chức năng MIỄN NHIỄM (Immune) tàng hình cho Buff.
Trong DSL hiện tại, `Effect` có một Property cực mạnh ở mảng `states` là `immune`.
Chỉ cần cấu hình Buff xuyên giáp như sau:
```typescript
'enhance-pierce': {
    duration: 4,
    impacts: {
        'modify-stats': [{ attribute: 'penetration-percent', value: '200u' }],
        // KHI BUFF NÀY TỒN TẠI, CHỦ THỂ HOÀN TOÀN MIỄN NHIỄM VỚI EFFECT TÍCH SỐ LẦN BẮN
        'states': [
            { type: 'immune', filter: 'id:hit-count' }
        ]
    }
}
```
Nhờ vậy, trong 4 giây này, mọi tia đạn bắn ra có gọi `@apply:effect` (hit-count) đập vào thân người Caster đều bị hệ thống chối bỏ. Hết 4 giây, cờ Immune rụng xuống, Caster lại tích stack bình thường. Khử sạch mọi logic IF/ELSE lằng nhằng!

---

## 2. Bài toán: Khi nào dùng Phase, khi nào dùng Effect?
Game rẽ nhánh ở một câu hỏi rất hay: "Nếu Skill 2 lướt và cường hóa 5 phát bắn thành đạn xuyên thấu, Phase đơn không thể merge với Phase cường hóa của nội tại. Vậy hệ thống có bị yếu không?"

**Không hề yếu, mà là do lạm dụng Phase sai mục đích!**

Trong Data-Driven / ECS:
* **PHASE (State Machine):** Là sự ĐỘC QUYỀN. Một Entity chỉ có 1 Phase ở 1 thời điểm.
    * **Chỉ dùng cho:** Chuyển đổi trạng thái mang tính Cấu Trúc Toàn Diện (Biến hình toàn tập như Jayce Cầm búa / Cầm súng). Đã cầm Búa thì không thể làm hành động của Súng.
* **EFFECT (Composition):** Là sự XẾP LỚP (Layering). Một Entity có thể gánh 100 Effect cùng lúc.
    * **Chức năng chính:** Cường Hóa (Empowerments). Nó giải quyết tình trạng Mix-and-Match. 
    * Ví dụ: Rớt item nhặt được Buff Lửa + Kích hoạt Skill 2 được Buff Xuyên -> Bắn ra Đạn Lửa Xuyên Thấu. Hai Effect này hoàn toàn dễ dàng tổng hợp (Cộng % xuyên từ effect 1, thêm effect damage cháy từ effect 2). Nếu dùng Phase, bạn sẽ phải hardcode 1 Phase "Lửa_Xuyên" vô cùng ngu ngốc.

### Cấu trúc thực hành cường hóa 5 phát bắn bằng Effect:
Không thay đổi Phase của đòn bắn thường. Đòn bắn thường chỉ nạp chỉ số từ Caster và bắn đi viên đạn gốc.
Thay vào đó, Skill 2 cấp cho Caster một **Effect `bullet-xuyen-thau`**:
- `duration: Infinity` (hoặc 10s)
- `impact-capacity: 5` (Giới hạn 5 stack tương đương 5 viên)
- Cấu trúc Effect xen ngang vũ khí: 
  - `modify-stats`: `[ + xuyên thấu ]`
  - `on-event`: Bắt sự kiện `on-attack-input` hoặc `on-hit-dealt` để gọi `@apply:clean-effect` tự trừ đi 1 stack của chính mình. 
  - Hoặc nếu hình ảnh viên đạn muốn to hơn rực rỡ hơn: Khai báo Visual Override ngay bên trong Effect. Engine sẽ ưu tiên Render theo Effect đang có trên thân thay vì Base Skill.
