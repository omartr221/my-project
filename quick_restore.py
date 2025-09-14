#!/usr/bin/env python3
import sqlite3
import pandas as pd
import glob
import re
from datetime import datetime

# قراءة سريعة للزبائن من Excel
excel_files = glob.glob("attached_assets/*ملف الزبائن*.xlsx")
all_names = []

for file_path in excel_files:
    df = pd.read_excel(file_path, sheet_name=0, header=None)
    for idx, row in df.iterrows():
        if idx < 5: continue
        for col in df.columns:
            value = str(row[col]).strip()
            if value and value != 'nan' and len(value) > 2:
                if re.search(r'[\u0600-\u06FF]', value) and not value.isdigit():
                    all_names.append(value)

# إزالة المكررات
unique_names = list(set(all_names))
print(f"وجدت {len(unique_names)} اسم فريد")

# حفظ في قاعدة البيانات
conn = sqlite3.connect('v-power-tuning.db')
cursor = conn.cursor()

# حذف البيانات السابقة
cursor.execute("DELETE FROM customers")

# إدراج الزبائن
count = 0
for name in unique_names:
    try:
        cursor.execute("""
            INSERT INTO customers (name, phone_number, notes, created_at)
            VALUES (?, ?, ?, ?)
        """, (name, '', 'مستورد من Excel', datetime.now().isoformat()))
        count += 1
    except:
        pass

conn.commit()
print(f"تم إدراج {count} زبون في قاعدة البيانات")

# التحقق
cursor.execute("SELECT COUNT(*) FROM customers")
total = cursor.fetchone()[0]
print(f"إجمالي الزبائن: {total}")

cursor.execute("SELECT name FROM customers LIMIT 10")
sample = [row[0] for row in cursor.fetchall()]
print("عينة:", sample)

conn.close()