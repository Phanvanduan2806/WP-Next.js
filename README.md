# Tạo token

https://github.com/settings/tokens/new

```bash
git clone https://TOKEN@github.com/webangiang/wp-init DOMAIN
```

# Chạy project

Sau khi clone project, di chuyển vào thư mục project:

```bash
cd DOMAIN
```

## Port

| Service    |   Port |
| ---------- | -----: |
| Next.js    | `2010` |
| WordPress  | `3010` |
| phpMyAdmin | `4010` |

Build và khởi động Docker:

```bash
docker compose up -d
```

Kiểm tra container:

```bash
docker compose ps
```

Xem log:

```bash
docker compose logs -f
```

## Truy cập

```text
Next.js:     http://localhost:2010
WordPress:   http://localhost:3010
phpMyAdmin:  http://localhost:4010
```

# Thông tin account

```text
PassFE: [YOUR_PASSWORD]

Link dashboard: https://domain/admin

User: code
Pass: [YOUR_PASSWORD]
```

# Security

**BẢO MẬT LÀ ƯU TIÊN HÀNG ĐẦU CỦA TEAM DEV VÀ CŨNG LÀ CỦA CTY.**

**PROJECTS/SẢN PHẨM LÀM RA BỊ HACK ĐÓ LÀ SỰ YẾU KÉM CỦA DEV.**

**THU NHẬP SẼ BỊ ẢNH HƯỞNG CHỈ VÌ 1 SỰ TẤT TRÁCH NHẤT THỜI.**

Try Hard 💪💪💪 and Happy Coding 😉!

*ReadMe sẽ được cập nhật theo issue/sự cố hoặc Policy.*
