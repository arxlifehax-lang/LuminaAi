# 🔧 Bug Fix Report v2 — Lumina Chatbot

## 🔴 Critical (app.js)
| # | บัค | การแก้ไข |
|---|-----|---------|
| 1 | `chatContainer` undefined → crash ทุก AI response | เปลี่ยนเป็น `getElementById` ทุกจุด |
| 2 | User message ซ้ำ 2 ครั้งใน API context | `slice(-11,-1)` ตัด message ปัจจุบันออก |
| 3 | API Key hardcoded + overwrite key ของ user | ลบทั้งหมด ให้ user กรอกเอง |
| 4 | ngrok URL expired `cold-petroleum-brook` | ลบ fallback, เพิ่ม guard แจ้งเตือน |

## 🟡 Image/File Bugs (app.js)
| # | บัค | การแก้ไข |
|---|-----|---------|
| 5 | ส่งได้เฉพาะมีข้อความ → ส่งแค่รูปไม่ได้ | อนุญาต send ถ้ามี attachment แม้ไม่มีข้อความ |
| 6 | รูปไม่ถูกบันทึกใน chat history | เพิ่ม `attachedImages` ใน `userMsg` |
| 7 | รูปไม่แสดงในฟอง message | Render `<img>` thumbnail + click-to-expand |
| 8 | รูปขนาดใหญ่ (5MB+) ส่งดิบไม่ compress | Compress ด้วย Canvas API (max 1024px, 0.82 quality) |
| 9 | `image_url` ขาด `detail:"auto"` | เพิ่ม `detail: "auto"` ให้ vision model เลือก resolution |
| 10 | Token estimation crash สำหรับ array content | Guard `typeof m.content === 'string'` |

## 🟢 New Features
| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| **ซ่อน Tab Bar** | ปุ่ม `▲` ในหัว Sandbox Panel ซ่อน/แสดง tab bar ด้วย animation |
| **Image click-to-expand** | คลิกรูปใน chat เพื่อขยาย |

## 🔵 HTML/CSS Fixes
- `index.html` — แก้ broken HTML comment ในหน้า API Settings
- `server.js` — เปลี่ยน port 8000 → 3000 (ไม่ชน Python server)

## 🟣 Integration (LuminazerPre-training_fixed.py)
- เพิ่ม `/api/feed-chat-to-dataset` endpoint
- เพิ่ม `--port` argument (default: 8001)
- เพิ่ม static file serving

---
## 🚀 วิธีรัน
```bash
# Option A: แยก server
node server.js                          # UI at :3000
python training_demo/LuminazerPre-training_fixed.py --mode serve --port 8001

# Option B: Python เดียว (ทั้ง UI + AI)
python training_demo/LuminazerPre-training_fixed.py --mode serve --port 8001
# → เปิด http://localhost:8001
# → ตั้ง Ngrok URL = http://localhost:8001 ใน Settings
```
