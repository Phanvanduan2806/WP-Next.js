# Tạo token

https://github.com/settings/tokens/new

```bash
git clone https://TOKEN@github.com/Phanvanduan2806/WP-Next.js.git DOMAIN
```

# Chạy project

Sau khi clone project, di chuyển vào thư mục project:

```bash
cd DOMAIN
```
# Đổi port

## Khởi động Docker

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

## Import Database

Sau khi Docker đã khởi động, mở phpMyAdmin:

```text
http://localhost:4010
```

Database WordPress được lưu trong:

```text
wp/db/
```

### Import database

Trong phpMyAdmin:

1. Chọn database `wordpress`.
2. Chọn tab **Import**.
3. Chọn file database trong thư mục:

```text
wp/db/
```

4. Thực hiện import.
5. Chờ quá trình import hoàn tất.

> Cần import database trước khi sử dụng project để có đầy đủ dữ liệu WordPress như user, page, post, menu và các thiết lập của website.

## Port

| Service    |   Port |
| ---------- | -----: |
| Next.js    | `2010` |
| WordPress  | `3010` |
| phpMyAdmin | `4010` |

## Truy cập

```text
Next.js:     http://localhost:2010
WordPress:   http://localhost:3010
phpMyAdmin:  http://localhost:4010
```

WordPress Dashboard:

```text
http://localhost:3010/wp-admin
```

# Thông tin account

```text
User: code
Pass: A@u+cnHAQo[0
```

WordPress Dashboard:

```text
http://localhost:3010/wp-admin
```

# Security

**BẢO MẬT LÀ ƯU TIÊN HÀNG ĐẦU CỦA TEAM DEV VÀ CŨNG LÀ CỦA CTY.**

**PROJECTS/SẢN PHẨM LÀM RA BỊ HACK ĐÓ LÀ SỰ YẾU KÉM CỦA DEV.**

**THU NHẬP SẼ BỊ ẢNH HƯỞNG CHỈ VÌ 1 SỰ TẤT TRÁCH NHẤT THỜI.**

Không commit các thông tin nhạy cảm lên Git:

* GitHub Token
* Password
* API Key
* Database credentials
* Private Key
* `.env`

Try Hard 💪💪💪 and Happy Coding 😉!

*ReadMe sẽ được cập nhật theo issue/sự cố hoặc Policy.*
