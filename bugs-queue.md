1. 2 sync state đang có 1 điểm đáng nghi, có thể nó bỏ qua sync mới khi 1 sync cũ đang chạy dở, ví dụ line 96 trong battle handler client
   -> Thử sửa lại vẫn giật, chứng tỏ vấn đề vẫn còn
   -> Chắc chắn do có sự chênh thời gian bấm nút, client khi bấm sẽ kích ngay, còn host sẽ tốn một khoảng trễ để nhận lệnh.
