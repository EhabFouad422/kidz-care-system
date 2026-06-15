# Kidz Care System — دليل الإعداد

## 1. إنشاء مشروع Supabase

1. اذهب إلى https://supabase.com وأنشئ حساباً مجانياً
2. أنشئ مشروع جديد (مثلاً: "kidz-care")
3. انتظر حتى يكتمل الإعداد

## 2. تشغيل قاعدة البيانات

في لوحة Supabase → **SQL Editor** → الصق محتوى ملف `supabase/schema.sql` كاملاً → اضغط **Run**

## 3. إعداد Storage (لرفع الروشتات)

في لوحة Supabase → **Storage** → أنشئ Bucket جديد:
- الاسم: `prescriptions`
- Public: ✅ مفعّل

## 4. إعداد متغيرات البيئة

افتح ملف `.env.local` وأضف قيمك من **Supabase → Project Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 5. إنشاء أول مستخدم

في Supabase → **Authentication → Users** → Add User:
- البريد: doctor@clinic.com
- كلمة المرور: اختارها

ثم في SQL Editor شغّل:
```sql
INSERT INTO profiles (id, clinic_id, full_name, role)
VALUES (
  'الـ UUID من جدول auth.users',
  '00000000-0000-0000-0000-000000000001',
  'د. بولا فتح الله عزيز',
  'doctor'
);
```

## 6. تشغيل المشروع

```bash
npm run dev
```

افتح المتصفح على: http://localhost:3000

## 7. النشر على الإنترنت (Vercel)

```bash
npm install -g vercel
vercel
```

أضف متغيرات البيئة في Vercel Dashboard → Settings → Environment Variables

## هيكل الملفات المهمة

```
src/
├── app/
│   ├── login/          — صفحة تسجيل الدخول
│   └── dashboard/
│       ├── page.tsx          — الرئيسية
│       ├── patients/         — المرضى
│       ├── visits/           — الزيارات
│       ├── vaccinations/     — التطعيمات
│       └── reports/          — التقارير
├── components/
│   ├── layout/Sidebar.tsx
│   └── patients/
│       ├── AddVisitDialog.tsx
│       ├── VaccinationCard.tsx
│       ├── EditPatientForm.tsx
│       └── PrescriptionUpload.tsx
└── lib/
    ├── supabase/client.ts
    ├── supabase/server.ts
    └── utils.ts
```
