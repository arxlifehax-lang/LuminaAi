# 🔐 วิธีตั้งค่า Google Login

## ขั้นตอนที่ 1 — สร้าง Google Cloud Project

1. ไปที่ [console.cloud.google.com](https://console.cloud.google.com)
2. คลิก **"New Project"** → ตั้งชื่อ เช่น `LuminaAI`
3. เลือก project ที่สร้าง

## ขั้นตอนที่ 2 — เปิดใช้ OAuth

1. ไปที่ **APIs & Services → Credentials**
2. คลิก **"+ CREATE CREDENTIALS"** → **OAuth client ID**
3. Application type: **Web application**
4. เพิ่ม Authorized JavaScript origins:
   ```
   http://localhost:3000
   http://localhost:8001
   ```
5. คัดลอก **Client ID** (หน้าตาคล้าย `123456789-abc.apps.googleusercontent.com`)

## ขั้นตอนที่ 3 — ใส่ Client ID ในไฟล์

เปิด `login.html` บรรทัดที่ 10:

```javascript
// เปลี่ยนจาก:
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// เป็น Client ID ของคุณ:
const GOOGLE_CLIENT_ID = '123456789-abc.apps.googleusercontent.com';
```

## ขั้นตอนที่ 4 — รัน

```bash
node server.js
# เปิด http://localhost:3000
```

จะ redirect ไป `/login.html` อัตโนมัติถ้ายังไม่ได้ login

---

## หมายเหตุ

- Token Google หมดอายุใน ~1 ชั่วโมง → user ต้อง login ใหม่
- ไม่มี backend verification (client-side only) — เหมาะสำหรับ demo
- Production: ควร verify token บน server ด้วย Google API
