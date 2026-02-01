**_Chỉ mới là thử nghiệm để tăng khả năng mở rộng, chưa có bất kỳ gì bên trong thư mục này đang được sử dụng_**

**_Nhớ_**

- Đây là hệ thống type TĨNH, để khai báo skill object TĨNH, không có bất kỳ giá trị runtime nào, chỉ có ngữ cảnh và hành vi
- Các enum được khai báo đầy đủ, không quan tâm đến ngữ cảnh, đây không phải là thiết kế lỗi.
- Khi hành vi được định nghĩa, sẽ khai báo kế thừa các interface và giới hạn ngữ cảnh lại
- Cấu trúc thư mục:
    - Chia thành domain/thư mục tùy hoàn cảnh
    - Dùng thư mục khi bên trong có rất nhiều thành phần, ví dụ thư mục `physic`
    - Dùng domain khi có khá ít file con khi tạo thư mục, ví dụ domain `physic.collider`
    - Với file con trực tiếp của thư mục, không có bắt đầu domain, sử dụng `.` ở đầu
      ví dụ `combat/.enums` thay vì `combat/combat.enums`
    - `.type-components` thể hiện các type trong đó dùng để "lắp ghép" dùng trong kế thừa khi tạo ra các "action"
    - `.type-entity` các type tổ hợp từ các `.type-components`
    - `.enums` chứa các enum thuộc domain
    - `.type` chứa các type không phải các loại trên thuộc domain

- Liệu có cần thiết chia thành đủ trò như projectile, area eff,... Hay không?
    - Chỉ cần tạo một impactor, với skill chọn mục tiêu, cũng vậy, chỉ cần tạo impactor ngay vị trí của mục tiêu, tốc độ di chuyển thông thường không tài nào né được impactor xuất hiện tức thời.
        - => Từ đó có skill khóa mục tiêu áp dụng lập tức dù khai báo/xử lý sẽ giống như impactor đánh trúng mục tiêu. Tránh phải tạo trường hợp cá biệt
        - Xử lý như thế nào khi kẻ địch đứng một chùm -> ăn hết?, có lẽ xét đến `pierce`, nếu không có pierce thì trúng cắm flag entity bị destroy luôn, bỏ qua mọi mục tiêu sau đó
    - Với lướt, nhảy, tạo một impactor, vì cơ bản là cũng cần va chạm. Impactor này sẽ cưỡng chế kéo theo caster. Va chạm thì tương tự đạn thôi
    - Đạn xuyên thấu, area eff?
        - Xuyên thấu và area eff kéo dài cũng vậy, hit box + pierce all. Area eff về cơ bản là đạn xuyên cụt chân
        - Cần giảm damage/tăng damage thì kế thừa thêm trait gì đó modify damage trên từng mục tiêu trúng
        - => Tất cả skill bản chất là mục cục va chạm
    - Bounce thì sao?
        - Hơi phiền khi impactor còn tồn tại, nhưng không được va vào thằng cuối cùng mà nó đụng, giống như xuyên thấu nhưng cần cơ chế sao cho chỉ giữ lại mục tiêu cuối để bỏ qua thay vì tất cả mục tiêu?
    - Vùng area eff đi theo mình như kết giới thì sao? Cần cho thêm 1 flag hay method movable gì đó kiểu như follow caster chẳng hạn? Khi này lại chỉ cần xử lý on impact như trên. Aura cũng tương tự kết giới, chỉ sửa phạm vi nhỏ hơn
    - Đạn dí? Chắc xử lý tương tự follow như trên nhưng giới hạn tốc độ bay của nó thành tốc độ của viên đạn thường?
    - Tại mức DSL/implement thì phân mảnh để hệ thống dễ hiểu, còn cho designer thì viết sẵn template với tên rõ hình dung, cho phép ghi đè một số config, không cần biết cấu trúc "đập bẹp, dát mỏng" bên dưới, mình viết template có nhiều mảnh ghép như vậy cũng dễ mở rộng nhiều case, tránh phải viết đi viết lại mỗi hành vi.

- Summon thì coi là một skill đặc thù rồi, để sau.
- Skill giữ phím, tích năng lượng sẽ cần, dồn chung thành 1 loại là tụ lực, sau thời gian delay thì bấm vào sẽ giải phóng skill, chủ yếu là tăng phạm vi và damage hoặc đơn giản là skill mạnh nên delay cho cân bằng.
    - Nhưng không định nghĩa nó là 1 action được.
    - Hình dung là cái đống trên chỉ là đại diện cho 1 action, toàn bộ skill sẽ quy định nó cần context gì (mục tiêu, hướng, mouse pos,...) và một mảng các định nghĩa action.
    - Nếu là một mảng thì bỏ cái tụ lực vào sẽ không ổn, khi đó cần phải có một loại quy định rằng lúc tụ lực này mà bị fail hoặc ít nhất tại thời điểm tụ, chuỗi action sau đó sẽ bị chặn, cái đó làm system trở nên phức tạp, có vẻ nên tạo một prop cho skill là require-charge và thời gian. Nhưng như vậy thì làm sao quy định chặt action có thể tăng phạm vi/damage/... dựa trên thời gian gồng chỉ được khai báo ở skill có gồng? À nghĩ ra rồi, hoàn toàn được phép, không có gồng thì đơn giản thời gian là 0 thôi.
- Toggle? có thể tận dụng change phase được không?
- Condition là kiểu mục tiêu phải bị hất tung/có đánh dấu hay gì đó? Thế thì nó thuộc loại khóa một mục tiêu nhưng bổ sung condition thôi nhỉ?

- Vấn đề mâu thuẫn animation:
    - Với đạn, animation/sprite sẽ chạy đến khi đạn bị xóa (do trúng hay hết tầm)
    - Với skill kiểu laze, nếu biến mất ngay sẽ rất xấu
      => Animation cần 2 điểm để xóa, entity liên kết với nó biến mất, và hết time => vấn đề triển khai, khai báo tĩnh không có gì đặc biệt cần khai báo, chỉ cần khai báo thời gian tồn tại => cơ chế khai báo visual hiện tại đã ổn.

- Vấn đề buff và debuff:
    - Làm thế nào để khai báo effect có thể cộng dồn? Ví dụ đốt gây damage mỗi giây và làm chậm 10% mỗi stack?
        - Có thể "ám" lên mục tiêu một collider có interval effect để đốt + làm chậm, nhưng làm sao để khai báo effect có thể cộng dồn?
        - Làm thế nào để khai báo effect không thể cộng dồn? Tức skill đó lại gây effect lại thì không bị dồn lên mà chỉ reset thời lượng???
