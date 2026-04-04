---
description: Tự động commit và push code lên GitHub sau mỗi thay đổi
---

# Quy trình Git Push

Sau mỗi lần thực hiện thay đổi code, **luôn tự động** thực hiện các bước sau:

// turbo-all

1. Stage tất cả thay đổi:
```
git add -A
```

2. Commit với message mô tả ngắn gọn (tiếng Việt không dấu):
```
git commit -m "<type>: <mo ta ngan gon>"
```
Trong đó `<type>` là: feat, fix, style, refactor, docs, chore

3. Push lên GitHub:
```
git push origin main
```

**Lưu ý:** Không cần hỏi user trước khi push. Tự động thực hiện sau mỗi thay đổi.
