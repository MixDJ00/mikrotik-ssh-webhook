# Mikrotik SSH Webhook

Một webhook trung gian giúp kết nối Google Sheets đến Mikrotik bằng SSH để thay đổi Username/Password proxy.

## Hướng dẫn triển khai

1. Deploy repo này lên Railway hoặc VPS
2. Từ Google Sheets (Apps Script), gửi POST đến `/update-user` với JSON sau:

```json
{
  "host": "hoangmproxy.xyz",
  "port": 22,
  "user": "xxx",
  "pass": "xxxxxx",
  "newUser": "abcxyz",
  "newPass": "defghi"
}
