**_Chỉ mới là thử nghiệm để tăng khả năng mở rộng, chưa có bất kỳ gì bên trong thư mục này đang được sử dụng_**

**_Nhớ_**

-   Các enum được khai báo đầy đủ, không quan tâm đến ngữ cảnh, đây không phải là thiết kế lỗi.
-   Khi hành vi được định nghĩa, sẽ khai báo kế thừa các interface và giới hạn ngữ cảnh lại
-   Cấu trúc thư mục:
    -   Chia thành domain/thư mục tùy hoàn cảnh
    -   Dùng thư mục khi bên trong có rất nhiều thành phần, ví dụ thư mục `physic`
    -   Dùng domain khi có khá ít file con khi tạo thư mục, ví dụ domain `physic.collider`
    -   Với file con trực tiếp của thư mục, không có bắt đầu domain, sử dụng `.` ở đầu
        ví dụ `combat/.enums` thay vì `combat/combat.enums`
    -   `.type-components` thể hiện các type trong đó dùng để "lắp ghép" dùng trong kế thừa khi tạo ra các "action"
    -   `.type-entity` các type tổ hợp từ các `.type-components`
    -   `.type` chứa các type phụ trợ thuộc domain
    -   `.enums` chứa các enum thuộc domain
