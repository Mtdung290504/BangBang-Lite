/\*\*

1. User account
    - UID: Chuỗi tạo từ uuid-v4.
    - Username: Giới hạn 20 ký tự (Unique).
    - Password: hash bằng bcrypt thành một chuỗi băm.
    - Mail: Cho phép lấy lại mật khẩu qua mail khi cần.
2. User ingame information
    - Character name: Chuỗi giới hạn 15 ký tự, được phép nhập dấu/ký tự đặc biệt (Unique).
    - Friends: Quan hệ bạn bè với người chơi khác.
    - Tình trạng sở hữu tank:
        - Mỗi tank có một id riêng biệt nhưng thông tin tank lưu trong src code chứ không phải db, db chỉ giữ id tank.
        - Người chơi có thể sở hữu tank, đang thuê tank hoặc chưa sở hữu tank (đề xuất lưu mỗi row gồm uid, tankId, own (boolean), rentalExpirationTime (được phép null, có thể lưu một chuỗi date để truy suất và lấy date hiện tại trừ đi để kiểm tra xem còn hạn không)).
        - Ngoài ra có cơ chế mảnh tank nhận từ các event của game, người chơi đủ 100 mảnh của tank thì đổi được tank.
    - Thông tin về chiến trận gồm:
        - Số trận đấu, số trận thắng, số trận thua
        - Số lần chơi mỗi tank đang sở hữu, điểm thông thao, chiến tích mỗi tank đang sở hữu (tăng khi thắng, giảm khi thua)
        - Số huy chương kích sát, trợ công, mvp (Huy chương đạt được từ trận đấu)
    - Thông tin về tài chính: Vàng
    - Kinh nghiệm
    - Image avatar (url đến file avatar của người chơi, có một avatar mặc định)
    - Điểm xếp hạng
3. Quản lý socket
    - Mỗi khi người chơi login sẽ hình thành socket kết nối với server, cần lưu trữ lại socketId với uid để xử lý các socket request hoặc xử lý khi tài khoản bị login ở nhiều nơi, đảm bảo tài khoản chỉ do 1 người online.
